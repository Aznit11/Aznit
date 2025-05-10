const { PrismaClient } = require('@prisma/client');
const { hash } = require('bcrypt');
const prisma = new PrismaClient();

const createAdmin = async () => {
  try {
    console.log('Checking for admin user...');

    // Check if an admin user already exists
    const existingAdmin = await prisma.user.findFirst({
      where: {
        role: 'ADMIN'
      }
    });

    if (existingAdmin) {
      console.log('Admin user already exists:', existingAdmin.email);
      return existingAdmin;
    }

    // Create admin user if none exists
    console.log('No admin user found. Creating admin user...');
    
    // Generate hashed password
    const hashedPassword = await hash('Admin@123', 10);
    
    const adminUser = await prisma.user.create({
      data: {
        name: 'Admin User',
        email: 'admin@aznit.com',
        password: hashedPassword,
        role: 'ADMIN',
        emailVerified: new Date(),
      }
    });

    console.log('Admin user created successfully:', adminUser.email);
    return adminUser;
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
};

createAdmin()
  .catch((error) => {
    console.error('Error running script:', error);
    process.exit(1);
  }); 