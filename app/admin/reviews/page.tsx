"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { CheckIcon, XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  isApproved: boolean;
  createdAt: string;
  userId: string;
  productId: string;
  user: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  product: {
    id: string;
    name: string;
    imageUrl: string | null;
  };
}

export default function AdminReviewsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialFilter = searchParams.get('filter') === 'pending' ? 'pending' : 
                      searchParams.get('filter') === 'approved' ? 'approved' : 'pending';
  
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">(initialFilter);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Extra client-side protection in case middleware fails
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      if (session.user.role !== "ADMIN") {
        router.push("/");
      } else {
        fetchReviews();
      }
    }
  }, [status, session, router, filter]);

  // Update URL when filter changes
  useEffect(() => {
    if (status === "authenticated" && session.user.role === "ADMIN") {
      const newParams = new URLSearchParams();
      // Copy all existing parameters
      searchParams.forEach((value, key) => {
        newParams.set(key, value);
      });
      
      if (filter !== 'all') {
        newParams.set('filter', filter);
      } else {
        newParams.delete('filter');
      }
      const newPath = `/admin/reviews${newParams.toString() ? `?${newParams.toString()}` : ''}`;
      router.replace(newPath, { scroll: false });
    }
  }, [filter, router, searchParams, session, status]);

  const fetchReviews = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/reviews?status=${filter}`);
      const data = await response.json();

      if (response.ok) {
        setReviews(data.reviews);
      } else {
        setError(data.error || "Failed to fetch reviews");
      }
    } catch (err) {
      setError("An error occurred while fetching reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReview = async (reviewId: string, approve: boolean) => {
    try {
      const response = await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reviewId,
          isApproved: approve,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        fetchReviews();
      } else {
        setError(data.error || "Failed to update review");
      }
    } catch (err) {
      setError("An error occurred while updating review");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/reviews?id=${reviewId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        fetchReviews();
      } else {
        setError(data.error || "Failed to delete review");
      }
    } catch (err) {
      setError("An error occurred while deleting review");
    }
  };

  if (loading && status !== "authenticated") {
    return (
      <div className="container-custom py-12">
        <div className="flex justify-center items-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-custom py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-serif font-bold">Manage Reviews</h1>
        <Link 
          href="/admin" 
          className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md"
        >
          Back to Dashboard
        </Link>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-green-100 text-green-700 rounded-md">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="flex space-x-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded-md ${
              filter === "all"
                ? "bg-primary text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            All Reviews
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-4 py-2 rounded-md ${
              filter === "pending"
                ? "bg-primary text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter("approved")}
            className={`px-4 py-2 rounded-md ${
              filter === "approved"
                ? "bg-primary text-white"
                : "bg-gray-100 hover:bg-gray-200"
            }`}
          >
            Approved
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <p className="text-gray-500">No reviews found.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rating
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Review
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reviews.map((review) => (
                <tr key={review.id} className={!review.isApproved ? "bg-gray-50" : ""}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 relative">
                        {review.product.imageUrl ? (
                          <Image
                            src={review.product.imageUrl}
                            alt={review.product.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        ) : (
                          <div className="h-10 w-10 bg-gray-200 rounded-md flex items-center justify-center text-gray-500">
                            No Img
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <Link 
                          href={`/products/${review.product.id}`} 
                          className="text-sm font-medium text-gray-900 hover:text-primary"
                        >
                          {review.product.name}
                        </Link>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-900 mr-1">{review.rating}</span>
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs truncate">
                      {review.comment || <span className="text-gray-500 italic">No comment</span>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {review.user.name || "Anonymous"}
                    </div>
                    <div className="text-sm text-gray-500">{review.user.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        review.isApproved
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {review.isApproved ? "Approved" : "Pending"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      {!review.isApproved && (
                        <button
                          onClick={() => handleApproveReview(review.id, true)}
                          className="text-green-600 hover:text-green-900"
                          title="Approve Review"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                      )}
                      {review.isApproved && (
                        <button
                          onClick={() => handleApproveReview(review.id, false)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Unapprove Review"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteReview(review.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete Review"
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
  );
} 