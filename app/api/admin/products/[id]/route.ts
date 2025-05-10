import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import prisma from '../../../../../lib/prisma';

// GET a specific product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Get the product with its images
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        reviews: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
        },
        images: {
          orderBy: {
            position: 'asc'
          }
        }
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT - Update a product
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const data = await request.json();

    // Validate product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true
      }
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Extract additional images if any
    const additionalImages = data.additionalImages || [];
    
    // Check which images to keep (if any were removed)
    const imagesToKeep = data.imagesToKeep || [];

    // Update product
    const updateData: any = {
      name: data.name,
      description: data.description,
      price: parseFloat(data.price),
      imageUrl: data.imageUrl,
      category: data.category,
      inStock: data.inStock,
      featured: data.featured,
      discount: data.discount ? parseFloat(data.discount) : null,
    };
    
    // Don't try to update weight until schema is properly migrated
    // The weight field will be stored in the frontend but not saved to the database yet
    // Uncomment this when database migration is complete:
    if (data.weight !== undefined) {
      updateData.weight = data.weight !== null ? parseFloat(data.weight) : null;
    }
    
    try {
      // Use transaction to handle product update and image management
      const product = await prisma.$transaction(async (tx) => {
        // Update the product first
        const updatedProduct = await tx.product.update({
          where: { id },
          data: updateData
        });
        
        // Delete images that are not in the keep list
        if (existingProduct.images && existingProduct.images.length > 0) {
          for (const img of existingProduct.images) {
            if (!imagesToKeep.includes(img.id)) {
              await tx.productImage.delete({
                where: { id: img.id }
              });
            }
          }
        }
        
        // Add new images if any
        if (additionalImages && additionalImages.length > 0) {
          // Get current max position
          const maxPosition = existingProduct.images.length > 0 
            ? Math.max(...existingProduct.images.map(img => img.position)) 
            : -1;
          
          // Add new images
          for (let i = 0; i < additionalImages.length; i++) {
            await tx.productImage.create({
              data: {
                url: additionalImages[i],
                alt: `${updateData.name} image ${i + maxPosition + 2}`,
                position: maxPosition + i + 1,
                productId: id
              }
            });
          }
        }
        
        // Return the updated product with images
        return tx.product.findUnique({
          where: { id },
          include: {
            images: {
              orderBy: {
                position: 'asc'
              }
            }
          }
        });
      });
      
      return NextResponse.json({ product });
    } catch (error: any) {
      console.error('Error updating product in database:', error);
      
      // Return a more descriptive error
      return NextResponse.json({ 
        error: 'Database error', 
        details: error.message,
        cause: 'This might be due to a pending database migration. The weight field will be stored once the migration is complete.' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Delete a product
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;

    // Validate product exists
    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Delete product (will cascade delete product images due to our schema)
    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 