import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import OrdersClient from "./components/OrdersClient";

export const metadata: Metadata = {
  title: "Orders | Admin Dashboard",
  description: "Manage and track all customer orders",
};

export default async function OrdersPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  return <OrdersClient />;
}
