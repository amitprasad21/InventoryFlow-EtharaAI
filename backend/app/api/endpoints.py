from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import List, Optional
import datetime
import os
import uuid
import shutil
from app.database.session import get_db
from app.models.models import User, Product, Customer, Order, OrderItem
from app.schemas.schemas import (
    Token, LoginRequest, UserCreate, UserResponse,
    ProductCreate, ProductUpdate, ProductResponse,
    CustomerCreate, CustomerResponse,
    OrderCreate, OrderResponse, DashboardStats,
    OrderItemResponse
)
from app.core import security
from app.services import business_logic
from app.core.config import settings
import cloudinary
import cloudinary.utils

# Configure Cloudinary
cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET,
    secure=True
)

router = APIRouter()
security_scheme = HTTPBearer()

# Dependency to get currently logged-in user
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: Session = Depends(get_db)
) -> User:
    token = credentials.credentials
    email = security.decode_access_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    return user

# ----------------- AUTHENTICATION -----------------
@router.post("/auth/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_in.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email address already registered."
        )
    hashed_pwd = security.get_password_hash(user_in.password)
    new_user = User(
        email=user_in.email,
        hashed_password=hashed_pwd,
        full_name=user_in.full_name
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@router.post("/auth/login", response_model=Token)
def login(login_in: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_in.email).first()
    if not user or not security.verify_password(login_in.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password."
        )
    access_token = security.create_access_token(subject=user.email)
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/auth/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


# ----------------- FILE UPLOADS -----------------
@router.get("/upload/signature")
def get_upload_signature(current_user: User = Depends(get_current_user)):
    import time
    timestamp = int(time.time())
    
    # Parameters to sign
    params = {
        "timestamp": timestamp,
        "upload_preset": "ml_default"
    }
    
    # Generate signature using API Secret
    try:
        signature = cloudinary.utils.api_sign_request(
            params_to_sign=params,
            api_secret=settings.CLOUDINARY_API_SECRET
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Could not generate Cloudinary signature: {str(e)}"
        )
        
    return {
        "signature": signature,
        "timestamp": timestamp,
        "api_key": settings.CLOUDINARY_API_KEY,
        "cloud_name": settings.CLOUDINARY_CLOUD_NAME,
        "upload_preset": "ml_default"
    }


# ----------------- PRODUCTS MANAGEMENT -----------------
@router.post("/products", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: ProductCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_prod = db.query(Product).filter(Product.sku == product_in.sku).first()
    if db_prod:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Product SKU '{product_in.sku}' already exists."
        )
    new_product = Product(**product_in.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.get("/products", response_model=List[ProductResponse])
def read_products(
    search: Optional[str] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Product)
    if search:
        query = query.filter(
            Product.name.ilike(f"%{search}%") | 
            Product.sku.ilike(f"%{search}%") |
            Product.category.ilike(f"%{search}%")
        )
    if category:
        query = query.filter(Product.category == category)
    return query.order_by(Product.name).all()

@router.get("/products/{id}", response_model=ProductResponse)
def read_product(id: int, db: Session = Depends(get_db)):
    prod = db.query(Product).filter(Product.id == id).first()
    if not prod:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found."
        )
    return prod

@router.put("/products/{id}", response_model=ProductResponse)
def update_product(
    id: int,
    product_in: ProductUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prod = db.query(Product).filter(Product.id == id).first()
    if not prod:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found."
        )
    
    update_data = product_in.model_dump(exclude_unset=True)
    if "sku" in update_data and update_data["sku"] != prod.sku:
        existing = db.query(Product).filter(Product.sku == update_data["sku"]).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Product SKU '{update_data['sku']}' already exists."
            )

    for field, value in update_data.items():
        setattr(prod, field, value)
        
    db.commit()
    db.refresh(prod)
    return prod

@router.delete("/products/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    prod = db.query(Product).filter(Product.id == id).first()
    if not prod:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Product not found."
        )
    db.delete(prod)
    db.commit()
    return


# ----------------- CUSTOMERS MANAGEMENT -----------------
@router.post("/customers", response_model=CustomerResponse, status_code=status.HTTP_201_CREATED)
def create_customer(
    customer_in: CustomerCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    db_cust = db.query(Customer).filter(Customer.email == customer_in.email).first()
    if db_cust:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Customer email '{customer_in.email}' already registered."
        )
    new_cust = Customer(**customer_in.model_dump())
    db.add(new_cust)
    db.commit()
    db.refresh(new_cust)
    return new_cust

