import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { hash } from 'bcrypt';

// Sample data for seeding the database
const sampleProducts = [
  {
    name: 'Moroccan Tea Glass',
    description: 'Traditional hand-painted tea glass from Morocco',
    price: 12.99,
    imageUrl: '/images/products/tea-glass.jpg',
    category: 'Homeware',
    inStock: true,
    featured: true
  },
  {
    name: 'Handwoven Basket',
    description: 'Authentic handwoven basket made by artisans',
    price: 29.99,
    imageUrl: '/images/products/basket.jpg',
    category: 'Homeware',
    inStock: true,
    featured: false
  },
  {
    name: 'Argan Oil',
    description: 'Pure organic argan oil for skin and hair',
    price: 24.50,
    imageUrl: '/images/products/argan-oil.jpg',
    category: 'Beauty',
    inStock: true,
    featured: true
  },
  {
    name: 'Ceramic Tagine',
    description: 'Traditional Moroccan cooking pot',
    price: 39.99,
    imageUrl: '/images/products/tagine.jpg',
    category: 'Homeware',
    inStock: true,
    featured: true
  },
  {
    name: 'Berber Rug - Small',
    description: 'Handmade Berber rug with traditional patterns',
    price: 89.99,
    imageUrl: '/images/products/rug-small.jpg',
    category: 'Textiles',
    inStock: true,
    featured: false
  },
  {
    name: 'Moroccan Leather Pouf',
    description: 'Handcrafted leather pouf, perfect as an ottoman',
    price: 79.99,
    imageUrl: '/images/products/pouf.jpg',
    category: 'Furniture',
    inStock: true,
    featured: true
  }
];

// Function to seed the database with sample data
export async function GET(req: NextRequest) {
  try {
    // Check if we're in development mode
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'This endpoint is only available in development mode' },
        { status: 403 }
      );
    }

    // Create sample products
    const productPromises = sampleProducts.map(product => 
      prisma.product.create({
        data: product
      })
    );
    
    const products = await Promise.all(productPromises);
    console.log(`Created ${products.length} products`);
    
    // Create a test admin user if it doesn't exist
    const adminEmail = 'admin@aznit.com';
    const existingAdmin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    let admin;
    if (!existingAdmin) {
      admin = await prisma.user.create({
        data: {
          name: 'Admin User',
          email: adminEmail,
          password: await hash('admin123', 10),
          role: 'ADMIN'
        }
      });
      console.log('Created admin user:', admin.email);
    } else {
      admin = existingAdmin;
      console.log('Admin user already exists:', admin.email);
    }
    
    // Create a test regular user if it doesn't exist
    const userEmail = 'user@aznit.com';
    const existingUser = await prisma.user.findUnique({
      where: { email: userEmail }
    });
    
    let user;
    if (!existingUser) {
      user = await prisma.user.create({
        data: {
          name: 'Test User',
          email: userEmail,
          password: await hash('user123', 10),
          role: 'USER'
        }
      });
      console.log('Created regular user:', user.email);
    } else {
      user = existingUser;
      console.log('Regular user already exists:', user.email);
    }
    
    // Return the created data
    return NextResponse.json({
      success: true,
      products: products.map(p => ({ id: p.id, name: p.name })),
      admin: { id: admin.id, email: admin.email },
      user: { id: user.id, email: user.email }
    });
    
  } catch (error) {
    console.error('Error seeding database:', error);
    return NextResponse.json(
      { error: 'Failed to seed database', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
} 