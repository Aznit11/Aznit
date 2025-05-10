"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { BlogPost } from '@/types';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const response = await fetch('/api/blog');
        
        if (!response.ok) {
          throw new Error('Failed to fetch blog posts');
        }
        
        const data = await response.json();
        setPosts(data.posts || []);
      } catch (err) {
        console.error('Error fetching blog posts:', err);
        setError('Failed to load blog posts. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchPosts();
  }, []);

  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl font-serif font-bold mb-8">Moroccan Lifestyle Blog</h1>
      
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8">
          {error}
        </div>
      )}
      
      {!loading && posts.length === 0 && !error && (
        <div className="text-center py-12">
          <p className="text-gray-500">No blog posts available yet. Check back soon!</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-lg overflow-hidden shadow-md transition-transform hover:shadow-lg hover:-translate-y-1">
            {post.imageUrl ? (
              <div className="relative h-48 w-full">
                <Image 
                  src={post.imageUrl} 
                  alt={post.title} 
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="h-48 bg-accent/20 flex items-center justify-center">
                <span className="text-accent">No image available</span>
              </div>
            )}
            
            <div className="p-6">
              <div className="flex flex-wrap gap-2 mb-3">
                {post.categories?.slice(0, 2).map((category, index) => (
                  <span key={index} className="inline-block bg-light text-secondary text-xs px-2 py-1 rounded">
                    {category}
                  </span>
                ))}
              </div>
              
              <h2 className="text-xl font-serif font-semibold mb-2 line-clamp-2">
                <Link href={`/blog/${post.slug}`} className="hover:text-primary transition-colors">
                  {post.title}
                </Link>
              </h2>
              
              <p className="text-gray-600 mb-4 line-clamp-3">
                {post.excerpt || post.content.substring(0, 150) + '...'}
              </p>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="flex items-center text-sm text-gray-500">
                    <span>{post.author?.name || 'Anonymous'}</span>
                    <span className="mx-2">•</span>
                    <span>{new Date(post.publishedAt || post.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {post.likeCount || 0}
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    {post.commentCount || 0}
                  </div>
                </div>
              </div>
              
              <div className="mt-4">
                <Link 
                  href={`/blog/${post.slug}`} 
                  className="text-primary hover:text-primary/80 font-medium"
                >
                  Read more →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 