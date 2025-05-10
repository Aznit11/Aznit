import { Product, ProductImage } from '../../types';

/**
 * Type-safe wrapper for product-related API calls
 */

// Get a product by ID
export async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const response = await fetch(`/api/products/${id}`);
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Error fetching product: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Process the product data to ensure it meets our type expectations
    if (data.product) {
      // Make sure tags is an array (parsed from comma-separated string on the server)
      if (!Array.isArray(data.product.tags)) {
        data.product.tags = data.product.tags ? String(data.product.tags).split(',').map((t: string) => t.trim()) : [];
      }
      
      // Make sure images is consistently structured for components
      if (data.product.images && !Array.isArray(data.product.images)) {
        data.product.images = [];
      }
      
      return data.product as Product;
    }
    
    return null;
  } catch (error) {
    console.error('Error in fetchProduct:', error);
    return null;
  }
}

// Get all products
export async function fetchProducts(): Promise<Product[]> {
  try {
    const response = await fetch('/api/products');
    
    if (!response.ok) {
      throw new Error(`Error fetching products: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Process the products to ensure they meet our type expectations
    if (data.products && Array.isArray(data.products)) {
      return data.products.map((product: any) => ({
        ...product,
        // Make sure tags is an array
        tags: product.tags ? String(product.tags).split(',').map((t: string) => t.trim()) : [],
        // Make sure images is consistently structured for components
        images: Array.isArray(product.images) ? product.images : []
      })) as Product[];
    }
    
    return [];
  } catch (error) {
    console.error('Error in fetchProducts:', error);
    return [];
  }
}

// Get related products
export async function fetchRelatedProducts(productId: string, category: string): Promise<Product[]> {
  try {
    const response = await fetch(`/api/products/related?id=${productId}&category=${encodeURIComponent(category)}`);
    
    if (!response.ok) {
      throw new Error(`Error fetching related products: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Process the products
    if (data.products && Array.isArray(data.products)) {
      return data.products.map((product: any) => ({
        ...product,
        tags: product.tags ? String(product.tags).split(',').map((t: string) => t.trim()) : [],
        images: Array.isArray(product.images) ? product.images : []
      })) as Product[];
    }
    
    return [];
  } catch (error) {
    console.error('Error in fetchRelatedProducts:', error);
    return [];
  }
}

// Get featured products
export async function fetchFeaturedProducts(): Promise<Product[]> {
  try {
    const response = await fetch('/api/products/featured');
    
    if (!response.ok) {
      throw new Error(`Error fetching featured products: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Process the products
    if (data.products && Array.isArray(data.products)) {
      return data.products.map((product: any) => ({
        ...product,
        tags: product.tags ? String(product.tags).split(',').map((t: string) => t.trim()) : [],
        images: Array.isArray(product.images) ? product.images : []
      })) as Product[];
    }
    
    return [];
  } catch (error) {
    console.error('Error in fetchFeaturedProducts:', error);
    return [];
  }
} 