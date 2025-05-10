const fs = require('fs');
const path = require('path');

// Function to find the Prisma client index.d.ts file
function findPrismaClientTypes() {
  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  const prismaClientPath = path.join(nodeModulesPath, '.prisma', 'client');
  const indexDtsPath = path.join(prismaClientPath, 'index.d.ts');
  
  if (fs.existsSync(indexDtsPath)) {
    return indexDtsPath;
  }
  
  // Alternative location
  const altPath = path.join(nodeModulesPath, '@prisma', 'client', 'index.d.ts');
  if (fs.existsSync(altPath)) {
    return altPath;
  }
  
  return null;
}

// Main function to append our type augmentation
function appendTypeAugmentation() {
  const indexDtsPath = findPrismaClientTypes();
  
  if (!indexDtsPath) {
    console.error('Could not find Prisma client index.d.ts file');
    process.exit(1);
  }
  
  console.log(`Found Prisma client at: ${indexDtsPath}`);
  
  // Our type augmentations to add
  const typeAugmentations = `
// Type augmentations for Product model
export interface Product {
  tags?: string | null;
  images?: ProductImage[];
}

// ProductImage model for multiple images per product
export interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
  position: number;
  productId: string;
  product: Product;
  createdAt: Date;
  updatedAt: Date;
}

// Extend ProductInclude to include images
interface ProductIncludeAugmentation {
  images?: boolean | ProductImageFindManyArgs;
}
`;

  try {
    // Read the current file content
    const currentContent = fs.readFileSync(indexDtsPath, 'utf-8');
    
    // Check if augmentation is already there
    if (currentContent.includes('// Type augmentations for Product model')) {
      console.log('Type augmentations already applied.');
      return;
    }
    
    // Find the best position to insert - look for a model declaration that's close to the end
    let lines = currentContent.split('\n');
    let insertPosition = lines.length - 100; // Start near the end
    
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].includes('export interface Product {') || 
          lines[i].includes('export type Product =')) {
        insertPosition = i;
        break;
      }
    }
    
    // Insert our augmentations
    lines.splice(insertPosition, 0, typeAugmentations);
    
    // Write the modified content back
    fs.writeFileSync(indexDtsPath, lines.join('\n'), 'utf-8');
    
    console.log('Successfully applied type augmentations to Prisma client');
  } catch (error) {
    console.error('Error updating Prisma client types:', error);
    process.exit(1);
  }
}

// Execute the main function
appendTypeAugmentation(); 