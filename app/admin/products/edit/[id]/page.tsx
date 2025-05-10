"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon, InformationCircleIcon, XMarkIcon, PlusIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { fetchCategories } from "../../../../../lib/categoryService";
import { convertGoogleDriveLink } from "../../../../../lib/utils";
import { Category } from "../../../../../types";

interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  position: number;
}

interface ProductData {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  weight: string;
  inStock: boolean;
  featured: boolean;
  discount: string;
  images?: ProductImage[];
}

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  // For additional images
  const [existingImages, setExistingImages] = useState<ProductImage[]>([]);
  const [additionalImages, setAdditionalImages] = useState<string[]>([]);
  const [additionalImageInput, setAdditionalImageInput] = useState("");
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<ProductData>({
    id: "",
    name: "",
    description: "",
    price: "",
    imageUrl: "",
    category: "",
    weight: "",
    inStock: true,
    featured: false,
    discount: "",
  });

  // Function to convert Google Drive links to direct image URLs
  const convertGoogleDriveLink = (url: string) => {
    // Check if it's a Google Drive link
    const gdriveLinkRegex = /https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/view/;
    const match = url.match(gdriveLinkRegex);
    
    if (match && match[1]) {
      const fileId = match[1];
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }
    
    return url; // Return original URL if not a Google Drive link
  };

  // Update preview image when imageUrl changes
  useEffect(() => {
    if (formData.imageUrl) {
      const convertedUrl = convertGoogleDriveLink(formData.imageUrl);
      setPreviewImage(convertedUrl);
    } else {
      setPreviewImage(null);
    }
  }, [formData.imageUrl]);

  // Update additional image previews
  useEffect(() => {
    const previews = additionalImages.map(url => convertGoogleDriveLink(url));
    setAdditionalImagePreviews(previews);
  }, [additionalImages]);

  // Load categories from the database
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error loading categories:", error);
      } finally {
        setCategoriesLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Fetch product data when the component mounts
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/admin/products/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setNotFound(true);
          } else {
            throw new Error("Failed to fetch product");
          }
          return;
        }
        
        const data = await response.json();
        setFormData({
          id: data.product.id,
          name: data.product.name,
          description: data.product.description || "",
          price: data.product.price.toString(),
          imageUrl: data.product.imageUrl || "",
          category: data.product.category || "",
          weight: data.product.weight ? data.product.weight.toString() : "",
          inStock: data.product.inStock,
          featured: data.product.featured || false,
          discount: data.product.discount ? data.product.discount.toString() : "",
        });

        // If there's an image URL, set preview
        if (data.product.imageUrl) {
          setPreviewImage(convertGoogleDriveLink(data.product.imageUrl));
        }
        
        // Set existing images if available
        if (data.product.images && data.product.images.length > 0) {
          setExistingImages(data.product.images);
        }
      } catch (error: any) {
        setError(error.message || "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated" && session.user.role === "ADMIN") {
      fetchProduct();
    }
  }, [params.id, status, session]);

  // Redirects to login if user is not authenticated or not admin
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (status === "authenticated" && session.user.role !== "ADMIN") {
    router.push("/");
    return null;
  }

  // Handle adding an additional image
  const handleAddAdditionalImage = () => {
    if (additionalImageInput && !additionalImages.includes(additionalImageInput)) {
      setAdditionalImages([...additionalImages, additionalImageInput]);
      setAdditionalImageInput("");
    }
  };

  // Handle removing an additional image
  const handleRemoveAdditionalImage = (index: number) => {
    const newImages = [...additionalImages];
    newImages.splice(index, 1);
    setAdditionalImages(newImages);
  };
  
  // Handle removing an existing image
  const handleRemoveExistingImage = (id: string) => {
    setExistingImages(existingImages.filter(img => img.id !== id));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
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
      if (!formData.name || !formData.price) {
        throw new Error("Product name and price are required");
      }

      // Parse price to ensure it's a valid number
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        throw new Error("Price must be a positive number");
      }

      // Convert Google Drive URL if needed
      const imageUrl = formData.imageUrl ? convertGoogleDriveLink(formData.imageUrl) : "";

      // Convert additional image URLs
      const processedAdditionalImages = additionalImages.map(url => convertGoogleDriveLink(url));

      // Parse discount as number or set to 0 if empty
      const discount = formData.discount ? parseFloat(formData.discount) : 0;

      // Parse weight as number or set to null if empty
      const weight = formData.weight ? parseFloat(formData.weight) : null;

      // Sanitize form data before sending to API
      const sanitizedData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: formData.price,
        imageUrl: imageUrl,
        additionalImages: processedAdditionalImages,
        imagesToKeep: existingImages.map(img => img.id),
        category: formData.category,
        weight: weight,
        inStock: formData.inStock,
        featured: formData.featured,
        discount: discount
      };

      // Update product via API
      const response = await fetch(`/api/admin/products/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sanitizedData),
        credentials: "include" // Include credentials to ensure session cookies are sent
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update product");
      }

      const result = await response.json();
      console.log("Product updated:", result);
      
      // Redirect to products list on success
      router.push("/admin/products");
    } catch (error: any) {
      console.error("Error updating product:", error);
      setError(error.message || "An error occurred while updating the product");
      setIsSubmitting(false);
    }
  };

  if (notFound) {
    return (
      <div className="container-custom py-8">
        <div className="mb-8">
          <Link 
            href="/admin/products" 
            className="inline-flex items-center text-primary hover:underline"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Products
          </Link>
        </div>
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          Product not found. The product may have been deleted or you may have followed an invalid link.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container-custom py-8">
        <div className="mb-8">
          <Link 
            href="/admin/products" 
            className="inline-flex items-center text-primary hover:underline"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Products
          </Link>
          <h1 className="text-3xl font-serif font-bold mt-4">Edit Product</h1>
        </div>
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
          href="/admin/products" 
          className="inline-flex items-center text-primary hover:underline"
        >
          <ArrowLeftIcon className="h-4 w-4 mr-1" />
          Back to Products
        </Link>
        <h1 className="text-3xl font-serif font-bold mt-4">Edit Product</h1>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Product Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
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

            {/* Price */}
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
                Price *
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                required
              />
            </div>
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Main Image URL */}
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Main Image URL
              </label>
              <div className="flex flex-col">
                <input
                  type="text"
                  id="imageUrl"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg or Google Drive link"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 mb-2"
                />
                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <InformationCircleIcon className="h-4 w-4 mr-1" />
                  <span>You can use a direct image URL or Google Drive link</span>
                </div>
                {previewImage && (
                  <div className="mt-2 relative h-32 w-full border rounded-md overflow-hidden">
                    <Image
                      src={previewImage}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Existing and Additional Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Images
              </label>
              <div className="flex flex-col">
                {/* Existing Images Section */}
                {existingImages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Existing Images:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {existingImages.map((img) => (
                        <div key={img.id} className="relative">
                          <div className="relative h-24 w-full border rounded-md overflow-hidden">
                            <Image
                              src={convertGoogleDriveLink(img.url)}
                              alt={img.alt || `Product image`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveExistingImage(img.id)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images Input */}
                <div className="flex">
                  <input
                    type="text"
                    value={additionalImageInput}
                    onChange={(e) => setAdditionalImageInput(e.target.value)}
                    placeholder="https://example.com/image.jpg or Google Drive link"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-primary/50"
                  />
                  <button
                    type="button"
                    onClick={handleAddAdditionalImage}
                    className="px-4 py-2 bg-primary text-white rounded-r-md hover:bg-primary/90"
                  >
                    <PlusIcon className="h-5 w-5" />
                  </button>
                </div>
                
                {/* New Images Preview */}
                {additionalImagePreviews.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">New Images:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {additionalImagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <div className="relative h-24 w-full border rounded-md overflow-hidden">
                            <Image
                              src={preview}
                              alt={`Additional image ${index + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveAdditionalImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                          >
                            <XMarkIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                <option value="">Select a category</option>
                {categoriesLoading ? (
                  <option disabled>Loading categories...</option>
                ) : (
                  categories.map((category) => (
                    <option key={category.id} value={category.name}>
                      {category.name}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Weight */}
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                id="weight"
                name="weight"
                value={formData.weight}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder="Optional"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Discount */}
            <div>
              <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">
                Discount % (Optional)
              </label>
              <input
                type="number"
                id="discount"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                min="0"
                max="100"
                step="1"
                placeholder="e.g. 10"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* In Stock */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="inStock"
                name="inStock"
                checked={formData.inStock}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-primary"
              />
              <label htmlFor="inStock" className="ml-2 text-sm text-gray-700">
                In Stock
              </label>
            </div>

            {/* Featured */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="featured"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="h-4 w-4 text-primary focus:ring-primary"
              />
              <label htmlFor="featured" className="ml-2 text-sm text-gray-700">
                Featured Product
              </label>
            </div>
          </div>

          <div className="mt-8 flex items-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-3 rounded-md ${
                isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-primary text-white hover:bg-primary/90"
              }`}
            >
              {isSubmitting ? "Updating..." : "Update Product"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="ml-4 px-6 py-3 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 