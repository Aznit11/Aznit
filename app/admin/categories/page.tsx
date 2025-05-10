"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PlusIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";
import { fetchCategoriesAdmin, deleteCategory } from "../../../lib/categoryService";
import { Category } from "../../../types";

export default function CategoriesPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Fetch categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await fetchCategoriesAdmin();
        setCategories(categoriesData);
        setError("");
      } catch (error: any) {
        setError(error.message || "Failed to load categories");
      } finally {
        setLoading(false);
      }
    };

    if (status === "authenticated" && session.user.role === "ADMIN") {
      loadCategories();
    }
  }, [status, session]);

  // Redirects to login if user is not authenticated or not admin
  if (status === "unauthenticated") {
    router.push("/login");
    return null;
  }

  if (status === "authenticated" && session.user.role !== "ADMIN") {
    router.push("/");
    return null;
  }

  // Handle category deletion
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      setDeletingId(id);
      try {
        await deleteCategory(id);
        setCategories(categories.filter(category => category.id !== id));
      } catch (error: any) {
        setError(error.message || "Failed to delete category");
      } finally {
        setDeletingId(null);
      }
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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold">Categories</h1>
        <Link 
          href="/admin/categories/new" 
          className="inline-flex items-center bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Category
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.length > 0 ? (
              categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 line-clamp-2">{category.description || "-"}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <Link
                        href={`/admin/categories/edit/${category.id}`}
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                      >
                        <PencilIcon className="h-4 w-4 mr-1" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(category.id)}
                        disabled={deletingId === category.id}
                        className="text-red-600 hover:text-red-900 flex items-center disabled:opacity-50"
                      >
                        <TrashIcon className="h-4 w-4 mr-1" />
                        {deletingId === category.id ? "Deleting..." : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                  No categories found. Create your first category!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
} 