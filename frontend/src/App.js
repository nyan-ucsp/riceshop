import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import ProductList from './ProductList';
import ProductDetail from './ProductDetail';
import Cart from './Cart';
import Checkout from './Checkout';
import OTPConfirmation from './OTPConfirmation';
import OrderSuccess from './OrderSuccess';
import logo from './logo192.jfif';

export const CartContext = React.createContext();

function App() {
  const [cart, setCart] = useState([]);
  const [orderInfo, setOrderInfo] = useState(null); // { orderId, email }

  return (
    <CartContext.Provider value={{ cart, setCart, orderInfo, setOrderInfo }}>
      <Router>
        <nav className="navbar">
          <Link to="/" className="logo-link">
            <img src={logo} alt="Rice Shop Logo" className="logo" />
          </Link>
          <div className="nav-links">
            <Link to="/cart" className="cart-link">
              <span className="cart-icon">🛒</span>
              <span className="cart-text">Cart</span>
              {cart.length > 0 && (
                <span className="cart-badge">{cart.reduce((a, c) => a + c.quantity, 0)}</span>
              )}
            </Link>
          </div>
        </nav>
        <Routes>
          <Route path="/" element={<ProductList />} />
          <Route path="/product/:productId" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/otp" element={<OTPConfirmation />} />
          <Route path="/success" element={<OrderSuccess />} />
        </Routes>
      </Router>
    </CartContext.Provider>
  );
}

export default App;
