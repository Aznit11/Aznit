import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: Fetch user's wishlist
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Fetch wishlist items with product details
    const wishlistItems = await prisma.wishlistItem.findMany({
      where: { userId: user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            imageUrl: true,
            inStock: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Format the response
    const formattedWishlist = wishlistItems.map((item: any) => ({
      id: item.id,
      productId: item.productId,
      name: item.product.name,
      price: item.product.price,
      image: item.product.imageUrl,
      inStock: item.product.inStock,
      createdAt: item.createdAt,
    }));

    return NextResponse.json({ wishlist: formattedWishlist });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

// POST: Add item to wishlist
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Session in wishlist POST:", JSON.stringify(session, null, 2));
    
    if (!session?.user?.email) {
      console.log("No user email in session:", session);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { productId } = await req.json();
    console.log("ProductId from request:", productId);

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    // Get user ID
    let user;
    try {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true },
      });
      console.log("User found:", user);
    } catch (userError) {
      console.error("Error finding user:", userError);
      return NextResponse.json(
        { error: "Database error finding user" },
        { status: 500 }
      );
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Check if product exists
    let product;
    try {
      product = await prisma.product.findUnique({
        where: { id: productId },
      });
      console.log("Product found:", product);
    } catch (productError) {
      console.error("Error finding product:", productError);
      return NextResponse.json(
        { error: "Database error finding product" },
        { status: 500 }
      );
    }

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Check if already in wishlist
    const existingItem = await prisma.wishlistItem.findFirst({
      where: {
        userId: user.id,
        productId: productId,
      },
    });

    if (existingItem) {
      return NextResponse.json(
        { error: "Product already in wishlist", wishlistItem: existingItem },
        { status: 200 }
      );
    }

    // Add to wishlist
    const wishlistItem = await prisma.wishlistItem.create({
      data: {
        userId: user.id,
        productId: productId,
      },
      include: {
        product: {
          select: {
            name: true,
            price: true,
            imageUrl: true,
            inStock: true,
          },
        },
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: "Product added to wishlist",
      wishlistItem: {
        id: wishlistItem.id,
        productId: wishlistItem.productId,
        name: wishlistItem.product.name,
        price: wishlistItem.product.price,
        image: wishlistItem.product.imageUrl,
        inStock: wishlistItem.product.inStock,
        createdAt: wishlistItem.createdAt,
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Detailed error adding to wishlist:", error);
    return NextResponse.json(
      { error: "Failed to add item to wishlist", details: (error as Error).message },
      { status: 500 }
    );
  }
} 