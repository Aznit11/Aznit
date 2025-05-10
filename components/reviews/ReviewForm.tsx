"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { StarIcon } from "@heroicons/react/24/solid";

interface ReviewFormProps {
  productId: string;
  onReviewSubmitted: () => void;
}

export default function ReviewForm({ productId, onReviewSubmitted }: ReviewFormProps) {
  const { data: session, status } = useSession();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [sessionDebug, setSessionDebug] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  // Debug session status when component loads
  useEffect(() => {
    console.log("Review form session status:", status);
    console.log("Review form session data:", session);
    setSessionDebug({ status, session });
  }, [session, status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    
    setSubmitting(true);
    
    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId,
          rating,
          comment: comment.trim() || null,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(data.message);
        setRating(0);
        setComment("");
        onReviewSubmitted();
      } else {
        setError(data.error || "Failed to submit review");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (status === "loading") {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (status === "unauthenticated") {
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
        <p className="text-center mb-4">Please sign in to leave a review</p>
        <a 
          href="/login" 
          className="block w-full text-center bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors"
        >
          Sign In
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
      <h3 className="text-xl font-bold mb-4">Write a Review</h3>
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded-md">
          {success}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {/* Debug section - hidden by default */}
      <div className="mb-4">
        <button 
          type="button"
          onClick={() => setShowDebug(!showDebug)}
          className="text-xs text-gray-500 underline"
        >
          {showDebug ? "Hide Debug" : "Debug"}
        </button>
        
        {showDebug && sessionDebug && (
          <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono">
            <p>Session Status: {sessionDebug.status}</p>
            <p>User: {sessionDebug.session?.user?.name || 'No name'} ({sessionDebug.session?.user?.email || 'No email'})</p>
            <p>User ID: {sessionDebug.session?.user?.id || 'No ID'}</p>
            <p>User Role: {sessionDebug.session?.user?.role || 'No role'}</p>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rating
          </label>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <StarIcon
                key={star}
                className={`h-8 w-8 cursor-pointer ${
                  (hoveredRating || rating) >= star 
                    ? 'text-yellow-400' 
                    : 'text-gray-300'
                }`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
              />
            ))}
            <span className="ml-2 text-sm text-gray-500">
              {rating > 0 ? `Your rating: ${rating}/5` : "Select a rating"}
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
            Your Review (Optional)
          </label>
          <textarea
            id="comment"
            rows={4}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-primary focus:ring-opacity-50"
          />
        </div>
        
        <button
          type="submit"
          disabled={submitting}
          className={`w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary/90 transition-colors ${
            submitting ? "opacity-50 cursor-not-allowed" : ""
          }`}
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
} 