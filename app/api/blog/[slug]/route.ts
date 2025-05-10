import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';

// GET - Get a specific blog post by slug
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;
    
    const post = await prisma.blogPost.findFirst({
      where: { 
        slug,
        published: true 
      },
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
        _count: {
          select: {
            likes: true,
          },
        },
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
      likeCount: post._count.likes,
    };
    
    // Check if the current user has liked the post
    const session = await getServerSession(authOptions);
    let userHasLiked = false;
    
    if (session) {
      const like = await prisma.blogLike.findFirst({
        where: {
          postId: post.id,
          userId: session.user.id
        }
      });
      
      userHasLiked = !!like;
    }
    
    return NextResponse.json({ 
      post: processedPost,
      userHasLiked
    });
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 