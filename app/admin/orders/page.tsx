"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  MagnifyingGlassIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowPathIcon,
  EyeIcon,
  DocumentTextIcon,
  TruckIcon,
  CheckCircleIcon,
  XCircleIcon,
  FunnelIcon,
} from "@heroicons/react/24/outline";

// Define Order type based on our database structure
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
  user: {
    id: string;
    name: string;
    email: string;
  };
  orderItems: OrderItem[];
}

type SortField = "id" | "createdAt" | "total";
type SortDirection = "asc" | "desc";

export default function AdminOrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<Order["status"] | "ALL">("ALL");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [updateLoading, setUpdateLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // Auth protection
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session.user.role !== "ADMIN") {
        router.push("/");
      } else {
        fetchOrders();
      }
    }
  }, [status, session, router]);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/admin/orders', {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }
      
      const data = await response.json();
      setOrders(data.orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orders.length === 0) return;
    
    let result = [...orders];
    
    // Apply text search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.id.toLowerCase().includes(query) || 
        order.user.name?.toLowerCase().includes(query) ||
        order.user.email.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    if (statusFilter !== "ALL") {
      result = result.filter(order => order.status === statusFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      if (sortField === "id") {
        return sortDirection === "asc" 
          ? a.id.localeCompare(b.id)
          : b.id.localeCompare(a.id);
      } else if (sortField === "createdAt") {
        return sortDirection === "asc" 
          ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() 
          : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortField === "total") {
        return sortDirection === "asc" 
          ? a.total - b.total 
          : b.total - a.total;
      }
      return 0;
    });
    
    setFilteredOrders(result);
  }, [searchQuery, statusFilter, sortField, sortDirection, orders]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("desc"); // Default to descending for new sort field
    }
  };

  const getSortIcon = (field: SortField) => {
    if (field !== sortField) {
      return null;
    }
    return sortDirection === "asc" ? (
      <ChevronUpIcon className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDownIcon className="h-4 w-4 ml-1" />
    );
  };

  const getStatusBadgeClasses = (status: Order["status"]) => {
    switch (status) {
      case "PENDING":
        return "bg-gray-100 text-gray-800";
      case "PROCESSING":
        return "bg-amber-100 text-amber-800";
      case "SHIPPED":
        return "bg-blue-100 text-blue-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute:'2-digit' })}`;
  };

  const updateOrderStatus = async (orderId: string, newStatus: Order["status"]) => {
    setUpdateLoading(orderId);
    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to update order status');
      }
      
      // Update local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );
      
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status. Please try again.');
    } finally {
      setUpdateLoading(null);
    }
  };

  const refreshOrders = () => {
    fetchOrders();
  };

  const calculateTotalItems = (order: Order) => {
    return order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
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

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-2xl font-bold mb-4 sm:mb-0">Orders</h1>
        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <button 
            onClick={refreshOrders}
            className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
          {error}
        </div>
      )}
      
      <div className="mb-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
        <div className="relative flex-grow">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search orders..."
            className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm py-2 bg-white focus:ring-primary focus:border-primary sm:text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="sm:w-48">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FunnelIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              className="pl-10 block w-full rounded-md border border-gray-300 shadow-sm py-2 bg-white focus:ring-primary focus:border-primary sm:text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as Order["status"] | "ALL")}
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="PROCESSING">Processing</option>
              <option value="SHIPPED">Shipped</option>
              <option value="DELIVERED">Delivered</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("id")}
                >
                  <div className="flex items-center">
                    Order ID
                    {getSortIcon("id")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Customer
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center">
                    Date
                    {getSortIcon("createdAt")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort("total")}
                >
                  <div className="flex items-center">
                    Total
                    {getSortIcon("total")}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Items
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No orders found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.id.substring(0, 8)}...
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{order.user.name || 'N/A'}</span>
                        <span className="text-gray-500">{order.user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${order.total.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeClasses(
                            order.status
                          )}`}
                        >
                          {order.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {calculateTotalItems(order)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <div className="relative group">
                          <button className="text-indigo-600 hover:text-indigo-900 bg-white rounded-md p-1">
                            <span className="sr-only">Update Status</span>
                            <DocumentTextIcon className="h-5 w-5" />
                          </button>
                          <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none invisible group-hover:visible">
                            <button 
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                              onClick={() => updateOrderStatus(order.id, 'PENDING')}
                              disabled={updateLoading === order.id}
                            >
                              <DocumentTextIcon className="mr-2 h-4 w-4 text-gray-500" />
                              Pending
                            </button>
                            <button 
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                              onClick={() => updateOrderStatus(order.id, 'PROCESSING')}
                              disabled={updateLoading === order.id}
                            >
                              <DocumentTextIcon className="mr-2 h-4 w-4 text-amber-500" />
                              Processing
                            </button>
                            <button 
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                              onClick={() => updateOrderStatus(order.id, 'SHIPPED')}
                              disabled={updateLoading === order.id}
                            >
                              <TruckIcon className="mr-2 h-4 w-4 text-blue-500" />
                              Shipped
                            </button>
                            <button 
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                              onClick={() => updateOrderStatus(order.id, 'DELIVERED')}
                              disabled={updateLoading === order.id}
                            >
                              <CheckCircleIcon className="mr-2 h-4 w-4 text-green-500" />
                              Delivered
                            </button>
                            <button 
                              className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center"
                              onClick={() => updateOrderStatus(order.id, 'CANCELLED')}
                              disabled={updateLoading === order.id}
                            >
                              <XCircleIcon className="mr-2 h-4 w-4 text-red-500" />
                              Cancelled
                            </button>
                          </div>
                        </div>
                        <Link 
                          href={`/admin/orders/${order.id}`}
                          className="text-indigo-600 hover:text-indigo-900 bg-white rounded-md p-1"
                        >
                          <span className="sr-only">View details</span>
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                      </div>
                      {updateLoading === order.id && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-200 bg-opacity-25">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 