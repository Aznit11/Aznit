"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Category } from '../../types';

interface CategoryCardProps {
  category: Category;
}

const CategoryCard = ({ category }: CategoryCardProps) => {
  const { id, name, description, imageUrl } = category;

  return (
    <Link 
      href={`/products?category=${name.toLowerCase().replace(/\s+/g, '-')}`}
      className="block group relative rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
    >
      <div className="relative h-64 w-full">
        <Image
          src={imageUrl || '/images/categories/placeholder.jpg'}
          alt={name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/80 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 text-white">
          <h3 className="text-xl font-serif font-bold mb-1">{name}</h3>
          <p className="text-sm text-gray-200">{description}</p>
        </div>
      </div>
    </Link>
  );
};

export default CategoryCard; 