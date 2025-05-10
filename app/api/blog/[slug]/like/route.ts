import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import prisma from '../../../../../lib/prisma';

// POST - Like a blog post
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
    
    // Check if the user has already liked the post
    const existingLike = await prisma.blogLike.findFirst({
      where: {
        postId: post.id,
        userId: session.user.id
      }
    });
    
    // If already liked, return conflict
    if (existingLike) {
      return NextResponse.json({ 
        error: 'You have already liked this post',
        userHasLiked: true
      }, { status: 409 });
    }
    
    // Create the like
    await prisma.blogLike.create({
      data: {
        postId: post.id,
        userId: session.user.id,
      },
    });
    
    // Get updated like count
    const likeCount = await prisma.blogLike.count({
      where: {
        postId: post.id
      }
    });
    
    return NextResponse.json({ 
      message: 'Post liked successfully',
      userHasLiked: true,
      likeCount
    });
  } catch (error) {
    console.error('Error liking post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Unlike a blog post
export async function DELETE(
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
    
    // Check if the user has liked the post
    const existingLike = await prisma.blogLike.findFirst({
      where: {
        postId: post.id,
        userId: session.user.id
      }
    });
    
    // If not liked, return error
    if (!existingLike) {
      return NextResponse.json({ 
        error: 'You have not liked this post',
        userHasLiked: false
      }, { status: 400 });
    }
    
    // Delete the like
    await prisma.blogLike.delete({
      where: {
        id: existingLike.id
      }
    });
    
    // Get updated like count
    const likeCount = await prisma.blogLike.count({
      where: {
        postId: post.id
      }
    });
    
    return NextResponse.json({ 
      message: 'Post unliked successfully',
      userHasLiked: false,
      likeCount
    });
  } catch (error) {
    console.error('Error unliking post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 