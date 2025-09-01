import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Get user ID
    const user = await db
      .collection("users")
      .findOne({ email: session.user.email });
    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Get active orders (pending or processing)
    const activeOrders = await db
      .collection("orders")
      .find({
        userId: new ObjectId(user._id),
        status: { $in: ["pending", "processing"] },
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Add estimated delivery dates for demo purposes
    const ordersWithEstimates = activeOrders.map((order) => ({
      ...order,
      estimatedDelivery: new Date(
        new Date(order.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000
      ).toISOString(),
    }));

    return NextResponse.json(ordersWithEstimates);
  } catch (error) {
    console.error("Error fetching active orders:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
