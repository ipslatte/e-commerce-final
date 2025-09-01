import { Metadata } from "next";
import AddressesClient from "./components/AddressesClient";

export const metadata: Metadata = {
  title: "Addresses | Dashboard",
  description: "Manage your shipping addresses",
};

export default function AddressesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050b2c]/5 via-white to-[#ffa509]/5">
      <div className="bg-gradient-to-r from-[#050b2c] to-[#050b2c]/90 text-white">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <h1 className="text-3xl font-bold mb-2">My Addresses</h1>
          <p className="text-white/80">Manage your shipping addresses</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-6">
        <AddressesClient />
      </div>
    </div>
  );
}
