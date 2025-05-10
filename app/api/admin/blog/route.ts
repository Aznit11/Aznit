import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';
import { slugify } from '@/lib/blogService';

// GET - Get all blog posts (for admin)
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }
    
    const posts = await prisma.blogPost.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });
    
    // Process posts to transform categories and tags from strings to arrays
    const processedPosts = posts.map(post => ({
      ...post,
      categories: post.categories ? post.categories.split(',').map(cat => cat.trim()) : [],
      tags: post.tags ? post.tags.split(',').map(tag => tag.trim()) : [],
      likeCount: post._count.likes,
      commentCount: post._count.comments,
    }));
    
    return NextResponse.json({ posts: processedPosts });
  } catch (error) {
    console.error('Error fetching blog posts for admin:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST - Create a new blog post (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Check if user is authenticated and is an admin
    if (!session) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }
    
    // Parse request body
    const data = await request.json();
    
    // Validate required fields
    if (!data.title) {
      return NextResponse.json({ error: 'Post title is required' }, { status: 400 });
    }
    
    if (!data.content) {
      return NextResponse.json({ error: 'Post content is required' }, { status: 400 });
    }
    
    // Generate slug from title if not provided
    let slug = data.slug;
    if (!slug) {
      slug = slugify(data.title);
    }
    
    // Check if slug already exists
    const existingPost = await prisma.blogPost.findUnique({
      where: { slug },
    });
    
    if (existingPost) {
      // If slug exists, append a random string
      slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
    }
    
    // Process categories and tags
    const categories = Array.isArray(data.categories) ? data.categories.join(', ') : data.categories;
    const tags = Array.isArray(data.tags) ? data.tags.join(', ') : data.tags;
    
    // Set published date if post is published
    const publishedAt = data.published ? new Date() : null;
    
    // Create blog post
    const blogPost = await prisma.blogPost.create({
      data: {
        title: data.title,
        slug,
        content: data.content,
        excerpt: data.excerpt || null,
        imageUrl: data.imageUrl || null,
        published: data.published === true,
        publishedAt,
        authorId: session.user.id,
        categories,
        tags,
      },
    });
    
    return NextResponse.json({ blogPost }, { status: 201 });
  } catch (error) {
    console.error('Error creating blog post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 