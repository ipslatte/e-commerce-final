"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { FiStar, FiImage, FiX } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

interface ReviewFormProps {
  productId: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ productId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [review, setReview] = useState("");
  const [images, setImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 5) {
      toast({
        title: "Error",
        description: "You can only upload up to 5 images",
        variant: "destructive",
      });
      return;
    }

    const validFiles = files.filter((file) => {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: `${file.name} is too large. Maximum size is 5MB`,
          variant: "destructive",
        });
        return false;
      }
      return true;
    });

    setImages([...images, ...validFiles]);
    const newImageUrls = validFiles.map((file) => URL.createObjectURL(file));
    setImageUrls([...imageUrls, ...newImageUrls]);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newImageUrls = [...imageUrls];
    newImages.splice(index, 1);
    newImageUrls.splice(index, 1);
    setImages(newImages);
    setImageUrls(newImageUrls);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("productId", productId);
      formData.append("rating", rating.toString());
      formData.append("title", title);
      formData.append("review", review);
      images.forEach((image) => {
        formData.append("images", image);
      });

      const response = await fetch("/api/reviews", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to submit review");
      }

      toast({
        title: "Success",
        description: "Your review has been submitted successfully",
      });

      // Reset form
      setRating(0);
      setTitle("");
      setReview("");
      setImages([]);
      setImageUrls([]);

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-lg shadow-sm p-6"
    >
      <h3 className="text-xl font-semibold text-[#050b2c] mb-6">
        Write a Review
      </h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Rating Section */}
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[#050b2c]">
            Rating
          </label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="focus:outline-none transition-transform hover:scale-110"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <FiStar
                  className={`w-8 h-8 ${
                    star <= (hoverRating || rating)
                      ? "fill-[#ffa509] text-[#ffa509]"
                      : "text-gray-300"
                  } transition-colors`}
                />
              </button>
            ))}
            <span className="ml-2 text-sm text-gray-500">
              {rating ? `${rating} out of 5 stars` : "Select rating"}
            </span>
          </div>
        </div>

        {/* Title Section */}
        <div className="space-y-2">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-[#050b2c]"
          >
            Title
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Summarize your experience"
            className="border-gray-200 focus:border-[#ffa509] focus:ring-[#ffa509]"
            required
          />
        </div>

        {/* Review Section */}
        <div className="space-y-2">
          <label
            htmlFor="review"
            className="block text-sm font-medium text-[#050b2c]"
          >
            Review
          </label>
          <Textarea
            id="review"
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Share your experience with this product"
            className="min-h-[120px] border-gray-200 focus:border-[#ffa509] focus:ring-[#ffa509]"
            required
          />
        </div>

        {/* Images Section */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-[#050b2c]">
            Images (Optional)
          </label>
          <div className="flex flex-wrap gap-3">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Preview ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute -top-2 -right-2 bg-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <FiX className="w-4 h-4 text-[#c90b0b]" />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="w-20 h-20 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-lg cursor-pointer hover:border-[#ffa509] transition-colors">
                <FiImage className="w-6 h-6 text-gray-400" />
                <span className="text-xs text-gray-500 mt-1">Add Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  multiple
                />
              </label>
            )}
          </div>
          <p className="text-xs text-gray-500">
            You can upload up to 5 images (max 5MB each)
          </p>
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-[#050b2c] hover:bg-opacity-90 text-white py-3"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
              Submitting...
            </div>
          ) : (
            "Submit Review"
          )}
        </Button>
      </form>
    </motion.div>
  );
}
