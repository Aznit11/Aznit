// Simple in-memory cache for categories and products

let categoriesCache: any[] = [];
let categoriesLastFetch = 0;
const CATEGORIES_CACHE_DURATION = 1000 * 60 * 5; // 5 minutes

let featuredProductsCache: any[] = [];
let featuredProductsLastFetch = 0;
const FEATURED_PRODUCTS_CACHE_DURATION = 1000 * 60 * 2; // 2 minutes

export async function getCachedCategories(fetchFn: () => Promise<any[]>) {
  const now = Date.now();
  if (now - categoriesLastFetch > CATEGORIES_CACHE_DURATION || categoriesCache.length === 0) {
    categoriesCache = await fetchFn();
    categoriesLastFetch = now;
  }
  return categoriesCache;
}

export async function getCachedFeaturedProducts(fetchFn: () => Promise<any[]>) {
  const now = Date.now();
  if (now - featuredProductsLastFetch > FEATURED_PRODUCTS_CACHE_DURATION || featuredProductsCache.length === 0) {
    featuredProductsCache = await fetchFn();
    featuredProductsLastFetch = now;
  }
  return featuredProductsCache;
} 