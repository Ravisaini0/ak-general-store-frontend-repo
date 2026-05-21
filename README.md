# AK General Store Frontend

Production-style React frontend for **AK General Store**, a multi-role grocery commerce platform with dedicated experiences for customers, admins, and delivery partners.

## Overview

This frontend powers the complete user-facing store journey:

- customer registration, login, OTP verification, and password recovery
- product browsing, search, categories, wishlist, and cart
- address management with map-based delivery location selection
- checkout with coverage validation, coupon support, and multiple payment modes
- order tracking, order history, and profile management
- admin dashboard, orders, products, categories, coupons, reports, and settings
- delivery dashboard, assigned orders, earnings, collection flow, and weekly payout requests

The project is built with **React + Vite + Tailwind CSS** and consumes the secured Spring Boot backend API.

## Core Modules

### Customer App

- Register / login / OTP verify
- Forgot password
- Browse products and categories
- Smart search
- Wishlist and cart
- Address book with current location and map selection
- Checkout with delivery coverage checks
- COD, manual UPI, and Razorpay-ready payment flow
- My Orders and order tracking
- Aata Chakki booking

### Admin Panel

- Dashboard with operations overview
- Product and category management
- Order management with filters and delivery assignment
- Customer management
- Delivery team management
- Coupons and usage controls
- Reports and store settings
- Shop location and coverage radius management

### Delivery Panel

- Login and assigned orders
- Batch-based delivery workflow
- Pickup, delivery, and collection tracking
- Earnings visibility
- Weekly withdrawal request flow

## Tech Stack

- React 18
- Vite 5
- React Router DOM 6
- Tailwind CSS 3
- Lucide React

## Project Structure

```txt
src/
|-- components/
|   |-- admin/
|   |-- cart/
|   |-- common/
|   |-- delivery/
|   `-- product/
|-- context/
|-- hooks/
|-- pages/
|   |-- admin/
|   |-- delivery/
|   `-- user/
|-- routes/
|-- services/
`-- utils/
```

## Environment Variables

Create a local env file from the example:

```powershell
Copy-Item .env.example .env.local
```

Required variables:

| Variable | Description |
| --- | --- |
| `VITE_API_BASE_URL` | Backend API base URL |
| `VITE_GOOGLE_MAPS_API_KEY` | Browser Google Maps key for address and map flows |

Example:

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_browser_key
```

## Local Development

### Prerequisites

- Node.js 18+
- npm
- Running backend API

### Install dependencies

```powershell
npm install
```

### Start development server

```powershell
npm run dev
```

Default local URL:

- `http://localhost:5173`

### Production build

```powershell
npm run build
```

### Preview production build

```powershell
npm run preview
```

## Routing and Role Protection

The frontend uses separate route groups for each role:

- customer routes
- admin routes
- delivery routes

Protected route handling includes:

- authentication checks
- role-based access control
- redirect-to-login for protected actions
- session expiry handling for invalid tokens

## Key Business Flows

### Customer Order Flow

```txt
Browse Products
-> Add to Cart
-> Login if required
-> Select Address + Delivery Location
-> Coverage Validation
-> Apply Coupon
-> Choose Payment
-> Place Order
-> Track Order
```

### Admin Fulfilment Flow

```txt
Review Order
-> Confirm Order
-> Assign Delivery Partner
-> Monitor Payment / Delivery Status
-> Track Collections and Payout Liability
```

### Delivery Flow

```txt
Accept Assigned Order
-> Pick Up from Shop
-> Collect COD or UPI if required
-> Mark Delivered
-> View Earnings
-> Request Weekly Withdrawal
```

## Production Notes

- frontend secrets are **not** committed
- `.env.local` is ignored
- build artifacts like `dist/` are ignored
- browser automation folders and local QA screenshots are ignored
- coverage and address validation rely on backend store settings

## Deployment

Production deployment guidance is documented in:

- [PRODUCTION-DEPLOYMENT.md](C:/Users/ravis/Documents/codex/e/ak-general-store/PRODUCTION-DEPLOYMENT.md)

Recommended production setup:

- deploy behind HTTPS
- point `VITE_API_BASE_URL` to the live backend domain
- use a restricted Google Maps browser key
- verify all role flows before launch

## Recommended Pre-Launch Checks

- customer register, login, OTP verify, and forgot password
- product search, category navigation, and product details
- address save, map selection, and checkout coverage validation
- coupon apply flow
- order placement and tracking
- admin login, order confirm, delivery assignment
- delivery login, pickup, delivery completion, and collection flow

## Related Repository

Backend API repository:

- [AK General Store Backend](https://github.com/Ravisaini0/ak-general-store-backend-repo)
