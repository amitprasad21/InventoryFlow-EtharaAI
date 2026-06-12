import unittest
import sys
import os

# Set database URL to in-memory SQLite before loading application modules to bypass Postgres drivers
os.environ["DATABASE_URL"] = "sqlite:///:memory:"

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi import HTTPException

# Adjust import paths to find backend
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

from app.database.session import Base
from app.models.models import Product, Customer, Order, OrderItem
from app.schemas.schemas import OrderCreate, OrderItemCreate
from app.services.business_logic import create_order_transaction

class TestInventoryFlowBusinessRules(unittest.TestCase):
    def setUp(self):
        # Set up an in-memory SQLite database for testing the business logic
        self.engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
        TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=self.engine)
        Base.metadata.create_all(bind=self.engine)
        self.db = TestingSessionLocal()
        
        # Seed test customer
        self.customer = Customer(name="Test Customer", email="test@customer.com", phone="+1 555-9999")
        self.db.add(self.customer)
        
        # Seed test products
        self.prod_a = Product(sku="PROD_A", name="Widget A", price=10.0, quantity=5)
        self.prod_b = Product(sku="PROD_B", name="Widget B", price=25.5, quantity=10)
        self.db.add(self.prod_a)
        self.db.add(self.prod_b)
        self.db.commit()

    def tearDown(self):
        self.db.close()
        Base.metadata.drop_all(bind=self.engine)

    def test_sku_uniqueness_prevention(self):
        # Verify unique constraints check is functional
        duplicate_prod = Product(sku="PROD_A", name="Duplicate A", price=15.0, quantity=3)
        self.db.add(duplicate_prod)
        with self.assertRaises(Exception):
            self.db.commit()
        self.db.rollback()

    def test_insufficient_stock_rejection(self):
        # Scenario: Customer requests 6 units of PROD_A, but only 5 are in stock
        order_in = OrderCreate(
            customer_id=self.customer.id,
            items=[
                OrderItemCreate(product_id=self.prod_a.id, quantity=6)
            ]
        )
        
        with self.assertRaises(HTTPException) as context:
            create_order_transaction(self.db, order_in)
            
        self.assertEqual(context.exception.status_code, 400)
        self.assertIn("Insufficient inventory", context.exception.detail)
        
        # Verify stock was NOT reduced (rollback check)
        self.db.refresh(self.prod_a)
        self.assertEqual(self.prod_a.quantity, 5)

    def test_successful_order_deduction_and_totals(self):
        # Scenario: Customer buys 2 of PROD_A ($10.00 each) and 1 of PROD_B ($25.50 each)
        order_in = OrderCreate(
            customer_id=self.customer.id,
            items=[
                OrderItemCreate(product_id=self.prod_a.id, quantity=2),
                OrderItemCreate(product_id=self.prod_b.id, quantity=1)
            ]
        )
        
        order = create_order_transaction(self.db, order_in)
        
        # 1. Verify total calculated dynamically: (2 * 10.0) + (1 * 25.50) = 45.50
        self.assertEqual(order.total_amount, 45.50)
        
        # 2. Verify stock levels reduced
        self.db.refresh(self.prod_a)
        self.db.refresh(self.prod_b)
        self.assertEqual(self.prod_a.quantity, 3) # 5 - 2
        self.assertEqual(self.prod_b.quantity, 9) # 10 - 1
        
        # 3. Verify order structure saved correctly
        self.assertEqual(len(order.items), 2)
        self.assertEqual(order.status, "Pending")

if __name__ == "__main__":
    unittest.main()
