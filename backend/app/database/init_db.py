from sqlalchemy.orm import Session
import datetime
from app.database.session import SessionLocal, Base, engine
from app.models.models import User, Product, Customer, Order, OrderItem
from app.core import security

def seed_db(db: Session):
    # 1. Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Check if admin user already exists
    admin = db.query(User).filter(User.email == "admin@inventoryflow.ai").first()
    if admin:
        print("Database already seeded. Skipping...")
        return
        
    print("Seeding database with fresh mock data...")

    # 2. Seed Admin User
    admin_user = User(
        email="admin@inventoryflow.ai",
        hashed_password=security.get_password_hash("admin123"),
        full_name="Administrator"
    )
    db.add(admin_user)
    
    # 3. Seed Products
    products_data = [
        {
            "name": "iPhone 15 Pro Max",
            "sku": "IPHONE15PM",
            "price": 139900.00,
            "quantity": 25,
            "category": "Electronics",
            "description": "Apple flagship iPhone 15 Pro Max with titanium chassis.",
            "image_url": "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400&auto=format&fit=crop&q=60"
        },
        {
            "name": "MacBook Pro 14 M3",
            "sku": "MACBOOKPRO14",
            "price": 169900.00,
            "quantity": 12,
            "category": "Electronics",
            "description": "Next-generation developer laptop with Apple M3 chip.",
            "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop&q=60"
        },
        {
            "name": "Airpods Pro 2",
            "sku": "AIRPODSPRO2",
            "price": 24900.00,
            "quantity": 4,
            "category": "Electronics",
            "description": "Active noise cancelling wireless earbuds.",
            "image_url": "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&auto=format&fit=crop&q=60"
        },
        {
            "name": "Tata Tea Gold 1kg",
            "sku": "TATATEAGOLD",
            "price": 620.00,
            "quantity": 40,
            "category": "Groceries",
            "description": "Premium quality CTC tea blend from Assam.",
            "image_url": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=400&auto=format&fit=crop&q=60"
        },
        {
            "name": "Royal Enfield Classic Helmet",
            "sku": "REHELMET01",
            "price": 2999.00,
            "quantity": 18,
            "category": "Accessories",
            "description": "Open-face fiberglass retro helmet.",
            "image_url": "https://images.unsplash.com/photo-1599819811279-d5ad9cccf838?w=400&auto=format&fit=crop&q=60"
        },
        {
            "name": "Amul Pure Ghee 1L",
            "sku": "AMULGHEE1L",
            "price": 680.00,
            "quantity": 30,
            "category": "Groceries",
            "description": "Pure milk fat clarified butter.",
            "image_url": "https://images.unsplash.com/photo-1634818629302-03b2b3d8108c?w=400&auto=format&fit=crop&q=60"
        },
        {
            "name": "Boat Rockerz 450",
            "sku": "BOATROCK450",
            "price": 1499.00,
            "quantity": 0,
            "category": "Electronics",
            "description": "On-ear wireless Bluetooth headphones.",
            "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop&q=60"
        },
        {
            "name": "Wipro 12W LED Smart Bulb",
            "sku": "WIPRO12WLED",
            "price": 499.00,
            "quantity": 50,
            "category": "Electronics",
            "description": "WiFi smart RGB dimmable LED bulb.",
            "image_url": "https://images.unsplash.com/photo-1550985543-f47f38aeee65?w=400&auto=format&fit=crop&q=60"
        }
    ]
    
    products = []
    for item in products_data:
        p = Product(**item)
        db.add(p)
        products.append(p)
        
    db.flush() # Populate IDs
    
    # 4. Seed Customers
    customers_data = [
        {"name": "Aarav Sharma", "email": "aarav.sharma@gmail.com", "phone": "+91 98765 43210"},
        {"name": "Priya Patel", "email": "priya.patel@yahoo.co.in", "phone": "+91 87654 32109"},
        {"name": "Rahul Verma", "email": "rahul.verma@outlook.in", "phone": "+91 76543 21098"},
        {"name": "Ananya Iyer", "email": "ananya.iyer@gmail.com", "phone": "+91 91234 56789"},
        {"name": "Vikram Singh", "email": "vikram.s@techcorp.in", "phone": "+91 99887 76655"}
    ]
    
    customers = []
    for item in customers_data:
        c = Customer(**item)
        db.add(c)
        customers.append(c)
        
    db.flush() # Populate IDs

    # 5. Seed Orders (with historical timestamps to construct a realistic monthly chart)
    now = datetime.datetime.utcnow()
    
    orders_data = [
        {
            "customer_id": customers[0].id,
            "status": "Delivered",
            "delta_days": 95,
            "items": [
                {"product_id": products[0].id, "quantity": 1, "price": 139900.00}, # iPhone 15 PM
                {"product_id": products[2].id, "quantity": 1, "price": 24900.00}   # Airpods
            ]
        },
        {
            "customer_id": customers[1].id,
            "status": "Delivered",
            "delta_days": 65,
            "items": [
                {"product_id": products[1].id, "quantity": 1, "price": 169900.00}  # Macbook
            ]
        },
        {
            "customer_id": customers[2].id,
            "status": "Processing",
            "delta_days": 35,
            "items": [
                {"product_id": products[4].id, "quantity": 1, "price": 2999.00},  # Helmet
                {"product_id": products[5].id, "quantity": 1, "price": 680.00}    # Amul Ghee
            ]
        },
        {
            "customer_id": customers[3].id,
            "status": "Pending",
            "delta_days": 10,
            "items": [
                {"product_id": products[3].id, "quantity": 2, "price": 620.00}    # Tata Tea
            ]
        },
        {
            "customer_id": customers[4].id,
            "status": "Cancelled",
            "delta_days": 5,
            "items": [
                {"product_id": products[7].id, "quantity": 5, "price": 499.00}    # Smart Bulb
            ]
        }
    ]
    
    for o_data in orders_data:
        order_date = now - datetime.timedelta(days=o_data["delta_days"])
        total_amount = sum(item["quantity"] * item["price"] for item in o_data["items"])
        
        o = Order(
            customer_id=o_data["customer_id"],
            total_amount=round(total_amount, 2),
            status=o_data["status"],
            created_at=order_date,
            updated_at=order_date
        )
        db.add(o)
        db.flush()
        
        for item in o_data["items"]:
            oi = OrderItem(
                order_id=o.id,
                product_id=item["product_id"],
                quantity=item["quantity"],
                price=item["price"]
            )
            db.add(oi)
            
    db.commit()
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    db_session = SessionLocal()
    try:
        seed_db(db_session)
    finally:
        db_session.close()
