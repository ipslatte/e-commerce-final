import { notFound } from "next/navigation";
import Image from "next/image";
import AddToCartButton from "@/components/AddToCartButton";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Order } from "@/models/Order";
import { Review } from "@/models/Review";
import { Star } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import CountdownTimer from "@/components/CountdownTimer";
import { getProductPrice } from "@/lib/utils/price";
import type { Product } from "@/types";
import ReviewForm from "@/components/ReviewForm";
import ProductImageGallery from "@/components/ProductImageGallery";
import AddToWishlistButton from "@/components/AddToWishlistButton";

async function getProduct(id: string): Promise<Product> {
  try {
    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      }/api/products/${id}`,
      {
        next: { revalidate: 60 },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!res.ok) {
      if (res.status === 404) {
        notFound();
      }
      throw new Error(`Failed to fetch product: ${res.statusText}`);
    }

    const data = await res.json();

    // Transform the data to match the Product type from @/types
    const transformedProduct: Product = {
      _id: data._id,
      name: data.name,
      description: data.description,
      price: data.price,
      images: data.images || [],
      coverImage: data.coverImage,
      stock: data.stock || 0, // Ensure stock is always set
      category: {
        _id: data.category._id,
        name: data.category.name,
      },
      // Optional fields - only include if they exist
      ...(data.rating !== undefined && { rating: data.rating }),
      ...(data.numReviews !== undefined && { numReviews: data.numReviews }),
      ...(data.variants !== undefined && { variants: data.variants }),
      ...(data.attributes !== undefined && { attributes: data.attributes }),
    };

    return transformedProduct;
  } catch (error) {
    console.error("Error fetching product:", error);
    throw error;
  }
}

async function getProductReviews(productId: string) {
  try {
    const reviews = await Review.find({ productId, status: "approved" })
      .populate("userId", "name")
      .sort({ createdAt: -1 })
      .lean();
    return reviews;
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return [];
  }
}

async function hasUserPurchasedProduct(userId: string, productId: string) {
  try {
    const order = await Order.findOne({
      userId,
      "items.productId": productId,
      status: "completed",
    });
    return order ? order._id.toString() : null;
  } catch (error) {
    console.error("Error checking purchase status:", error);
    return null;
  }
}

// Add this helper function at the top level
function isColorAttribute(name: string): boolean {
  return (
    name.toLowerCase() === "color" ||
    name.toLowerCase() === "colours" ||
    name.toLowerCase() === "colors"
  );
}

// Add this helper function to get the background color style
function getColorStyle(
  color: string
):
  | { backgroundColor: string }
  | { backgroundColor: string; backgroundImage: string } {
  // Handle special cases
  const specialColors: { [key: string]: string } = {
    gold: "linear-gradient(45deg, #bf953f, #fcf6ba, #b38728, #fbf5b7)",
    silver: "linear-gradient(45deg, #cecece, #ffffff, #cecece)",
    bronze: "linear-gradient(45deg, #cd7f32, #e4bc84, #cd7f32)",
  };

  const lowerColor = color.toLowerCase();
  if (specialColors[lowerColor]) {
    return {
      backgroundColor: "#ffffff",
      backgroundImage: specialColors[lowerColor],
    };
  }

  return { backgroundColor: lowerColor };
}

// Update the helper function to calculate discounted price
function calculateDiscountedPrice(
  price: number,
  discountType?: string,
  discountValue?: number
): number {
  if (!discountType || discountValue === undefined) return price;

  const numericDiscountValue = Number(discountValue);
  if (isNaN(numericDiscountValue)) return price;

  if (discountType === "percentage") {
    return price - (price * numericDiscountValue) / 100;
  }
  return Math.max(0, price - numericDiscountValue);
}

// Add this function to fetch flash sale information
async function getFlashSaleInfo(productId: string) {
  try {
    const res = await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      }/api/products/${productId}/flash-sale`,
      {
        cache: "no-store", // Disable caching to always get fresh flash sale data
      }
    );

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    console.log("Flash sale data for product:", productId, data); // Debug log

    if (data && data.discountValue) {
      return {
        ...data,
        discountValue: Number(data.discountValue), // Ensure discountValue is a number
      };
    }
    return null;
  } catch (error) {
    console.error("Error fetching flash sale info:", error);
    return null;
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  try {
    // Track product view on server side to ensure first view is always counted
    await fetch(
      `${
        process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"
      }/api/products/${params.id}/view`,
      {
        method: "POST",
        cache: "no-store",
        headers: {
          "x-initial-view": "true", // Special header to indicate server-side view
        },
      }
    );

    // Get product price data (includes flash sale info)
    const priceData = await getProductPrice(params.id);
    const session = await getServerSession(authOptions);

    // Fetch product, reviews, and order status in parallel
    const [product, reviews, orderId] = await Promise.all([
      getProduct(params.id),
      getProductReviews(params.id),
      session?.user
        ? hasUserPurchasedProduct(session.user.id, params.id)
        : null,
    ]);

    // Calculate average rating
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((acc: number, review: any) => acc + review.rating, 0) /
          reviews.length
        : 0;

    console.log("Price data:", priceData);

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Image Gallery */}
          <div>
            <ProductImageGallery images={product.images} />
            {priceData.hasFlashSale && priceData.flashSale && (
              <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center justify-between">
                  <span className="text-red-600 font-medium">Flash Sale!</span>
                  <CountdownTimer endDate={priceData.flashSale.endDate} />
                </div>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <div className="flex items-center mt-2">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-5 w-5 ${
                        star <= averageRating
                          ? "text-yellow-400 fill-current"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                </span>
              </div>
            </div>

            <p className="text-gray-600">{product.description}</p>

            <div className="border-t border-b py-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-semibold">
                    ${priceData.finalPrice.toFixed(2)}
                  </span>
                  {priceData.hasFlashSale && (
                    <>
                      <span className="text-lg text-gray-500 line-through">
                        ${priceData.originalPrice.toFixed(2)}
                      </span>
                      <Badge variant="destructive" className="ml-2">
                        Flash Sale!
                      </Badge>
                    </>
                  )}
                </div>
                <span className="text-sm text-gray-500">
                  Category: {product.category.name}
                </span>
              </div>
            </div>

            {/* Product Attributes */}
            {product.attributes &&
              Object.keys(product.attributes).length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Product Options</h3>
                  {Object.entries(product.attributes).map(([name, values]) => (
                    <div key={name} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 capitalize">
                        {name}
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {(Array.isArray(values) ? values : [values]).map(
                          (value: string) =>
                            isColorAttribute(name) ? (
                              <div key={value} className="group relative">
                                <button
                                  className={`w-10 h-10 rounded-full relative group transition-all duration-200 ring-2 ring-offset-2 hover:scale-110
                                    ${
                                      false
                                        ? "ring-[#ffa509]"
                                        : "ring-gray-300 hover:ring-[#ffa509]"
                                    }`}
                                  style={getColorStyle(value)}
                                >
                                  <span className="sr-only">{value}</span>
                                </button>
                                {/* Color name tooltip */}
                                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                  {value}
                                </span>
                              </div>
                            ) : (
                              <button
                                key={value}
                                className={`px-4 py-2 border rounded-md transition-all duration-200 ${
                                  false
                                    ? "border-[#ffa509] bg-[#ffa509] text-white"
                                    : "border-gray-200 hover:border-[#ffa509] hover:text-[#ffa509]"
                                }`}
                              >
                                {value}
                              </button>
                            )
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            {/* Add to Cart */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <AddToCartButton
                  product={product}
                  variants={product.variants}
                  flashSale={priceData.flashSale}
                />
              </div>
              <AddToWishlistButton product={product} />
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>

          {session?.user ? (
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4">Write a Review</h3>
              <ReviewForm
                productId={params.id}
                orderId={orderId || undefined}
              />
            </div>
          ) : (
            <p className="text-gray-600 mb-8">
              Please sign in to write a review.
            </p>
          )}

          <div className="space-y-8">
            {reviews.map((review: any) => (
              <div key={review._id} className="border-b pb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 ${
                            star <= review.rating
                              ? "text-yellow-400 fill-current"
                              : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                    <h4 className="font-medium mt-2">{review.title}</h4>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(new Date(review.createdAt))}
                  </div>
                </div>
                <p className="mt-2 text-gray-600">{review.comment}</p>
                {review.images && review.images.length > 0 && (
                  <div className="mt-4 flex gap-4">
                    {review.images.map((image: string, index: number) => (
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
                <div className="mt-4 flex items-center text-sm text-gray-500">
                  <span>By {review.userId.name}</span>
                  {review.isVerifiedPurchase && (
                    <span className="ml-4 text-green-600">
                      Verified Purchase
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error in ProductDetailPage:", error);
    notFound();
  }
}
