import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Review } from "@/models/Review";
import clientPromise from "@/lib/mongodb";
import ReviewsTable from "../components/ReviewsTable";

export const metadata: Metadata = {
  title: "Pending Reviews | Admin",
  description: "Manage pending customer reviews",
};

export default async function PendingReviewsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  const client = await clientPromise;
  await client.connect();

  const reviews = await Review.find({ status: "pending" })
    .populate("productId", "name coverImage")
    .populate("userId", "name email")
    .sort({ createdAt: -1 })
    .lean();

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Pending Reviews</h1>
        <p className="text-gray-600">
          Review and moderate customer reviews awaiting approval
        </p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <ReviewsTable reviews={reviews} />
      </div>
    </div>
  );
}
