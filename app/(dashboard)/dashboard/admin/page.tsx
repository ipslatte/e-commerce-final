import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminDashboardClient from "./components/AdminDashboardClient";
import clientPromise from "@/lib/mongodb";
import { subDays } from "date-fns";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Overview of your store's performance",
};

async function getDashboardData() {
  const client = await clientPromise;
  const db = client.db();

  // Get total products count
  const totalProducts = await db.collection("products").countDocuments();

  // Get total categories count
  const totalCategories = await db.collection("categories").countDocuments();

  // Get orders statistics
  const now = new Date();
  const thirtyDaysAgo = subDays(now, 30);

  const recentOrders = await db
    .collection("orders")
    .find()
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();

  // Serialize recent orders
  const serializedRecentOrders = recentOrders.map((order) => ({
    id: order._id.toString(),
    createdAt: order.createdAt.toISOString(),
    total: order.total,
    status: order.status,
  }));

  const orderStats = await db
    .collection("orders")
    .aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          pending: [{ $match: { status: "pending" } }, { $count: "count" }],
          completed: [{ $match: { status: "completed" } }, { $count: "count" }],
          totalRevenue: [{ $group: { _id: null, total: { $sum: "$total" } } }],
          last30Days: [
            {
              $match: {
                createdAt: { $gte: thirtyDaysAgo },
              },
            },
            {
              $group: {
                _id: null,
                revenue: { $sum: "$total" },
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ])
    .toArray();

  // Get users statistics
  const userStats = await db
    .collection("users")
    .aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          customers: [{ $match: { role: "customer" } }, { $count: "count" }],
          last30Days: [
            {
              $match: {
                createdAt: { $gte: thirtyDaysAgo },
              },
            },
            { $count: "count" },
          ],
        },
      },
    ])
    .toArray();

  return {
    products: {
      total: totalProducts,
      categories: totalCategories,
    },
    orders: {
      total: orderStats[0].total[0]?.count || 0,
      pending: orderStats[0].pending[0]?.count || 0,
      completed: orderStats[0].completed[0]?.count || 0,
      totalRevenue: orderStats[0].totalRevenue[0]?.total || 0,
      last30Days: {
        revenue: orderStats[0].last30Days[0]?.revenue || 0,
        count: orderStats[0].last30Days[0]?.count || 0,
      },
      recent: serializedRecentOrders,
    },
    users: {
      total: userStats[0].total[0]?.count || 0,
      customers: userStats[0].customers[0]?.count || 0,
      newLast30Days: userStats[0].last30Days[0]?.count || 0,
    },
  };
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  const data = await getDashboardData();

  return <AdminDashboardClient data={data} />;
}
