"use client";

import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { StarIcon } from '@heroicons/react/24/solid';
import { ShoppingCartIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../../contexts/CartContext';
import ReviewForm from '../../../components/reviews/ReviewForm';
import ReviewList from '../../../components/reviews/ReviewList';
import { fetchProduct, fetchProducts } from '../../../lib/api/products';
import { formatPrice, calculateSalePrice, convertGoogleDriveLink } from '../../../lib/utils';
import { Product, ProductImage } from '../../../types';
import { Metadata } from 'next';

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const [quantity, setQuantity] = useState(1);
  const [reviewRefreshTrigger, setReviewRefreshTrigger] = useState(0);
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { addToCart } = useCart();

  // Fetch product data
  useEffect(() => {
    async function loadProductData() {
      setLoading(true);
      setError(null);
      try {
        console.log("Fetching product with ID:", params.id);
        const productData = await fetchProduct(params.id);
        
        if (!productData) {
          console.error("Product not found");
          setError("Product not found");
          setLoading(false);
          return notFound();
        }
        
        console.log("Product data received:", productData);
        setProduct(productData);
        
        // Set the initial selected image
        let initialImage = null;
        
        // First check if there are images in the images array
        if (productData.images && productData.images.length > 0) {
          const firstImage = productData.images[0];
          initialImage = typeof firstImage === 'string' 
            ? firstImage 
            : firstImage.url;
        } 
        // Fallback to the main imageUrl
        else if (productData.imageUrl) {
          initialImage = productData.imageUrl;
        }
        
        if (initialImage) {
          setSelectedImage(convertGoogleDriveLink(initialImage));
        }
        
        // Fetch related products
        const allProducts = await fetchProducts();
        const related = allProducts
          .filter((p: Product) => p.category === productData.category && p.id !== productData.id)
          .slice(0, 4);
        setRelatedProducts(related);
      } catch (error) {
        console.error('Error loading product:', error);
        setError('Failed to load product. Please try again.');
      } finally {
        setLoading(false);
      }
    }
    
    loadProductData();
  }, [params.id]);
  
  // If loading, show loading state
  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }
  
  // If error, show error message
  if (error) {
    return (
      <div className="container-custom py-12">
        <div className="flex flex-col justify-center items-center min-h-[50vh]">
          <h2 className="text-xl font-bold text-red-500 mb-4">{error}</h2>
          <Link href="/products" className="text-primary hover:underline">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }
  
  // If product not found, use Next.js not found page
  if (!product) {
    notFound();
  }

  // Calculate discounted price
  const salePrice = product.discount ? calculateSalePrice(product.price, product.discount) : null;

  // Get all product images
  const allImages: string[] = [];
  
  // Add main image if it exists
  if (product.imageUrl) {
    allImages.push(convertGoogleDriveLink(product.imageUrl));
  }
  
  // Add additional images if they exist
  if (product.images && product.images.length > 0) {
    // Process images whether they're strings or objects
    product.images.forEach(img => {
      const imageUrl = typeof img === 'string' ? img : img.url;
      const convertedUrl = convertGoogleDriveLink(imageUrl);
      if (!allImages.includes(convertedUrl)) {
        allImages.push(convertedUrl);
      }
    });
  }
  
  // Fallback if no images
  if (allImages.length === 0) {
    allImages.push('/images/placeholder.jpg');
  }

  // Handle adding to cart
  const handleAddToCart = () => {
    if (product.inStock) {
      addToCart(product, quantity);
    }
  };

  // Refresh reviews after new submission
  const handleReviewSubmitted = () => {
    setReviewRefreshTrigger(prev => prev + 1);
  };
  
  // Handle image selection
  const handleImageSelect = (image: string) => {
    setSelectedImage(image);
  };

  // Calculate average rating from reviews if available
  let averageRating = product.rating || 0;
  let reviewCount = 0;
  if (product.reviews && product.reviews.length > 0) {
    reviewCount = product.reviews.length;
  }

  // Get tags from the product
  const tags = product.tags || [];

  return (
    <div className="container-custom py-12">
      {/* Breadcrumb */}
      <div className="flex items-center mb-8 text-sm">
        <Link href="/" className="text-gray-500 hover:text-primary">Home</Link>
        <span className="mx-2 text-gray-400">/</span>
        <Link href="/products" className="text-gray-500 hover:text-primary">Products</Link>
        <span className="mx-2 text-gray-400">/</span>
        <span className="text-gray-700">{product.name}</span>
      </div>

      {/* Back Button */}
      <Link href="/products" className="inline-flex items-center text-primary mb-6 hover:underline">
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back to products
      </Link>

      {/* Product Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div>
          {/* Main selected image */}
          <div className="relative h-[400px] w-full mb-4 rounded-lg overflow-hidden">
            <Image
              src={selectedImage || allImages[0]}
              alt={product.name}
              fill
              priority
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {product.discount && (
              <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-2 py-1 rounded">
                {product.discount}% OFF
              </div>
            )}
          </div>
          
          {/* Thumbnail gallery */}
          {allImages.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {allImages.map((image, idx) => (
                <div 
                  key={idx} 
                  className={`relative h-16 rounded-md overflow-hidden cursor-pointer border-2 ${
                    selectedImage === image ? 'border-primary' : 'border-transparent'
                  }`}
                  onClick={() => handleImageSelect(image)}
                >
                  <Image 
                    src={image} 
                    alt={`${product.name} ${idx + 1}`}
                    fill
                    sizes="20vw"
                    className="object-cover object-center hover:opacity-80"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="text-3xl font-serif font-bold mb-2">{product.name}</h1>
          
          {/* Rating */}
          {product.rating && (
            <div className="flex items-center mb-4">
              <div className="flex mr-1">
                {[...Array(5)].map((_, i) => (
                  <StarIcon
                    key={i}
                    className={`h-5 w-5 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600 ml-2">
                {product.rating} ({reviewCount} reviews)
              </span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center mb-6">
            {salePrice ? (
              <>
                <span className="text-2xl font-bold text-primary mr-3">{formatPrice(salePrice)}</span>
                <span className="text-gray-500 line-through">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="text-2xl font-bold text-primary">{formatPrice(product.price)}</span>
            )}
          </div>

          {/* Description */}
          <div className="mb-8">
            <h3 className="font-bold text-lg mb-2">Description</h3>
            <p className="text-gray-700">{product.description}</p>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mb-6">
              <h3 className="font-bold text-lg mb-2">Features</h3>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, index) => (
                  <span 
                    key={index} 
                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart */}
          <div className="flex items-center mb-4">
            <div className="mr-4">
              <label htmlFor="quantity" className="block text-sm mb-1">Quantity</label>
              <select
                id="quantity"
                className="border border-gray-300 rounded p-2 w-20"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              >
                {[...Array(10)].map((_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <button
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className={`w-full flex items-center justify-center py-3 px-6 rounded-md ${
                  product.inStock
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ShoppingCartIcon className="h-5 w-5 mr-2" />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
          {product.inStock ? (
            <p className="text-green-600 text-sm flex items-center">
              <span className="inline-block h-2 w-2 rounded-full bg-green-600 mr-2"></span>
              In Stock
            </p>
          ) : (
            <p className="text-red-600 text-sm flex items-center">
              <span className="inline-block h-2 w-2 rounded-full bg-red-600 mr-2"></span>
              Out of Stock
            </p>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <div className="mt-16">
        <ReviewForm 
          productId={product.id} 
          onReviewSubmitted={handleReviewSubmitted}
        />
        
        <ReviewList 
          productId={product.id}
          initialAverageRating={averageRating}
          initialReviewCount={reviewCount}
          refreshTrigger={reviewRefreshTrigger}
        />
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-serif font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div 
                key={relatedProduct.id} 
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                <Link href={`/products/${relatedProduct.id}`}>
                  <div className="relative h-48 w-full">
                    <Image
                      src={relatedProduct.imageUrl ? convertGoogleDriveLink(relatedProduct.imageUrl) : '/images/placeholder.jpg'}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {relatedProduct.discount && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        {relatedProduct.discount}% OFF
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium text-gray-900 mb-1">{relatedProduct.name}</h3>
                    <p className="text-gray-700 text-sm mb-2">{relatedProduct.category}</p>
                    {relatedProduct.discount ? (
                      <div className="flex items-center">
                        <span className="text-primary font-bold">
                          {formatPrice(calculateSalePrice(relatedProduct.price, relatedProduct.discount) || 0)}
                        </span>
                        <span className="text-gray-500 text-sm line-through ml-2">
                          {formatPrice(relatedProduct.price)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-primary font-bold">{formatPrice(relatedProduct.price)}</span>
                    )}
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Structured Data for SEO */}
      {product && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Product",
            name: product.name,
            image: product.imageUrl || '/images/placeholder.jpg',
            description: product.description,
            sku: product.id,
            offers: {
              "@type": "Offer",
              price: product.price,
              priceCurrency: "USD",
              availability: product.inStock ? "InStock" : "OutOfStock"
            }
          })
        }} />
      )}
    </div>
  );
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  // Fetch product data for SEO
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/products/${params.id}`);
  const data = await res.json();
  const product = data.product;
  if (!product) {
    return {
      title: 'Product Not Found | AzniT',
      description: 'This product could not be found.',
      openGraph: {
        title: 'Product Not Found | AzniT',
        description: 'This product could not be found.',
        images: ['/images/placeholder.jpg'],
        url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/products/${params.id}`,
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'Product Not Found | AzniT',
        description: 'This product could not be found.',
        images: ['/images/placeholder.jpg'],
      },
    };
  }
  return {
    title: `${product.name} | AzniT`,
    description: product.description,
    openGraph: {
      title: `${product.name} | AzniT`,
      description: product.description,
      images: [product.imageUrl || '/images/placeholder.jpg'],
      url: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com'}/products/${product.id}`,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${product.name} | AzniT`,
      description: product.description,
      images: [product.imageUrl || '/images/placeholder.jpg'],
    },
  };
} 