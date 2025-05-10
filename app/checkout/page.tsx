"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '../../contexts/CartContext';
import PayPalPayment from '../../components/checkout/PayPalPayment';
import { 
  getShippingRate, 
  calculateShippingCost, 
  getDeliveryEstimate, 
  getAllCountries 
} from '../../lib/shippingService';

type CheckoutStep = 'shipping' | 'payment' | 'confirmation';
type ShippingMethod = 'express' | 'economy';

interface ShippingFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  shippingMethod: ShippingMethod;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, total, subtotal, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [orderId, setOrderId] = useState<string>('');
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>('economy');
  const [shipping, setShipping] = useState<number>(0);
  const [deliveryEstimate, setDeliveryEstimate] = useState<string>('');
  const [availableCountries, setAvailableCountries] = useState<string[]>([]);
  
  // Form states
  const [shippingData, setShippingData] = useState<ShippingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'United States',
    shippingMethod: 'economy'
  });
  
  // Calculate total cart weight and quantity
  const calculateCartWeightAndQuantity = () => {
    let totalWeight = 0;
    let totalItems = 0;
    let sameProductQuantity = 1;
    
    // If there's only one product type in the cart with multiple quantities,
    // we can apply the quantity discount
    if (cart.length === 1) {
      sameProductQuantity = cart[0].quantity;
    }
    
    // Calculate total weight
    cart.forEach(item => {
      // Use the weight from the cart item, with a default of 0.5kg if not available
      const itemWeight = typeof item.weight === 'number' ? item.weight : 0.5;
      totalWeight += itemWeight * item.quantity;
      totalItems += item.quantity;
    });
    
    return {
      weight: Math.max(totalWeight, 0.5), // Minimum weight 0.5kg
      totalItems,
      sameProductQuantity
    };
  };
  
  // Get available countries from the shipping service
  useEffect(() => {
    setAvailableCountries(getAllCountries());
  }, []);
  
  // Calculate final total with shipping
  const finalTotal = subtotal + shipping;
  
  // Error states
  const [shippingErrors, setShippingErrors] = useState<Partial<ShippingFormData>>({});
  
  // Update shipping cost when country or method changes
  useEffect(() => {
    const { weight, totalItems, sameProductQuantity } = calculateCartWeightAndQuantity();
    
    const shippingCost = calculateShippingCost(
      shippingData.country, 
      shippingData.shippingMethod, 
      weight,
      subtotal,
      sameProductQuantity // Apply quantity discount if all items are the same product
    );
    
    setShipping(shippingCost);
    
    const estimate = getDeliveryEstimate(
      shippingData.country,
      shippingData.shippingMethod
    );
    setDeliveryEstimate(estimate);
  }, [shippingData.country, shippingData.shippingMethod, subtotal, cart]);
  
  // Handle shipping form changes
  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingData(prev => ({ ...prev, [name]: value }));
    // Clear validation error when user types
    if (shippingErrors[name as keyof ShippingFormData]) {
      setShippingErrors(prev => ({ ...prev, [name]: '' }));
    }
  };
  
  // Handle shipping method change
  const handleShippingMethodChange = (method: ShippingMethod) => {
    setShippingData(prev => ({ ...prev, shippingMethod: method }));
  };
  
  // Validate shipping form
  const validateShippingForm = (): boolean => {
    const errors: Partial<ShippingFormData> = {};
    
    if (!shippingData.firstName.trim()) errors.firstName = 'First name is required';
    if (!shippingData.lastName.trim()) errors.lastName = 'Last name is required';
    if (!shippingData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(shippingData.email)) errors.email = 'Email is invalid';
    if (!shippingData.phone.trim()) errors.phone = 'Phone number is required';
    if (!shippingData.address.trim()) errors.address = 'Address is required';
    if (!shippingData.city.trim()) errors.city = 'City is required';
    if (!shippingData.state.trim()) errors.state = 'State/Province is required';
    if (!shippingData.postalCode.trim()) errors.postalCode = 'Postal code is required';
    
    setShippingErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle shipping form submission
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateShippingForm()) {
      setCurrentStep('payment');
      window.scrollTo(0, 0);
    }
  };
  
  // Handle successful PayPal payment
  const handlePaymentSuccess = (data: any) => {
    // Set the order ID from PayPal
    setOrderId(data.id || `PP-${Math.random().toString(36).substring(2, 10).toUpperCase()}`);
    setCurrentStep('confirmation');
    window.scrollTo(0, 0);
    
    // Clear the cart after successful purchase
    clearCart();
  };
  
  // Handle payment error
  const handlePaymentError = (error: any) => {
    console.error('Payment error:', error);
    // You could add more error handling here if needed
  };
  
  // If cart is empty and not on confirmation page, redirect to cart
  if (cart.length === 0 && currentStep !== 'confirmation') {
    return (
      <div className="container-custom py-12">
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">
            You need to add items to your cart before proceeding to checkout.
          </p>
          <Link href="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      </div>
    );
  }
  
  // Calculate cart weight and quantity for displaying in the UI
  const { weight: cartWeight, totalItems: cartItems, sameProductQuantity } = calculateCartWeightAndQuantity();
  
  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl md:text-4xl font-serif font-bold mb-8 text-center">
        {currentStep === 'shipping' && 'Checkout'}
        {currentStep === 'payment' && 'Payment Information'}
        {currentStep === 'confirmation' && 'Order Confirmation'}
      </h1>
      
      {/* Checkout Progress */}
      {currentStep !== 'confirmation' && (
        <div className="mb-12">
          <div className="flex items-center justify-center">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center border-2 ${currentStep === 'shipping' ? 'bg-primary text-white border-primary' : 'bg-primary text-white border-primary'}`}>
              1
            </div>
            <div className={`h-1 w-20 ${currentStep === 'shipping' ? 'bg-gray-300' : 'bg-primary'}`}></div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center border-2 ${currentStep === 'payment' ? 'bg-primary text-white border-primary' : 'border-gray-300 text-gray-500'}`}>
              2
            </div>
            <div className="h-1 w-20 bg-gray-300"></div>
            <div className={`h-12 w-12 rounded-full flex items-center justify-center border-2 border-gray-300 text-gray-500`}>
              3
            </div>
          </div>
          <div className="flex items-center justify-center mt-2 text-sm">
            <div className="w-12 text-center">Shipping</div>
            <div className="w-20"></div>
            <div className="w-12 text-center">Payment</div>
            <div className="w-20"></div>
            <div className="w-12 text-center">Confirm</div>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Checkout Form */}
        <div className="lg:col-span-2">
          {/* Shipping Information Step */}
          {currentStep === 'shipping' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-6">Shipping Information</h2>
              <form onSubmit={handleShippingSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm text-gray-700 mb-1">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={shippingData.firstName}
                      onChange={handleShippingChange}
                      className={`w-full px-3 py-2 border ${shippingErrors.firstName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50`}
                    />
                    {shippingErrors.firstName && (
                      <p className="text-red-500 text-xs mt-1">{shippingErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm text-gray-700 mb-1">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={shippingData.lastName}
                      onChange={handleShippingChange}
                      className={`w-full px-3 py-2 border ${shippingErrors.lastName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50`}
                    />
                    {shippingErrors.lastName && (
                      <p className="text-red-500 text-xs mt-1">{shippingErrors.lastName}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <label htmlFor="email" className="block text-sm text-gray-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={shippingData.email}
                      onChange={handleShippingChange}
                      className={`w-full px-3 py-2 border ${shippingErrors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50`}
                    />
                    {shippingErrors.email && (
                      <p className="text-red-500 text-xs mt-1">{shippingErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={shippingData.phone}
                      onChange={handleShippingChange}
                      className={`w-full px-3 py-2 border ${shippingErrors.phone ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50`}
                    />
                    {shippingErrors.phone && (
                      <p className="text-red-500 text-xs mt-1">{shippingErrors.phone}</p>
                    )}
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="address" className="block text-sm text-gray-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={shippingData.address}
                    onChange={handleShippingChange}
                    className={`w-full px-3 py-2 border ${shippingErrors.address ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50`}
                  />
                  {shippingErrors.address && (
                    <p className="text-red-500 text-xs mt-1">{shippingErrors.address}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="col-span-2">
                    <label htmlFor="city" className="block text-sm text-gray-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={shippingData.city}
                      onChange={handleShippingChange}
                      className={`w-full px-3 py-2 border ${shippingErrors.city ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50`}
                    />
                    {shippingErrors.city && (
                      <p className="text-red-500 text-xs mt-1">{shippingErrors.city}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="state" className="block text-sm text-gray-700 mb-1">
                      State/Province *
                    </label>
                    <input
                      type="text"
                      id="state"
                      name="state"
                      value={shippingData.state}
                      onChange={handleShippingChange}
                      className={`w-full px-3 py-2 border ${shippingErrors.state ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50`}
                    />
                    {shippingErrors.state && (
                      <p className="text-red-500 text-xs mt-1">{shippingErrors.state}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="postalCode" className="block text-sm text-gray-700 mb-1">
                      ZIP/Postal Code *
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      name="postalCode"
                      value={shippingData.postalCode}
                      onChange={handleShippingChange}
                      className={`w-full px-3 py-2 border ${shippingErrors.postalCode ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50`}
                    />
                    {shippingErrors.postalCode && (
                      <p className="text-red-500 text-xs mt-1">{shippingErrors.postalCode}</p>
                    )}
                  </div>
                </div>
                
                <div className="mb-6">
                  <label htmlFor="country" className="block text-sm text-gray-700 mb-1">
                    Country *
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={shippingData.country}
                    onChange={handleShippingChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50"
                  >
                    {availableCountries.map(country => (
                      <option key={country} value={country}>{country}</option>
                    ))}
                  </select>
                </div>
                
                {/* Shipping Method Selection */}
                <div className="mb-6">
                  <label className="block text-sm text-gray-700 mb-3">
                    Shipping Method *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div 
                      className={`border rounded-md p-4 cursor-pointer ${
                        shippingData.shippingMethod === 'economy' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleShippingMethodChange('economy')}
                    >
                      <div className="flex items-center mb-2">
                        <div className={`w-5 h-5 rounded-full border ${
                          shippingData.shippingMethod === 'economy' 
                            ? 'border-primary' 
                            : 'border-gray-300'
                        } flex items-center justify-center mr-3`}>
                          {shippingData.shippingMethod === 'economy' && (
                            <div className="w-3 h-3 rounded-full bg-primary"></div>
                          )}
                        </div>
                        <span className="font-medium">Economy Shipping</span>
                      </div>
                      <p className="text-sm text-gray-500 ml-8">
                        {getDeliveryEstimate(shippingData.country, 'economy')} delivery
                      </p>
                      <p className="text-sm font-medium text-gray-700 ml-8 mt-1">
                        {calculateShippingCost(shippingData.country, 'economy', cartWeight, subtotal, sameProductQuantity) === 0 
                          ? 'FREE' 
                          : `$${calculateShippingCost(shippingData.country, 'economy', cartWeight, subtotal, sameProductQuantity).toFixed(2)}`
                        }
                      </p>
                    </div>
                    
                    <div 
                      className={`border rounded-md p-4 cursor-pointer ${
                        shippingData.shippingMethod === 'express' 
                          ? 'border-primary bg-primary/5' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleShippingMethodChange('express')}
                    >
                      <div className="flex items-center mb-2">
                        <div className={`w-5 h-5 rounded-full border ${
                          shippingData.shippingMethod === 'express' 
                            ? 'border-primary' 
                            : 'border-gray-300'
                        } flex items-center justify-center mr-3`}>
                          {shippingData.shippingMethod === 'express' && (
                            <div className="w-3 h-3 rounded-full bg-primary"></div>
                          )}
                        </div>
                        <span className="font-medium">Express Shipping</span>
                      </div>
                      <p className="text-sm text-gray-500 ml-8">
                        {getDeliveryEstimate(shippingData.country, 'express')} delivery
                      </p>
                      <p className="text-sm font-medium text-gray-700 ml-8 mt-1">
                        {calculateShippingCost(shippingData.country, 'express', cartWeight, subtotal, sameProductQuantity) === 0 
                          ? 'FREE' 
                          : `$${calculateShippingCost(shippingData.country, 'express', cartWeight, subtotal, sameProductQuantity).toFixed(2)}`
                        }
                      </p>
                    </div>
                  </div>
                </div>
                
                <button type="submit" className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary/90 transition-colors">
                  Continue to Payment
                </button>
              </form>
            </div>
          )}
          
          {/* Payment Information Step - Updated to use PayPal */}
          {currentStep === 'payment' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-6">Payment Information</h2>
              <p className="text-gray-600 mb-6">
                Please complete your payment using PayPal. You can pay with your PayPal account or credit card.
              </p>
              
              {/* PayPal Payment Component */}
              <PayPalPayment 
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                finalTotal={finalTotal}
              />
              
              <div className="mt-8">
                <button 
                  type="button"
                  onClick={() => setCurrentStep('shipping')}
                  className="w-full bg-gray-200 text-gray-800 py-3 px-4 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Back to Shipping
                </button>
              </div>
            </div>
          )}
          
          {/* Order Confirmation */}
          {currentStep === 'confirmation' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-center mb-6">
                <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">Thank You for Your Order!</h2>
              <p className="text-center text-gray-600 mb-6">
                Your order has been received and is being processed.
              </p>
              <div className="bg-gray-50 p-4 rounded-md mb-6">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Order Number:</span>
                  <span>{orderId}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Order Date:</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Estimated Delivery:</span>
                  <span>{deliveryEstimate}</span>
                </div>
              </div>
              <div className="text-center">
                <p className="mb-6 text-gray-600">
                  We've sent a confirmation email to {shippingData.email}.
                  You'll receive another email when your order ships.
                </p>
                <Link href="/products" className="inline-block bg-primary text-white py-3 px-6 rounded-md hover:bg-primary/90 transition-colors">
                  Continue Shopping
                </Link>
              </div>
            </div>
          )}
        </div>
        
        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            {currentStep !== 'confirmation' && (
              <div className="max-h-80 overflow-y-auto mb-6">
                {cart.map((item) => {
                  // Calculate item price with discount
                  const itemPrice = item.discount 
                    ? item.price - (item.price * item.discount / 100)
                    : item.price;
                  
                  // Get item weight with default fallback
                  const itemWeight = typeof item.weight === 'number' ? item.weight : 0.5;
                  
                  return (
                    <div key={item.id} className="flex mb-4 pb-4 border-b border-gray-200">
                      <div className="w-16 h-16 relative flex-shrink-0">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded-md"
                        />
                        <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="ml-4 flex-grow">
                        <h3 className="text-sm font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          ${itemPrice.toFixed(2)} each
                        </p>
                        <p className="text-xs text-gray-400">
                          Weight: {itemWeight.toFixed(1)}kg × {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          ${(itemPrice * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <div>
                  <span className="text-gray-600">Shipping ({shippingData.shippingMethod})</span>
                  <p className="text-xs text-gray-500">
                    Total weight: {cartWeight.toFixed(1)}kg
                    {cart.length > 0 && (
                      <span className="block text-xs italic">
                        ({cart.map(item => `${item.name}: ${typeof item.weight === 'number' ? item.weight.toFixed(1) : '0.5'}kg × ${item.quantity}`).join(', ')})
                      </span>
                    )}
                  </p>
                </div>
                {shipping === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  <span>${shipping.toFixed(2)}</span>
                )}
              </div>
              {sameProductQuantity > 1 && shipping > 0 && (
                <div className="text-xs text-green-600 italic">
                  {`Applied ${
                    sameProductQuantity <= 3 
                      ? '10%' 
                      : sameProductQuantity <= 5
                        ? '15%' 
                        : sameProductQuantity <= 10
                          ? '20%'
                          : '30%'
                  } quantity discount`}
                </div>
              )}
              {shipping === 0 && (
                <div className="text-xs text-green-600 italic">
                  {shippingData.country === 'Morocco' 
                    ? "Free shipping in Morocco for orders over $50" 
                    : shippingData.shippingMethod === 'economy' 
                      ? "Free economy shipping for international orders over $300"
                      : ""}
                </div>
              )}
              <div className="border-t pt-3 mt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span>${finalTotal.toFixed(2)}</span>
              </div>
              <div className="text-xs text-gray-500">
                Estimated delivery: {deliveryEstimate}
              </div>
            </div>
            
            {currentStep === 'confirmation' ? (
              <p className="text-sm text-gray-600">
                Your payment has been processed successfully. Thank you for your purchase!
              </p>
            ) : (
              <p className="text-xs text-gray-500">
                By proceeding to checkout, you agree to our 
                <Link href="/terms-of-service" className="text-primary hover:underline ml-1">
                  Terms of Service
                </Link> and 
                <Link href="/privacy-policy" className="text-primary hover:underline ml-1">
                  Privacy Policy
                </Link>.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 