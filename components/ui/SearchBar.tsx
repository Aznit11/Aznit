"use client";

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

const SearchBar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Focus input when expanded
  useEffect(() => {
    if (isExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isExpanded]);

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsExpanded(false);
      setSearchQuery('');
    }
  };

  // Handle escape key press to close search
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsExpanded(false);
    }
  };

  return (
    <div className="relative">
      {isExpanded ? (
        <form 
          onSubmit={handleSearch}
          className="absolute right-0 top-0 z-10 flex items-center bg-white rounded-full shadow-md overflow-hidden"
        >
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="py-2 pl-4 pr-10 w-64 focus:outline-none text-gray-700"
          />
          <button
            type="button"
            onClick={() => setIsExpanded(false)}
            className="absolute right-3 text-gray-400 hover:text-gray-600"
            aria-label="Close search"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </form>
      ) : (
        <button
          onClick={() => setIsExpanded(true)}
          className="p-2 rounded-full hover:bg-gray-100"
          aria-label="Search"
        >
          <MagnifyingGlassIcon className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};

export default SearchBar; 