import { Product, Category } from '../types';

export const products: Product[] = [
  {
    id: '1',
    name: 'Moroccan Ceramic Tagine',
    description: 'Authentic handcrafted Moroccan tagine pot, perfect for slow-cooking traditional stews and preserving the rich flavors of Moroccan cuisine.',
    price: 89.99,
    images: [
      '/images/products/tagine.svg',
      '/images/products/tagine.svg'
    ],
    category: 'kitchenware',
    tags: ['ceramic', 'cooking', 'traditional', 'handcrafted'],
    inStock: true,
    featured: true,
    rating: 4.8,
    reviews: 124,
  },
  {
    id: '2',
    name: 'Handwoven Moroccan Rug',
    description: 'Authentic Berber rug handwoven by skilled artisans using traditional techniques. Each piece features unique patterns that tell stories of Moroccan heritage.',
    price: 349.99,
    images: [
      '/images/products/rug.svg',
      '/images/products/rug.svg'
    ],
    category: 'home',
    tags: ['rug', 'berber', 'handwoven', 'wool'],
    inStock: true,
    featured: true,
    rating: 4.9,
    reviews: 87,
  },
  {
    id: '3',
    name: 'Moroccan Leather Pouf',
    description: 'Handcrafted genuine leather pouf with intricate embroidery. This versatile piece functions as an ottoman, extra seating, or decorative accent.',
    price: 129.99,
    images: [
      '/images/products/pouf.svg',
      '/images/products/pouf.svg'
    ],
    category: 'home',
    tags: ['leather', 'pouf', 'ottoman', 'decor'],
    inStock: true,
    rating: 4.7,
    reviews: 56,
  },
  {
    id: '4',
    name: 'Moroccan Argan Oil',
    description: 'Pure organic argan oil sourced from cooperatives in Morocco. This versatile oil can be used for cooking, skincare, and haircare.',
    price: 34.99,
    images: [
      '/images/products/argan-oil.svg',
      '/images/products/argan-oil.svg'
    ],
    category: 'beauty',
    tags: ['argan', 'oil', 'organic', 'skincare'],
    inStock: true,
    rating: 4.9,
    reviews: 203,
  },
  {
    id: '5',
    name: 'Moroccan Mint Tea Set',
    description: 'Traditional Moroccan tea set including a handcrafted teapot, tea glasses, and authentic mint tea leaves for the perfect Moroccan tea ceremony.',
    price: 79.99,
    images: [
      '/images/products/tea-set.svg',
      '/images/products/tea-set.svg'
    ],
    category: 'kitchenware',
    tags: ['tea', 'mint', 'traditional', 'set'],
    inStock: true,
    discount: 15,
    rating: 4.6,
    reviews: 78,
  },
  {
    id: '6',
    name: 'Handmade Moroccan Lantern',
    description: 'Intricately designed metal lantern with colorful glass panels that cast beautiful patterns when lit, perfect for creating a warm and inviting atmosphere.',
    price: 69.99,
    images: [
      '/images/products/lantern.svg',
      '/images/products/lantern.svg'
    ],
    category: 'home',
    tags: ['lantern', 'lighting', 'decor', 'metal'],
    inStock: true,
    featured: true,
    rating: 4.7,
    reviews: 92,
  },
  {
    id: '7',
    name: 'Moroccan Ceramic Plates Set',
    description: 'Set of 4 hand-painted ceramic plates featuring traditional Moroccan patterns. Perfect for serving Moroccan dishes or as decorative wall art.',
    price: 99.99,
    images: [
      '/images/products/plates.svg',
      '/images/products/plates.svg'
    ],
    category: 'kitchenware',
    tags: ['ceramic', 'plates', 'handpainted', 'tableware'],
    inStock: true,
    rating: 4.5,
    reviews: 43,
  },
  {
    id: '8',
    name: 'Moroccan Spice Collection',
    description: 'Authentic Moroccan spice set featuring ras el hanout, cumin, saffron, and other essential spices for creating traditional Moroccan dishes.',
    price: 49.99,
    images: [
      '/images/products/spices.svg',
      '/images/products/spices.svg'
    ],
    category: 'food',
    tags: ['spices', 'cooking', 'ras el hanout', 'collection'],
    inStock: true,
    discount: 10,
    rating: 4.8,
    reviews: 67,
  }
];

export const categories: Category[] = [
  {
    id: 'kitchenware',
    name: 'Kitchen & Dining',
    description: 'Traditional Moroccan kitchenware and dining essentials',
    image: '/images/categories/kitchenware.svg'
  },
  {
    id: 'home',
    name: 'Home Decor',
    description: 'Beautiful Moroccan decor to enrich your living space',
    image: '/images/categories/home.svg'
  },
  {
    id: 'beauty',
    name: 'Beauty & Wellness',
    description: 'Natural Moroccan beauty products and wellness items',
    image: '/images/categories/beauty.svg'
  },
  {
    id: 'food',
    name: 'Food & Spices',
    description: 'Authentic Moroccan flavors and traditional ingredients',
    image: '/images/categories/food.svg'
  }
]; 