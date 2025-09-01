import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import FlashSalesClient from "./components/FlashSalesClient";

export const metadata: Metadata = {
  title: "Flash Sales | Admin Dashboard",
  description: "Manage store flash sales and time-limited promotions",
};

export default async function FlashSalesPage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  return <FlashSalesClient />;
}
