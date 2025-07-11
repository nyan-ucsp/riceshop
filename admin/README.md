# Rice Shop Admin Panel

This is the admin dashboard for the Rice Shop project, built with React.

## Features
- Secure admin login (JWT-based)
- Product management (add, edit, delete)
- Order management (view, filter, mark delivered, detailed profit view)
- Admin user management (add, remove, edit username, reset password)
- Analytics dashboard (revenue, orders, monthly stats)
- All prices in MMK (Myanmar Kyat)
- Modern, responsive UI

## Getting Started

### 1. Install Dependencies
```bash
cd admin
npm install
```

### 2. Environment Variables
Usually, no special `.env` is needed. If your backend is not at `http://localhost:3000`, set the API base URL in `src/api.js` or via environment variables as needed.

### 3. Run the App
```bash
npm start
```
The app will run at [http://localhost:3002](http://localhost:3002) by default (or another port if 3000/3001 are in use).

### 4. Backend Requirement
- The backend API must be running (see `../backend/README.md`).
- All admin features require the backend and a valid admin user.

## Default Admin Login
- **Username:** `admin`
- **Password:** `admin123`

Change the password after first login!

## Project Structure
- `src/` — Main React source code
  - `App.js` — Main app, routing, and auth context
  - `components/` — Dashboard, ProductManagement, OrderManagement, Analytics, AdminManagement
  - `api.js` — API calls

## Customization
- Update branding, colors, and images in `public/` and `src/` as needed.
- To change the API base URL, edit `src/api.js`.

## License
MIT 