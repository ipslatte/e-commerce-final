import { Metadata } from "next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/mongodb";
import { Wishlist } from "@/models/Wishlist";
import DashboardClient from "./components/DashboardClient";

export const metadata: Metadata = {
  title: "Dashboard | Account",
  description: "View your account dashboard",
};

// Interface for the MongoDB order document
interface OrderDocument {
  _id: ObjectId;
  userId: ObjectId;
  total: number;
  status: string;
  createdAt: Date;
}

// Interface for the serialized order that's passed to the client
interface SerializedOrder {
  _id: string;
  userId: string;
  total: number;
  status: string;
  createdAt: string;
}

async function getAccountSummary(email: string) {
  const client = await clientPromise;
  const db = client.db();

  // First get the user's ID
  const user = await db.collection("users").findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }

  const userId = new ObjectId(user._id);

  // Get recent orders
  const recentOrders = (await db
    .collection("orders")
    .find({ userId })
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray()) as OrderDocument[];

  // Get total orders count
  const totalOrders = await db.collection("orders").countDocuments({ userId });

  // Get wishlist count
  const wishlist = (await Wishlist.findOne({ userId: user._id }).lean()) as {
    products: any[];
  } | null;
  const wishlistCount = wishlist?.products?.length || 0;

  // Get total spent
  const totalSpent = await db
    .collection("orders")
    .aggregate([
      { $match: { userId } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ])
    .toArray();

  // Get address count
  const addressCount = await db
    .collection("addresses")
    .countDocuments({ userId });

  // Serialize the orders
  const serializedOrders: SerializedOrder[] = recentOrders.map((order) => ({
    _id: order._id.toString(),
    userId: order.userId.toString(),
    total: order.total,
    status: order.status,
    createdAt: order.createdAt.toISOString(),
  }));

  return {
    recentOrders: serializedOrders,
    totalOrders,
    wishlistCount,
    totalSpent: totalSpent[0]?.total || 0,
    addressCount,
  };
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/auth/login");
  }

  const { recentOrders, totalOrders, wishlistCount, totalSpent, addressCount } =
    await getAccountSummary(session.user.email || "");

  return (
    <DashboardClient
      user={{
        name: session.user.name || "User",
        email: session.user.email || "",
      }}
      data={{
        recentOrders,
        totalOrders,
        wishlistCount,
        totalSpent,
        addressCount,
      }}
    />
  );
}
