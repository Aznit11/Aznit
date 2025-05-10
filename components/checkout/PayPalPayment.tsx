"use client";

import React, { useState, useEffect } from 'react';
import { PayPalButtons } from '@paypal/react-paypal-js';
import { usePayPal } from '../../contexts/PayPalContext';
import { useCart } from '../../contexts/CartContext';
import { useRouter } from 'next/navigation';
import CsrfToken from '../ui/CsrfToken';

interface PayPalPaymentProps {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  finalTotal?: number;
}

export default function PayPalPayment({ onSuccess, onError, finalTotal }: PayPalPaymentProps) {
  const { cart, total, clearCart } = useCart();
  const { createOrder, captureOrder, isProcessing, paymentError, resetPayment } = usePayPal();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const router = useRouter();
  const [csrfToken, setCsrfToken] = useState<string>('');

  // Use finalTotal if provided, otherwise fall back to cart total
  const amountToCharge = finalTotal !== undefined ? finalTotal : total;

  // Make sure cart data is saved to localStorage before payment
  useEffect(() => {
    // Save cart to localStorage when component mounts
    if (cart && cart.length > 0) {
      window.localStorage.setItem('cart', JSON.stringify(cart));
      window.localStorage.setItem('cartTotal', String(amountToCharge));
      console.log('Saved cart to localStorage:', cart);
      console.log('Saved total to localStorage:', amountToCharge);
    }
  }, [cart, amountToCharge]);

  // Reset payment state when component unmounts
  useEffect(() => {
    return () => {
      resetPayment();
    };
  }, [resetPayment]);

  // Update error message if there's a payment error
  useEffect(() => {
    if (paymentError) {
      setErrorMessage(paymentError);
    }
  }, [paymentError]);

  // Fetch CSRF token on component mount
  useEffect(() => {
    const fetchCsrfToken = async () => {
      try {
        const response = await fetch('/api/csrf');
        if (response.ok) {
          const data = await response.json();
          setCsrfToken(data.csrfToken);
        }
      } catch (error) {
        console.error('Error fetching CSRF token:', error);
      }
    };
    
    fetchCsrfToken();
  }, []);

  // Handle successful payment
  const handleApprove = async (data: any, actions: any) => {
    try {
      console.log('Payment approved:', data);
      
      // Ensure cart data is saved to localStorage before capture
      window.localStorage.setItem('cart', JSON.stringify(cart));
      window.localStorage.setItem('cartTotal', String(amountToCharge));
      console.log('Saved cart before capture:', cart);
      
      // Capture the funds from the transaction
      const orderData = await captureOrder(data.orderID);
      
      console.log('Payment capture successful:', orderData);
      
      // Save order to database with CSRF token
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify({
            total: amountToCharge,
            paymentMethod: 'PAYPAL',
            paymentId: data.orderID,
            shippingAddress: {}, // Assuming shippingData is not provided in the component
            items: cart.map(item => ({
              id: item.id,
              quantity: item.quantity,
              price: item.price
            })),
            _csrf: csrfToken
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to create order in database');
        }
        
        const orderDataFromDB = await response.json();
        console.log('Order created in database:', orderDataFromDB);
      } catch (error) {
        console.error('Error saving order to database:', error);
        // Continue with success flow even if DB save fails
        // This prevents double-charging the customer
      }
      
      // Clear the cart
      clearCart();
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(orderData);
      } else {
        // If no callback provided, redirect to success page
        router.push('/checkout/success?orderId=' + data.orderID);
      }
    } catch (error) {
      console.error('Error capturing PayPal order:', error);
      setErrorMessage('Payment could not be completed. Please try again.');
      
      // Call onError callback if provided
      if (onError) {
        onError(error);
      }
    }
  };

  return (
    <div className="mt-6">
      {errorMessage && (
        <div className="p-4 mb-4 bg-red-100 text-red-700 rounded-md">
          <p>{errorMessage}</p>
        </div>
      )}

      {isProcessing && (
        <div className="flex justify-center items-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2">Processing payment...</span>
        </div>
      )}

      <div className="mb-4">
        <div className="p-4 bg-yellow-50 text-yellow-800 rounded-md text-sm">
          <p className="font-semibold">Sandbox Mode</p>
          <p>This is a test environment. No real payments will be processed.</p>
          <p className="mt-1">Use the PayPal Sandbox account to complete the test checkout.</p>
          <p className="mt-1">Order total: ${amountToCharge?.toFixed(2) || '0.00'}</p>
        </div>
      </div>

      <PayPalButtons
        style={{ 
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'pay'
        }}
        disabled={isProcessing}
        forceReRender={[amountToCharge]}
        fundingSource={undefined}
        createOrder={async () => {
          console.log('Starting PayPal order creation with total:', amountToCharge);
          
          if (!amountToCharge || amountToCharge <= 0) {
            const error = new Error('Invalid order amount');
            console.error(error);
            setErrorMessage('Cannot process payment: invalid amount');
            throw error;
          }
          
          try {
            const orderId = await createOrder(amountToCharge);
            console.log('Order created successfully with ID:', orderId);
            return orderId;
          } catch (error) {
            console.error('Error creating PayPal order:', error);
            setErrorMessage(error instanceof Error ? error.message : 'Failed to create PayPal order. Please try again.');
            throw error;
          }
        }}
        onApprove={handleApprove}
        onError={(err: any) => {
          console.error('PayPal error:', err);
          setErrorMessage('An error occurred with PayPal. Please try again.');
          if (onError) onError(err);
        }}
        onCancel={() => {
          console.log('Payment was cancelled by user');
          setErrorMessage('Payment was cancelled. Please try again.');
        }}
      />
    </div>
  );
} 