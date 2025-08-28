const { sequelize, AdminUser } = require('./models/index');
const bcrypt = require('bcryptjs');

async function syncDatabase() {
    try {
        // Sync all models
        await sequelize.sync({ alter: true });
        console.log('Database synced successfully');

        // Check if admin user exists
        const adminExists = await AdminUser.findOne({ where: { username: 'admin' } });
        
        if (!adminExists) {
            // Create default admin user
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await AdminUser.create({
                username: 'admin',
                password: hashedPassword
            });
            console.log('Default admin user created: admin/admin123');
        } else {
            console.log('Admin user already exists');
        }

        console.log('Database setup completed');
    } catch (error) {
        console.error('Error syncing database:', error);
    } finally {
        await sequelize.close();
    }
}

syncDatabase(); 