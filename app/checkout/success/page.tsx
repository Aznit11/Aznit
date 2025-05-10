"use client";

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '../../../contexts/CartContext';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const [orderID, setOrderID] = useState<string>('');
  
  useEffect(() => {
    // Get order ID from URL parameters
    const orderId = searchParams.get('orderId');
    
    if (orderId) {
      setOrderID(orderId);
      
      // Clear the cart
      clearCart();
    } else {
      // If no order ID is found, redirect to homepage
      router.push('/');
    }
  }, [searchParams, clearCart, router]);
  
  return (
    <div className="container-custom py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-serif font-bold text-center mb-4">
          Payment Successful!
        </h1>
        
        <p className="text-center text-gray-600 mb-8">
          Thank you for your purchase. Your order has been received and is being processed.
        </p>
        
        <div className="bg-gray-50 p-4 rounded-md mb-8">
          <div className="flex justify-between mb-2">
            <span className="font-medium">Order ID:</span>
            <span>{orderID}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">Order Date:</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="text-center">
          <p className="mb-6 text-gray-600">
            We've sent a confirmation email with your order details.
            You'll receive another email when your order ships.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link href="/" className="inline-block bg-primary text-white py-3 px-6 rounded-md hover:bg-primary/90 transition-colors">
              Return to Home
            </Link>
            <Link href="/products" className="inline-block bg-gray-200 text-gray-800 py-3 px-6 rounded-md hover:bg-gray-300 transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 