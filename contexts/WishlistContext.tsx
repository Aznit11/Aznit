"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface WishlistContextType {
  wishlist: WishlistItem[];
  isInWishlist: (productId: string) => boolean;
  addToWishlist: (productId: string) => Promise<void>;
  removeFromWishlist: (wishlistItemId: string) => Promise<void>;
  isLoading: boolean;
}

interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  price: number;
  image: string | null;
  inStock: boolean;
  createdAt: string;
}

interface WishlistProviderProps {
  children: ReactNode;
}

// Create context with default values
const WishlistContext = createContext<WishlistContextType>({
  wishlist: [],
  isInWishlist: () => false,
  addToWishlist: async () => {},
  removeFromWishlist: async () => {},
  isLoading: false,
});

// Hook to use wishlist context
export const useWishlist = () => useContext(WishlistContext);

// Context provider component
export const WishlistProvider = ({ children }: WishlistProviderProps) => {
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();

  // Fetch wishlist items from API when session changes
  useEffect(() => {
    const fetchWishlist = async () => {
      if (status === 'authenticated') {
        setIsLoading(true);
        try {
          const response = await fetch('/api/wishlist', {
            method: 'GET',
            credentials: 'include',
          });
          
          if (response.ok) {
            const data = await response.json();
            if (data.wishlist) {
              setWishlist(data.wishlist);
            }
          }
        } catch (error) {
          console.error('Error fetching wishlist:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        // Clear wishlist when logged out
        setWishlist([]);
      }
    };

    fetchWishlist();
  }, [status]);

  // Check if a product is in the wishlist
  const isInWishlist = (productId: string): boolean => {
    return wishlist.some(item => item.productId === productId);
  };

  // Add a product to the wishlist
  const addToWishlist = async (productId: string): Promise<void> => {
    if (status !== 'authenticated') {
      // Redirect to login or show a message
      alert('Please log in to add items to your wishlist');
      return;
    }

    setIsLoading(true);
    try {
      console.log("Calling API with productId:", productId);
      
      const response = await fetch('/api/wishlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ productId }),
      });

      console.log("API response status:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("API error response:", errorData);
        throw new Error('Failed to add item to wishlist');
      }

      const data = await response.json();
      console.log("API success response:", data);
      
      // Update local state
      if (data.wishlistItem && !isInWishlist(productId)) {
        setWishlist(prev => [...prev, data.wishlistItem]);
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Remove a product from the wishlist
  const removeFromWishlist = async (wishlistItemId: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/wishlist/${wishlistItemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to remove item from wishlist');
      }

      // Update local state
      setWishlist(prev => prev.filter(item => item.id !== wishlistItemId));
    } catch (error) {
      console.error('Error removing from wishlist:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        isInWishlist,
        addToWishlist,
        removeFromWishlist,
        isLoading,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export default WishlistContext; 