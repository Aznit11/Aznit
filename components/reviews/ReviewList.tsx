"use client";

import { useState, useEffect } from "react";
import { StarIcon } from "@heroicons/react/24/solid";
import { format } from "date-fns";
import Image from "next/image";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

interface ReviewListProps {
  productId: string;
  initialAverageRating?: number;
  initialReviewCount?: number;
  refreshTrigger?: number;
}

export default function ReviewList({ 
  productId, 
  initialAverageRating = 0, 
  initialReviewCount = 0,
  refreshTrigger = 0
}: ReviewListProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState(initialAverageRating);
  const [reviewCount, setReviewCount] = useState(initialReviewCount);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError("");
      
      try {
        const response = await fetch(`/api/reviews?productId=${productId}`);
        const data = await response.json();
        
        if (response.ok) {
          setReviews(data.reviews);
          setAverageRating(data.averageRating);
          setReviewCount(data.count);
        } else {
          setError(data.error || "Failed to fetch reviews");
        }
      } catch (err) {
        setError("An error occurred while fetching reviews");
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [productId, refreshTrigger]);

  if (loading) {
    return <div className="py-4">Loading reviews...</div>;
  }

  if (error) {
    return <div className="text-red-500 py-4">{error}</div>;
  }

  if (reviews.length === 0) {
    return (
      <div className="py-6 text-center border-t">
        <h3 className="text-xl font-bold mb-2">Customer Reviews</h3>
        <p className="text-gray-500">
          This product has no reviews yet. Be the first to review it!
        </p>
      </div>
    );
  }

  return (
    <div className="py-6 border-t">
      <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
      
      {/* Review summary */}
      <div className="flex items-center mb-6">
        <div className="flex mr-1">
          {[...Array(5)].map((_, i) => (
            <StarIcon
              key={i}
              className={`h-5 w-5 ${
                i < Math.floor(averageRating) 
                  ? 'text-yellow-400' 
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-lg ml-2">
          {averageRating.toFixed(1)} out of 5
        </span>
        <span className="text-sm text-gray-500 ml-4">
          Based on {reviewCount} {reviewCount === 1 ? 'review' : 'reviews'}
        </span>
      </div>
      
      {/* Reviews list */}
      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-6 last:border-0">
            <div className="flex items-center mb-2">
              {/* User avatar */}
              <div className="relative w-10 h-10 rounded-full overflow-hidden mr-3 bg-gray-200">
                {review.user.image ? (
                  <Image
                    src={review.user.image}
                    alt={review.user.name || "User"}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold">
                    {review.user.name ? review.user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
              </div>
              
              <div>
                <div className="font-medium">
                  {review.user.name || "Anonymous User"}
                </div>
                <div className="text-sm text-gray-500">
                  {format(new Date(review.createdAt), "MMM d, yyyy")}
                </div>
              </div>
            </div>
            
            {/* Rating */}
            <div className="flex items-center my-2">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-4 w-4 ${
                    i < review.rating
                      ? 'text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            
            {/* Review content */}
            {review.comment && (
              <p className="text-gray-700 mt-2">{review.comment}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 