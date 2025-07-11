const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const Otp = sequelize.define('Otp', {
    email: { type: DataTypes.STRING, allowNull: false },
    code: { type: DataTypes.STRING, allowNull: false },
    expiresAt: { type: DataTypes.DATE, allowNull: false },
});

module.exports = Otp; 