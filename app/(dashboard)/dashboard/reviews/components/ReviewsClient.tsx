"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Star,
  Edit,
  Trash,
  MessageSquare,
  ThumbsUp,
} from "lucide-react";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Review {
  _id: string;
  productId: {
    _id: string;
    name: string;
    coverImage: string;
  };
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  helpfulVotes: number;
}

const statusColors = {
  pending: "from-yellow-400 to-yellow-500",
  approved: "from-green-400 to-green-500",
  rejected: "from-red-400 to-red-500",
};

export default function ReviewsClient() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingReview, setEditingReview] = useState<Review | null>(null);
  const [activeTab, setActiveTab] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/reviews");
      if (!response.ok) throw new Error("Failed to fetch reviews");
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      alert("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleEditReview = async (
    reviewId: string,
    updatedData: Partial<Review>
  ) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (!response.ok) throw new Error("Failed to update review");

      alert("Review updated successfully");
      fetchReviews();
      setEditingReview(null);
    } catch (error) {
      alert("Failed to update review");
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to delete review");

      alert("Review deleted successfully");
      fetchReviews();
    } catch (error) {
      alert("Failed to delete review");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-12 w-12 animate-spin text-[#ffa509]" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md w-full">
          <MessageSquare className="h-12 w-12 text-[#ffa509] mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-[#050b2c] mb-3">
            No reviews yet
          </h3>
          <p className="text-gray-600">
            Your product reviews will appear here after you make a purchase and
            review the products.
          </p>
        </div>
      </div>
    );
  }

  const filteredReviews =
    activeTab === "all"
      ? reviews
      : reviews.filter((review) => review.status === activeTab);

  return (
    <div className="py-8">
      {/* Tabs */}
      <div className="flex space-x-2 mb-8 overflow-x-auto pb-2">
        {["all", "pending", "approved", "rejected"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as typeof activeTab)}
            className={`px-6 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap
              ${
                activeTab === tab
                  ? "bg-[#050b2c] text-white shadow-lg"
                  : "bg-white text-[#050b2c] hover:bg-gray-50"
              }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Reviews Grid */}
      <div className="grid gap-6">
        {filteredReviews.map((review) => (
          <motion.div
            key={review._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100"
          >
            <div className="p-6">
              {/* Product Info */}
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  <div className="relative h-20 w-20 flex-shrink-0">
                    <Image
                      src={review.productId.coverImage}
                      alt={review.productId.name}
                      fill
                      className="object-cover rounded-xl"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-[#050b2c] text-lg">
                      {review.productId.name}
                    </h4>
                    <div className="flex items-center gap-1 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "text-[#ffa509] fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div
                  className={`px-4 py-1 rounded-full text-sm font-medium text-white bg-gradient-to-r ${
                    statusColors[review.status]
                  }`}
                >
                  {review.status.charAt(0).toUpperCase() +
                    review.status.slice(1)}
                </div>
              </div>

              {/* Review Content */}
              <div className="mt-6">
                <h5 className="font-medium text-[#050b2c]">{review.title}</h5>
                <p className="mt-2 text-gray-600">{review.comment}</p>
              </div>

              {/* Review Images */}
              {review.images && review.images.length > 0 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                  {review.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative h-24 w-24 flex-shrink-0"
                    >
                      <Image
                        src={image}
                        alt={`Review image ${index + 1}`}
                        fill
                        className="object-cover rounded-xl"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Review Footer */}
              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{formatDate(new Date(review.createdAt))}</span>
                  <div className="flex items-center gap-1">
                    <ThumbsUp className="h-4 w-4" />
                    <span>{review.helpfulVotes} helpful</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingReview(review)}
                    className="text-[#050b2c] hover:text-[#ffa509] transition-colors"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteReview(review._id)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog
        open={!!editingReview}
        onOpenChange={() => setEditingReview(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Review</DialogTitle>
          </DialogHeader>
          {editingReview && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                handleEditReview(editingReview._id, {
                  rating: Number(formData.get("rating")),
                  title: formData.get("title") as string,
                  comment: formData.get("comment") as string,
                });
              }}
              className="space-y-6 mt-4"
            >
              <div>
                <label className="block text-sm font-medium text-[#050b2c] mb-2">
                  Rating
                </label>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => {
                        const input = document.querySelector(
                          'input[name="rating"]'
                        ) as HTMLInputElement;
                        if (input) input.value = value.toString();
                      }}
                      className="focus:outline-none"
                    >
                      <Star
                        className={`h-6 w-6 ${
                          value <= (editingReview?.rating || 0)
                            ? "text-[#ffa509] fill-current"
                            : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <input
                  type="hidden"
                  name="rating"
                  defaultValue={editingReview.rating}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#050b2c] mb-2">
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingReview.title}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ffa509] focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#050b2c] mb-2">
                  Review
                </label>
                <textarea
                  name="comment"
                  rows={4}
                  defaultValue={editingReview.comment}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ffa509] focus:border-transparent"
                  required
                />
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditingReview(null)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#050b2c] text-white hover:bg-[#050b2c]/90"
                >
                  Save Changes
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
