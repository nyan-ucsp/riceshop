import React, { useEffect, useState, useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { CartContext } from './App';
import { getProducts } from './api';
import { useNavigate } from 'react-router-dom';
import './ProductList.css';

function ProductList() {
    const [products, setProducts] = useState([]);
    const [imageErrors, setImageErrors] = useState({});
    const { cart, setCart } = useContext(CartContext);
    const navigate = useNavigate();
    const { t } = useTranslation();

    useEffect(() => {
        getProducts().then(setProducts);
    }, []);

    function addToCart(product) {
        const existing = cart.find(item => item.productId === product.id);
        if (existing) {
            setCart(cart.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item));
        } else {
            setCart([...cart, { productId: product.id, name: product.name, price: product.price, quantity: 1 }]);
        }
    }

    function viewDetails(product) {
        navigate(`/product/${product.id}`, { state: { product } });
    }

    function handleImageError(productId) {
        setImageErrors(prev => ({
            ...prev,
            [productId]: true
        }));
    }

    function getImageUrl(imagePath) {
        if (!imagePath) return null; // Return null if no image path
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:3000${imagePath}`;
    }

    function getImageSrc(product) {
        if (imageErrors[product.id]) {
            return '/logo192.png'; // Use same logo as app
        }
        const imageUrl = getImageUrl(product.image);
        return imageUrl || '/logo192.png'; // Use same logo as app
    }

    function formatMMK(amount) {
        return amount.toLocaleString('en-US') + ' MMK';
    }

    return (
        <div className="product-list-container">
            <h2 style={{ textAlign: 'center', color: '#2d7a2d', marginBottom: 32 }}>{t('common.products')}</h2>
            <div className="product-grid">
                {products.map(product => (
                    <div key={product.id} className="product-grid-item">
                        <img
                            src={getImageSrc(product)}
                            alt={product.name}
                            className="product-grid-image"
                            onError={() => handleImageError(product.id)}
                        />
                        <div className="product-grid-info">
                            <div className="product-grid-name">{product.name}</div>
                            <div className="product-grid-price">{formatMMK(product.price)}</div>
                        </div>
                        <div className="product-grid-actions">
                            <button
                                className="view-details-btn"
                                onClick={() => viewDetails(product)}
                            >
                                {t('product.description')}
                            </button>
                            <button
                                className="add-to-cart-btn"
                                onClick={() => addToCart(product)}
                            >
                                {t('common.addToCart')}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProductList; 