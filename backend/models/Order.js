const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Order = sequelize.define('Order', {
    name: { type: DataTypes.STRING, allowNull: false }, // Customer name
    email: { type: DataTypes.STRING, allowNull: false },
    address: { type: DataTypes.STRING, allowNull: false },
    cart: { type: DataTypes.JSON, allowNull: false },
    totalPrice: { type: DataTypes.FLOAT, allowNull: false },
    purchaseOrderNumber: { type: DataTypes.STRING, allowNull: false, unique: true },
    confirmed: { type: DataTypes.BOOLEAN, defaultValue: false },
    status: { type: DataTypes.STRING, defaultValue: 'pending' }, // pending, confirmed, delivered
    language: { type: DataTypes.STRING, defaultValue: 'en' }, // en, my - user's preferred language
});

module.exports = Order; 