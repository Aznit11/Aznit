import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';

// GET all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');
    
    // Build filter conditions
    const where: any = {};
    if (category) {
      where.category = category;
    }
    if (featured === 'true') {
      where.featured = true;
    }

    // Get products with filtering and include images
    const products = await prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
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