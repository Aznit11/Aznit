import { Product } from '@prisma/client';
import prisma from './prisma';

export interface ImageData {
  url: string;
  altText: string;
  isFeatured: boolean;
  displayOrder: number;
}

export interface ProductWithImages extends Product {
  images: ImageData[];
}

// Get all products
export async function getProducts() {
  try {
    // Check if we're running on the client or server
    const isClient = typeof window !== 'undefined';
    
    if (!isClient || process.env.NODE_ENV === 'development') {
      // Server-side or development environment - use database directly
      const products = await prisma.product.findMany({
        include: {
          images: {
            orderBy: {
              position: 'asc'
            }
          }
        }
      });
      
      // Transform the product data to ensure consistent format
      const transformedProducts = products.map(product => ({
        ...product,
        // If no images are related but imageUrl exists, create a virtual image
        images: product.images.length > 0 
          ? product.images 
          : (product.imageUrl 
            ? [{
                id: 'virtual-image',
                url: product.imageUrl,
                alt: product.name,
                position: 0,
                productId: product.id,
                createdAt: new Date(),
                updatedAt: new Date()
              }] 
            : [])
      }));
      
      return transformedProducts;
    }
    
    // Client-side in production - fetch from API
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error(`Error fetching products: ${response.status}`);
    }
    const data = await response.json();
    return data.products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

// Get a single product by ID
export async function getProduct(id: string) {
  try {
    // Check if we're running on the client or server
    const isClient = typeof window !== 'undefined';
    
    if (!isClient || process.env.NODE_ENV === 'development') {
      // Server-side or development environment - use database directly
      const product = await prisma.product.findUnique({
        where: { id },
        include: {
          reviews: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                }
              }
            },
            orderBy: {
              createdAt: 'desc'
            }
          },
          images: {
            orderBy: {
              position: 'asc'
            }
          }
        }
      });
      
      if (!product) return null;
      
      // Transform the product to include legacy imageUrl handling
      return {
        ...product,
        // If no images are related but imageUrl exists, create a virtual image
        images: product.images.length > 0 
          ? product.images 
          : (product.imageUrl 
            ? [{
                id: 'virtual-image',
                url: product.imageUrl,
                alt: product.name,
                position: 0,
                productId: product.id,
                createdAt: new Date(),
                updatedAt: new Date()
              }] 
            : [])
      };
    }
    
    // Client-side in production - fetch from API
    const response = await fetch(`/api/products/${id}`);
    if (!response.ok) {
      if (response.status === 404) {
    return null;
      }
      throw new Error(`Error fetching product: ${response.status}`);
    }
    const data = await response.json();
    return data.product;
  } catch (error) {
    console.error(`Error fetching product ${id}:`, error);
    return null;
  }
}

// Get related products (same category)
export async function getRelatedProducts(productId: string, category: string) {
  try {
    // Check if we're running on the client or server
    const isClient = typeof window !== 'undefined';
    
    if (!isClient || process.env.NODE_ENV === 'development') {
      // Server-side or development environment - use database directly
      const relatedProducts = await prisma.product.findMany({
        where: {
          id: { not: productId },
          category
        },
        include: {
          images: {
            orderBy: {
              position: 'asc'
            }
          }
        },
        take: 4
      });
      
      // Transform the products to include legacy imageUrl handling
      return relatedProducts.map(product => ({
        ...product,
        // If no images are related but imageUrl exists, create a virtual image
        images: product.images.length > 0 
          ? product.images 
          : (product.imageUrl 
            ? [{
                id: 'virtual-image',
                url: product.imageUrl,
                alt: product.name,
                position: 0,
                productId: product.id,
                createdAt: new Date(),
                updatedAt: new Date()
              }] 
            : [])
      }));
    }
    
    // Client-side in production - fetch from API
    const response = await fetch(`/api/products/related?id=${productId}&category=${encodeURIComponent(category)}`);
    if (!response.ok) {
      throw new Error(`Error fetching related products: ${response.status}`);
    }
    const data = await response.json();
    return data.products;
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
}

// Get featured products
export async function getFeaturedProducts() {
  try {
    // Check if we're running on the client or server
    const isClient = typeof window !== 'undefined';
    
    if (!isClient || process.env.NODE_ENV === 'development') {
      // Server-side or development environment - use database directly
      const featuredProducts = await prisma.product.findMany({
        where: { featured: true },
        include: {
          images: {
            orderBy: {
              position: 'asc'
            }
          }
        },
        take: 4
      });
      
      // Transform the products to include legacy imageUrl handling
      return featuredProducts.map(product => ({
        ...product,
        // If no images are related but imageUrl exists, create a virtual image
        images: product.images.length > 0 
          ? product.images 
          : (product.imageUrl 
            ? [{
                id: 'virtual-image',
                url: product.imageUrl,
                alt: product.name,
                position: 0,
                productId: product.id,
                createdAt: new Date(),
                updatedAt: new Date()
              }] 
            : [])
      }));
    }
    
    // Client-side in production - fetch from API
    const response = await fetch('/api/products/featured');
    if (!response.ok) {
      throw new Error(`Error fetching featured products: ${response.status}`);
    }
    const data = await response.json();
    return data.products;
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return [];
  }
}

// Helper to get the primary image for a product
export function getPrimaryProductImage(product: ProductWithImages): string {
  // First check for a featured image in the images array
  const featuredImage = product.images.find(img => img.isFeatured);
  if (featuredImage) {
    return featuredImage.url;
  }
  
  // If there's no featured image but there are images, use the first one
  if (product.images.length > 0) {
    return product.images[0].url;
  }
  
  // Fall back to the legacy imageUrl field
  return product.imageUrl || '/images/placeholder.jpg';
}

// Helper to get all product images
export function getAllProductImages(product: ProductWithImages): string[] {
  // Start with all images from the images relationship
  const imageUrls = product.images.map(img => img.url);
  
  // If legacy imageUrl exists and it's not already in the list, add it
  if (product.imageUrl && !imageUrls.includes(product.imageUrl)) {
    imageUrls.unshift(product.imageUrl);
  }
  
  // If no images, return a placeholder
  if (imageUrls.length === 0) {
    return ['/images/placeholder.jpg'];
  }
  
  return imageUrls;
} 