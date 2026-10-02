# 🛒 Shop ERP (Grocery Management System)

> A lightweight, full-stack Enterprise Resource Planning (ERP) system tailored for grocery stores and retail shops. Built with the MERN stack to handle inventory management, sales tracking, and customer ledgers efficiently.

![React](https://img.shields.io/badge/React-18-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-20-green.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green.svg)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)

---

## ✨ Key Features
- **Product & Inventory Management**: Track stock levels, pricing, and product categorization in real-time.
- **Point of Sale (POS) & Sales Tracking**: Seamlessly record daily sales and generate revenue reports.
- **Customer Ledgers**: Maintain robust profiles for loyal customers, including purchase history and due balances.
- **Purchase & Supply Chain**: Record wholesale purchases and automatically update existing stock levels.
- **Secure Authentication**: JWT-based authentication system to protect sensitive shop data.

---

## 🏗️ Architecture

The project is structured as a standard MERN stack monorepo:
- **`/backend`**: Node.js + Express API. Utilizes Mongoose models (`Customer.js`, `Product.js`, `Sale.js`, `Ledger.js`) and JWT middleware for secure endpoints.
- **`/frontend`**: React SPA (Single Page Application) built with Vite. Uses React Context (`AuthContext.jsx`) for global state management and features a fully responsive dashboard UI.

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas cluster)

### 1. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `/backend` directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
```
Start the backend server:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
*(The web UI will be available at `http://localhost:5173`)*

---

## 🔮 Future Updates & Roadmap
To elevate this project to a production-ready enterprise solution, the following updates are planned:
1. **Invoice Generation**: Auto-generate downloadable PDF invoices and receipts for customers.
2. **Advanced Analytics Dashboard**: Add charting libraries (e.g., Recharts) to visualize weekly/monthly profit margins and best-selling items.
3. **Role-Based Access Control (RBAC)**: Differentiate between Admin (owner) and Cashier roles to restrict deletion permissions.
4. **Offline Mode Support**: Implement Service Workers and IndexedDB on the frontend to allow temporary offline billing that syncs when the connection is restored.

## 🐛 Known Bugs to Fix
- **Token Expiration Handling**: Ensure the frontend gracefully logs the user out and redirects to the login screen when the JWT expires, instead of silently failing.
- **Concurrency in Inventory**: Add atomic operations (via MongoDB `$inc`) when recording sales to prevent stock count race conditions during high-volume simultaneous checkouts.