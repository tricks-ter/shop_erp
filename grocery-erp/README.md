# Grocery ERP System

A multi-tenant ERP system for grocery shops in Bangladesh. Built with MongoDB, Express.js, React, and Node.js (MERN Stack).

## Features

### Core Functionality
- **Multi-tenant Architecture**: Support multiple shops on the same platform
- **Product Management**: Track inventory, cost prices, selling prices, and stock levels
- **Sales Recording**: Record sales with automatic stock deduction
- **Purchase Management**: Record purchases from supplier SR with stock updates
- **Customer Ledger**: Track credit sales and payments at month-end
- **Business Intelligence**: Analytics dashboard with profit tracking and trend analysis

### Key Features
1. **Inventory Tracking**
   - Real-time stock updates
   - Low stock alerts
   - Automatic reorder suggestions

2. **Profit Calculation**
   - Track cost price vs selling price
   - Calculate profit per sale
   - Generate profit reports

3. **Customer Credit Management**
   - Maintain customer ledger
   - Track outstanding dues
   - Record monthly settlements

4. **Supplier Management**
   - Weekly purchase recording from SR
   - Track purchase history
   - Monitor supplier payments

5. **Analytics & Reports**
   - Sales trends (daily/weekly/monthly)
   - Top selling products
   - Profit analysis
   - Stock reports

## Tech Stack

### Backend
- Node.js + Express.js
- MongoDB + Mongoose
- JWT Authentication
- Multi-tenant architecture

### Frontend
- React 18
- Ant Design UI Components
- Recharts for data visualization
- React Router
- Axios for API calls

## Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Backend Setup

```bash
cd grocery-erp/backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration:
# PORT=5000
# MONGODB_URI=mongodb://localhost:27017/grocery-erp
# JWT_SECRET=your-secret-key
# NODE_ENV=development

# Start the server
npm start
# or for development
npm run dev
```

### Frontend Setup

```bash
cd grocery-erp/frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## Usage

### 1. Register Your Shop
- Navigate to `/register`
- Enter shop details (name, owner, location, etc.)
- You'll be logged in automatically

### 2. Add Products
- Go to Products page
- Click "Add Product"
- Enter product details including:
  - Cost price (from supplier SR)
  - Selling price
  - Initial stock
  - Minimum stock level for alerts

### 3. Record Purchases
- When SR visits weekly, go to Purchases page
- Click "New Purchase"
- Select products and quantities
- This will update stock levels

### 4. Make Sales
- Go to Sales page
- Click "New Sale"
- Add items to the sale
- Select customer (optional for walk-in)
- Choose payment status (paid/pending/partial)
- Stock will be automatically deducted

### 5. Manage Customer Credit
- Add customers with credit limits
- When selling on credit, select the customer
- View customer ledger anytime
- Record payments at month-end

### 6. View Reports
- Dashboard shows key metrics
- Reports page has detailed analytics:
  - Sales trends
  - Top products
  - Profit analysis

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new shop
- `POST /api/auth/login` - Login

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Add product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/products/low-stock` - Get low stock alerts

### Sales
- `POST /api/sales` - Record sale
- `GET /api/sales` - Get all sales
- `GET /api/sales/analytics/summary` - Get sales summary
- `GET /api/sales/analytics/top-products` - Get top products
- `GET /api/sales/analytics/trend` - Get sales trend

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Add customer
- `GET /api/customers/:id/ledger` - Get customer ledger
- `POST /api/customers/:id/payment` - Record payment
- `GET /api/customers/dues/outstanding` - Get outstanding dues

### Purchases
- `POST /api/purchases` - Record purchase
- `GET /api/purchases` - Get all purchases

## Project Structure

```
grocery-erp/
├── backend/
│   ├── models/          # Database schemas
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── controllers/     # Business logic
│   └── server.js        # Entry point
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── services/    # API services
│   │   └── App.jsx      # Main app component
│   └── public/
└── README.md
```

## Currency

All monetary values are in Bangladeshi Taka (BDT/৳)

## License

MIT License

## Support

For questions or issues, please contact the development team.
