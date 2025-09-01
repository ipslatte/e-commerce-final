"use client";

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { Star } from "lucide-react";
import { toast } from "sonner";

interface Review {
  _id: string;
  productId: {
    _id: string;
    name: string;
    coverImage: string;
  };
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  rating: number;
  title: string;
  comment: string;
  images?: string[];
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface ReviewsTableProps {
  reviews: Review[];
}

export default function ReviewsTable({
  reviews: initialReviews,
}: ReviewsTableProps) {
  const [reviews, setReviews] = useState(initialReviews);

  const handleStatusChange = async (reviewId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Failed to update review status");
      }

      setReviews((prevReviews) =>
        prevReviews.map((review) =>
          review._id === reviewId
            ? {
                ...review,
                status: newStatus as "pending" | "approved" | "rejected",
              }
            : review
        )
      );

      toast.success("Review status updated successfully");
    } catch (error) {
      console.error("Error updating review status:", error);
      toast.error("Failed to update review status");
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="bg-gray-100">
            <th className="px-4 py-3 text-left">Product</th>
            <th className="px-4 py-3 text-left">Customer</th>
            <th className="px-4 py-3 text-left">Rating</th>
            <th className="px-4 py-3 text-left">Review</th>
            <th className="px-4 py-3 text-left">Images</th>
            <th className="px-4 py-3 text-left">Date</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {reviews.map((review) => (
            <tr key={review._id} className="border-b hover:bg-gray-50">
              <td className="px-4 py-3">
                <div className="flex items-center space-x-3">
                  <div className="h-12 w-12 relative">
                    <Image
                      src={review.productId.coverImage}
                      alt={review.productId.name}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                  <span className="font-medium">{review.productId.name}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div>
                  <div className="font-medium">{review.userId.name}</div>
                  <div className="text-sm text-gray-500">
                    {review.userId.email}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="ml-1">{review.rating}</span>
                </div>
              </td>
              <td className="px-4 py-3">
                <div>
                  <div className="font-medium">{review.title}</div>
                  <div className="text-sm text-gray-500 line-clamp-2">
                    {review.comment}
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex -space-x-2">
                  {review.images?.slice(0, 3).map((image, index) => (
                    <div
                      key={index}
                      className="h-8 w-8 relative rounded-full border-2 border-white"
                    >
                      <Image
                        src={image}
                        alt={`Review image ${index + 1}`}
                        fill
                        className="object-cover rounded-full"
                      />
                    </div>
                  ))}
                  {(review.images?.length || 0) > 3 && (
                    <div className="h-8 w-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-sm">
                      +{review.images!.length - 3}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-gray-500">
                {format(new Date(review.createdAt), "MMM d, yyyy")}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    review.status === "approved"
                      ? "bg-green-100 text-green-800"
                      : review.status === "rejected"
                      ? "bg-red-100 text-red-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {review.status.charAt(0).toUpperCase() +
                    review.status.slice(1)}
                </span>
              </td>
              <td className="px-4 py-3">
                <select
                  value={review.status}
                  onChange={(e) =>
                    handleStatusChange(review._id, e.target.value)
                  }
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approve</option>
                  <option value="rejected">Reject</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
