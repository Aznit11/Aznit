"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { createCategory } from "../../../../lib/categoryService";
import { convertGoogleDriveLink } from "../../../../lib/utils";

export default function NewCategoryPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    imageUrl: "",
  });

  // Redirects to login if user is not authenticated or not admin
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (status === "authenticated" && session.user.role !== "ADMIN") {
    router.push("/");
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Update image preview when imageUrl changes
    if (name === "imageUrl" && value) {
      setPreviewImage(convertGoogleDriveLink(value));
    } else if (name === "imageUrl" && !value) {
      setPreviewImage("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Check if session has expired
      if (status !== "authenticated" || !session) {
        router.push("/login");
        return;
      }

      // Validate form data
      if (!formData.name) {
        throw new Error("Category name is required");
      }

      // Sanitize form data before sending to API
      const sanitizedData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        imageUrl: formData.imageUrl ? convertGoogleDriveLink(formData.imageUrl) : "",
      };

      // Create new category via API
      await createCategory(sanitizedData);
      
      // Redirect to categories list on success
      router.push("/admin/categories");
    } catch (error: any) {
      console.error("Error creating category:", error);
      setError(error.message || "An error occurred while creating the category");
      setIsSubmitting(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="container-custom py-12">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-8">
        <Link 
          href="/admin/categories" 
          className="inline-flex items-center text-primary hover:underline"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Categories
        </Link>
        <h1 className="text-3xl font-serif font-bold mt-4">Add New Category</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit}>
          {/* Category Name */}
          <div className="mb-6">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              required
            />
          </div>

          {/* Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            ></textarea>
          </div>

          {/* Image URL */}
          <div className="mb-6">
            <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Image URL
            </label>
            <div className="mb-1 flex items-center text-xs text-gray-500">
              <InformationCircleIcon className="h-4 w-4 mr-1" />
              <span>Google Drive links are automatically converted to compatible format</span>
            </div>
            <input
              type="text"
              id="imageUrl"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            
            {/* Image Preview */}
            {previewImage && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Image Preview:</p>
                <div className="border border-gray-200 rounded-md p-2 bg-gray-50 h-32 flex items-center justify-center">
                  <img 
                    src={previewImage} 
                    alt="Preview" 
                    className="max-h-full max-w-full object-contain"
                    onError={() => setError("Failed to load image preview. Please check the URL.")}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary/50 mr-3"
              onClick={() => router.push("/admin/categories")}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {isSubmitting ? "Creating..." : "Create Category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 