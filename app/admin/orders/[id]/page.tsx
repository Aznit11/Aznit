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
  UserIcon,
  XCircleIcon,
  DocumentTextIcon,
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
  paymentId?: string;
  paymentProvider?: string;
  user: {
    id: string;
    name?: string;
    email: string;
    image?: string;
  };
  orderItems: OrderItem[];
}

export default function AdminOrderDetailsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const orderId = params.id as string;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updateLoading, setUpdateLoading] = useState(false);

  useEffect(() => {
    // Auth protection
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session.user.role !== "ADMIN") {
        router.push("/");
      } else {
        fetchOrderDetails();
      }
    }
  }, [status, session, router, orderId]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError("");
      
      const response = await fetch(`/api/admin/orders/${orderId}`, {
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

  const updateOrderStatus = async (newStatus: Order["status"]) => {
    try {
      setUpdateLoading(true);
      
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update order: ${response.status}`);
      }
      
      const data = await response.json();
      setOrder(data.order);
    } catch (error) {
      console.error("Error updating order status:", error);
      setError(error instanceof Error ? error.message : "Failed to update order status");
    } finally {
      setUpdateLoading(false);
    }
  };

  const formatDate = (dateString: string, showTime = true) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      ...(showTime && { hour: '2-digit', minute: '2-digit' })
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
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
      <div className="p-6">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <div className="text-red-500 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Error Loading Order</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link 
            href="/admin/orders"
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
      <div className="p-6">
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Order Not Found</h1>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist.</p>
          <Link 
            href="/admin/orders"
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center mb-6">
          <Link 
            href="/admin/orders"
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
                <h1 className="text-2xl font-bold mb-1">Order #{order.id}</h1>
                <p className="text-gray-600">Placed on {formatDate(order.createdAt)}</p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center space-x-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
                <div className="relative group">
                  <button className="inline-flex items-center px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                    Update Status
                    <ChevronLeftIcon className="h-4 w-4 ml-1 rotate-90" />
                  </button>
                  <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none invisible group-hover:visible">
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center ${order.status === 'PENDING' ? 'text-gray-400' : ''}`}
                      onClick={() => updateOrderStatus('PENDING')}
                      disabled={updateLoading || order.status === 'PENDING'}
                    >
                      <DocumentTextIcon className="mr-2 h-4 w-4 text-gray-500" />
                      Set as Pending
                    </button>
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center ${order.status === 'PROCESSING' ? 'text-gray-400' : ''}`}
                      onClick={() => updateOrderStatus('PROCESSING')}
                      disabled={updateLoading || order.status === 'PROCESSING'}
                    >
                      <ClockIcon className="mr-2 h-4 w-4 text-amber-500" />
                      Set as Processing
                    </button>
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center ${order.status === 'SHIPPED' ? 'text-gray-400' : ''}`}
                      onClick={() => updateOrderStatus('SHIPPED')}
                      disabled={updateLoading || order.status === 'SHIPPED'}
                    >
                      <TruckIcon className="mr-2 h-4 w-4 text-blue-500" />
                      Set as Shipped
                    </button>
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center ${order.status === 'DELIVERED' ? 'text-gray-400' : ''}`}
                      onClick={() => updateOrderStatus('DELIVERED')}
                      disabled={updateLoading || order.status === 'DELIVERED'}
                    >
                      <CheckCircleIcon className="mr-2 h-4 w-4 text-green-500" />
                      Set as Delivered
                    </button>
                    <button 
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center ${order.status === 'CANCELLED' ? 'text-gray-400' : ''}`}
                      onClick={() => updateOrderStatus('CANCELLED')}
                      disabled={updateLoading || order.status === 'CANCELLED'}
                    >
                      <XCircleIcon className="mr-2 h-4 w-4 text-red-500" />
                      Cancel Order
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {/* Customer Information */}
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4">Customer Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <UserIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                  <div>
                    <p className="font-medium">{order.user.name || 'No Name'}</p>
                    <p className="text-gray-600 text-sm mt-1">{order.user.email}</p>
                    <p className="text-gray-600 text-sm mt-1">User ID: {order.user.id}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Payment Information */}
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4">Payment Information</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-start">
                  <CreditCardIcon className="h-5 w-5 text-gray-400 mt-0.5 mr-2" />
                  <div>
                    <p className="font-medium">Payment Method</p>
                    <p className="text-gray-600 text-sm mt-1">{order.paymentProvider || 'Not specified'}</p>
                    {order.paymentId && (
                      <p className="text-gray-600 text-sm mt-1">Payment ID: {order.paymentId}</p>
                    )}
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
                  <div className="flex justify-between pt-2 border-t border-gray-200">
                    <span className="font-bold">Total</span>
                    <span className="font-bold">${order.total.toFixed(2)}</span>
                  </div>
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
                                href={`/admin/products/${item.product.id}`}
                                className="text-xs text-primary hover:underline"
                              >
                                Edit product
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
            
            {/* Order Timeline */}
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4">Order Timeline</h2>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary">
                        <DocumentDuplicateIcon className="h-4 w-4 text-white" />
                      </div>
                    </div>
                    <div className="ml-4">
                      <p className="font-medium">Order Placed</p>
                      <p className="text-gray-600 text-sm">{formatDate(order.createdAt)}</p>
                    </div>
                  </div>
                  
                  {order.updatedAt !== order.createdAt && (
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200">
                          <ClockIcon className="h-4 w-4 text-gray-500" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <p className="font-medium">Last Updated</p>
                        <p className="text-gray-600 text-sm">{formatDate(order.updatedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Admin Actions */}
            <div className="mb-8">
              <h2 className="text-lg font-bold mb-4">Admin Actions</h2>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={() => fetchOrderDetails()}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 transition-colors"
                >
                  Refresh Order Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
