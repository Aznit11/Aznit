"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  UserIcon,
  ShoppingBagIcon,
  HeartIcon,
  MapPinIcon,
  CreditCardIcon,
  BellIcon,
  ArrowRightIcon,
  StarIcon,
  LockClosedIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  XMarkIcon,
  EyeIcon,
  ChatBubbleBottomCenterTextIcon
} from "@heroicons/react/24/outline";
import { useSearchParams } from "next/navigation";
import { products } from "../../lib/data";
import { useRouter as useNavigationRouter } from "next/navigation";
import { useChat } from "@/contexts/ChatContext";

// Define order interface
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

// Sample addresses
const userAddresses = [
  {
    id: "addr_1",
    label: "Home",
    name: "John Doe",
    street: "123 Main Street",
    city: "Austin",
    state: "TX",
    postalCode: "78701",
    country: "United States",
    phone: "512-555-1234",
    isDefault: true
  },
  {
    id: "addr_2",
    label: "Work",
    name: "John Doe",
    street: "456 Corporate Ave, Suite 300",
    city: "Austin",
    state: "TX",
    postalCode: "78701",
    country: "United States",
    phone: "512-555-5678",
    isDefault: false
  }
];

// Sample wishlist items
const wishlistItems = [
  {
    id: "1",
    name: "Moroccan Leather Bag",
    price: 89.99,
    image: "/images/products/leather-bag.jpg",
    inStock: true
  },
  {
    id: "2",
    name: "Hand-painted Tea Set",
    price: 125.00,
    image: "/images/products/tea-set.jpg",
    inStock: true
  },
  {
    id: "3",
    name: "Moroccan Lantern",
    price: 65.50,
    image: "/images/products/lantern.jpg",
    inStock: false
  }
];

// Account page tabs
const tabs = [
  { id: "dashboard", label: "Dashboard", icon: <UserIcon className="w-5 h-5" /> },
  { id: "orders", label: "Orders", icon: <ShoppingBagIcon className="w-5 h-5" /> },
  { id: "wishlist", label: "Wishlist", icon: <HeartIcon className="w-5 h-5" /> },
  { id: "addresses", label: "Addresses", icon: <MapPinIcon className="w-5 h-5" /> },
  { id: "payment", label: "Payment Methods", icon: <CreditCardIcon className="w-5 h-5" /> },
  { id: "support", label: "Contact Support", icon: <ChatBubbleBottomCenterTextIcon className="w-5 h-5" /> },
  { id: "settings", label: "Settings", icon: <LockClosedIcon className="w-5 h-5" /> }
];

