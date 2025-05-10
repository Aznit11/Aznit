import { Prisma } from '@prisma/client';

// Extend Prisma namespace to add the missing fields
declare global {
  namespace PrismaJson {
    type ProductImageInclude = {
      images?: boolean | Prisma.ProductImageArgs;
    }

    type ProductInclude = Prisma.ProductInclude & {
      images?: boolean | Prisma.ProductImageFindManyArgs;
    }
    
    interface ProductPayload extends Prisma.ProductGetPayload<{}> {
      tags?: string | null;
      images?: ProductImagePayload[];
    }
    
    interface ProductImagePayload extends Prisma.ProductImageGetPayload<{}> {
      url: string;
      alt: string | null;
      position: number;
      productId: string;
    }
  }
}

// Add augmentation to the Prisma namespace
declare module '@prisma/client' {
  interface Product {
    tags?: string | null;
    images?: ProductImage[];
  }
  
  interface ProductInclude {
    images?: boolean | Prisma.ProductImageFindManyArgs;
  }
}

export {}; 