import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../../lib/prisma';
import { getCachedFeaturedProducts } from '../../../../lib/cache';

// GET featured products
export async function GET(request: NextRequest) {
  try {
    // Use cache for featured products
    const products = await getCachedFeaturedProducts(() =>
      prisma.product.findMany({
        where: {
          featured: true,
          inStock: true
        },
        include: {
          images: {
            orderBy: {
              position: 'asc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      })
    );

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 