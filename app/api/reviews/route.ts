import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import prisma from "../../../lib/prisma";
import { authOptions } from "../../../lib/auth";

// Define types
interface ReviewUser {
  id: string;
  name: string | null;
  image: string | null;
}

interface ReviewWithUser {
  id: string;
  rating: number;
  comment: string | null;
  userId: string;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
  isApproved: boolean;
  user: ReviewUser;
}

// GET - Get reviews for a product
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get("productId");
    
    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }
    
    // Get approved reviews for the product
    const reviews = await prisma.review.findMany({
      where: {
        productId,
        isApproved: true,
      },
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
        createdAt: "desc",
      },
    });
    
    // Calculate average rating
    const averageRating = reviews.length > 0
      ? reviews.reduce((acc: number, review: ReviewWithUser) => acc + review.rating, 0) / reviews.length
      : 0;
    
    return NextResponse.json({
      reviews,
      count: reviews.length,
      averageRating,
    });
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

// POST - Submit a new review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: "You must be logged in to submit a review" },
        { status: 401 }
      );
    }
    
    const { productId, rating, comment } = await request.json();
    
    if (!productId || !rating) {
      return NextResponse.json(
        { error: "Product ID and rating are required" },
        { status: 400 }
      );
    }
    
    // Validate rating (1-5)
    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Rating must be between 1 and 5" },
        { status: 400 }
      );
    }
    
    // Get user from database
    const user = await prisma.user.findUnique({
      where: { email: session.user.email as string },
    });
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Check if user has already reviewed this product
    const existingReview = await prisma.review.findFirst({
      where: {
        userId: user.id,
        productId,
      },
    });
    
    if (existingReview) {
      // Update existing review
      const updatedReview = await prisma.review.update({
        where: { id: existingReview.id },
        data: {
          rating,
          comment,
          isApproved: false, // Reset approval on update
          updatedAt: new Date(),
        },
      });
      
      return NextResponse.json({
        message: "Review updated successfully. It will be visible after approval.",
        review: updatedReview,
      });
    }
    
    // Create new review
    const newReview = await prisma.review.create({
      data: {
        rating,
        comment,
        userId: user.id,
        productId,
        isApproved: false, // Requires moderation
      },
    });
    
    return NextResponse.json({
      message: "Review submitted successfully. It will be visible after approval.",
      review: newReview,
    });
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 }
    );
  }
} 