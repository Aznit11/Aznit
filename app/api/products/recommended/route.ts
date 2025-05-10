import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Fetch recommended products
export async function GET(req: NextRequest) {
  try {
    // Get the 'limit' query parameter or default to 8
    const url = new URL(req.url);
    const limit = Number(url.searchParams.get("limit")) || 8;

    // Strategy for recommendations:
    // 1. First get featured products
    // 2. Then add popular products (could be based on order frequency)
    // 3. Ensure we have enough products by adding more if needed

    // Get featured products first
    const featuredProducts = await prisma.product.findMany({
      where: {
        featured: true,
        inStock: true,
      },
      include: {
        images: {
          orderBy: {
            position: 'asc'
          }
        }
      },
      take: limit,
    });

    // If we already have enough featured products, return them
    if (featuredProducts.length >= limit) {
      return NextResponse.json({
        products: featuredProducts.slice(0, limit),
      });
    }

    // Add additional products to reach the limit
    const additionalProducts = await prisma.product.findMany({
      where: {
        inStock: true,
        featured: false,
        id: {
          notIn: featuredProducts.map((p: { id: string }) => p.id)
        }
      },
      include: {
        images: {
          orderBy: {
            position: 'asc'
          }
        }
      },
      take: limit - featuredProducts.length,
    });

    // Combine featured and additional products
    const recommendedProducts = [...featuredProducts, ...additionalProducts];

    return NextResponse.json({
      products: recommendedProducts,
    });
  } catch (error) {
    console.error("Error fetching recommended products:", error);
    return NextResponse.json(
      { error: "Failed to fetch recommended products" },
      { status: 500 }
    );
  }
} 