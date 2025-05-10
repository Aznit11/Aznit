"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { BlogPost } from '@/types';
import ImageUploader from '@/components/admin/ImageUploader';

// Dynamically import ReactQuill to avoid SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });
import 'react-quill/dist/quill.snow.css';

export default function EditBlogPostPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { id } = params;
  
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editorLoaded, setEditorLoaded] = useState(false);
  
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [categoriesInput, setCategoriesInput] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [published, setPublished] = useState(false);
  const [originalSlug, setOriginalSlug] = useState('');

  // Load editor only after component mounts to avoid hydration issues
  useEffect(() => {
    setEditorLoaded(true);
    fetchBlogPost();
  }, [id]);
  
  // Fetch the blog post data
  const fetchBlogPost = async () => {
    try {
      setFetchLoading(true);
      const response = await fetch(`/api/admin/blog/${id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch blog post');
      }
      
      const data = await response.json();
      const post: BlogPost = data.post;
      
      // Set form values from fetched post
      setTitle(post.title);
      setSlug(post.slug);
      setOriginalSlug(post.slug);
      setContent(post.content);
      setExcerpt(post.excerpt || '');
      setImageUrl(post.imageUrl || '');
      setCategoriesInput(post.categories?.join(', ') || '');
      setTagsInput(post.tags?.join(', ') || '');
      setPublished(post.published);
      
    } catch (err: any) {
      console.error('Error fetching blog post:', err);
      setError(err.message || 'Failed to fetch blog post. Please try again later.');
    } finally {
      setFetchLoading(false);
    }
  };
  
  // Generate slug from title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    
    // Only auto-generate slug if it hasn't been manually edited or if it's empty
    if (!slug || slug === generateSlug(title)) {
      setSlug(generateSlug(newTitle));
    }
  };
  
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  // Handle image upload
  const handleImageUpload = (imagePath: string) => {
    setImageUrl(imagePath);
  };

  // Quill editor modules and formats
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      ['link', 'image'],
      ['clean']
    ],
  };
  
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet',
    'link', 'image'
  ];
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (loading) return;
    
    // Basic validation
    if (!title.trim()) {
      setError('Title is required');
      return;
    }
    
    if (!content.trim()) {
      setError('Content is required');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Prepare categories and tags
      const categories = categoriesInput
        .split(',')
        .map(cat => cat.trim())
        .filter(cat => cat !== '');
      
      const tags = tagsInput
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag !== '');
      
      const response = await fetch(`/api/admin/blog/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title,
          slug,
          content,
          excerpt: excerpt || null,
          imageUrl: imageUrl || null,
          categories,
          tags,
          published,
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update blog post');
      }
      
      // Redirect to blog management page
      router.push('/admin/blog');
    } catch (err: any) {
      console.error('Error updating blog post:', err);
      setError(err.message || 'Failed to update blog post. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  if (fetchLoading) {
    return (
      <AdminLayout pageTitle="Edit Blog Post">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </AdminLayout>
    );
  }
  
  return (
    <AdminLayout pageTitle="Edit Blog Post">
      <div className="mb-6 flex items-center">
        <Link href="/admin/blog" className="text-primary hover:text-primary/80 mr-4">
          ← Back to Blog Posts
        </Link>
        <h1 className="text-2xl font-bold">Edit Blog Post</h1>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={handleTitleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Post title"
                required
              />
            </div>
            
            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
                Slug
              </label>
              <input
                type="text"
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="post-url-slug"
              />
              <p className="text-xs text-gray-500 mt-1">
                The URL-friendly version of the title.
              </p>
            </div>
            
            <div>
              <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
                Excerpt
              </label>
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Brief summary of the post (optional)"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Featured Image
              </label>
              <ImageUploader 
                initialImage={imageUrl} 
                onImageUpload={handleImageUpload} 
              />
              <p className="text-xs text-gray-500 mt-1">
                Upload an image for the blog post (recommended size: 1200x800px).
              </p>
            </div>
            
            <div>
              <label htmlFor="categories" className="block text-sm font-medium text-gray-700 mb-1">
                Categories
              </label>
              <input
                type="text"
                id="categories"
                value={categoriesInput}
                onChange={(e) => setCategoriesInput(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Home Decor, Kitchenware, Beauty (comma separated)"
              />
            </div>
            
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="moroccan, traditional, handmade (comma separated)"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="published"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
              />
              <label htmlFor="published" className="ml-2 block text-sm text-gray-700">
                Published
              </label>
            </div>
          </div>
          
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
              Content *
            </label>
            {editorLoaded && (
              <div className="border border-gray-300 rounded-md">
                <ReactQuill
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  formats={formats}
                  theme="snow"
                  placeholder="Write your blog post content here..."
                  className="h-[350px] mb-12" // Add height and margin for the toolbar
                />
              </div>
            )}
            <p className="text-xs text-gray-500 mt-14">
              Use the formatting toolbar to add headlines, lists, links, and more to your content.
            </p>
          </div>
        </div>
        
        <div className="flex justify-end space-x-4">
          <Link
            href="/admin/blog"
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </AdminLayout>
  );
} 