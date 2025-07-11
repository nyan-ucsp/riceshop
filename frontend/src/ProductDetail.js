import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from './App';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { getProducts } from './api';

function ProductDetail() {
    const { productId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const { cart, setCart } = useContext(CartContext);
    const [product, setProduct] = useState(location.state?.product || null);
    const [quantity, setQuantity] = useState(1);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (!product) {
            // If no product in state, fetch it by ID
            getProducts().then(products => {
                const foundProduct = products.find(p => p.id == productId);
                if (foundProduct) {
                    setProduct(foundProduct);
                } else {
                    navigate('/');
                }
            });
        }
    }, [productId, product, navigate]);

    function addToCart() {
        const existing = cart.find(item => item.productId === product.id);
        if (existing) {
            setCart(cart.map(item =>
                item.productId === product.id
                    ? { ...item, quantity: item.quantity + quantity }
                    : item
            ));
        } else {
            setCart([...cart, {
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: quantity
            }]);
        }
        navigate('/cart');
    }

    function handleImageError() {
        setImageError(true);
    }

    function getImageUrl(imagePath) {
        if (!imagePath) return null; // Return null if no image path
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:3000${imagePath}`;
    }

    function getImageSrc() {
        if (imageError) {
            return '/logo192.png'; // Use same logo as app
        }
        const imageUrl = getImageUrl(product.image);
        return imageUrl || '/logo192.png'; // Use same logo as app
    }

    function formatMMK(amount) {
        return amount.toLocaleString('en-US') + ' MMK';
    }

    if (!product) {
        return <div>Loading...</div>;
    }

    return (
        <div style={{
            minHeight: '100vh',
            background: '#f8fafc',
            padding: '40px 20px'
        }}>
            <div style={{
                maxWidth: 800,
                margin: '0 auto',
                background: '#fff',
                borderRadius: 12,
                boxShadow: '0 2px 12px #0001',
                padding: 32
            }}>
                <button
                    onClick={() => navigate('/')}
                    style={{
                        background: '#6c757d',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        padding: '8px 16px',
                        marginBottom: 24,
                        cursor: 'pointer',
                        fontSize: 14
                    }}
                >
                    ← Back to Products
                </button>

                <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
                    {/* Product Image */}
                    <div style={{ flex: '1', minWidth: 300 }}>
                        <img
                            src={getImageSrc()}
                            alt={product.name}
                            style={{
                                width: '100%',
                                height: 400,
                                objectFit: 'cover',
                                borderRadius: 8,
                                boxShadow: '0 4px 12px #0001'
                            }}
                            onError={handleImageError}
                        />
                    </div>

                    {/* Product Info */}
                    <div style={{ flex: '1', minWidth: 300 }}>
                        <h1 style={{
                            color: '#2d7a2d',
                            marginBottom: 16,
                            fontSize: '2.5rem'
                        }}>
                            {product.name}
                        </h1>

                        <div style={{
                            fontSize: '2rem',
                            fontWeight: 'bold',
                            color: '#2d7a2d',
                            marginBottom: 16
                        }}>
                            {formatMMK(product.price)}
                        </div>

                        {product.sku && (
                            <div style={{
                                color: '#666',
                                marginBottom: 16,
                                fontSize: '1.1rem'
                            }}>
                                <strong>SKU:</strong> {product.sku}
                            </div>
                        )}

                        <div style={{
                            color: '#333',
                            marginBottom: 32,
                            lineHeight: 1.6,
                            fontSize: '1.1rem'
                        }}>
                            {product.description}
                        </div>

                        {/* Quantity Selector */}
                        <div style={{ marginBottom: 24 }}>
                            <label style={{
                                display: 'block',
                                marginBottom: 8,
                                fontWeight: 500,
                                color: '#333'
                            }}>
                                Quantity:
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={quantity}
                                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                                style={{
                                    width: 80,
                                    padding: '8px 12px',
                                    borderRadius: 6,
                                    border: '1.5px solid #2d7a2d',
                                    fontSize: 16,
                                    outline: 'none'
                                }}
                            />
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={addToCart}
                            style={{
                                width: '100%',
                                background: '#2d7a2d',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                padding: '16px 0',
                                fontSize: 18,
                                fontWeight: 600,
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px #0001',
                                marginBottom: 16
                            }}
                        >
                            Add to Cart ({formatMMK(product.price * quantity)})
                        </button>

                        {/* Back to Cart Button */}
                        <button
                            onClick={() => navigate('/cart')}
                            style={{
                                width: '100%',
                                background: '#6c757d',
                                color: '#fff',
                                border: 'none',
                                borderRadius: 8,
                                padding: '12px 0',
                                fontSize: 16,
                                fontWeight: 500,
                                cursor: 'pointer'
                            }}
                        >
                            View Cart
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProductDetail; 