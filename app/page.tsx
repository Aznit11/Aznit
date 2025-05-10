import HomeClient from './HomeClient';

export default async function Home() {
  // Fetch categories and featured products on the server
  const categoriesRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/categories`, { cache: 'no-store' });
  const featuredRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/products/featured`, { cache: 'no-store' });
  const categoriesData = await categoriesRes.json();
  const featuredData = await featuredRes.json();
  const categories = categoriesData.categories || [];
  const featuredProducts = featuredData.products || [];

  return <HomeClient initialCategories={categories} initialFeatured={featuredProducts} />;
} 