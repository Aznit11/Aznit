"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShoppingBagIcon,
  ChevronLeftIcon,
  TruckIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentDuplicateIcon,
  CreditCardIcon,
  MapPinIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";

// Define Order interface
interface OrderItem {
  id: string;
  productId: string;
  orderId: string;
  quantity: number;
  price: number;
  product: {
    id: string;
    name: string;
    imageUrl: string;
  };
}

interface Order {
  id: string;
  userId: string;
  status: "PENDING" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  total: number;
  createdAt: string;
  updatedAt: string;
  orderItems: OrderItem[];
}

export default function OrderDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Redirect if not authenticated
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchOrderDetails();
    }
  }, [status, orderId, router]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch(`/api/orders/${orderId}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to fetch order: ${response.status}`);
      }
      
      const data = await response.json();
      setOrder(data.order);
    } catch (error) {
      console.error("Error fetching order details:", error);
      setError(error instanceof Error ? error.message : "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string, showTime = false) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      ...(showTime && { hour: '2-digit', minute: '2-digit' })
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusSteps = () => {
    const steps = [
      { status: "PENDING", label: "Order Placed", icon: <DocumentDuplicateIcon className="h-6 w-6" /> },
      { status: "PROCESSING", label: "Processing", icon: <ClockIcon className="h-6 w-6" /> },
      { status: "SHIPPED", label: "Shipped", icon: <TruckIcon className="h-6 w-6" /> },
      { status: "DELIVERED", label: "Delivered", icon: <CheckCircleIcon className="h-6 w-6" /> }
    ];

    // Get index of current status
    let currentIndex = steps.findIndex(step => step.status === order?.status);
    if (currentIndex === -1) currentIndex = 0; // Default to first step if status not found

    // If cancelled, only show the first step as completed
    if (order?.status === "CANCELLED") {
      currentIndex = 0;
    }

    return steps.map((step, index) => ({
      ...step,
      complete: index <= currentIndex && order?.status !== "CANCELLED",
      current: index === currentIndex && order?.status !== "CANCELLED",
      cancelled: order?.status === "CANCELLED" && index > 0
    }));
  };

  const getStatusColor = (status: Order["status"] | undefined) => {
    switch (status) {
      case "PENDING":
        return "bg-gray-100 text-gray-700";
      case "PROCESSING":
        return "bg-amber-100 text-amber-700";
      case "SHIPPED":
        return "bg-blue-100 text-blue-700";
      case "DELIVERED":
        return "bg-green-100 text-green-700";
      case "CANCELLED":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const calculateSubtotal = () => {
    if (!order) return 0;
    return order.orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  if (loading) {
    return (
      <div className="container-custom py-12">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Error Loading Order</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/account?tab=orders"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-custom py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have permission to view it.</p>
          <Link 
            href="/account?tab=orders"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link 
            href="/account?tab=orders"
            className="flex items-center text-gray-600 hover:text-primary transition-colors"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-1" />
            Back to Orders
          </Link>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="bg-gray-50 p-6 border-b border-gray-100">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold mb-1">Order #{order.id.substring(0, 8)}...</h1>
                <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {/* Order Progress */}
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4">Order Progress</h2>
              <div className="relative">
                {/* Progress Line */}
                <div className="absolute top-5 left-5 right-5 h-0.5 bg-gray-200"></div>
                
                {/* Status Steps */}
                <div className="relative grid grid-cols-4 gap-2">
                  {getStatusSteps().map((step, index) => (
                    <div key={index} className="flex flex-col items-center text-center relative">
                      {/* Step Circle */}
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 
                        ${step.complete ? 'bg-primary text-white' : 
                          step.cancelled ? 'bg-gray-200 text-gray-400' : 
                          'bg-gray-200 text-gray-500'}`}
                      >
                        {step.icon}
                      </div>
                      
                      {/* Step Label */}
                      <div className="mt-2">
                        <p className={`text-sm font-medium ${step.complete ? 'text-primary' : 
                          step.cancelled ? 'text-gray-400' : 'text-gray-600'}`}
                        >
                          {step.label}
                        </p>
                        {step.current && order.status !== "CANCELLED" && (
                          <p className="text-xs text-primary mt-1">Current</p>
                        )}
                        {order.status === "CANCELLED" && index === 0 && (
                          <p className="text-xs text-red-500 mt-1">Order cancelled</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Order Items */}
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4">Items Ordered</h2>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {order.orderItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="relative h-12 w-12 bg-gray-100 rounded overflow-hidden mr-3">
                              <Image
                                src={item.product.imageUrl || '/images/products/placeholder.jpg'}
                                alt={item.product.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{item.product.name}</div>
                              <Link 
                                href={`/products/${item.product.id}`}
                                className="text-xs text-primary hover:underline"
                              >
                                View product
                              </Link>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${item.price.toFixed(2)}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          ${(item.price * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            {/* Order Summary */}
            <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-lg font-bold mb-4">Payment Info</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <CreditCardIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                    <div>
                      <p className="font-medium">Payment Method</p>
                      <p className="text-gray-600 text-sm mt-1">Credit Card or PayPal</p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-medium">${calculateSubtotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium">${(order.total - calculateSubtotal()).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span className="text-gray-600">Tax</span>
                      <span className="font-medium">$0.00</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-gray-200">
                      <span className="font-bold">Total</span>
                      <span className="font-bold">${order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-bold mb-4">Shipping Info</h2>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-start">
                    <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                    <div>
                      <p className="font-medium">Shipping Address</p>
                      <p className="text-gray-600 text-sm mt-1">
                        {session?.user?.name}<br />
                        123 Main Street<br />
                        Anytown, ST 12345<br />
                        United States
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-start">
                      <TruckIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                      <div>
                        <p className="font-medium">Shipping Method</p>
                        <p className="text-gray-600 text-sm mt-1">Standard Shipping</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Help Section */}
            <div>
              <h2 className="text-lg font-bold mb-4">Need Help?</h2>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-blue-700 text-sm">
                  If you have any questions or concerns about your order, please 
                  <Link href="/contact" className="underline font-medium ml-1">contact our support team</Link>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 