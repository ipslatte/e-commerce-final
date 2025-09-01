import { Metadata } from "next";
import WishlistClient from "./components/WishlistClient";

export const metadata: Metadata = {
  title: "Wishlist | Dashboard",
  description: "View and manage your wishlist",
};

export default function WishlistPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050b2c]/5 via-white to-[#ffa509]/5">
      <div className="bg-gradient-to-r from-[#050b2c] to-[#050b2c]/90 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-2">My Wishlist</h1>
          <p className="text-white/80">Save and track your favorite products</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6">
        <WishlistClient />
      </div>
    </div>
  );
}
