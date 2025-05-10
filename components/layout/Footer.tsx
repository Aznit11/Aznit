"use client";

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { fetchCategories } from '../../lib/categoryService';
import { Category } from '../../types';

const Footer = () => {
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    async function loadCategories() {
      const categoriesData = await fetchCategories();
      setCategories(categoriesData);
    }
    
    loadCategories();
  }, []);

  return (
    <footer className="bg-dark text-light pt-16 pb-8">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1">
            <h3 className="text-3xl font-bold text-primary mb-4">AzniT</h3>
            <p className="mb-4">
              Authentic Moroccan traditional products, handcrafted with love and bringing the spirit of Morocco to your home.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h4 className="text-xl font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:text-primary transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-primary transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="col-span-1">
            <h4 className="text-xl font-bold mb-4">Categories</h4>
            <ul className="space-y-2">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <li key={category.id}>
                    <Link href={`/products?category=${category.name.toLowerCase().replace(/\s+/g, '-')}`} className="hover:text-primary transition-colors">
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                <>
                  <li>
                    <Link href="/products" className="hover:text-primary transition-colors">
                      All Products
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h4 className="text-xl font-bold mb-4">Contact Us</h4>
            <ul className="space-y-2">
              <li>Email: aznit25@gmail.com              </li>
              <li>Phone: +212600000000</li>
              <li>Address: 123 Moroccan Avenue, Marrakech, Morocco</li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>© 2025 AzniT. All rights reserved.</p>
            <div className="mt-4 md:mt-0">
              <ul className="flex space-x-4">
                <li>
                  <Link href="/privacy-policy" className="hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href="/terms-of-service" className="hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/shipping" className="hover:text-primary transition-colors">
                    Shipping
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 