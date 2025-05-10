import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import prisma from "../../../lib/prisma";
import { csrfProtection } from "@/lib/csrf";

export async function GET(req: NextRequest) {
  try {
    // Try both methods to get the user session
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    const session = await getServerSession(authOptions);
    
    // Determine user ID from either token or session
    const userId = token?.id || session?.user?.id;

    // Check if user is authenticated
    if (!userId) {
      console.error("Authentication failed: No user ID found in token or session");
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    console.log("Fetching orders for user:", userId);

    // Fetch user orders
    const orders = await prisma.order.findMany({
      where: {
        userId: userId as string,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });

    console.log(`Found ${orders.length} orders for user ${userId}`);
    
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return NextResponse.json(
      { error: "Error fetching orders" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  // Check CSRF token for POST requests
  const csrfError = await csrfProtection(req);
  if (csrfError) {
    return csrfError;
  }
  
  try {
    // Get the user session
    const token = await getToken({ 
      req,
      secret: process.env.NEXTAUTH_SECRET 
    });
    
    const session = await getServerSession(authOptions);
    
    // Determine user ID from either token or session
    const userId = token?.id || session?.user?.id;

    // Check if user is authenticated
    if (!userId) {
      console.error("Authentication failed: No user ID found in token or session");
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }
    
    // Get order data from request body
    const orderData = await req.json();
    
    // Validate order data
    if (!orderData.items || orderData.items.length === 0) {
      return NextResponse.json(
        { error: "No items in order" },
        { status: 400 }
      );
    }
    
    // Create the order with only fields that exist in the schema
    const order = await prisma.order.create({
      data: {
        userId: userId as string,
        status: "PENDING",
        total: orderData.total,
        paymentProvider: orderData.paymentMethod || "PAYPAL",
        paymentId: orderData.paymentId || "",
        orderItems: {
          create: orderData.items.map((item: any) => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }
      }
    });
    
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    return NextResponse.json(
      { error: "Error creating order" },
      { status: 500 }
    );
  }
} 