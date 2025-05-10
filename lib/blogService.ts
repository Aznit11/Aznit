import prisma from './prisma';
import { BlogPost, BlogComment, BlogLike } from '../types';

/**
 * Generate a slug from a title
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with a single one
    .trim();
}

/**
 * Get all published blog posts
 */
export async function getPublishedBlogPosts(limit?: number): Promise<BlogPost[]> {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
    orderBy: { publishedAt: 'desc' },
    take: limit,
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

  return posts.map(post => ({
    ...post,
    categories: post.categories ? post.categories.split(',').map(cat => cat.trim()) : [],
    tags: post.tags ? post.tags.split(',').map(tag => tag.trim()) : [],
    likeCount: post._count.likes,
    commentCount: post._count.comments,
  }));
}

/**
 * Get a published blog post by slug
 */
export async function getPublishedBlogPostBySlug(slug: string): Promise<BlogPost | null> {
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

  if (!post) return null;

  return {
    ...post,
    categories: post.categories ? post.categories.split(',').map(cat => cat.trim()) : [],
    tags: post.tags ? post.tags.split(',').map(tag => tag.trim()) : [],
    likeCount: post._count.likes,
  };
}

/**
 * Get all blog posts (including unpublished) for admin
 */
export async function getAllBlogPosts(): Promise<BlogPost[]> {
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

  return posts.map(post => ({
    ...post,
    categories: post.categories ? post.categories.split(',').map(cat => cat.trim()) : [],
    tags: post.tags ? post.tags.split(',').map(tag => tag.trim()) : [],
    likeCount: post._count.likes,
    commentCount: post._count.comments,
  }));
}

/**
 * Get a blog post by ID (for admin)
 */
export async function getBlogPostById(id: string): Promise<BlogPost | null> {
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

  if (!post) return null;

  return {
    ...post,
    categories: post.categories ? post.categories.split(',').map(cat => cat.trim()) : [],
    tags: post.tags ? post.tags.split(',').map(tag => tag.trim()) : [],
    likeCount: post.likes.length,
    commentCount: post.comments.length,
  };
}

/**
 * Check if a user has liked a post
 */
export async function hasUserLikedPost(postId: string, userId: string): Promise<boolean> {
  const like = await prisma.blogLike.findFirst({
    where: {
      postId,
      userId
    }
  });
  
  return !!like;
}

/**
 * Get recent blog posts
 */
export async function getRecentBlogPosts(limit = 3): Promise<BlogPost[]> {
  return getPublishedBlogPosts(limit);
}

/**
 * Get blog posts by category
 */
export async function getBlogPostsByCategory(category: string): Promise<BlogPost[]> {
  const posts = await prisma.blogPost.findMany({
    where: {
      published: true,
      categories: {
        contains: category,
      },
    },
    orderBy: { publishedAt: 'desc' },
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

  return posts.map(post => ({
    ...post,
    categories: post.categories ? post.categories.split(',').map(cat => cat.trim()) : [],
    tags: post.tags ? post.tags.split(',').map(tag => tag.trim()) : [],
    likeCount: post._count.likes,
    commentCount: post._count.comments,
  }));
}

/**
 * Get popular blog posts by like count
 */
export async function getPopularBlogPosts(limit = 3): Promise<BlogPost[]> {
  const posts = await prisma.blogPost.findMany({
    where: { published: true },
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
          likes: true,
          comments: true,
        },
      },
    },
    orderBy: {
      likes: {
        _count: 'desc',
      },
    },
    take: limit,
  });

  return posts.map(post => ({
    ...post,
    categories: post.categories ? post.categories.split(',').map(cat => cat.trim()) : [],
    tags: post.tags ? post.tags.split(',').map(tag => tag.trim()) : [],
    likeCount: post._count.likes,
    commentCount: post._count.comments,
  }));
} 