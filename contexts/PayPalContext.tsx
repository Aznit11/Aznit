"use client";

import { createContext, useState, useContext, ReactNode } from 'react';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { useCart } from './CartContext';

// Define the PayPal context type
interface PayPalContextType {
  isProcessing: boolean;
  paymentError: string | null;
  orderID: string | null;
  createOrder: (amount: number, items?: any[]) => Promise<string>;
  captureOrder: (orderID: string) => Promise<any>;
  resetPayment: () => void;
}

// Create the context
const PayPalContext = createContext<PayPalContextType | undefined>(undefined);

// PayPal provider props
interface PayPalProviderProps {
  children: ReactNode;
  clientId: string;
}

// Create a provider component
export function PayPalProvider({ children, clientId }: PayPalProviderProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [orderID, setOrderID] = useState<string | null>(null);

  // Create a PayPal order
  const createOrder = async (amount: number, items?: any[]): Promise<string> => {
    try {
      setIsProcessing(true);
      setPaymentError(null);
      
      console.log('Creating PayPal order with amount:', amount);
      
      if (!amount || amount <= 0) {
        const error = new Error('Invalid order amount');
        console.error(error);
        setPaymentError('Cannot process payment: invalid amount');
        throw error;
      }
      
      // API call to create order
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          items,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('PayPal order creation response:', data);
      
      if (!data.id) {
        console.error('No order ID returned from PayPal API:', data);
        throw new Error('No order ID returned from PayPal');
      }
      
      setOrderID(data.id);
      return data.id;
    } catch (error) {
      console.error('Error in createOrder:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setPaymentError(errorMessage);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Capture a PayPal order (after approval)
  const captureOrder = async (orderID: string): Promise<any> => {
    try {
      setIsProcessing(true);
      setPaymentError(null);
      
      console.log(`Capturing PayPal order: ${orderID}`);
      
      // Get cart data from localStorage
      let cartData;
      try {
        const cartJSON = window.localStorage.getItem('cart');
        console.log('Cart data from localStorage:', cartJSON);
        
        if (!cartJSON) {
          throw new Error('Cart data not found in localStorage');
        }
        
        cartData = JSON.parse(cartJSON);
        
        if (!Array.isArray(cartData) || cartData.length === 0) {
          throw new Error('Cart is empty or invalid');
        }
        
        console.log('Parsed cart data:', cartData);
      } catch (storageError) {
        console.error('Error getting cart from localStorage:', storageError);
        throw new Error('Failed to retrieve cart data: ' + 
          (storageError instanceof Error ? storageError.message : String(storageError)));
      }
      
      const totalValue = parseFloat(window.localStorage.getItem('cartTotal') || '0');
      console.log('Total from localStorage:', totalValue);
      
      // API call to capture the order
      const response = await fetch(`/api/checkout/capture?orderID=${orderID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems: cartData,
          total: totalValue
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`API error: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('PayPal capture response:', data);
      
      return data;
    } catch (error) {
      console.error('Error in captureOrder:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setPaymentError(errorMessage);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  // Reset payment state
  const resetPayment = () => {
    setOrderID(null);
    setPaymentError(null);
    setIsProcessing(false);
  };

  const contextValue = {
    isProcessing,
    paymentError,
    orderID,
    createOrder,
    captureOrder,
    resetPayment,
  };

  return (
    <PayPalScriptProvider options={{ 
      "client-id": clientId,
      currency: "USD"
    }}>
      <PayPalContext.Provider value={contextValue}>
        {children}
      </PayPalContext.Provider>
    </PayPalScriptProvider>
  );
}

// Custom hook to use the PayPal context
export function usePayPal() {
  const context = useContext(PayPalContext);
  if (context === undefined) {
    throw new Error('usePayPal must be used within a PayPalProvider');
  }
  return context;
} 