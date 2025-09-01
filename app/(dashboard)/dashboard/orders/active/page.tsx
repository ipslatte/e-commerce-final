import { Metadata } from "next";
import ActiveOrdersClient from "./components/ActiveOrdersClient";

export const metadata: Metadata = {
  title: "Active Orders | Dashboard",
  description: "Track your active orders and their current status",
};

export default function ActiveOrdersPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050b2c]/5 via-white to-[#ffa509]/5">
      <div className="bg-gradient-to-r from-[#050b2c] to-[#050b2c]/90 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-2">Active Orders</h1>
          <p className="text-white/80">Track your orders in progress</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6">
        <ActiveOrdersClient />
      </div>
    </div>
  );
}
