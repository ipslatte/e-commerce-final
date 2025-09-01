"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FiStar, FiThumbsUp, FiImage, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import ReviewForm from "./ReviewForm";

interface Review {
  _id: string;
  userId: string;
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  isVerifiedPurchase: boolean;
  helpfulVotes: number;
  createdAt: string;
  user: {
    name: string;
  };
}

interface ProductReviewsProps {
  productId: string;
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

export default function ProductReviews({
  productId,
  reviews,
  averageRating,
  totalReviews,
}: ProductReviewsProps) {
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const ratingCounts = Array.from({ length: 5 }, (_, i) => {
    const count = reviews.filter((review) => review.rating === i + 1).length;
    return {
      stars: i + 1,
      count,
      percentage: totalReviews ? (count / totalReviews) * 100 : 0,
    };
  }).reverse();

  return (
    <div className="space-y-8">
      {/* Reviews Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-2xl font-bold text-[#050b2c] mb-6">
          Customer Reviews
        </h2>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Rating Summary */}
          <div className="space-y-4">
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold text-[#050b2c]">
                {averageRating.toFixed(1)}
              </span>
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FiStar
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.round(averageRating)
                        ? "fill-[#ffa509] text-[#ffa509]"
                        : "text-gray-300"
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-500">
                {totalReviews} {totalReviews === 1 ? "review" : "reviews"}
              </span>
            </div>

            {/* Rating Bars */}
            <div className="space-y-2">
              {ratingCounts.map(({ stars, count, percentage }) => (
                <div key={stars} className="flex items-center gap-2">
                  <div className="flex items-center gap-1 w-20">
                    <span className="text-sm text-gray-600">{stars}</span>
                    <FiStar className="w-4 h-4 text-gray-400" />
                  </div>
                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.5 }}
                      className="h-full bg-[#ffa509]"
                    />
                  </div>
                  <span className="text-sm text-gray-500 w-12">{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Write Review Button */}
          <div className="flex items-center justify-center">
            <Button
              onClick={() => setShowReviewForm(true)}
              className="bg-[#050b2c] hover:bg-opacity-90 text-white px-8 py-6 text-lg"
            >
              Write a Review
            </Button>
          </div>
        </div>
      </div>

      {/* Review Form */}
      <AnimatePresence>
        {showReviewForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            <ReviewForm
              productId={productId}
              onSuccess={() => setShowReviewForm(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reviews List */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <motion.div
            key={review._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FiStar
                        key={i}
                        className={`w-5 h-5 ${
                          i < review.rating
                            ? "fill-[#ffa509] text-[#ffa509]"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  {review.isVerifiedPurchase && (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Verified Purchase
                    </span>
                  )}
                </div>
                <h3 className="font-semibold text-[#050b2c] mb-1">
                  {review.title}
                </h3>
                <p className="text-sm text-gray-600 mb-4">{review.comment}</p>
                {review.images && review.images.length > 0 && (
                  <div className="flex gap-2 mb-4">
                    {review.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImage(image)}
                        className="relative group"
                      >
                        <img
                          src={image}
                          alt={`Review ${index + 1}`}
                          className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-lg transition-all">
                          <FiImage className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-white opacity-0 group-hover:opacity-100" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>By {review.user.name}</span>
                  <span>•</span>
                  <span>
                    {new Date(review.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-500 hover:text-[#050b2c]"
              >
                <FiThumbsUp className="w-4 h-4 mr-1" />
                <span className="text-sm">Helpful ({review.helpfulVotes})</span>
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <img
              src={selectedImage}
              alt="Review"
              className="max-w-full max-h-[90vh] object-contain"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-200"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
