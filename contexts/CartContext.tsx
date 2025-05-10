"use client";

import { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Product } from '../types';

// Define cart item interface
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  discount?: number;
  weight?: number;
}

// Define cart context interface
interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  total: number;
}

// Create the cart context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Cart provider props
interface CartProviderProps {
  children: ReactNode;
}

// Create a provider component
export function CartProvider({ children }: CartProviderProps) {
  // Initialize cart from localStorage if available
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage when component mounts
  useEffect(() => {
    const storedCart = localStorage.getItem('aznit-cart');
    if (storedCart) {
      try {
        setCart(JSON.parse(storedCart));
      } catch (error) {
        console.error('Error parsing cart from localStorage', error);
        setCart([]);
      }
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('aznit-cart', JSON.stringify(cart));
    }
  }, [cart, isInitialized]);

  // Add item to cart
  const addToCart = (product: Product, quantity: number) => {
    setCart(prevCart => {
      // Check if item already exists in cart
      const existingItemIndex = prevCart.findIndex(item => item.id === product.id);
      
      if (existingItemIndex !== -1) {
        // Update quantity if item exists
        const updatedCart = [...prevCart];
        updatedCart[existingItemIndex].quantity += quantity;
        return updatedCart;
      } else {
        // Determine the image to use (support both imageUrl and images array)
        let productImage = '/images/products/placeholder.jpg'; // Default image
        if (product.imageUrl) {
          productImage = product.imageUrl;
        } else if (product.images && product.images.length > 0) {
          productImage = product.images[0];
        }
        
        // Add new item to cart
        return [...prevCart, {
          id: product.id,
          name: product.name,
          price: product.price,
          image: productImage,
          quantity,
          discount: product.discount,
          weight: product.weight
        }];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (id: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== id));
  };

  // Update item quantity
  const updateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    
    setCart(prevCart => 
      prevCart.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  // Clear all items from cart
  const clearCart = () => {
    setCart([]);
  };

  // Calculate total item count
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);

  // Calculate subtotal (without discounts)
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity, 
    0
  );

  // Calculate total (with discounts)
  const total = cart.reduce((total, item) => {
    const itemPrice = item.discount 
      ? item.price - (item.price * item.discount / 100)
      : item.price;
    return total + itemPrice * item.quantity;
  }, 0);

  // Context value
  const value = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    itemCount,
    subtotal,
    total
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

// Custom hook to use the cart context
export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
} 