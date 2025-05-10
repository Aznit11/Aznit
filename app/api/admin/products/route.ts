import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';

// Don't create a new PrismaClient for every request
// const prisma = new PrismaClient();

// GET all products
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const inStock = searchParams.get('inStock');
    const sort = searchParams.get('sort') || 'name:asc';

    // Build filter conditions
    const where: any = {};
    if (category) {
      where.category = category;
    }
    if (inStock !== null) {
      where.inStock = inStock === 'true';
    }

    // Parse sort parameter
    const [sortField, sortDirection] = sort.split(':');
    const orderBy: any = {};
    orderBy[sortField] = sortDirection.toLowerCase();

    // Get products with filtering and sorting, including images
    const products = await prisma.product.findMany({
      where,
      orderBy,
      include: {
        images: {
          orderBy: {
            position: 'asc'
          }
        }
      }
    });

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Create a new product
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }

    // Parse request body
    let data;
    try {
      data = await request.json();
    } catch (e) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }
    
    // Validate required fields
    if (!data.name) {
      return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
    }
    
    if (!data.price) {
      return NextResponse.json({ error: 'Product price is required' }, { status: 400 });
    }
    
    // Validate price format
    const price = parseFloat(data.price);
    if (isNaN(price) || price <= 0) {
      return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 });
    }

    // Extract additional images if any
    const additionalImages = data.additionalImages || [];

    // Create new product
    const productData: any = {
      name: data.name,
      description: data.description || '',
      price: price,
      imageUrl: data.imageUrl || '',
      category: data.category || '',
      inStock: data.inStock !== false, // Default to true if not provided
      featured: data.featured === true, // Default to false if not provided
      discount: data.discount ? parseFloat(data.discount) : null, // Parse discount as float
    };
    
    // Don't try to add weight until schema is properly migrated
    // The weight field will be stored in the frontend but not saved to the database yet
    // Uncomment this when database migration is complete:
    if (data.weight !== undefined && data.weight !== null) {
     productData.weight = parseFloat(data.weight);
    }
    
    try {
      // Create product with its related images in a transaction
      const product = await prisma.$transaction(async (tx) => {
        // Create the product first
        const newProduct = await tx.product.create({
          data: productData
        });
        
        // Add additional images if any
        if (additionalImages && additionalImages.length > 0) {
          // Process each additional image
          await Promise.all(additionalImages.map(async (imgUrl: string, index: number) => {
            await tx.productImage.create({
              data: {
                url: imgUrl,
                alt: `${productData.name} image ${index + 1}`,
                position: index,
                productId: newProduct.id
              }
            });
          }));
        }
        
        // Return the product with its images
        return tx.product.findUnique({
          where: { id: newProduct.id },
          include: { 
            images: {
              orderBy: {
                position: 'asc'
              }
            } 
          }
        });
      });
      
      return NextResponse.json({ product }, { status: 201 });
    } catch (error: any) {
      console.error('Error creating product in database:', error);
      
      // Return a more descriptive error
      return NextResponse.json({ 
        error: 'Database error', 
        details: error.message,
        cause: 'This might be due to a pending database migration. The weight field will be stored once the migration is complete.' 
      }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error creating product:', error);
    
    // Handle Prisma specific errors
    if (error.code) {
      return NextResponse.json({ 
        error: 'Database error', 
        details: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 