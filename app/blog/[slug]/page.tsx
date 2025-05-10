"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { BlogPost, BlogComment } from '@/types';
import { useSession } from 'next-auth/react';

export default function BlogPostPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [userHasLiked, setUserHasLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [likingInProgress, setLikingInProgress] = useState(false);

  const slug = params.slug as string;

  useEffect(() => {
    if (!slug) return;

    async function fetchPost() {
      try {
        const response = await fetch(`/api/blog/${slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Blog post not found');
          }
          throw new Error('Failed to fetch blog post');
        }
        
        const data = await response.json();
        setPost(data.post);
        setUserHasLiked(data.userHasLiked);
        setLikeCount(data.post.likeCount);
      } catch (err) {
        console.error('Error fetching blog post:', err);
        setError('Failed to load blog post. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [slug]);

  const handleLike = async () => {
    if (!session) {
      router.push('/login?redirect=' + encodeURIComponent('/blog/' + slug));
      return;
    }

    if (likingInProgress) return;

    try {
      setLikingInProgress(true);
      const response = await fetch(`/api/blog/${slug}/like`, {
        method: userHasLiked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to update like status');
      }

      const data = await response.json();
      setUserHasLiked(data.userHasLiked);
      setLikeCount(data.likeCount);
    } catch (err) {
      console.error('Error updating like:', err);
    } finally {
      setLikingInProgress(false);
    }
  };

  const submitComment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      router.push('/login?redirect=' + encodeURIComponent('/blog/' + slug));
      return;
    }

    if (!comment.trim() || commenting) return;

    try {
      setCommenting(true);
      const response = await fetch(`/api/blog/${slug}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: comment }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit comment');
      }

      const data = await response.json();
      
      // Update the post with the new comment
      if (post) {
        setPost({
          ...post,
          comments: [data.comment, ...(post.comments || [])],
        });
      }
      
      setComment('');
    } catch (err) {
      console.error('Error submitting comment:', err);
    } finally {
      setCommenting(false);
    }
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="container-custom py-12">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-8">
          {error || 'Blog post not found'}
        </div>
        <div className="mt-4">
          <Link href="/blog" className="text-primary hover:text-primary/80">
            ← Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <div className="max-w-3xl mx-auto">
        <div className="mb-4">
          <Link href="/blog" className="text-primary hover:text-primary/80">
            ← Back to Blog
          </Link>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-4">
          {post.categories?.map((category, index) => (
            <Link 
              key={index} 
              href={`/blog?category=${encodeURIComponent(category)}`}
              className="inline-block bg-light text-secondary text-sm px-3 py-1 rounded hover:bg-secondary hover:text-white transition-colors"
            >
              {category}
            </Link>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-4xl font-serif font-bold mb-4">{post.title}</h1>

        {/* Author and Date */}
        <div className="flex items-center mb-6">
          {post.author?.image && (
            <div className="relative h-10 w-10 rounded-full overflow-hidden mr-3">
              <Image 
                src={post.author.image} 
                alt={post.author.name || 'Author'} 
                fill
                className="object-cover"
              />
            </div>
          )}
          <div>
            <div className="font-medium">{post.author?.name || 'Anonymous'}</div>
            <div className="text-sm text-gray-500">
              {new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </div>
        </div>

        {/* Featured Image */}
        {post.imageUrl && (
          <div className="relative h-96 w-full mb-8 rounded-lg overflow-hidden">
            <Image 
              src={post.imageUrl} 
              alt={post.title} 
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none mb-8"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 my-8 border-t border-b border-gray-200 py-4">
            <span className="text-gray-700 font-medium">Tags:</span>
            {post.tags.map((tag, index) => (
              <Link 
                key={index} 
                href={`/blog?tag=${encodeURIComponent(tag)}`}
                className="text-primary hover:text-primary/80"
              >
                #{tag}
              </Link>
            ))}
          </div>
        )}

        {/* Like Button */}
        <div className="flex justify-between items-center my-8">
          <button 
            onClick={handleLike}
            disabled={likingInProgress}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-colors ${
              userHasLiked 
                ? 'bg-primary/10 text-primary' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 ${userHasLiked ? 'fill-primary' : 'stroke-current fill-none'}`} 
              viewBox="0 0 24 24"
              strokeWidth={userHasLiked ? 0 : 2}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
            {userHasLiked ? 'Liked' : 'Like'} ({likeCount})
          </button>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              {post.comments?.length || 0} Comments
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="my-12">
          <h2 className="text-2xl font-serif font-bold mb-6">Comments</h2>

          {/* Comment Form */}
          <form onSubmit={submitComment} className="mb-8">
            <div className="mb-4">
              <textarea
                rows={4}
                placeholder={session ? "Add a comment..." : "Please log in to comment"}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                disabled={!session || commenting}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!session || !comment.trim() || commenting}
                className={`px-4 py-2 rounded-md ${
                  session && comment.trim() && !commenting
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {commenting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
            {!session && (
              <div className="mt-2 text-center text-sm text-gray-500">
                <Link href={`/login?redirect=${encodeURIComponent('/blog/' + slug)}`} className="text-primary hover:underline">
                  Log in
                </Link> to join the conversation.
              </div>
            )}
          </form>

          {/* Comment List */}
          {post.comments && post.comments.length > 0 ? (
            <div className="space-y-6">
              {post.comments.map((comment: BlogComment) => (
                <div key={comment.id} className="bg-light p-4 rounded-lg">
                  <div className="flex items-center mb-2">
                    {comment.user?.image && (
                      <div className="relative h-8 w-8 rounded-full overflow-hidden mr-2">
                        <Image 
                          src={comment.user.image} 
                          alt={comment.user.name || 'User'} 
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{comment.user?.name || 'Anonymous'}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                  </div>
                  <div className="text-gray-700">
                    {comment.content}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No comments yet. Be the first to share your thoughts!
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 