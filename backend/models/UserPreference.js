const { DataTypes } = require('sequelize');
const sequelize = require('./index');

const UserPreference = sequelize.define('UserPreference', {
    email: { 
        type: DataTypes.STRING, 
        allowNull: false,
        unique: true
    },
    language: { 
        type: DataTypes.STRING, 
        allowNull: false,
        defaultValue: 'en'
    },
    createdAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
});

module.exports = UserPreference;
