"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeftIcon, EnvelopeIcon, CalendarIcon, ShoppingBagIcon, StarIcon, ChatBubbleLeftRightIcon, PencilIcon, XMarkIcon } from "@heroicons/react/24/outline";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
  orders: Array<{
    id: string;
    status: string;
    total: number;
    createdAt: string;
  }>;
  reviews: Array<{
    id: string;
    rating: number;
    comment: string;
    createdAt: string;
    product: {
      id: string;
      name: string;
      imageUrl: string;
    };
  }>;
  _count: {
    orders: number;
    reviews: number;
  };
}

export default function UserDetailsPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'reviews' | 'messages'>('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'USER' as 'USER' | 'ADMIN'
  });

  useEffect(() => {
    // Auth protection
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session.user.role !== "ADMIN") {
        router.push("/");
      } else {
        fetchUserData();
      }
    }
  }, [status, session, router, params.id]);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email,
        role: user.role
      });
    }
  }, [user]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/users/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        console.error('Failed to fetch user details:', await response.text());
        if (response.status === 404) {
          // Handle not found
          alert('User not found');
          router.push('/admin/users');
        }
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSaving(true);
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const data = await response.json();
        // Update the user state with new data
        setUser(prev => prev ? { ...prev, ...data.user } : null);
        setIsEditing(false);
        // Show success message
        alert('User information updated successfully');
      } else {
        console.error('Failed to update user:', await response.text());
        alert('Failed to update user information');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('An error occurred while updating user information');
    } finally {
      setSaving(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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

  if (!user) {
    return (
      <div className="container-custom py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">User Not Found</h1>
          <p className="text-gray-600 mb-6">The user you are looking for does not exist or has been removed.</p>
          <Link 
            href="/admin/users" 
            className="inline-flex items-center text-primary hover:text-primary/80"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to User Management
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-8">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <div className="flex items-center">
            <Link 
              href="/admin/users" 
              className="mr-4 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl md:text-4xl font-serif font-bold">User Details</h1>
          </div>
          <p className="text-gray-600 mt-1">View and manage user information</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setIsEditing(!isEditing)}
            className="bg-gray-100 px-4 py-2 rounded-lg shadow-sm text-gray-700 hover:bg-gray-200 transition-colors flex items-center"
          >
            <PencilIcon className="h-5 w-5 mr-1" />
            {isEditing ? 'Cancel' : 'Edit User'}
          </button>
          <Link 
            href={`/admin/chats?userId=${user.id}`}
            className="bg-primary px-4 py-2 rounded-lg shadow-sm text-white hover:bg-primary/90 transition-colors flex items-center"
          >
            <ChatBubbleLeftRightIcon className="h-5 w-5 mr-1" />
            Chat with User
          </Link>
        </div>
      </div>
      
      {/* User Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8">
        <div className="p-6 flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative w-24 h-24 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || 'User avatar'}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500 text-2xl font-bold">
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
          </div>
          
          <div className="flex-grow">
            <h2 className="text-2xl font-bold text-gray-800">{user.name || 'No Name'}</h2>
            <div className="flex flex-col md:flex-row md:items-center gap-y-2 md:gap-x-6 mt-2">
              <div className="flex items-center text-gray-600">
                <EnvelopeIcon className="h-5 w-5 mr-2" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center text-gray-600">
                <CalendarIcon className="h-5 w-5 mr-2" />
                <span>Joined {formatDate(user.createdAt)}</span>
              </div>
              <div className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm">
                {user.role}
              </div>
            </div>
            
            <div className="flex mt-4 gap-x-4">
              <div className="flex items-center">
                <ShoppingBagIcon className="h-5 w-5 text-primary mr-1" />
                <span className="text-gray-700">{user._count.orders} Orders</span>
              </div>
              <div className="flex items-center">
                <StarIcon className="h-5 w-5 text-primary mr-1" />
                <span className="text-gray-700">{user._count.reviews} Reviews</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="border-t border-gray-200">
          <div className="flex overflow-x-auto">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'profile' 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Profile
            </button>
            <button 
              onClick={() => setActiveTab('orders')}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'orders' 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Orders
            </button>
            <button 
              onClick={() => setActiveTab('reviews')}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'reviews' 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Reviews
            </button>
            <button 
              onClick={() => setActiveTab('messages')}
              className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
                activeTab === 'messages' 
                  ? 'border-b-2 border-primary text-primary' 
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              Messages
            </button>
          </div>
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {activeTab === 'profile' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Account Details</h3>
              {!isEditing && (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="text-primary hover:text-primary/80 text-sm flex items-center"
                >
                  <PencilIcon className="h-4 w-4 mr-1" />
                  Edit
                </button>
              )}
            </div>
            
            {isEditing ? (
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                  <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                      User Role
                    </label>
                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="USER">User</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 flex items-center"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin h-4 w-4 mr-2 border-2 border-t-transparent border-white rounded-full"></div>
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Full Name</p>
                  <p className="text-gray-800">{user.name || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Email Address</p>
                  <p className="text-gray-800">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">User Role</p>
                  <p className="text-gray-800">{user.role}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Account Created</p>
                  <p className="text-gray-800">{formatDate(user.createdAt)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Last Updated</p>
                  <p className="text-gray-800">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'orders' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Recent Orders</h3>
            {user.orders.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">This user hasn't placed any orders yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {user.orders.map((order) => (
                      <tr key={order.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                            order.status === 'PROCESSING' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'SHIPPED' ? 'bg-indigo-100 text-indigo-800' :
                            order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link 
                            href={`/admin/orders/${order.id}`}
                            className="text-primary hover:text-primary/80"
                          >
                            View Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {user._count.orders > user.orders.length && (
              <div className="mt-4 text-center">
                <Link
                  href={`/admin/orders?userId=${user.id}`}
                  className="text-primary hover:text-primary/80 text-sm"
                >
                  View All Orders ({user._count.orders})
                </Link>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'reviews' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Recent Reviews</h3>
            {user.reviews.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">This user hasn't left any reviews yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {user.reviews.map((review) => (
                  <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center mb-2">
                      <div className="mr-3 relative w-12 h-12 flex-shrink-0">
                        <Image
                          src={review.product.imageUrl}
                          alt={review.product.name}
                          fill
                          className="rounded object-cover"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">{review.product.name}</h4>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon 
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                            />
                          ))}
                          <span className="ml-1 text-xs text-gray-500">
                            {formatDate(review.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm">{review.comment}</p>
                    <div className="mt-2">
                      <Link
                        href={`/admin/products/${review.product.id}`}
                        className="text-xs text-primary hover:text-primary/80"
                      >
                        View Product
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {user._count.reviews > user.reviews.length && (
              <div className="mt-4 text-center">
                <Link
                  href={`/admin/products/reviews?userId=${user.id}`}
                  className="text-primary hover:text-primary/80 text-sm"
                >
                  View All Reviews ({user._count.reviews})
                </Link>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'messages' && (
          <div>
            <h3 className="text-xl font-semibold mb-4">Support Conversations</h3>
            <div className="mt-4">
              <Link
                href={`/admin/chats?userId=${user.id}`}
                className="inline-flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
              >
                <ChatBubbleLeftRightIcon className="h-5 w-5 mr-2" />
                View All Conversations
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 