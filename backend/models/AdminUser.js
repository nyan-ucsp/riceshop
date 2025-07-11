const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const AdminUser = sequelize.define('AdminUser', {
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false }, // hashed
});

module.exports = AdminUser; 