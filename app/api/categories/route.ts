import { NextRequest, NextResponse } from 'next/server';
import prisma from '../../../lib/prisma';
import { getCachedCategories } from '../../../lib/cache';

// GET all categories
export async function GET(request: NextRequest) {
  try {
    // Use cache for categories
    const categories = await getCachedCategories(() =>
      prisma.category.findMany({
        orderBy: { name: 'asc' },
      })
    );
    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 