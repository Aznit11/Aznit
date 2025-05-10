"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  FunnelIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
  position: number;
}

interface Product {
  id: string;
  name: string;
  price: number;
  images?: ProductImage[];
  imageUrl?: string;
  category: string;
  inStock: boolean;
  discount?: number;
  featured?: boolean;
  description?: string;
}

type SortField = "name" | "price" | "category";
type SortDirection = "asc" | "desc";

// Function to convert Google Drive links to direct image URLs
const convertGoogleDriveLink = (url: string) => {
  if (!url) return "";
  
  // Check if it's a Google Drive link
  const gdriveLinkRegex = /https:\/\/drive\.google\.com\/file\/d\/([^/]+)\/view/;
  const match = url.match(gdriveLinkRegex);
  
  if (match && match[1]) {
    const fileId = match[1];
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }
  
  return url; // Return original URL if not a Google Drive link
};

export default function AdminProductsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [stockFilter, setStockFilter] = useState<"all" | "inStock" | "outOfStock">("all");
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    // Auth protection
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session.user.role !== "ADMIN") {
        router.push("/");
      } else {
        fetchProducts();
      }
    }
  }, [status, session, router]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/products');
      if (response.ok) {
        const data = await response.json();
        setDbProducts(data.products || []);
        
        // Extract unique categories from real data
        const uniqueCategories = Array.from(
          new Set(data.products.map((product: Product) => product.category).filter(Boolean))
        );
        setCategories(uniqueCategories as string[]);
      } else {
        console.error('Failed to fetch products from API');
        setDbProducts([]);
        setCategories([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setDbProducts([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (dbProducts.length > 0) {
      // Filter and sort products
      let result = [...dbProducts];
      
      // Apply text search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(product => 
          product.name.toLowerCase().includes(query) || 
          (product.description?.toLowerCase().includes(query)) ||
          product.category?.toLowerCase().includes(query)
        );
      }
      
      // Apply category filter
      if (activeCategory) {
        result = result.filter(product => product.category === activeCategory);
      }
      
      // Apply stock filter
      if (stockFilter === "inStock") {
        result = result.filter(product => product.inStock);
      } else if (stockFilter === "outOfStock") {
        result = result.filter(product => !product.inStock);
      }
      
      // Apply sorting
      result.sort((a, b) => {
        if (sortField === "price") {
          return sortDirection === "asc" 
            ? a.price - b.price 
            : b.price - a.price;
        } else if (sortField === "name") {
          return sortDirection === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        } else if (sortField === "category") {
          return sortDirection === "asc"
            ? (a.category || '').localeCompare(b.category || '')
            : (b.category || '').localeCompare(a.category || '');
        }
        return 0;
      });
      
      setFilteredProducts(result);
    }
  }, [searchQuery, activeCategory, stockFilter, sortField, sortDirection, dbProducts]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    
    return sortDirection === "asc" 
      ? <ChevronUpIcon className="h-4 w-4" /> 
      : <ChevronDownIcon className="h-4 w-4" />;
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product? This action cannot be undone.")) {
      try {
        setIsDeleting(true);
        const response = await fetch(`/api/admin/products/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // Refresh product list after successful deletion
          await fetchProducts();
        } else {
          const data = await response.json();
          alert(data.error || 'Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        alert('An error occurred while trying to delete the product');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Function to get product image
  const getProductImage = (product: Product) => {
    if (product.imageUrl) {
      return convertGoogleDriveLink(product.imageUrl);
    }
    
    if (product.images && product.images.length > 0) {
      return convertGoogleDriveLink(product.images[0].url);
    }
    
    return '/images/placeholder.jpg';
  };

  if (loading) {
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold">Product Management</h1>
          <p className="text-gray-600 mt-1">Manage your store's product catalog</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/admin" 
            className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to Dashboard
          </Link>
          <Link 
            href="/admin/products/new" 
            className="bg-primary px-4 py-2 rounded-lg shadow-sm text-white hover:bg-primary/90 transition-colors flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Add Product
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search products..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-200 rounded-md pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={activeCategory || ""}
                onChange={(e) => setActiveCategory(e.target.value || null)}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <FunnelIcon className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-200 rounded-md pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
              >
                <option value="all">All Stock</option>
                <option value="inStock">In Stock</option>
                <option value="outOfStock">Out of Stock</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <FunnelIcon className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <button 
              onClick={fetchProducts}
              className="bg-white border border-gray-200 rounded-md p-2 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label="Refresh products"
              title="Refresh products"
            >
              <ArrowPathIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-gray-500 mb-4">No products found</p>
            <Link
              href="/admin/products/new"
              className="inline-flex items-center text-primary hover:underline"
            >
              <PlusIcon className="h-4 w-4 mr-1" />
              Add your first product
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500 tracking-wider w-14">
                    Image
                  </th>
                  <th 
                    className="px-6 py-3 text-sm font-medium text-gray-500 tracking-wider cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Product Name
                      {getSortIcon("name")}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-sm font-medium text-gray-500 tracking-wider cursor-pointer"
                    onClick={() => handleSort("category")}
                  >
                    <div className="flex items-center">
                      Category
                      {getSortIcon("category")}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-sm font-medium text-gray-500 tracking-wider cursor-pointer"
                    onClick={() => handleSort("price")}
                  >
                    <div className="flex items-center">
                      Price
                      {getSortIcon("price")}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500 tracking-wider">
                    Stock Status
                  </th>
                  <th className="px-6 py-3 text-sm font-medium text-gray-500 tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="relative h-10 w-10 rounded-md overflow-hidden border border-gray-200">
                        <Image
                          src={getProductImage(product)}
                          alt={product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      {product.featured && (
                        <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full">
                          Featured
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {product.category || "-"}
                    </td>
                    <td className="px-6 py-4">
                      {product.discount ? (
                        <div>
                          <span className="font-medium text-primary">
                            ${((product.price * (100 - product.discount)) / 100).toFixed(2)}
                          </span>
                          <span className="ml-2 text-xs text-gray-500 line-through">
                            ${product.price.toFixed(2)}
                          </span>
                          <span className="ml-1 text-xs text-red-500">
                            (-{product.discount}%)
                          </span>
                        </div>
                      ) : (
                        <span className="font-medium text-gray-900">
                          ${product.price.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {product.inStock ? (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                          In Stock
                        </span>
                      ) : (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded-full">
                          Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <Link 
                          href={`/products/${product.id}`}
                          className="text-blue-600 hover:text-blue-800"
                          target="_blank"
                        >
                          <EyeIcon className="h-5 w-5" title="View product" />
                        </Link>
                        <Link 
                          href={`/admin/products/edit/${product.id}`}
                          className="text-yellow-600 hover:text-yellow-800"
                        >
                          <PencilIcon className="h-5 w-5" title="Edit product" />
                        </Link>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="text-red-600 hover:text-red-800"
                          disabled={isDeleting}
                        >
                          <TrashIcon className="h-5 w-5" title="Delete product" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 