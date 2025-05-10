"use client";

import { useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import ProductCard from '../../components/product/ProductCard';
import { fetchCategories } from '../../lib/categoryService';
import { fetchProducts } from '../../lib/api/products';
import { Product, Category } from '../../types';

export default function ProductsPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search');
  const categoryParam = searchParams.get('category');
  
  // State for filters
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    categoryParam ? [categoryParam] : []
  );
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortOption, setSortOption] = useState('featured');
  
  // State for products and categories
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  // State for filtered products
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  // Fetch categories from API
  useEffect(() => {
    async function loadCategories() {
      setCategoriesLoading(true);
      try {
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setCategoriesLoading(false);
      }
    }
    
    loadCategories();
  }, []);
  
  // Fetch products from API
  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const productsData = await fetchProducts();
        setProducts(productsData);
      } catch (error) {
        console.error('Error loading products:', error);
      } finally {
        setLoading(false);
      }
    }
    
    loadProducts();
  }, []);

  // Helper function to normalize category names for comparison
  const normalizeCategory = (category: string): string => {
    return category.toLowerCase().replace(/[^a-z0-9]+/g, '');
  };
  
  // Apply filters and search when dependencies change
  useEffect(() => {
    if (products.length === 0) return;
    
    let result = [...products];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(product => 
        product.name.toLowerCase().includes(query) || 
        (product.description?.toLowerCase().includes(query)) ||
        (product.tags && product.tags.some(tag => tag.toLowerCase().includes(query)))
      );
    }
    
    // Apply category filter
    if (selectedCategories.length > 0) {
      result = result.filter(product => {
        return selectedCategories.some(selectedCat => {
          // Handle both hyphenated and non-hyphenated formats by normalizing both sides
          const normalizedProductCategory = normalizeCategory(product.category);
          const normalizedSelectedCategory = normalizeCategory(selectedCat);
          
          // Check for exact match and beginning-of-word match to handle partial categories
          return normalizedProductCategory === normalizedSelectedCategory ||
                 normalizedProductCategory.startsWith(normalizedSelectedCategory);
        });
      });
    }
    
    // Apply price filter
    if (minPrice) {
      result = result.filter(product => product.price >= parseFloat(minPrice));
    }
    
    if (maxPrice) {
      result = result.filter(product => product.price <= parseFloat(maxPrice));
    }
    
    // Apply stock filter
    if (inStockOnly) {
      result = result.filter(product => product.inStock);
    }
    
    // Apply sorting
    switch (sortOption) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => ((b.rating || 0) - (a.rating || 0)));
        break;
      case 'featured':
      default:
        // For featured, keep original order but put featured items first
        result.sort((a, b) => ((b.featured ? 1 : 0) - (a.featured ? 1 : 0)));
        break;
    }
    
    setFilteredProducts(result);
  }, [searchQuery, selectedCategories, minPrice, maxPrice, inStockOnly, sortOption, products]);
  
  // Handle category checkbox change
  const handleCategoryChange = (categoryName: string) => {
    setSelectedCategories(prev => {
      if (prev.includes(categoryName)) {
        return prev.filter(cat => cat !== categoryName);
      } else {
        return [...prev, categoryName];
      }
    });
  };
  
  // Handle filter application
  const applyFilters = () => {
    // Filters are applied automatically via useEffect
  };
  
  // Effect to update checkbox UI when URL param changes
  useEffect(() => {
    if (categoryParam && categories.length > 0) {
      // Find matching category based on normalized comparison
      const matchingCategory = categories.find(cat => 
        normalizeCategory(cat.name) === normalizeCategory(categoryParam)
      );
      
      if (matchingCategory) {
        setSelectedCategories([matchingCategory.name.toLowerCase()]);
      }
    }
  }, [categoryParam, categories]);
  
  if (loading) {
    return (
      <div className="container-custom py-12">
        <h1 className="text-3xl md:text-4xl font-serif font-bold mb-8 text-center">
          Loading Products...
        </h1>
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl md:text-4xl font-serif font-bold mb-8 text-center">
        {searchQuery 
          ? `Search Results for "${searchQuery}"` 
          : categoryParam
            ? `${categoryParam.charAt(0).toUpperCase() + categoryParam.slice(1).replace(/-/g, ' ')} Products`
            : "Explore Our Products"}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-4">Categories</h2>
            <div className="space-y-2">
              {categoriesLoading ? (
                <div className="text-sm text-gray-500">Loading categories...</div>
              ) : categories.length > 0 ? (
                categories.map(category => (
                  <div key={category.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={category.id}
                      checked={selectedCategories.some(selected => 
                        normalizeCategory(selected) === normalizeCategory(category.name)
                      )}
                      onChange={() => handleCategoryChange(category.name.toLowerCase())}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor={category.id} className="ml-2 text-sm text-gray-700">
                      {category.name}
                    </label>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500">No categories found</div>
              )}
            </div>

            <h2 className="text-xl font-bold mt-8 mb-4">Price Range</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="min-price" className="block text-sm text-gray-700 mb-1">
                  Min Price
                </label>
                <input
                  type="number"
                  id="min-price"
                  min="0"
                  placeholder="$0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
              <div>
                <label htmlFor="max-price" className="block text-sm text-gray-700 mb-1">
                  Max Price
                </label>
                <input
                  type="number"
                  id="max-price"
                  min="0"
                  placeholder="$1000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary"
                />
              </div>
            </div>

            <h2 className="text-xl font-bold mt-8 mb-4">Availability</h2>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="in-stock"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="in-stock" className="ml-2 text-sm text-gray-700">
                  In Stock Only
                </label>
              </div>
            </div>

            <button 
              onClick={applyFilters}
              className="w-full mt-8 bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
            >
              Apply Filters
            </button>
          </div>
        </div>

        {/* Product Grid */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">{filteredProducts.length} products</p>
            <div>
              <label htmlFor="sort" className="text-sm text-gray-600 mr-2">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-primary focus:border-primary"
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Customer Rating</option>
              </select>
            </div>
          </div>

          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-2">No products found</h2>
              <p className="text-gray-600 mb-6">
                Try adjusting your search or filter criteria.
              </p>
              <button
                onClick={() => {
                  setSelectedCategories([]);
                  setMinPrice('');
                  setMaxPrice('');
                  setInStockOnly(false);
                  setSortOption('featured');
                }}
                className="text-primary hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 