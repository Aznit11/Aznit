"use client";

import Image from 'next/image';
import Link from 'next/link';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useCart } from '../../contexts/CartContext';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, subtotal, total } = useCart();
  
  // Calculate shipping (free shipping over $100)
  const shipping = subtotal > 100 ? 0 : 15;

  return (
    <div className="container-custom py-12">
      <h1 className="text-3xl md:text-4xl font-serif font-bold mb-8 text-center">
        Your Shopping Cart
      </h1>

      {cart.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">Cart Items ({cart.length})</h2>
                <div className="divide-y divide-gray-200">
                  {cart.map((item) => {
                    // Calculate item price (with discount if applicable)
                    const itemPrice = item.discount 
                      ? item.price - (item.price * item.discount / 100)
                      : item.price;
                    
                    return (
                      <div key={item.id} className="py-6 flex flex-col sm:flex-row gap-4">
                        {/* Product Image */}
                        <div className="flex-shrink-0 w-full sm:w-24 h-24 relative">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            sizes="(max-width: 768px) 100vw, 100px"
                            className="object-cover object-center rounded-md"
                          />
                        </div>

                        {/* Product Details */}
                        <div className="flex-grow">
                          <h3 className="text-lg font-semibold mb-1">
                            <Link
                              href={`/products/${item.id}`}
                              className="hover:text-primary transition-colors"
                            >
                              {item.name}
                            </Link>
                          </h3>
                          <p className="text-gray-600 text-sm mb-2">
                            ${itemPrice.toFixed(2)} each
                            {item.discount && (
                              <span className="ml-2 text-red-500">
                                ({item.discount}% off)
                              </span>
                            )}
                          </p>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center border border-gray-300 rounded-md">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={item.quantity <= 1}
                                className={`px-3 py-1 ${
                                  item.quantity <= 1 
                                    ? 'text-gray-400 cursor-not-allowed' 
                                    : 'text-gray-600 hover:bg-gray-100'
                                }`}
                                aria-label="Decrease quantity"
                              >
                                -
                              </button>
                              <span className="px-3 py-1 border-l border-r border-gray-300">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700"
                              aria-label="Remove item"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="flex-shrink-0 font-semibold">
                          ${(itemPrice * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Continue Shopping */}
            <div className="mt-6">
              <Link
                href="/products"
                className="inline-flex items-center text-primary hover:underline"
              >
                &larr; Continue Shopping
              </Link>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <h2 className="text-xl font-bold mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  {shipping === 0 ? (
                    <span className="text-green-600">Free</span>
                  ) : (
                    <span>${shipping.toFixed(2)}</span>
                  )}
                </div>
                <div className="border-t pt-4 flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${(total + shipping).toFixed(2)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                className="w-full block text-center bg-primary text-white py-3 px-4 rounded-md hover:bg-primary/90 transition-colors"
              >
                Proceed to Checkout
              </Link>

              <p className="text-xs text-gray-500 mt-6">
                By proceeding to checkout, you agree to our{' '}
                <Link href="/terms-of-service" className="text-primary hover:underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy-policy" className="text-primary hover:underline">
                  Privacy Policy
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link
            href="/products"
            className="btn btn-primary"
          >
            Start Shopping
          </Link>
        </div>
      )}
    </div>
  );
} 