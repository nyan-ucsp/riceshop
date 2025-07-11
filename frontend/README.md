# Rice Shop Frontend

This is the customer-facing frontend for the Rice Shop project, built with React.

## Features
- Browse rice products
- Add to cart and checkout
- OTP email confirmation for orders
- Order success and status feedback
- Responsive, modern UI
- All prices in MMK (Myanmar Kyat)
- Fallback for missing product images

## Getting Started

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Environment Variables
Usually, no special `.env` is needed. If your backend is not at `http://localhost:3000`, set the API base URL in `src/api.js` or via environment variables as needed.

### 3. Run the App
```bash
npm start
```
The app will run at [http://localhost:3001](http://localhost:3001) by default (or another port if 3000 is in use).

### 4. Backend Requirement
- The backend API must be running (see `../backend/README.md`).
- All product, order, and OTP features require the backend.

## Project Structure
- `src/` — Main React source code
  - `App.js` — Main app and routing
  - `ProductList.js` — Product browsing
  - `Cart.js` — Shopping cart
  - `Checkout.js` — Checkout and OTP
  - `OrderSuccess.js` — Order confirmation
  - `api.js` — API calls

## Customization
- Update branding, colors, and images in `public/` and `src/` as needed.
- To change the API base URL, edit `src/api.js`.

## License
MIT 