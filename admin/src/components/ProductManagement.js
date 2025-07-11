import React, { useState, useEffect } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api';

function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        price: '',
        cost: '',
        description: '',
        image: null
    });
    const [imagePreview, setImagePreview] = useState(null);
    const [imageError, setImageError] = useState({});

    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        try {
            const data = await getProducts();
            setProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoading(false);
        }
    }

    function handleInputChange(e) {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    }

    function handleImageChange(e) {
        const file = e.target.files[0];
        if (file) {
            setFormData(prev => ({
                ...prev,
                image: file
            }));

            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    function resetForm() {
        setFormData({
            name: '',
            sku: '',
            price: '',
            cost: '',
            description: '',
            image: null
        });
        setImagePreview(null);
        setEditingProduct(null);
        setShowForm(false);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        try {
            if (editingProduct) {
                await updateProduct(editingProduct.id, formData);
            } else {
                await createProduct(formData);
            }
            resetForm();
            loadProducts();
        } catch (error) {
            console.error('Error saving product:', error);
        }
    }

    function handleEdit(product) {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            sku: product.sku,
            price: product.price.toString(),
            cost: product.cost?.toString() || '',
            description: product.description || '',
            image: null
        });
        setImagePreview(product.image ? `http://localhost:3000${product.image}` : null);
        setShowForm(true);
    }

    async function handleDelete(id) {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await deleteProduct(id);
                loadProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    }

    function handleImageError(productId) {
        setImageError(prev => ({
            ...prev,
            [productId]: true
        }));
    }

    function getImageUrl(imagePath) {
        if (!imagePath) return '/logo192.png';
        if (imagePath.startsWith('http')) return imagePath;
        return `http://localhost:3000${imagePath}`;
    }

    function getImageSrc(product) {
        if (imageError[product.id]) {
            return '/logo192.png'; // Use same logo as app
        }
        return getImageUrl(product.image);
    }

    function formatMMK(value) {
        return value ? value.toLocaleString('en-US', { maximumFractionDigits: 0 }) + ' MMK' : '0 MMK';
    }

    if (loading) {
        return <div>Loading products...</div>;
    }

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Product Management</h1>
                <p className="page-subtitle">Manage your rice products inventory</p>
            </div>

            <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h3>Products ({products.length})</h3>
                    <button
                        className="btn btn-primary"
                        onClick={() => setShowForm(true)}
                    >
                        Add New Product
                    </button>
                </div>

                {showForm && (
                    <div className="card" style={{ marginBottom: '20px' }}>
                        <h4>{editingProduct ? 'Edit Product' : 'Add New Product'}</h4>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Product Name</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">SKU</label>
                                <input
                                    type="text"
                                    name="sku"
                                    value={formData.sku}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Price</label>
                                <input
                                    type="number"
                                    name="price"
                                    value={formData.price}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Cost</label>
                                <input
                                    type="number"
                                    name="cost"
                                    value={formData.cost}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    step="0.01"
                                    min="0"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <textarea
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="form-input"
                                    rows="3"
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Product Image</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="form-input"
                                />
                                {imagePreview && (
                                    <div style={{ marginTop: '10px' }}>
                                        <img
                                            src={imagePreview}
                                            alt="Preview"
                                            style={{
                                                width: '100px',
                                                height: '100px',
                                                objectFit: 'cover',
                                                borderRadius: '4px'
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <button type="submit" className="btn btn-success">
                                    {editingProduct ? 'Update Product' : 'Add Product'}
                                </button>
                                <button type="button" className="btn btn-danger" onClick={resetForm}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <table className="table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>SKU</th>
                            <th>Price</th>
                            <th>Cost</th>
                            <th>Description</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>
                                    <img
                                        src={getImageSrc(product)}
                                        alt={product.name}
                                        style={{
                                            width: '50px',
                                            height: '50px',
                                            objectFit: 'cover',
                                            borderRadius: '4px'
                                        }}
                                        onError={() => handleImageError(product.id)}
                                    />
                                </td>
                                <td>{product.name}</td>
                                <td>{product.sku}</td>
                                <td>{formatMMK(product.price)}</td>
                                <td>{formatMMK(product.cost)}</td>
                                <td>{product.description}</td>
                                <td>
                                    <button
                                        className="btn btn-primary"
                                        onClick={() => handleEdit(product)}
                                        style={{ marginRight: '5px' }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="btn btn-danger"
                                        onClick={() => handleDelete(product.id)}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default ProductManagement; 