const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const mockCategories = [
  {
    name: 'Home Decor',
    description: 'Beautiful Moroccan decorative items for your home',
    imageUrl: '/images/categories/home.svg'
  },
  {
    name: 'Kitchenware',
    description: 'Traditional Moroccan cookware and kitchen accessories',
    imageUrl: '/images/categories/kitchenware.svg'
  },
  {
    name: 'Beauty',
    description: 'Natural Moroccan beauty products and cosmetics',
    imageUrl: '/images/categories/beauty.svg'
  },
  {
    name: 'Food',
    description: 'Authentic Moroccan spices, herbs, and gourmet items',
    imageUrl: '/images/categories/food.svg'
  }
];

async function seedCategories() {
  console.log('Seeding categories...');
  
  for (const category of mockCategories) {
    // Check if category already exists (by name)
    const existingCategory = await prisma.category.findUnique({
      where: { name: category.name }
    });
    
    if (!existingCategory) {
      await prisma.category.create({
        data: category
      });
      console.log(`Created category: ${category.name}`);
    } else {
      console.log(`Category ${category.name} already exists, skipping`);
    }
  }
  
  console.log('Seeding completed');
}

seedCategories()
  .catch(e => {
    console.error('Error seeding categories:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 