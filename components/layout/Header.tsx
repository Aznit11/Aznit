"use client";

import React from 'react';
import Link from 'next/link';
import { ShoppingCartIcon, UserIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { useCart } from '../../contexts/CartContext';
import SearchBar from '../ui/SearchBar';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const { itemCount } = useCart();

  return (
    <header className="bg-light border-b border-gray-200">
      <div className="container-custom py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="font-serif text-3xl font-bold text-primary">
            AzniT
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link href="/" className="font-medium hover:text-primary">
              Home
            </Link>
            <Link href="/products" className="font-medium hover:text-primary">
              Shop
            </Link>
            <Link href="/about" className="font-medium hover:text-primary">
              About
            </Link>
            <Link href="/contact" className="font-medium hover:text-primary">
              Contact
            </Link>
          </nav>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <SearchBar />
            <Link href="/cart" className="p-2 rounded-full hover:bg-gray-100 relative">
              <ShoppingCartIcon className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount > 99 ? '99+' : itemCount}
                </span>
              )}
            </Link>
            <button className="p-2 rounded-full hover:bg-gray-100">
              <UserIcon className="w-6 h-6" />
            </button>
            <button 
              className="md:hidden p-2 rounded-full hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t border-gray-200 mt-4">
            <nav className="flex flex-col space-y-3">
              <Link href="/" className="font-medium py-2 hover:text-primary">
                Home
              </Link>
              <Link href="/products" className="font-medium py-2 hover:text-primary">
                Shop
              </Link>
              <Link href="/about" className="font-medium py-2 hover:text-primary">
                About
              </Link>
              <Link href="/contact" className="font-medium py-2 hover:text-primary">
                Contact
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 