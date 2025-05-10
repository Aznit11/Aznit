"use client";

import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import ProductCard from '../components/product/ProductCard';
import CategoryCard from '../components/product/CategoryCard';
import { Product, Category } from '../types';

interface HomeClientProps {
  initialCategories: Category[];
  initialFeatured: Product[];
}

export default function HomeClient({ initialCategories, initialFeatured }: HomeClientProps) {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>(initialFeatured);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Optionally, you can re-fetch on the client if you want live updates
  // useEffect(() => { ... }, []);

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/banners/hero-banner.svg"
            alt="Moroccan Interior"
            fill
            priority
            className="object-cover object-center brightness-90"
          />
        </div>
        <div className="container-custom relative z-10 text-white">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-4">
              Authentic Moroccan Treasures
            </h1>
            <p className="text-lg md:text-xl mb-8">
              Discover traditional handcrafted products that bring the spirit of Morocco to your home.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/products" className="btn btn-primary">
                Shop Now
              </Link>
              <Link href="/about" className="btn btn-outline border-white text-white hover:bg-white hover:text-dark">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="section bg-light">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Our Collections</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Explore our carefully curated collections of authentic Moroccan products, each telling a unique story.
            </p>
          </div>
          {categoriesLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map(category => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-lg text-gray-600">No categories found</p>
            </div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="section">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">Featured Products</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Our most popular and unique selections, handpicked for your consideration.
            </p>
          </div>
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-lg text-gray-600">No featured products found</p>
            </div>
          )}
          <div className="text-center mt-12">
            <Link href="/products" className="btn btn-primary">
              View All Products
            </Link>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="section bg-dark text-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-6 text-primary">Our Story</h2>
              <p className="text-lg mb-6">
                AzniT brings the rich heritage and craftsmanship of Morocco directly to your doorstep. 
                We partner with skilled artisans across Morocco to bring you authentic, 
                high-quality products that celebrate centuries-old traditions.
              </p>
              <p className="text-lg mb-6">
                Each piece in our collection tells a story of cultural heritage, 
                passed down through generations of dedicated craftspeople.
              </p>
              <Link href="/about" className="btn btn-outline border-primary text-primary hover:bg-primary hover:text-white">
                Learn More About Us
              </Link>
            </div>
            <div className="relative h-[400px] rounded-lg overflow-hidden">
              <Image
                src="/images/banners/about-banner.svg"
                alt="Moroccan Artisan"
                fill
                className="object-cover object-center"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section bg-light">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">What Our Customers Say</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Hear from people who have experienced the beauty and quality of our Moroccan treasures.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "The Moroccan rug I purchased has transformed my living room. The quality is exceptional, 
                and it's exactly as described. It brings a beautiful cultural touch to my home."
              </p>
              <div className="font-medium">Sarah Johnson</div>
              <div className="text-sm text-gray-500">New York, USA</div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "I've been using the argan oil for a month now, and my skin has never felt better. 
                Knowing it comes from a sustainable source makes it even more special. Will definitely reorder!"
              </p>
              <div className="font-medium">Emily Thompson</div>
              <div className="text-sm text-gray-500">London, UK</div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-gray-700 mb-4">
                "The tagine pot is not just functional but a beautiful piece of art. The craftsmanship is impressive,
                and it has made my cooking experience so much more enjoyable. Highly recommend!"
              </p>
              <div className="font-medium">Michael Rodriguez</div>
              <div className="text-sm text-gray-500">Toronto, Canada</div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-16 bg-primary text-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-serif font-bold mb-4">Join Our Community</h2>
            <p className="text-lg mb-8">
              Subscribe to receive updates on new products, special offers, and cultural insights from Morocco.
            </p>
            <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Your email address"
                className="flex-grow px-4 py-3 rounded-md text-dark focus:outline-none"
                required
              />
              <button 
                type="submit"
                className="bg-dark text-white px-6 py-3 rounded-md hover:bg-dark/90 transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
      </section>
    </>
  );
} 