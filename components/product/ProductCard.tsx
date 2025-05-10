"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Product } from '../../types';
import { ShoppingCartIcon, StarIcon } from '@heroicons/react/24/solid';
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid';
import { useCart } from '../../contexts/CartContext';
import { useWishlist } from '../../contexts/WishlistContext';
import { formatPrice, calculateSalePrice, convertGoogleDriveLink } from '../../lib/utils';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { id, name, price, imageUrl, rating, reviews, discount, inStock } = product;
  const { addToCart } = useCart();
  const { isInWishlist, addToWishlist, removeFromWishlist, wishlist } = useWishlist();
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  // Calculate discounted price
  const salePrice = discount ? calculateSalePrice(price, discount) : null;

  // Get image URL (support for array of images or single image URL)
  const images = Array.isArray(product.images) ? product.images : [];
  const displayImage = imageUrl ? convertGoogleDriveLink(imageUrl) : 
                      images.length > 0 ? images[0] : '/images/placeholder.jpg';

  // Handle add to cart
  const handleAddToCart = () => {
    if (inStock) {
      addToCart(product, 1);
    }
  };

  // Check if product is in wishlist
  const productInWishlist = isInWishlist(id);
  
  // Find wishlist item ID for this product (needed for removal)
  const wishlistItemId = productInWishlist
    ? wishlist.find(item => item.productId === id)?.id
    : null;

  // Handle wishlist toggle
  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation to product detail page
    if (wishlistLoading) return;
    
    setWishlistLoading(true);
    try {
      if (productInWishlist && wishlistItemId) {
        await removeFromWishlist(wishlistItemId);
      } else {
        await addToWishlist(id);
      }
    } finally {
      setWishlistLoading(false);
    }
  };

  return (
    <div className="group relative bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Discount badge */}
      {discount && (
        <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md">
          {discount}% OFF
        </div>
      )}
      
      {/* Out of stock badge */}
      {!inStock && (
        <div className="absolute top-2 right-2 z-10 bg-gray-700 text-white text-xs font-bold px-2 py-1 rounded-md">
          OUT OF STOCK
        </div>
      )}

      {/* Wishlist Button */}
      <button 
        onClick={handleWishlistToggle}
        className={`absolute top-2 right-2 z-10 rounded-full w-8 h-8 flex items-center justify-center bg-white shadow-md transition-colors ${wishlistLoading ? 'opacity-50' : 'hover:bg-gray-100'}`}
        disabled={wishlistLoading}
        aria-label={productInWishlist ? "Remove from wishlist" : "Add to wishlist"}
      >
        {productInWishlist ? (
          <HeartSolid className="h-5 w-5 text-red-500" />
        ) : (
          <HeartOutline className="h-5 w-5 text-gray-500" />
        )}
      </button>

      {/* Product Image */}
      <Link href={`/products/${id}`}>
        <div className="relative w-full h-64 overflow-hidden">
          <Image 
            src={displayImage} 
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4">
        <Link href={`/products/${id}`} className="block">
          <h3 className="text-lg font-semibold text-dark mb-1 hover:text-primary transition-colors">
            {name}
          </h3>
        </Link>
        
        {/* Price */}
        <div className="flex items-center mb-2">
          {salePrice ? (
            <>
              <span className="font-bold text-primary mr-2">{formatPrice(salePrice)}</span>
              <span className="text-sm text-gray-500 line-through">{formatPrice(price)}</span>
            </>
          ) : (
            <span className="font-bold text-primary">{formatPrice(price)}</span>
          )}
        </div>

        {/* Rating */}
        {rating && (
          <div className="flex items-center mb-3">
            <div className="flex mr-1">
              {[...Array(5)].map((_, i) => (
                <StarIcon 
                  key={i} 
                  className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <span className="text-sm text-gray-600">
              {rating} ({reviews || 0})
            </span>
          </div>
        )}

        {/* Add to cart button */}
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className={`w-full flex items-center justify-center py-2 px-4 rounded ${
            inStock 
              ? 'bg-primary text-white hover:bg-primary/90 transition-colors' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <ShoppingCartIcon className="h-5 w-5 mr-2" />
          {inStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 