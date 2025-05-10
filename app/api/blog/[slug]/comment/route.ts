import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import prisma from '../../../../../lib/prisma';

// POST - Add a comment to a blog post
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    const { slug } = params;
    const data = await request.json();
    
    // Validate content
    if (!data.content || !data.content.trim()) {
      return NextResponse.json({ error: 'Comment content is required' }, { status: 400 });
    }
    
    // Find the post by slug
    const post = await prisma.blogPost.findFirst({
      where: { 
        slug,
        published: true 
      },
    });
    
    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }
    
    // Create the comment
    const comment = await prisma.blogComment.create({
      data: {
        content: data.content.trim(),
        postId: post.id,
        userId: session.user.id,
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
    });
    
    return NextResponse.json({ 
      message: 'Comment added successfully',
      comment
    }, { status: 201 });
  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 