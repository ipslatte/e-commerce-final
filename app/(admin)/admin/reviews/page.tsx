import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Review } from "@/models/Review";
import clientPromise from "@/lib/mongodb";
import ReviewsTable from "./components/ReviewsTable";

export const metadata: Metadata = {
  title: "Reviews | Admin",
  description: "Manage customer reviews",
};

export default async function AdminReviewsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  const client = await clientPromise;
  await client.connect();

  const reviews = await Review.find({})
    .populate("productId", "name coverImage")
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Reviews Management</h1>
        <p className="text-gray-600">
          Manage customer reviews and their approval status
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <ReviewsTable reviews={reviews} />
      </div>
    </div>
  );
}
