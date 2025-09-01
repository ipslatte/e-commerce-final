"use client";

import { useEffect, useState } from "react";
import { Loader2, Star } from "lucide-react";
import Image from "next/image";
import { formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  title: string;
  comment: string;
  images?: string[];
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  helpfulVotes: number;
  isVerifiedPurchase: boolean;
}

export default function ReviewsClient() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const response = await fetch("/api/admin/reviews");
      if (!response.ok) throw new Error("Failed to fetch reviews");
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      alert("Failed to load reviews");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (
    reviewId: string,
    status: Review["status"]
  ) => {
    try {
      const response = await fetch(`/api/admin/reviews/${reviewId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) throw new Error("Failed to update review status");

      alert("Review status updated successfully");
      fetchReviews();
    } catch (error) {
      alert("Failed to update review status");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900">No reviews yet</h3>
        <p className="mt-2 text-sm text-gray-500">
          Customer reviews will appear here once they start reviewing products.
        </p>
      </div>
    );
  }

  return (
    <Tabs defaultValue="all" className="w-full">
      <TabsList>
        <TabsTrigger value="all">All Reviews</TabsTrigger>
        <TabsTrigger value="pending">Pending</TabsTrigger>
        <TabsTrigger value="approved">Approved</TabsTrigger>
        <TabsTrigger value="rejected">Rejected</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="mt-6">
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review._id}
              className="bg-white shadow rounded-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative h-16 w-16">
                      <Image
                        src={review.productId.coverImage}
                        alt={review.productId.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">
                        {review.productId.name}
                      </h4>
                      <p className="text-sm text-gray-500">
                        by {review.userId.name} ({review.userId.email})
                      </p>
                      <div className="flex items-center mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < review.rating
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {review.status === "pending" && (
                      <>
                        <Button
                          variant="default"
                          onClick={() =>
                            handleUpdateStatus(review._id, "approved")
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() =>
                            handleUpdateStatus(review._id, "rejected")
                          }
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {review.status === "approved" && (
                      <Button
                        variant="destructive"
                        onClick={() =>
                          handleUpdateStatus(review._id, "rejected")
                        }
                      >
                        Reject
                      </Button>
                    )}
                    {review.status === "rejected" && (
                      <Button
                        variant="default"
                        onClick={() =>
                          handleUpdateStatus(review._id, "approved")
                        }
                      >
                        Approve
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <h5 className="font-medium">{review.title}</h5>
                  <p className="mt-1 text-gray-600">{review.comment}</p>
                </div>

                {review.images && review.images.length > 0 && (
                  <div className="mt-4 flex space-x-2">
                    {review.images.map((image, index) => (
                      <div key={index} className="relative h-20 w-20">
                        <Image
                          src={image}
                          alt={`Review image ${index + 1}`}
                          fill
                          className="object-cover rounded-md"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>
                      Posted on {formatDate(new Date(review.createdAt))}
                    </span>
                    <span>{review.helpfulVotes} people found this helpful</span>
                    {review.isVerifiedPurchase && (
                      <span className="text-green-600">Verified Purchase</span>
                    )}
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                </div>
              </div>
            </div>
          ))}
        </div>
      </TabsContent>

      {["pending", "approved", "rejected"].map((status) => (
        <TabsContent key={status} value={status}>
          <div className="space-y-6">
            {reviews
              .filter((review) => review.status === status)
              .map((review) => (
                <div
                  key={review._id}
                  className="bg-white shadow rounded-lg overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative h-16 w-16">
                          <Image
                            src={review.productId.coverImage}
                            alt={review.productId.name}
                            fill
                            className="object-cover rounded-md"
                          />
                        </div>
                        <div>
                          <h4 className="text-lg font-medium text-gray-900">
                            {review.productId.name}
                          </h4>
                          <p className="text-sm text-gray-500">
                            by {review.userId.name} ({review.userId.email})
                          </p>
                          <div className="flex items-center mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-5 w-5 ${
                                  i < review.rating
                                    ? "text-yellow-400 fill-current"
                                    : "text-gray-300"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {review.status === "pending" && (
                          <>
                            <Button
                              variant="default"
                              onClick={() =>
                                handleUpdateStatus(review._id, "approved")
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() =>
                                handleUpdateStatus(review._id, "rejected")
                              }
                            >
                              Reject
                            </Button>
                          </>
                        )}
                        {review.status === "approved" && (
                          <Button
                            variant="destructive"
                            onClick={() =>
                              handleUpdateStatus(review._id, "rejected")
                            }
                          >
                            Reject
                          </Button>
                        )}
                        {review.status === "rejected" && (
                          <Button
                            variant="default"
                            onClick={() =>
                              handleUpdateStatus(review._id, "approved")
                            }
                          >
                            Approve
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="mt-4">
                      <h5 className="font-medium">{review.title}</h5>
                      <p className="mt-1 text-gray-600">{review.comment}</p>
                    </div>

                    {review.images && review.images.length > 0 && (
                      <div className="mt-4 flex space-x-2">
                        {review.images.map((image, index) => (
                          <div key={index} className="relative h-20 w-20">
                            <Image
                              src={image}
                              alt={`Review image ${index + 1}`}
                              fill
                              className="object-cover rounded-md"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span>
                          Posted on {formatDate(new Date(review.createdAt))}
                        </span>
                        <span>
                          {review.helpfulVotes} people found this helpful
                        </span>
                        {review.isVerifiedPurchase && (
                          <span className="text-green-600">
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
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
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
}
