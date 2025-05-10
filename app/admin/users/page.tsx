"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  MagnifyingGlassIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
  ArrowPathIcon,
  ShoppingBagIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  _count: {
    orders: number;
    reviews: number;
  };
}

type SortField = "name" | "email" | "role" | "createdAt";
type SortDirection = "asc" | "desc";

export default function AdminUsersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "USER" | "ADMIN">("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Auth protection
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session.user.role !== "ADMIN") {
        router.push("/");
      } else {
        fetchUsers();
      }
    }
  }, [status, session, router]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        console.error('Failed to fetch users:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (users.length > 0) {
      // Filter users
      let result = [...users];
      
      // Apply text search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(user => 
          (user.name || '').toLowerCase().includes(query) || 
          user.email.toLowerCase().includes(query)
        );
      }
      
      // Apply role filter
      if (roleFilter !== "all") {
        result = result.filter(user => user.role === roleFilter);
      }
      
      // Apply sorting
      result.sort((a, b) => {
        if (sortField === "name") {
          return sortDirection === "asc"
            ? (a.name || '').localeCompare(b.name || '')
            : (b.name || '').localeCompare(a.name || '');
        } else if (sortField === "email") {
          return sortDirection === "asc"
            ? a.email.localeCompare(b.email)
            : b.email.localeCompare(a.email);
        } else if (sortField === "role") {
          return sortDirection === "asc"
            ? a.role.localeCompare(b.role)
            : b.role.localeCompare(a.role);
        } else if (sortField === "createdAt") {
          return sortDirection === "asc"
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      });
      
      setFilteredUsers(result);
    }
  }, [searchQuery, roleFilter, sortField, sortDirection, users]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    
    return sortDirection === "asc" 
      ? <ChevronUpIcon className="h-4 w-4" /> 
      : <ChevronDownIcon className="h-4 w-4" />;
  };

  const handleDelete = async (id: string) => {
    // Don't allow deleting the current user
    if (id === session?.user.id) {
      alert("You cannot delete your own account");
      return;
    }

    if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
      try {
        setIsDeleting(true);
        const response = await fetch(`/api/admin/users/${id}`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          // Refresh user list after successful deletion
          await fetchUsers();
        } else {
          const data = await response.json();
          alert(data.error || 'Failed to delete user');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('An error occurred while trying to delete the user');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleRoleChange = async (id: string, newRole: 'USER' | 'ADMIN') => {
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (response.ok) {
        // Refresh user list after successful update
        await fetchUsers();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update user role');
      }
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('An error occurred while trying to update user role');
    }
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

  return (
    <div className="container-custom py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold">User Management</h1>
          <p className="text-gray-600 mt-1">Manage user accounts and permissions</p>
        </div>
        <div className="flex gap-3">
          <Link 
            href="/admin" 
            className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Back to Dashboard
          </Link>
          <Link 
            href="/admin/users/new" 
            className="bg-primary px-4 py-2 rounded-lg shadow-sm text-white hover:bg-primary/90 transition-colors flex items-center"
          >
            <PlusIcon className="h-5 w-5 mr-1" />
            Add User
          </Link>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users by name or email..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-200 rounded-md pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as "all" | "USER" | "ADMIN")}
              >
                <option value="all">All Roles</option>
                <option value="USER">User</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            
            <button
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("all");
                setSortField("createdAt");
                setSortDirection("desc");
              }}
              className="flex items-center px-3 py-2 border border-gray-200 rounded-md hover:bg-gray-50"
              title="Reset Filters"
            >
              <ArrowPathIcon className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 mb-4">No users found matching your criteria</p>
            <button
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("all");
              }}
              className="text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avatar
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Name
                      {getSortIcon("name")}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center">
                      Email
                      {getSortIcon("email")}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("role")}
                  >
                    <div className="flex items-center">
                      Role
                      {getSortIcon("role")}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center">
                      Joined
                      {getSortIcon("createdAt")}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full overflow-hidden bg-gray-100">
                          {user.image ? (
                            <Image
                              src={user.image}
                              alt={user.name || "User"}
                              width={40}
                              height={40}
                              className="h-10 w-10 object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 flex items-center justify-center bg-primary/10 text-primary font-bold">
                              {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{user.name || "(No name)"}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value as "USER" | "ADMIN")}
                        className={`px-2 py-1 text-sm border rounded ${
                          user.role === "ADMIN" ? 'border-purple-200 bg-purple-50 text-purple-700' : 'border-gray-200 bg-gray-50 text-gray-700'
                        }`}
                        disabled={user.id === session?.user.id} // Can't change own role
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center text-sm text-gray-500">
                          <ShoppingBagIcon className="h-4 w-4 mr-1 text-gray-400" />
                          {user._count.orders}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <StarIcon className="h-4 w-4 mr-1 text-gray-400" />
                          {user._count.reviews}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end items-center space-x-2">
                        <Link 
                          href={`/admin/users/${user.id}`}
                          className="text-blue-500 hover:text-blue-700"
                          title="Edit User"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(user.id)} 
                          className="text-red-500 hover:text-red-700"
                          title="Delete User"
                          disabled={isDeleting || user.id === session?.user.id}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
} 