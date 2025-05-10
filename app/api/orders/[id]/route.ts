import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import prisma from "../../../../lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const orderId = params.id;
    
    // Try both methods to get the user session
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    const session = await getServerSession(authOptions);
    
    // Determine user ID from either token or session
    const userId = token?.id || session?.user?.id;
    const userRole = token?.role || session?.user?.role;

    // Check if user is authenticated
    if (!userId) {
      console.error("Authentication failed: No user ID found in token or session");
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    console.log("Fetching order details:", orderId, "for user:", userId);

    // Fetch order details
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    // Check if order exists and belongs to user (or user is admin)
    if (!order) {
      console.error("Order not found:", orderId);
      return NextResponse.json(
        { error: "Order not found" },
        { status: 404 }
      );
    }

    if (order.userId !== userId && userRole !== "ADMIN") {
      console.error("Unauthorized access to order:", orderId, "by user:", userId);
      return NextResponse.json(
        { error: "Not authorized to view this order" },
        { status: 403 }
      );
    }

    console.log("Successfully fetched order:", orderId);
    return NextResponse.json({ order });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Error fetching order" },
      { status: 500 }
    );
  }
} 