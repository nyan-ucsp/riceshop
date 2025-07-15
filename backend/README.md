# Rice Shop Backend

This is the backend API for the Rice Shop project, built with Node.js, Express, and Sequelize (SQLite by default). It powers the customer site and the admin panel.

## Features
- Customer order flow with OTP email confirmation
- Product and order management (admin)
- Admin user management (add/remove/edit/reset password)
- Analytics endpoints
- All prices in MMK (Myanmar Kyat)
- Email notifications for orders and OTPs

## Getting Started

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Environment Variables
Create a `.env` file in the `backend` directory with:
```
SMTP_USER=your_gmail@gmail.com
SMTP_PASS=your_gmail_app_password
SHOP_OWNER_EMAIL=your_notify_email@gmail.com
JWT_SECRET=your_super_secret
SMTP_SENDER_NAME=Rice Shop   # (Optional) Sender name for all outgoing emails
```

### 3. Database Setup
By default, uses PostgrsSQL (dbname: `rice_shop`).
To sync and seed sample data:
```bash
node sync.js   # Creates tables
node seed.js   # Seeds products and default admin
```

### 4. Run the Server
```bash
npm start
# or
node app.js
```
Server runs on [http://localhost:3000](http://localhost:3000) by default.

## Default Admin Login
- **Username:** `admin`
- **Password:** `admin123`

Change the password after first login!

## API Overview
- **Customer:**
  - `GET /api/products` — List products
  - `POST /api/orders` — Place order (sends OTP)
  - `POST /api/orders/confirm` — Confirm order with OTP
  - `POST /api/orders/resend-otp` — Resend OTP
- **Admin:**
  - `POST /api/admin/login` — Login (returns JWT)
  - `POST /api/admin/change-password` — Change own password
  - `GET /api/admin/users` — List admins
  - `POST /api/admin/users` — Add admin
  - `DELETE /api/admin/users/:id` — Remove admin
  - `PUT /api/admin/users/:id/username` — Edit admin username
  - `PUT /api/admin/users/:id/password` — Reset admin password
  - `GET /api/orders` — List all orders
  - `PUT /api/orders/:id/status` — Update order status
  - `POST /api/products` — Add product
  - `PUT /api/products/:id` — Edit product
  - `DELETE /api/products/:id` — Delete product
  - `GET /api/analytics` — Get analytics
  - `GET /api/analytics/monthly` — Get monthly analytics

All admin endpoints require a valid JWT in the `Authorization: Bearer ...` header.

## Postman Collection
A full Postman collection is provided: `RiceShop.postman_collection.json`
- Import into Postman to test all endpoints.
- Use the login endpoint to get a JWT, then set it as `{{admin_token}}` in the collection variables.

## Email Setup
- Uses Gmail SMTP by default. Enable "App Passwords" in your Google account.
- Emails are sent for OTP, order confirmation, and admin notifications.
- **Sender Name:** You can customize the sender name for all outgoing emails by setting `SMTP_SENDER_NAME` in your `.env` file. If not set, it defaults to `Rice Shop`.

## License
MIT 