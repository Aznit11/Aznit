const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedProducts() {
  console.log('Seeding products...');
  
  // Get all categories
  const categories = await prisma.category.findMany();
  if (!categories.length) {
    console.error('No categories found. Please run the seed-categories script first.');
    process.exit(1);
  }
  
  // Create a map for easier lookup
  const categoryMap = {};
  categories.forEach(cat => {
    categoryMap[cat.name.toLowerCase()] = cat;
  });

  const mockProducts = [
    {
      name: 'Moroccan Leather Pouf',
      description: 'Handcrafted leather pouf, perfect for additional seating or as a footrest',
      price: 89.99,
      imageUrl: '/images/products/pouf.svg',
      category: categoryMap['home decor'] ? categoryMap['home decor'].name : 'Home Decor',
      inStock: true,
      featured: true
    },
    {
      name: 'Traditional Moroccan Tagine',
      description: 'Authentic clay cooking pot for preparing delicious Moroccan stews',
      price: 64.99,
      imageUrl: '/images/products/tagine.svg',
      category: categoryMap['kitchenware'] ? categoryMap['kitchenware'].name : 'Kitchenware',
      inStock: true,
      featured: true
    },
    {
      name: 'Argan Oil',
      description: 'Pure organic argan oil for skin, hair, and nails',
      price: 29.99,
      imageUrl: '/images/products/argan.svg',
      category: categoryMap['beauty'] ? categoryMap['beauty'].name : 'Beauty',
      inStock: true,
      featured: true
    },
    {
      name: 'Moroccan Spice Mix',
      description: 'Traditional blend of spices for authentic Moroccan cuisine',
      price: 12.99,
      imageUrl: '/images/products/spice.svg',
      category: categoryMap['food'] ? categoryMap['food'].name : 'Food',
      inStock: true,
      featured: true
    },
    {
      name: 'Hand-Painted Ceramic Plate',
      description: 'Beautiful hand-painted ceramic plate for serving or decoration',
      price: 45.99,
      imageUrl: '/images/products/plate.svg',
      category: categoryMap['home decor'] ? categoryMap['home decor'].name : 'Home Decor',
      inStock: true,
      featured: false
    },
    {
      name: 'Moroccan Tea Glasses (Set of 6)',
      description: 'Traditional tea glasses with intricate designs',
      price: 34.99,
      imageUrl: '/images/products/glasses.svg',
      category: categoryMap['kitchenware'] ? categoryMap['kitchenware'].name : 'Kitchenware',
      inStock: true,
      featured: false
    }
  ];
  
  for (const product of mockProducts) {
    // Check if product already exists (by name)
    const existingProduct = await prisma.product.findFirst({
      where: { name: product.name }
    });
    
    if (!existingProduct) {
      await prisma.product.create({
        data: product
      });
      console.log(`Created product: ${product.name}`);
    } else {
      console.log(`Product ${product.name} already exists, skipping`);
    }
  }
  
  console.log('Product seeding completed');
}

seedProducts()
  .catch(e => {
    console.error('Error seeding products:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 