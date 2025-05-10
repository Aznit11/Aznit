import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';

// GET a specific product by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get the product with its images
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        reviews: {
          where: { isApproved: true },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        images: true
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Process tags if they exist (convert from comma-separated string to array)
    const processedProduct = {
      ...product,
      tags: product.tags ? product.tags.split(',').map(tag => tag.trim()) : []
    };

    return NextResponse.json({ product: processedProduct });
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 