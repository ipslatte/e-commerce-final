"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Star,
  Search,
  Filter,
  Clock,
  User,
  ChevronDown,
  Calendar,
  ThumbsUp,
  ThumbsDown,
  BarChart2,
  Award,
  TrendingUp,
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

export default function ApprovedReviewsClient() {
  const router = useRouter();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [expandedReviews, setExpandedReviews] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"date" | "rating" | "helpful">("date");

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/admin/reviews?status=approved");
      if (!response.ok) throw new Error("Failed to fetch reviews");
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      toast.error("Failed to load reviews");
    } finally {
      setLoading(false);
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
      } else if (sortBy === "rating") {
        return b.rating - a.rating;
      } else {
        // Sort by helpful (placeholder - you can implement actual helpful count)
        return 0;
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
            <div className="p-2 bg-[#050b2c]/10 rounded-lg">
              <CheckCircle className="h-6 w-6 text-[#050b2c]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#050b2c]">
                Approved Reviews
              </h1>
              <p className="text-[#050b2c]/60">
                View and manage approved customer feedback
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
                <BarChart2 className="h-6 w-6 text-[#050b2c]" />
              </div>
              <div>
                <p className="text-sm text-[#050b2c]/60">Total Approved</p>
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
                <Award className="h-6 w-6 text-[#ffa509]" />
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
              <div className="p-3 bg-[#ffa509]/10 rounded-lg">
                <TrendingUp className="h-6 w-6 text-[#ffa509]" />
              </div>
              <div>
                <p className="text-sm text-[#050b2c]/60">Most Recent</p>
                <p className="text-2xl font-bold text-[#050b2c]">
                  {filteredReviews.length > 0
                    ? formatDate(new Date(filteredReviews[0].createdAt))
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
                onChange={(e) =>
                  setSortBy(e.target.value as "date" | "rating" | "helpful")
                }
                className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#050b2c]/20 focus:border-[#050b2c]"
              >
                <option value="date">Sort by Date</option>
                <option value="rating">Sort by Rating</option>
                <option value="helpful">Sort by Helpful</option>
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
                <CheckCircle className="h-12 w-12 mx-auto text-[#050b2c]/20 mb-4" />
                <h3 className="text-lg font-medium text-[#050b2c] mb-2">
                  No Approved Reviews
                </h3>
                <p className="text-[#050b2c]/60">
                  There are no approved reviews at the moment
                </p>
              </motion.div>
            ) : (
              filteredReviews.map((review) => (
                <motion.div
                  key={review._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                  {/* Review Header */}
                  <div className="p-6 bg-gradient-to-r from-[#050b2c]/5 to-transparent">
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
                                Approved on{" "}
                                {formatDate(new Date(review.updatedAt))}
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
