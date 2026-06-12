# InventoryFlow AI – Enterprise Inventory & Order Management System

InventoryFlow AI is a production-ready, containerized, enterprise-grade inventory and purchase order coordination system. It features a modern, glassmorphic SaaS design matching the visual styling of Linear, Stripe, and Ramp, with soft shadows, responsive layouts, automated charts, notifications, and dark mode theme switching.

---

## Technical Stack

* **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Query, React Hook Form, Recharts, Lucide Icons.
* **Backend**: Python 3.11+, FastAPI, PostgreSQL, SQLAlchemy ORM, JWT authentication, and Pydantic validation.
* **DevOps**: Docker, Docker Compose, Nginx.

---

## Quick Start (Docker Compose)

The easiest way to run the entire system (Database + Backend API + Frontend Client) is with Docker Compose. This automatically spins up PostgreSQL, runs schema initializations, seeds mock records, and compiles the React app.

### 1. Requirements
* Docker Desktop installed and running.
* Docker Compose available.

### 2. Launch the Application
Run the following command from the `inventoryflow/` directory:
```bash
docker-compose up --build -d
```

### 3. Access the Services
* **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
* **Backend API Swagger Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **PostgreSQL Database Port**: `5432`

---

## Authentication Credentials

To evaluate the dashboard, use the preloaded administrator credentials:
* **Email Address**: `admin@inventoryflow.ai`
* **Password**: `admin123`

---

## Manual Local Development Setup

If you prefer to run the applications locally on your machine without Docker:

### 1. Backend Setup
Navigate to the `backend/` directory:
1. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   # On Windows (CMD/PowerShell)
   .\venv\Scripts\activate
   # On macOS/Linux
   source venv/bin/activate
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file in the `backend/` folder (or rely on the root `.env`):
   ```env
   DATABASE_URL=sqlite:///./inventoryflow.db
   SECRET_KEY=supersecretjwtkeyforinventoryflowai123_change_in_prod
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=60
   PORT=8000
   ```
   *(Note: SQLite is automatically supported as a lightweight fallback for local execution without a running PostgreSQL container)*.
4. Launch the FastAPI Uvicorn server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

### 2. Frontend Setup
Navigate to the `frontend/` directory:
1. Install node packages:
   ```bash
   npm install --legacy-peer-deps
   ```
2. Launch the Vite local dev server:
   ```bash
   npm run dev
   ```
3. Open the browser to the URL printed in the terminal (typically `http://localhost:5173`).

---

## Business Logic Rules & Features

The system implements strict relational workflows:
1. **Unique SKUs**: Attempting to register duplicates triggers a `400 Bad Request` safety intercept.
2. **Stock Verification**: The order wizard prevents transactions containing quantities exceeding available stock.
3. **Transaction Rollbacks**: Any database write error triggers a database rollback, ensuring data integrity.
4. **Auto-Calculations**: Order totals are computed on the backend server from database prices, avoiding client-side price injection exploits.
5. **Inventory Refunding**: Cancelling an order automatically refunds the item counts back into product stocks.
6. **Activity Log**: Tracks system updates, including stock drop warnings, new signups, and transaction status adjustments.
7. **CSV Export**: Allows downloading recent transactions directly into a spreadsheet compatible format.
