const { sequelize, Product, AdminUser } = require('./models/index');
const bcrypt = require('bcryptjs');

async function seed() {
    await sequelize.sync({ alter: true });
    // Seed admin user
    const adminUsername = 'admin';
    const adminPassword = 'admin123';
    const existing = await AdminUser.findOne({ where: { username: adminUsername } });
    if (!existing) {
        const hash = await bcrypt.hash(adminPassword, 10);
        await AdminUser.create({ username: adminUsername, password: hash });
        console.log('Seeded default admin user: admin / admin123');
    }
    await Product.bulkCreate([
        { name: 'Shwebo Pawsan (Shel - Old)', sku: 'RICE-SBP-001', price: 168000, cost: 140000, description: "Premium aged Myanmar rice, highly aromatic and fluffy.", image: 'https://goodzay.com/cdn/shop/products/3_203bbdf4-de6a-4692-bc45-edf8b83fe417_1024x1024@2x.jpg?v=1602923532' },
        { name: 'Shwebo Pawsan (Shel - New)', sku: 'RICE-SBP-002', price: 150000, cost: 130000, description: "Fresh Shwebo Pawsan, aromatic and soft, ideal for daily meals.", image: 'https://cmhlprodblobstorage1.blob.core.windows.net/sys-master-cmhlprodblobstorage1/hbb/hb1/8979318964254/cmhl_1000000000080_1_hero.jpg_Default-WorkingFormat_1000Wx1000H' },
        { name: 'Ayeyarwady Pawsan', sku: 'RICE-AYP-003', price: 140000, cost: 115000, description: "Award-winning rice from the Ayeyarwady Delta, soft and fragrant.", image: 'https://cmhlprodblobstorage1.blob.core.windows.net/sys-master-cmhlprodblobstorage1/h75/had/9037047758878/cmhl_1000000000085_1_hero.jpg_Default-WorkingFormat_1000Wx1000H' },
        { name: 'ManawThuKha', sku: 'RICE-MTK-004', price: 125000, cost: 100000, description: "Popular short-grain rice, soft and pleasant texture.", image: 'https://goodzay.com/cdn/shop/products/14_1024x1024@2x.jpg?v=1602923525' },
        { name: 'Sticky Rice', sku: 'RICE-STL-005', price: 180000, cost: 155000, description: "Glutinous rice, perfect for desserts and traditional dishes.", image: 'https://i0.wp.com/chawjcreations.com/wp-content/uploads/2020/12/IMG_0846-2-scaled.jpg?resize=1536%2C1152&ssl=1' },
        { name: 'Zeeyar (Emata)', sku: 'RICE-EMT-006', price: 90000, cost: 80000, description: "Affordable long-grain rice, widely consumed in Myanmar.", image: 'https://goodzay.com/cdn/shop/products/11_5eb7b401-173c-4ab4-929d-9a0b026867f3.jpg?v=1602923527' },
    ], { ignoreDuplicates: true });
    console.log('Seeded initial rice products!');
    process.exit();
}

seed().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
}); 