export default function AccountPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const navigationRouter = useNavigationRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState(userAddresses);
  const [wishlist, setWishlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { unreadCount } = useChat();

  useEffect(() => {
    // Get tab from URL or default to dashboard
    const tab = searchParams.get("tab");
    if (tab && tabs.some(t => t.id === tab)) {
      setActiveTab(tab);
    }

    // Redirect if not authenticated
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      // Fetch user data
      fetchUserData();
    }
  }, [status, router, searchParams]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      
      // First try the new combined user profile + orders endpoint
      try {
        console.log('Fetching user profile with orders...');
        const profileResponse = await fetch('/api/users/me', {
          method: 'GET',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
          cache: 'no-store'
        });
        
        if (profileResponse.ok) {
          const data = await profileResponse.json();
          console.log(`Fetched user profile with ${data.user.orders?.length || 0} orders`);
          
          if (data.user?.orders) {
            setOrders(data.user.orders);
          }
        } else {
          console.warn('Failed to fetch from /api/users/me, falling back to separate endpoints');
          await fetchOrders();
        }
      } catch (profileError) {
        console.warn('Error using /api/users/me endpoint, falling back to separate endpoints', profileError);
        await fetchOrders();
      }
      
      // Fetch wishlist and recommendations in parallel
      await Promise.all([
        fetchWishlist(),
        fetchRecommendations()
      ]);
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setIsLoading(false);
    }
  };

  const fetchOrders = async () => {
    setOrdersLoading(true);
    setError(null);
    try {
      console.log('Fetching orders from API...');
      const response = await fetch('/api/orders', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response from orders API:', {
          status: response.status,
          statusText: response.statusText,
          body: errorText
        });
        throw new Error(`Failed to fetch orders: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log(`Fetched ${data.orders?.length || 0} orders`);
      
      if (!data.orders) {
        console.error('Missing orders array in API response:', data);
        setOrders([]);
        return;
      }
      
      setOrders(data.orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Failed to load orders. Please try again.');
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const fetchWishlist = async () => {
    setWishlistLoading(true);
    try {
      console.log('Fetching wishlist from API...');
      const response = await fetch('/api/wishlist', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch wishlist: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Fetched ${data.wishlist?.length || 0} wishlist items`);
      
      if (data.wishlist) {
        setWishlist(data.wishlist);
      }
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      // Fallback to empty wishlist
      setWishlist([]);
    } finally {
      setWishlistLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    setRecommendationsLoading(true);
    try {
      console.log('Fetching product recommendations...');
      const response = await fetch('/api/products/recommended?limit=4', {
        method: 'GET',
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch recommendations: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Fetched ${data.products?.length || 0} recommended products`);
      
      if (data.products && data.products.length > 0) {
        setRecommendations(data.products);
      } else {
        // Fallback to sample data if no recommendations
        setRecommendations(products.slice(0, 4));
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      // Fallback to sample data
      setRecommendations(products.slice(0, 4));
    } finally {
      setRecommendationsLoading(false);
    }
  };

  // Handle tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    router.push(`/account?tab=${tabId}`, { scroll: false });
  };

  // Remove from wishlist
  const removeFromWishlist = async (itemId: string) => {
    try {
      const response = await fetch(`/api/wishlist/${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      
      if (response.ok) {
        // Update the local state to remove the item
        setWishlist(current => current.filter(item => item.id !== itemId));
      } else {
        console.error('Failed to remove item from wishlist');
      }
    } catch (err) {
      console.error('Error removing from wishlist:', err);
    }
  };

  // Add to cart from wishlist
  const addToCart = (itemId: string) => {
    // In a real app, this would call an API to add the item to the cart
    alert(`Added item ${itemId} to cart`);
  };

  // Add new address
  const addNewAddress = () => {
    // This would open a modal or redirect to an address form page
    router.push("/account/addresses/new");
  };

  // Remove address
  const removeAddress = (addressId) => {
    if (confirm("Are you sure you want to remove this address?")) {
      setAddresses(current => current.filter(addr => addr.id !== addressId));
    }
  };

  // Set default address
  const setDefaultAddress = (addressId) => {
    setAddresses(current => 
      current.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }))
    );
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Calculate total items in an order
  const calculateTotalItems = (order) => {
    return order.orderItems.reduce((sum, item) => sum + item.quantity, 0);
  };

  // Get status badge class
  const getStatusBadgeClass = (status) => {
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

  // Function to navigate to support page
  const navigateToSupport = () => {
    router.push('/account/support');
  };

  if (isLoading) {
    return (
      <div className="container-custom py-12">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  // Dashboard Tab Content
  const DashboardContent = () => (
    <div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center space-x-4">
          <div className="relative h-16 w-16 rounded-full bg-gray-200 overflow-hidden">
            {session?.user?.image ? (
              <Image 
                src={session.user.image} 
                alt={session.user.name || "User"} 
                fill 
                className="object-cover"
              />
            ) : (
              <UserIcon className="h-10 w-10 text-gray-400 absolute inset-0 m-auto" />
            )}
          </div>
          <div>
            <h2 className="text-xl font-bold">{session?.user?.name || "User"}</h2>
            <p className="text-gray-600">{session?.user?.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <ShoppingBagIcon className="h-6 w-6 text-primary mr-2" />
            <h3 className="text-lg font-bold">Recent Orders</h3>
          </div>
          {ordersLoading ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : orders.length > 0 ? (
            <div>
              <div className="space-y-3">
                {orders.slice(0, 3).map(order => (
                  <div key={order.id} className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <div>
                      <p className="font-medium">Order #{order.id.substring(0, 8)}...</p>
                      <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusBadgeClass(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/account?tab=orders" className="flex items-center text-primary mt-4 text-sm font-medium">
                View all orders
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </Link>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-2">No orders yet</p>
              <Link href="/products" className="text-primary font-medium">Start shopping</Link>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <HeartIcon className="h-6 w-6 text-primary mr-2" />
            <h3 className="text-lg font-bold">Wishlist</h3>
          </div>
          {wishlistLoading ? (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : wishlist.length > 0 ? (
            <div>
              <div className="space-y-3">
                {wishlist.slice(0, 3).map(item => (
                  <div key={item.id} className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-md overflow-hidden relative mr-3">
                        <Image src={item.image || '/images/products/placeholder.jpg'} alt={item.name} fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-sm text-gray-600">${item.price.toFixed(2)}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-medium ${item.inStock ? 'text-green-600' : 'text-red-600'}`}>
                      {item.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                ))}
              </div>
              <Link href="/account?tab=wishlist" className="flex items-center text-primary mt-4 text-sm font-medium">
                View all wishlist items
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </Link>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-2">Your wishlist is empty</p>
              <Link href="/products" className="text-primary font-medium">Browse products</Link>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
          <div className="flex items-center mb-4">
            <MapPinIcon className="h-6 w-6 text-primary mr-2" />
            <h3 className="text-lg font-bold">Addresses</h3>
          </div>
          {addresses.length > 0 ? (
            <div>
              <div className="space-y-3">
                {addresses.slice(0, 3).map(address => (
                  <div key={address.id} className="border-b border-gray-100 pb-3">
                    <div className="flex justify-between">
                      <p className="font-medium">{address.label}</p>
                      {address.isDefault && (
                        <span className="text-xs text-primary font-medium">Default</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{address.street}</p>
                    <p className="text-sm text-gray-600">{address.city}, {address.state} {address.postalCode}</p>
                  </div>
                ))}
              </div>
              <Link href="/account?tab=addresses" className="flex items-center text-primary mt-4 text-sm font-medium">
                Manage addresses
                <ArrowRightIcon className="h-4 w-4 ml-1" />
              </Link>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-600 mb-2">No addresses saved</p>
              <button onClick={addNewAddress} className="text-primary font-medium">Add an address</button>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center mb-6">
          <StarIcon className="h-6 w-6 text-primary mr-2" />
          <h3 className="text-lg font-bold">Recommended For You</h3>
        </div>

        {recommendationsLoading ? (
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {recommendations.map(product => (
              <Link key={product.id} href={`/products/${product.id}`} className="group">
                <div className="aspect-square overflow-hidden rounded-lg bg-gray-100 relative mb-2">
                  <Image 
                    src={product.imageUrl || '/images/products/placeholder.jpg'} 
                    alt={product.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <h4 className="font-medium text-sm group-hover:text-primary transition-colors">{product.name}</h4>
                <p className="text-gray-900 font-bold text-sm">${product.price.toFixed(2)}</p>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
        <div className="flex items-center mb-4">
          <BellIcon className="h-6 w-6 text-primary mr-2" />
          <h3 className="text-lg font-bold">Account Activity</h3>
        </div>
        
        <div className="space-y-3">
          <div className="flex items-start border-b border-gray-100 pb-3">
            <div className="rounded-full bg-green-100 p-2 mr-3">
              <CheckCircleIcon className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="font-medium">Account created</p>
              <p className="text-sm text-gray-600">{formatDate(session?.user?.createdAt || new Date())}</p>
            </div>
          </div>
          
          {orders.length > 0 && (
            <div className="flex items-start border-b border-gray-100 pb-3">
              <div className="rounded-full bg-blue-100 p-2 mr-3">
                <ShoppingBagIcon className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Last order placed</p>
                <p className="text-sm text-gray-600">{formatDate(orders[0].createdAt)}</p>
              </div>
            </div>
          )}
          
          <div className="flex items-start">
            <div className="rounded-full bg-indigo-100 p-2 mr-3">
              <ShieldCheckIcon className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="font-medium">Account security</p>
              <p className="text-sm text-gray-600">Your account is secure</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Orders Tab Content
  const OrdersContent = () => (
    <div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-bold mb-6">Your Orders</h2>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}
        
        {ordersLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : orders.length > 0 ? (
          <div className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items
                    </th>
                    <th scope="col" className="relative px-6 py-3">
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{order.id.substring(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(order.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${order.total.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {calculateTotalItems(order)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link href={`/account/orders/${order.id}`} className="text-indigo-600 hover:text-indigo-900">
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <ShoppingBagIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-6">When you place an order, it will appear here</p>
            <Link href="/products" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90">
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  // Wishlist Tab Content updated for real data
  const WishlistContent = () => (
    <div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
        <h2 className="text-xl font-bold mb-6">Your Wishlist</h2>
        
        {wishlistLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : wishlist.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlist.map(item => (
              <div key={item.id} className="border border-gray-100 rounded-lg overflow-hidden shadow-sm">
                <div className="relative h-48 bg-gray-100">
                  <Image src={item.image || '/images/products/placeholder.jpg'} alt={item.name} fill className="object-cover" />
                </div>
                <div className="p-4">
                  <h3 className="font-bold mb-1">{item.name}</h3>
                  <p className="text-lg font-bold text-primary mb-3">${item.price.toFixed(2)}</p>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => addToCart(item.productId)}
                      disabled={!item.inStock}
                      className={`flex-1 py-2 px-3 rounded-md text-center text-sm font-medium ${
                        item.inStock 
                          ? 'bg-primary text-white hover:bg-primary/90' 
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {item.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </button>
                    <button 
                      onClick={() => removeFromWishlist(item.id)}
                      className="p-2 rounded-md border border-gray-200 hover:bg-gray-50"
                    >
                      <XMarkIcon className="h-5 w-5 text-gray-500" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Your wishlist is empty</h3>
            <p className="text-gray-500 mb-6">Save items you love to your wishlist</p>
            <Link href="/products" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90">
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );

  // Get the active tab content
  const getActiveTabContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardContent />;
      case "orders":
        return <OrdersContent />;
      case "wishlist":
        return <WishlistContent />;
      case "addresses":
        return (
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Your Addresses</h2>
                <button 
                  onClick={addNewAddress}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 text-sm font-medium"
                >
                  Add New Address
                </button>
              </div>
              
              {addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {addresses.map(address => (
                    <div key={address.id} className="border border-gray-200 rounded-lg p-4 relative">
                      {address.isDefault && (
                        <span className="absolute top-2 right-2 bg-primary/10 text-primary text-xs font-medium px-2 py-1 rounded-full">
                          Default
                        </span>
                      )}
                      <h3 className="font-bold text-lg mb-2">{address.label}</h3>
                      <p className="text-gray-700">{address.name}</p>
                      <p className="text-gray-700">{address.street}</p>
                      <p className="text-gray-700">{address.city}, {address.state} {address.postalCode}</p>
                      <p className="text-gray-700">{address.country}</p>
                      <p className="text-gray-700 mt-2">{address.phone}</p>
                      
                      <div className="mt-4 pt-4 border-t border-gray-100 flex space-x-4">
                        {!address.isDefault && (
                          <button 
                            onClick={() => setDefaultAddress(address.id)}
                            className="text-primary text-sm font-medium"
                          >
                            Set as Default
                          </button>
                        )}
                        <button 
                          onClick={() => removeAddress(address.id)}
                          className="text-red-600 text-sm font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <MapPinIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses saved</h3>
                  <p className="text-gray-500 mb-6">Add your shipping and billing addresses</p>
                  <button 
                    onClick={addNewAddress}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90"
                  >
                    Add an Address
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      case "payment":
        return (
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
              <h2 className="text-xl font-bold mb-6">Payment Methods</h2>
              
              <div className="mb-8">
                <div className="flex items-center">
                  <CreditCardIcon className="h-10 w-10 text-primary mr-4" />
                  <div>
                    <h3 className="text-lg font-bold">Credit or Debit Card</h3>
                    <p className="text-gray-600">Add a new card or manage existing ones</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-center text-gray-600">
                    For now, we use PayPal for secure payments. No need to store your card details.
                  </p>
                </div>
              </div>
              
              <div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" className="h-10 w-10 mr-4 text-blue-600">
                    <path fill="currentColor" d="M186.3 258.2c0 12.2-9.7 21.5-22 21.5-9.2 0-16-5.2-16-15 0-12.2 9.5-21.5 21.8-21.5 9.2 0 16.2 5.2 16.2 15zM80.5 209.7h-4.7c-1.5 0-3 1-3.2 2.5l-4.3 26.3 8.2-.3c11 0 19.5-1.5 21.5-14.2 2.3-13.4-6.2-14.3-17.5-14.3zm284 0H360c-1.8 0-3 1-3.2 2.5l-4.2 26.3 8-.3c13 0 17-3 18.5-14.2 2-13.4-5.3-14.3-14.6-14.3zm373.3-53.8c-3.2-3-7.9-2.2-10.5 1.5-49.5 69.6-143.8 119.2-216.5 109.1-104.5-14.8-176.5-143.3-195.8-267-0.3-2.5-2.5-4.2-5-4.2h-57.5c-2.8 0-5 2.3-5 5.2 1 105.5 82.8 238.5 190.8 238.5 46.8 0 97-24.2 137.9-64.7l-47.5 71.8c-1.7 2.7-0.5 6.2 2.4 7.5 1.1 0.5 2.1 0.7 3.1 0.7 2 0 3.8-1 4.8-2.9l164.8-239.7c1.5-2.1 1.2-5.2-1-6.8z" />
                  </svg>
                  <div>
                    <h3 className="text-lg font-bold">PayPal</h3>
                    <p className="text-gray-600">Pay with your PayPal account</p>
                  </div>
                </div>
                
                <div className="mt-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <p className="text-center text-gray-600">
                    We use PayPal for secure checkout. You don't need a PayPal account - you can pay with your credit card through PayPal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      case "settings":
        return (
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
              <h2 className="text-xl font-bold mb-6">Account Settings</h2>
              
              <div className="space-y-6">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Personal Information</h3>
                  <p className="text-gray-600 mb-4">Manage your personal details</p>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={session?.user?.name || ""}
                        readOnly
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={session?.user?.email || ""}
                        readOnly
                      />
                    </div>
                    
                    <div className="pt-4">
                      <p className="text-sm text-gray-500">
                        To update your profile information, please email our customer support.
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Password</h3>
                  <p className="text-gray-600 mb-4">Manage your account password</p>
                  
                  <div className="space-y-4">
                    <button
                      className="px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
                      onClick={() => alert("This feature is coming soon!")}
                    >
                      Change Password
                    </button>
                  </div>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-bold text-lg mb-2">Preferences</h3>
                  <p className="text-gray-600 mb-4">Manage your communication preferences</p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <input
                        id="marketing-emails"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary"
                        defaultChecked
                      />
                      <label htmlFor="marketing-emails" className="ml-2 block text-sm text-gray-700">
                        Receive marketing emails about new products and offers
                      </label>
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        id="order-updates"
                        type="checkbox"
                        className="h-4 w-4 text-primary focus:ring-primary"
                        defaultChecked
                      />
                      <label htmlFor="order-updates" className="ml-2 block text-sm text-gray-700">
                        Receive order updates via email
                      </label>
                    </div>
                    
                    <div className="pt-4">
                      <button
                        className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                        onClick={() => alert("Preferences saved!")}
                      >
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="p-4 border border-red-100 rounded-lg">
                  <h3 className="font-bold text-lg text-red-700 mb-2">Danger Zone</h3>
                  <p className="text-gray-600 mb-4">Permanent actions for your account</p>
                  
                  <div className="space-y-4">
                    <button
                      className="px-4 py-2 bg-white text-red-600 border border-red-600 rounded-md hover:bg-red-50 transition-colors"
                      onClick={() => confirm("Are you sure you want to delete your account? This action cannot be undone.")}
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      case "support":
        // Navigate to the support page when support tab is clicked
        navigateToSupport();
        return null;
      default:
        return null;
    }
  };

  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl md:text-4xl font-serif font-bold mb-2">My Account</h1>
      <p className="text-gray-600 mb-8">Manage your profile, orders, and preferences</p>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-1/4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-4">
            <div className="flex items-center mb-6">
              <div className="relative h-16 w-16 rounded-full bg-gray-200 overflow-hidden mr-4">
                {session?.user?.image ? (
                  <Image 
                    src={session.user.image} 
                    alt={session.user.name || "User"} 
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-primary/10">
                    <UserIcon className="h-8 w-8 text-primary" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-bold text-lg">{session?.user?.name || "User"}</p>
                <p className="text-gray-500 text-sm">{session?.user?.email}</p>
              </div>
            </div>
            
            <div className="space-y-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`w-full flex items-center py-2.5 px-4 rounded-lg text-left transition-colors ${
                    activeTab === tab.id 
                      ? "bg-primary text-white"
                      : "hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  <span className="mr-3">{tab.icon}</span>
                  {tab.label}
                  {tab.id === "support" && unreadCount > 0 && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-1 font-semibold">
                      {unreadCount}
                    </span>
                  )}
                </button>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-100">
              <a 
                href="/api/auth/signout"
                className="flex items-center py-2 px-4 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
              >
                <XMarkIcon className="w-5 h-5 mr-3" />
                Sign Out
              </a>
            </div>
          </div>
        </div>
        
        {/* Main Content Area */}
        <div className="lg:w-3/4">
          {getActiveTabContent()}
        </div>
      </div>

      {/* Floating chat button */}
      {activeTab !== 'support' && (
        <button
          onClick={() => handleTabChange('support')}
          className="fixed bottom-8 right-8 z-50 flex items-center justify-center bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors duration-200"
          aria-label="Contact Support"
        >
          <ChatBubbleBottomCenterTextIcon className="h-6 w-6" />
          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
              {unreadCount}
            </span>
          )}
        </button>
      )}
    </div>
  );
} 