const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASS,
    {
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        dialect: 'postgres',
        logging: false,
        retry: {
            match: [
                /ETIMEDOUT/,
                /EHOSTUNREACH/,
                /ECONNRESET/,
                /ECONNREFUSED/,
                /ETIMEDOUT/,
                /ESOCKETTIMEDOUT/,
                /EHOSTUNREACH/,
                /EPIPE/,
                /EAI_AGAIN/,
                /SequelizeConnectionError/,
                /SequelizeConnectionRefusedError/,
                /SequelizeHostNotFoundError/,
                /SequelizeHostNotReachableError/,
                /SequelizeInvalidConnectionError/,
                /SequelizeConnectionTimedOutError/
            ],
            max: 3
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        dialectOptions: {
            connectTimeout: 10000,
            requestTimeout: 30000
        }
    }
);

// Test database connection
async function testConnection() {
    try {
        await sequelize.authenticate();
        console.log('Database connection has been established successfully.');
        return true;
    } catch (error) {
        console.error('Unable to connect to the database:', error.message);
        return false;
    }
}

// Initialize connection test
testConnection();

// Define all models
const AdminUser = sequelize.define('AdminUser', {
    username: { type: Sequelize.DataTypes.STRING, allowNull: false, unique: true },
    password: { type: Sequelize.DataTypes.STRING, allowNull: false }, // hashed
});

const Order = sequelize.define('Order', {
    name: { type: Sequelize.DataTypes.STRING, allowNull: false }, // Customer name
    email: { type: Sequelize.DataTypes.STRING, allowNull: false },
    address: { type: Sequelize.DataTypes.STRING, allowNull: false },
    cart: { type: Sequelize.DataTypes.JSON, allowNull: false },
    totalPrice: { type: Sequelize.DataTypes.FLOAT, allowNull: false },
    purchaseOrderNumber: { type: Sequelize.DataTypes.STRING, allowNull: false, unique: true },
    confirmed: { type: Sequelize.DataTypes.BOOLEAN, defaultValue: false },
    status: { type: Sequelize.DataTypes.STRING, defaultValue: 'pending' }, // pending, confirmed, delivered
    language: { type: Sequelize.DataTypes.STRING, defaultValue: 'en' }, // en, my - user's preferred language
});

const Otp = sequelize.define('Otp', {
    email: { type: Sequelize.DataTypes.STRING, allowNull: false },
    code: { type: Sequelize.DataTypes.STRING, allowNull: false },
    expiresAt: { type: Sequelize.DataTypes.DATE, allowNull: false },
});

const Product = sequelize.define('Product', {
    name: { type: Sequelize.DataTypes.STRING, allowNull: false },
    sku: { type: Sequelize.DataTypes.STRING, allowNull: false, unique: true },
    price: { type: Sequelize.DataTypes.FLOAT, allowNull: false },
    cost: { type: Sequelize.DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    description: { type: Sequelize.DataTypes.TEXT },
    image: { type: Sequelize.DataTypes.STRING },
    category: { type: Sequelize.DataTypes.STRING },
    stock: { type: Sequelize.DataTypes.INTEGER, defaultValue: 0 },
});

const UserPreference = sequelize.define('UserPreference', {
    email: { type: Sequelize.DataTypes.STRING, allowNull: false, unique: true },
    language: { type: Sequelize.DataTypes.STRING, defaultValue: 'en' }, // en, my
    createdAt: { type: Sequelize.DataTypes.DATE, defaultValue: Sequelize.NOW },
    updatedAt: { type: Sequelize.DataTypes.DATE, defaultValue: Sequelize.NOW },
});

module.exports = {
    sequelize,
    AdminUser,
    Order,
    Otp,
    Product,
    UserPreference
}; 