import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

// GET: Fetch user's chat conversations
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true, role: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Get URL params
    const url = new URL(req.url);
    const userIdFilter = url.searchParams.get('userId');

    // Different queries based on role
    let conversations;
    if (user.role === "ADMIN") {
      // Admins can see all conversations or filtered by userId
      const where = userIdFilter ? { userId: userIdFilter } : {};
      
      conversations = await prisma.chatConversation.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1, // Get only the most recent message
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    } else {
      // Regular users can only see their own conversations
      conversations = await prisma.chatConversation.findMany({
        where: {
          userId: user.id,
        },
        include: {
          messages: {
            orderBy: {
              createdAt: "desc",
            },
            take: 1, // Get only the most recent message
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });
    }

    return NextResponse.json({ conversations });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { error: "Failed to fetch conversations" },
      { status: 500 }
    );
  }
}

// POST: Create a new chat conversation
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title } = await req.json();

    if (!title) {
      return NextResponse.json(
        { error: "Conversation title is required" },
        { status: 400 }
      );
    }

    // Get user ID
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Create new conversation
    const conversation = await prisma.chatConversation.create({
      data: {
        userId: user.id,
        title,
      },
    });

    return NextResponse.json({ 
      success: true, 
      conversation 
    }, { status: 201 });
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { error: "Failed to create conversation" },
      { status: 500 }
    );
  }
} 