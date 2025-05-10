export type ProductImage = {
  id: string;
  url: string;
  alt?: string | null;
  position: number;
  productId: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl?: string;
  images?: ProductImage[] | string[];  // Support both formats for backward compatibility
  category: string;
  tags?: string[];    // Optional tags (already parsed from comma-separated string)
  weight?: number;    // Weight in kilograms
  inStock: boolean;
  featured?: boolean;
  discount?: number;
  rating?: number;
  reviews?: any[];    // Array of reviews rather than just a count
  createdAt?: Date;
  updatedAt?: Date;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type Category = {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
};

export type User = {
  id: string;
  name: string;
  email: string;
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  imageUrl?: string;
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author?: User;
  comments?: BlogComment[];
  likes?: BlogLike[];
  categories?: string[];
  tags?: string[];
  likeCount?: number;
  commentCount?: number;
};

export type BlogComment = {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  postId: string;
  userId: string;
  user?: User;
};

export type BlogLike = {
  id: string;
  createdAt: Date;
  postId: string;
  userId: string;
  user?: User;
}; 