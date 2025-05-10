"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CheckoutCancelPage() {
  const router = useRouter();
  
  return (
    <div className="container-custom py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 bg-red-100 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>
        
        <h1 className="text-3xl font-serif font-bold text-center mb-4">
          Payment Cancelled
        </h1>
        
        <p className="text-center text-gray-600 mb-8">
          Your payment was cancelled. No charges have been made to your account.
        </p>
        
        <div className="text-center">
          <p className="mb-6 text-gray-600">
            You can complete your purchase at any time. The items in your cart have been saved.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 justify-center">
            <Link 
              href="/checkout" 
              className="inline-block bg-primary text-white py-3 px-6 rounded-md hover:bg-primary/90 transition-colors"
            >
              Return to Checkout
            </Link>
            <Link 
              href="/cart" 
              className="inline-block bg-gray-200 text-gray-800 py-3 px-6 rounded-md hover:bg-gray-300 transition-colors"
            >
              View Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 