@router.get("/customers", response_model=List[CustomerResponse])
def read_customers(
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Customer)
    if search:
        query = query.filter(
            Customer.name.ilike(f"%{search}%") | 
            Customer.email.ilike(f"%{search}%") |
            Customer.phone.ilike(f"%{search}%")
        )
    return query.order_by(Customer.name).all()

@router.get("/customers/{id}", response_model=CustomerResponse)
def read_customer(id: int, db: Session = Depends(get_db)):
    cust = db.query(Customer).filter(Customer.id == id).first()
    if not cust:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found."
        )
    return cust

@router.delete("/customers/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    cust = db.query(Customer).filter(Customer.id == id).first()
    if not cust:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Customer not found."
        )
    db.delete(cust)
    db.commit()
    return


# ----------------- ORDERS MANAGEMENT -----------------
@router.post("/orders", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
def create_order(
    order_in: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    order = business_logic.create_order_transaction(db, order_in)
    return order

@router.get("/orders", response_model=List[OrderResponse])
def read_orders(
    status: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Order)
    if status:
        query = query.filter(Order.status == status)
    
    db_orders = query.order_by(Order.created_at.desc()).all()
    
    # Format to include customer names and items with names
    orders_response = []
    for o in db_orders:
        orders_response.append(
            OrderResponse(
                id=o.id,
                customer_id=o.customer_id,
                customer_name=o.customer.name if o.customer else "Unknown",
                customer_email=o.customer.email if o.customer else "",
                total_amount=o.total_amount,
                status=o.status,
                created_at=o.created_at,
                updated_at=o.updated_at,
                items=[
                    OrderItemResponse(
                        id=item.id,
                        product_id=item.product_id,
                        quantity=item.quantity,
                        price=item.price,
                        product_name=item.product.name if item.product else "Deleted Product",
                        product_sku=item.product.sku if item.product else "N/A"
                    ) for item in o.items
                ]
            )
        )
    return orders_response

@router.get("/orders/{id}", response_model=OrderResponse)
def read_order(id: int, db: Session = Depends(get_db)):
    o = db.query(Order).filter(Order.id == id).first()
    if not o:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found."
        )
    
    return OrderResponse(
        id=o.id,
        customer_id=o.customer_id,
        customer_name=o.customer.name if o.customer else "Unknown",
        customer_email=o.customer.email if o.customer else "",
        total_amount=o.total_amount,
        status=o.status,
        created_at=o.created_at,
        updated_at=o.updated_at,
        items=[
            OrderItemResponse(
                id=item.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price=item.price,
                product_name=item.product.name if item.product else "Deleted Product",
                product_sku=item.product.sku if item.product else "N/A"
            ) for item in o.items
        ]
    )

@router.delete("/orders/{id}", response_model=OrderResponse)
def cancel_or_delete_order(
    id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Retrieve order
    order = db.query(Order).filter(Order.id == id).first()
    if not order:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Order not found."
        )

    # Cancel order: refund inventory stock to database
    if order.status != "Cancelled":
        for item in order.items:
            if item.product:
                item.product.quantity += item.quantity
        order.status = "Cancelled"
        order.updated_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(order)
    else:
         raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Order is already cancelled."
        )

    return OrderResponse(
        id=order.id,
        customer_id=order.customer_id,
        customer_name=order.customer.name if order.customer else "Unknown",
        customer_email=order.customer.email if order.customer else "",
        total_amount=order.total_amount,
        status=order.status,
        created_at=order.created_at,
        updated_at=order.updated_at,
        items=[
            OrderItemResponse(
                id=item.id,
                product_id=item.product_id,
                quantity=item.quantity,
                price=item.price,
                product_name=item.product.name if item.product else "Deleted Product",
                product_sku=item.product.sku if item.product else "N/A"
            ) for item in order.items
        ]
    )


# ----------------- ANALYTICS & DASHBOARD -----------------
@router.get("/analytics/dashboard", response_model=DashboardStats)
def read_dashboard_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return business_logic.get_dashboard_analytics(db)
