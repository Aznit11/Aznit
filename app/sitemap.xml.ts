import { NextRequest, NextResponse } from 'next/server';
import prisma from '../lib/prisma';

export async function GET(req: NextRequest) {
  // Fetch products, categories, and blog posts
  const products = await prisma.product.findMany({ select: { id: true, updatedAt: true } });
  const categories = await prisma.category.findMany({ select: { id: true, updatedAt: true } });
  const posts = await prisma.blogPost.findMany({ select: { slug: true, updatedAt: true } });

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
  let urls = [
    { loc: `${baseUrl}/`, lastmod: new Date().toISOString() },
    { loc: `${baseUrl}/products`, lastmod: new Date().toISOString() },
    { loc: `${baseUrl}/blog`, lastmod: new Date().toISOString() },
  ];

  urls = urls.concat(
    products.map(p => ({
      loc: `${baseUrl}/products/${p.id}`,
      lastmod: p.updatedAt.toISOString(),
    })),
    categories.map(c => ({
      loc: `${baseUrl}/products?category=${c.id}`,
      lastmod: c.updatedAt.toISOString(),
    })),
    posts.map(post => ({
      loc: `${baseUrl}/blog/${post.slug}`,
      lastmod: post.updatedAt.toISOString(),
    }))
  );

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join('\n')}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
} 