"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Star,
  Search,
  Filter,
  Clock,
  User,
  ChevronDown,
  CheckCircle,
  XCircle,
  Calendar,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { toast } from "sonner";

interface Review {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  productId: {
    _id: string;
    name: string;
    coverImage: string;
  };
  rating: number;
  comment: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

export default function PendingReviewsClient() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [expandedReviews, setExpandedReviews] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"date" | "rating">("date");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/admin/reviews?status=pending");
      if (!response.ok) throw new Error("Failed to fetch reviews");
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (reviewId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update review status");

      toast.success("Review status updated successfully");
      fetchReviews();
    } catch (error) {
      toast.error("Failed to update review status");
    }
  };

  const toggleReviewExpansion = (reviewId: string) => {
    setExpandedReviews((prev) =>
      prev.includes(reviewId)
        ? prev.filter((id) => id !== reviewId)
        : [...prev, reviewId]
    );
  };

  const filteredReviews = reviews
    .filter((review) => {
      const matchesSearch =
        review.productId.name
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        review.userId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        review.comment.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRating =
        ratingFilter === "all" || review.rating === parseInt(ratingFilter);

      return matchesSearch && matchesRating;
    })
    .sort((a, b) => {
      if (sortBy === "date") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        return b.rating - a.rating;
      }
    });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#050b2c]/5 via-white to-[#ffa509]/5">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-[#050b2c] border-t-transparent rounded-full"
        />
        <p className="mt-4 text-[#050b2c] font-medium">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050b2c]/5 via-white to-[#ffa509]/5 p-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#ffa509]/10 rounded-lg">
              <MessageSquare className="h-6 w-6 text-[#ffa509]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#050b2c]">
                Pending Reviews
              </h1>
              <p className="text-[#050b2c]/60">
                Review and moderate customer feedback
              </p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#050b2c]/10 rounded-lg">
                <MessageSquare className="h-6 w-6 text-[#050b2c]" />
              </div>
              <div>
                <p className="text-sm text-[#050b2c]/60">Total Pending</p>
                <p className="text-2xl font-bold text-[#050b2c]">
                  {filteredReviews.length}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#ffa509]/10 rounded-lg">
                <Star className="h-6 w-6 text-[#ffa509]" />
              </div>
              <div>
                <p className="text-sm text-[#050b2c]/60">Average Rating</p>
                <p className="text-2xl font-bold text-[#050b2c]">
                  {(
                    filteredReviews.reduce(
                      (sum, review) => sum + review.rating,
                      0
                    ) / filteredReviews.length || 0
                  ).toFixed(1)}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-lg"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#c90b0b]/10 rounded-lg">
                <Clock className="h-6 w-6 text-[#c90b0b]" />
              </div>
              <div>
                <p className="text-sm text-[#050b2c]/60">Oldest Pending</p>
                <p className="text-2xl font-bold text-[#050b2c]">
                  {filteredReviews.length > 0
                    ? formatDate(
                        new Date(
                          filteredReviews[filteredReviews.length - 1].createdAt
                        )
                      )
                    : "N/A"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#050b2c]/40" />
                <input
                  type="text"
                  placeholder="Search reviews..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#050b2c]/20 focus:border-[#050b2c]"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={ratingFilter}
                onChange={(e) => setRatingFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#050b2c]/20 focus:border-[#050b2c]"
              >
                <option value="all">All Ratings</option>
                {[5, 4, 3, 2, 1].map((rating) => (
                  <option key={rating} value={rating.toString()}>
                    {rating} Stars
                  </option>
                ))}
              </select>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "date" | "rating")}
                className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#050b2c]/20 focus:border-[#050b2c]"
              >
                <option value="date">Sort by Date</option>
                <option value="rating">Sort by Rating</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reviews List */}
        <div className="space-y-6">
          <AnimatePresence>
            {filteredReviews.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="bg-white rounded-xl shadow-lg p-8 text-center"
              >
                <MessageSquare className="h-12 w-12 mx-auto text-[#050b2c]/20 mb-4" />
                <h3 className="text-lg font-medium text-[#050b2c] mb-2">
                  No Pending Reviews
                </h3>
                <p className="text-[#050b2c]/60">
                  All customer reviews have been moderated
                </p>
              </motion.div>
            ) : (
              filteredReviews.map((review) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#050b2c]/10"
                >
                  {/* Review Header */}
                  <div className="p-6 bg-gradient-to-r from-[#050b2c]/10 to-transparent">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="relative h-16 w-16 rounded-lg overflow-hidden">
                          <Image
                            src={review.productId.coverImage}
                            alt={review.productId.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-[#050b2c]">
                            {review.productId.name}
                          </h3>
                          <div className="flex items-center gap-2 text-[#050b2c]/60 mt-1">
                            <User className="h-4 w-4" />
                            <p className="text-sm">{review.userId.name}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star
                              key={index}
                              className={`h-4 w-4 ${
                                index < review.rating
                                  ? "text-[#ffa509] fill-[#ffa509]"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() =>
                              handleStatusChange(review._id, "approved")
                            }
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[#050b2c] hover:bg-[#050b2c]/10 transition-colors"
                          >
                            <CheckCircle className="h-4 w-4" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(review._id, "rejected")
                            }
                            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[#c90b0b] hover:bg-[#c90b0b]/10 transition-colors"
                          >
                            <XCircle className="h-4 w-4" />
                            <span>Reject</span>
                          </button>
                        </div>
                        <button
                          onClick={() => toggleReviewExpansion(review._id)}
                          className="p-2 hover:bg-[#050b2c]/10 rounded-lg transition-colors"
                        >
                          <ChevronDown
                            className={`h-5 w-5 transition-transform ${
                              expandedReviews.includes(review._id)
                                ? "rotate-180"
                                : ""
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Review Details */}
                  <AnimatePresence>
                    {expandedReviews.includes(review._id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-[#050b2c]/10"
                      >
                        <div className="p-6 space-y-4">
                          <div>
                            <h4 className="text-sm font-medium text-[#050b2c]/60 mb-2">
                              Review Comment
                            </h4>
                            <p className="text-[#050b2c] bg-[#050b2c]/5 p-4 rounded-lg">
                              {review.comment}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-sm text-[#050b2c]/60">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Posted on{" "}
                                {formatDate(new Date(review.createdAt))}
                              </span>
                            </div>
                            <div className="flex items-center gap-4">
                              <button className="flex items-center gap-1 hover:text-[#050b2c] transition-colors">
                                <ThumbsUp className="h-4 w-4" />
                                <span>Helpful</span>
                              </button>
                              <button className="flex items-center gap-1 hover:text-[#c90b0b] transition-colors">
                                <ThumbsDown className="h-4 w-4" />
                                <span>Not Helpful</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
