from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime

# ----------------- TOKEN SCHEMAS -----------------
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ----------------- PRODUCT SCHEMAS -----------------
class ProductBase(BaseModel):
    sku: str = Field(..., description="Unique SKU code")
    name: str = Field(..., min_length=1)
    description: Optional[str] = None
    price: float = Field(..., gt=0.0)
    quantity: int = Field(..., ge=0)
    category: Optional[str] = None
    image_url: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    sku: Optional[str] = None
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[float] = Field(None, gt=0.0)
    quantity: Optional[int] = Field(None, ge=0)
    category: Optional[str] = None
    image_url: Optional[str] = None

class ProductResponse(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# ----------------- CUSTOMER SCHEMAS -----------------
class CustomerBase(BaseModel):
    name: str = Field(..., min_length=1)
    email: EmailStr
    phone: Optional[str] = None

class CustomerCreate(CustomerBase):
    pass

class CustomerResponse(CustomerBase):
    id: int
    created_at: datetime
    orders_count: int
    total_spending: float

    class Config:
        from_attributes = True

# ----------------- ORDER ITEM SCHEMAS -----------------
class OrderItemBase(BaseModel):
    product_id: int
    quantity: int = Field(..., gt=0)

class OrderItemCreate(OrderItemBase):
    pass

class OrderItemResponse(BaseModel):
    id: int
    product_id: Optional[int]
    quantity: int
    price: float
    product_name: Optional[str] = None
    product_sku: Optional[str] = None

    class Config:
        from_attributes = True

# ----------------- ORDER SCHEMAS -----------------
class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate] = Field(..., min_length=1)

class OrderResponse(BaseModel):
    id: int
    customer_id: int
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    total_amount: float
    status: str
    created_at: datetime
    updated_at: datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True

# ----------------- ANALYTICS & DASHBOARD SCHEMAS -----------------
class LowStockWidget(BaseModel):
    id: int
    name: str
    sku: str
    quantity: int
    category: Optional[str] = None
    status: str # "out_of_stock" or "low_stock"

class RevenueDataPoint(BaseModel):
    name: str  # Month or Day
    revenue: float
    orders: int

class DashboardStats(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    total_revenue: float
    revenue_growth: float  # Percentage
    orders_growth: float
    products_growth: float
    customers_growth: float
    low_stock_alerts: List[LowStockWidget]
    recent_orders: List[OrderResponse]
    revenue_chart: List[RevenueDataPoint]
