"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  ShoppingBagIcon,
  UserGroupIcon,
  DocumentTextIcon,
  StarIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  BellAlertIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  FolderIcon,
  ChatBubbleLeftRightIcon
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import { useChat } from "@/contexts/ChatContext";

// Interface for dashboard stats
interface DashboardStats {
  totalRevenue: {
    value: number;
    growth: number;
  };
  totalOrders: {
    value: number;
    growth: number;
  };
  totalCustomers: {
    value: number;
    growth: number;
  };
  totalProducts: {
    value: number;
    growth: number;
  };
  pendingOrders: number;
  lowStockItems: number;
  pendingReviews: number;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const { unreadCount } = useChat();
  const chatSectionRef = useRef<HTMLDivElement>(null);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [recentReviews, setRecentReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: {
      value: 0,
      growth: 0
    },
    totalOrders: {
      value: 0,
      growth: 0
    },
    totalCustomers: {
      value: 0,
      growth: 0
    },
    totalProducts: {
      value: 0,
      growth: 0
    },
    pendingOrders: 0,
    lowStockItems: 0,
    pendingReviews: 0
  });

  useEffect(() => {
    // Extra client-side protection in case middleware fails
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session.user.role !== "ADMIN") {
        router.push("/");
      } else {
        fetchDashboardData();
      }
    }
  }, [status, session, router]);

  useEffect(() => {
    // Check if the URL has a #chat fragment and scroll to the chat section
    if (window.location.hash === '#chat' && chatSectionRef.current) {
      setTimeout(() => {
        chatSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 500); // Small delay to ensure the chat section is loaded
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await fetch("/api/admin/stats", {
        credentials: 'include'
      });
      
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch recent orders
      const ordersResponse = await fetch("/api/admin/orders?sort=createdAt:desc", {
        credentials: 'include'
      });
      
      if (ordersResponse.ok) {
        const { orders } = await ordersResponse.json();
        setRecentOrders(orders.slice(0, 4)); // Get latest 4 orders
      }

      // Fetch recent reviews
      const reviewsResponse = await fetch("/api/admin/reviews", {
        credentials: 'include'
      });
      
      if (reviewsResponse.ok) {
        const { reviews } = await reviewsResponse.json();
        setRecentReviews(reviews.slice(0, 3)); // Get latest 3 reviews
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format short date
  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} - ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  // Refresh dashboard data
  const refreshData = () => {
    fetchDashboardData();
  };

  if (loading || status !== "authenticated") {
    return (
      <div className="container-custom py-12">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your store, monitor metrics, and grow your business</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={refreshData}
            className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Refresh Data
          </button>
          <a 
            href="/"
            className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            View Store
          </a>
          <a 
            href="/api/auth/signout"
            className="bg-gray-800 px-4 py-2 rounded-lg shadow-sm text-white hover:bg-gray-700 transition-colors"
          >
            Sign Out
          </a>
        </div>
      </div>
      
      {/* Welcome Card */}
      <div className="bg-gradient-to-r from-primary/90 to-primary rounded-xl shadow-md p-6 mb-8 text-white">
        <div className="flex items-center mb-3">
          <CheckCircleIcon className="h-8 w-8 mr-3" />
          <h2 className="text-2xl font-bold">Welcome, {session.user.name || "Admin"}</h2>
        </div>
        <p className="mb-3 opacity-90">
          You have access to all admin features. Here's your store overview for today.
        </p>
        <div className="flex flex-wrap gap-6 mt-4">
          <div className="bg-white/20 rounded-lg px-4 py-3 backdrop-blur-sm">
            <p className="font-semibold text-sm">Pending Orders</p>
            <p className="text-2xl font-bold">{stats.pendingOrders}</p>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-3 backdrop-blur-sm">
            <p className="font-semibold text-sm">Low Stock Items</p>
            <p className="text-2xl font-bold">{stats.lowStockItems}</p>
          </div>
          <div className="bg-white/20 rounded-lg px-4 py-3 backdrop-blur-sm">
            <p className="font-semibold text-sm">Pending Reviews</p>
            <p className="text-2xl font-bold">{stats.pendingReviews}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Revenue</p>
              <p className="text-3xl font-bold mt-1">${stats.totalRevenue.value.toFixed(2)}</p>
            </div>
            <div className="rounded-full p-3 bg-primary/10 text-primary">
              <CurrencyDollarIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">{stats.totalRevenue.growth}%</span>
            <span className="text-gray-400 ml-2">vs. last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Orders</p>
              <p className="text-3xl font-bold mt-1">{stats.totalOrders.value}</p>
            </div>
            <div className="rounded-full p-3 bg-blue-50 text-blue-500">
              <DocumentTextIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">{stats.totalOrders.growth}%</span>
            <span className="text-gray-400 ml-2">vs. last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Customers</p>
              <p className="text-3xl font-bold mt-1">{stats.totalCustomers.value}</p>
            </div>
            <div className="rounded-full p-3 bg-purple-50 text-purple-500">
              <UserGroupIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">{stats.totalCustomers.growth}%</span>
            <span className="text-gray-400 ml-2">vs. last month</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Products</p>
              <p className="text-3xl font-bold mt-1">{stats.totalProducts.value}</p>
            </div>
            <div className="rounded-full p-3 bg-amber-50 text-amber-500">
              <ShoppingBagIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="flex items-center mt-4 text-sm">
            <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">{stats.totalProducts.growth}%</span>
            <span className="text-gray-400 ml-2">vs. last month</span>
          </div>
        </div>
      </div>

      {/* Management Cards */}
      <h2 className="text-2xl font-serif font-bold mb-6">Management</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {/* Products Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="rounded-full w-12 h-12 flex items-center justify-center bg-amber-50 text-amber-500 mb-4">
              <ShoppingBagIcon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Products</h3>
            <p className="text-gray-600 text-sm mb-4">
              Manage product listings, inventory, and categories
            </p>
            <Link 
              href="/admin/products" 
              className="block w-full text-center py-2 bg-primary/10 text-primary font-medium rounded-md hover:bg-primary hover:text-white transition-colors group-hover:bg-primary group-hover:text-white"
            >
              Manage Products
            </Link>
          </div>
        </div>

        {/* Categories Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="rounded-full w-12 h-12 flex items-center justify-center bg-orange-50 text-orange-500 mb-4">
              <FolderIcon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Categories</h3>
            <p className="text-gray-600 text-sm mb-4">
              Create and manage product categories
            </p>
            <Link 
              href="/admin/categories" 
              className="block w-full text-center py-2 bg-primary/10 text-primary font-medium rounded-md hover:bg-primary hover:text-white transition-colors group-hover:bg-primary group-hover:text-white"
            >
              Manage Categories
            </Link>
          </div>
        </div>

        {/* Orders Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="rounded-full w-12 h-12 flex items-center justify-center bg-blue-50 text-blue-500 mb-4">
              <DocumentTextIcon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Orders</h3>
            <p className="text-gray-600 text-sm mb-4">
              View and manage customer orders and shipments
            </p>
            <Link 
              href="/admin/orders" 
              className="block w-full text-center py-2 bg-primary/10 text-primary font-medium rounded-md hover:bg-primary hover:text-white transition-colors group-hover:bg-primary group-hover:text-white"
            >
              Manage Orders
            </Link>
          </div>
        </div>

        {/* Users Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="rounded-full w-12 h-12 flex items-center justify-center bg-purple-50 text-purple-500 mb-4">
              <UserGroupIcon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Users</h3>
            <p className="text-gray-600 text-sm mb-4">
              Manage user accounts and permissions
            </p>
            <Link 
              href="/admin/users" 
              className="block w-full text-center py-2 bg-primary/10 text-primary font-medium rounded-md hover:bg-primary hover:text-white transition-colors group-hover:bg-primary group-hover:text-white"
            >
              Manage Users
            </Link>
          </div>
        </div>

        {/* Reviews Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow relative">
          <div className="p-6">
            <div className="rounded-full w-12 h-12 flex items-center justify-center bg-green-50 text-green-500 mb-4">
              <StarIcon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Reviews</h3>
            {stats.pendingReviews > 0 && (
              <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {stats.pendingReviews}
              </div>
            )}
            <p className="text-gray-600 text-sm mb-4">
              Moderate customer reviews and ratings
              {stats.pendingReviews > 0 && (
                <span className="block mt-1 text-red-500 font-medium">
                  {stats.pendingReviews} {stats.pendingReviews === 1 ? 'review' : 'reviews'} pending approval
                </span>
              )}
            </p>
            <div className="space-y-2">
              <Link 
                href="/admin/reviews" 
                className="block w-full text-center py-2 bg-primary/10 text-primary font-medium rounded-md hover:bg-primary hover:text-white transition-colors group-hover:bg-primary group-hover:text-white"
              >
                Manage Reviews
              </Link>
              {stats.pendingReviews > 0 && (
                <Link 
                  href="/admin/reviews?filter=pending" 
                  className="block w-full text-center py-2 bg-red-500 text-white font-medium rounded-md hover:bg-red-600 transition-colors"
                >
                  View Pending Reviews
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Customer Messages Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="rounded-full w-12 h-12 flex items-center justify-center bg-blue-50 text-blue-500 mb-4">
              <ChatBubbleLeftRightIcon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Customer Messages</h3>
            {unreadCount > 0 && (
              <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {unreadCount}
              </div>
            )}
            <p className="text-gray-600 text-sm mb-4">
              Respond to customer inquiries and support messages
            </p>
            <Link 
              href="/admin/chats" 
              className="block w-full text-center py-2 bg-primary/10 text-primary font-medium rounded-md hover:bg-primary hover:text-white transition-colors group-hover:bg-primary group-hover:text-white"
            >
              View Messages
            </Link>
          </div>
        </div>

        {/* Blog Management */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden group hover:shadow-md transition-shadow">
          <div className="p-6">
            <div className="rounded-full w-12 h-12 flex items-center justify-center bg-emerald-50 text-emerald-500 mb-4">
              <DocumentTextIcon className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Blog</h3>
            <p className="text-gray-600 text-sm mb-4">
              Create and manage blog posts, comments, and categories
            </p>
            <Link 
              href="/admin/blog" 
              className="block w-full text-center py-2 bg-primary/10 text-primary font-medium rounded-md hover:bg-primary hover:text-white transition-colors group-hover:bg-primary group-hover:text-white"
            >
              Manage Blog
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Recent Orders</h3>
            <Link 
              href="/admin/orders" 
              className="text-primary text-sm font-medium hover:underline"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentOrders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent orders found</p>
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <p className="font-medium">#{order.id.substring(0, 8)}...</p>
                    <p className="text-sm text-gray-500">{formatShortDate(order.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(order.total)}</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'SHIPPED' ? 'bg-green-100 text-green-800' :
                      order.status === 'DELIVERED' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold">Recent Reviews</h3>
            <Link 
              href="/admin/reviews" 
              className="text-primary text-sm font-medium hover:underline"
            >
              View All
            </Link>
          </div>
          
          <div className="space-y-4">
            {recentReviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No recent reviews found</p>
              </div>
            ) : (
              recentReviews.map((review) => (
                <div key={review.id} className="pb-4 border-b">
                  <div className="flex justify-between mb-1">
                    <p className="font-medium">{review.product.name}</p>
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <StarIcon key={i} className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 mb-1 line-clamp-2">{review.comment}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      {review.user?.name || review.user?.email || 'Customer'} - {formatShortDate(review.createdAt)}
                    </p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      review.isApproved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {review.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Chat Dashboard Section - Replace with Recent Messages */}
      <div id="chat-section" ref={chatSectionRef} className="mt-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-serif font-bold">Recent Messages</h3>
            <Link 
              href="/admin/chats" 
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors flex items-center"
            >
              <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
              View All Messages
              {unreadCount > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                  {unreadCount}
                </span>
              )}
            </Link>
          </div>
          
          {/* Recent Messages Summary */}
          <div className="space-y-4">
            {/* Show loading, empty state, or a preview of most recent conversations */}
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : unreadCount === 0 ? (
              <div className="text-center py-8">
                <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-gray-500 font-medium">No unread customer messages</p>
                <p className="text-sm text-gray-400 mt-1">All customer inquiries have been addressed</p>
                <Link 
                  href="/admin/chats" 
                  className="mt-4 inline-block px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors rounded-md text-sm font-medium"
                >
                  Go to Messages
                </Link>
              </div>
            ) : (
              <div className="text-center py-8">
                <ChatBubbleLeftRightIcon className="h-12 w-12 mx-auto text-primary mb-3" />
                <p className="text-gray-800 font-medium">You have {unreadCount} unread customer messages</p>
                <p className="text-sm text-gray-500 mt-1">Respond to customer inquiries to provide timely support</p>
                <Link 
                  href="/admin/chats" 
                  className="mt-4 inline-block px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors rounded-md text-sm font-medium"
                >
                  Reply to Messages
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 