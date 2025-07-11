const sequelize = require('./models');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Otp = require('./models/Otp');

sequelize.sync({ alter: true }).then(() => {
    console.log('Database synced');
    process.exit();
}).catch((err) => {
    console.error('Failed to sync database:', err);
    process.exit(1);
}); 