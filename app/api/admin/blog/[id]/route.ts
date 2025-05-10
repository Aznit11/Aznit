import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';
import prisma from '../../../../../lib/prisma';

// GET - Get a specific blog post by ID (for admin)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }
    
    const { id } = params;
    
    const post = await prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        likes: true,
      },
    });
    
    if (!post) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }
    
    // Process post to transform categories and tags from strings to arrays
    const processedPost = {
      ...post,
      categories: post.categories ? post.categories.split(',').map(cat => cat.trim()) : [],
      tags: post.tags ? post.tags.split(',').map(tag => tag.trim()) : [],
      likeCount: post.likes.length,
      commentCount: post.comments.length,
    };
    
    return NextResponse.json({ post: processedPost });
  } catch (error) {
    console.error('Error fetching blog post for admin:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH - Update a blog post (admin only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }
    
    const { id } = params;
    const data = await request.json();
    
    // Find the post
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    });
    
    if (!existingPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }
    
    // If updating slug, check if the new slug already exists
    if (data.slug && data.slug !== existingPost.slug) {
      const slugExists = await prisma.blogPost.findFirst({
        where: {
          slug: data.slug,
          id: { not: id }
        },
      });
      
      if (slugExists) {
        return NextResponse.json({ error: 'Slug already exists' }, { status: 400 });
      }
    }
    
    // Process categories and tags if provided
    let categories = undefined;
    let tags = undefined;
    
    if (data.categories !== undefined) {
      categories = Array.isArray(data.categories) ? data.categories.join(', ') : data.categories;
    }
    
    if (data.tags !== undefined) {
      tags = Array.isArray(data.tags) ? data.tags.join(', ') : data.tags;
    }
    
    // Update publishedAt if publishing status changed
    let publishedAt = undefined;
    if (data.published !== undefined && data.published !== existingPost.published) {
      publishedAt = data.published ? new Date() : null;
    }
    
    // Update the post
    const updatedPost = await prisma.blogPost.update({
      where: { id },
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        excerpt: data.excerpt,
        imageUrl: data.imageUrl,
        published: data.published,
        publishedAt,
        categories,
        tags,
      },
    });
    
    return NextResponse.json({ post: updatedPost });
  } catch (error) {
    console.error('Error updating blog post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE - Delete a blog post (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }
    
    const { id } = params;
    
    // Find the post
    const existingPost = await prisma.blogPost.findUnique({
      where: { id },
    });
    
    if (!existingPost) {
      return NextResponse.json({ error: 'Blog post not found' }, { status: 404 });
    }
    
    // Delete the post - comments and likes will be cascade deleted
    await prisma.blogPost.delete({
      where: { id },
    });
    
    return NextResponse.json({ message: 'Blog post deleted successfully' });
  } catch (error) {
    console.error('Error deleting blog post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 