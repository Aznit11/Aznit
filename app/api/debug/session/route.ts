import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Debug session:", JSON.stringify(session, null, 2));
    
    if (!session?.user?.email) {
      return NextResponse.json({ 
        error: "No authenticated session",
        session: null
      });
    }

    // Try to get user from database
    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { 
          id: true,
          email: true,
          name: true,
          role: true
        },
      });
    } catch (error) {
      console.error("Error fetching user:", error);
    }

    return NextResponse.json({ 
      session: {
        ...session,
        user: {
          ...session.user,
          // Don't expose sensitive data
          password: undefined
        }
      },
      databaseUser: user
    });
  } catch (error) {
    console.error("Error in debug session:", error);
    return NextResponse.json({ 
      error: "Failed to get session", 
      details: (error as Error).message 
    }, { status: 500 });
  }
} 