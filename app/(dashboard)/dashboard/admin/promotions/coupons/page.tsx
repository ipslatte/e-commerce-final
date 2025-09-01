import { Metadata } from "next";
import CouponsClient from "./components/CouponsClient";

export const metadata: Metadata = {
  title: "Coupons | Admin Dashboard",
  description: "Manage store coupons and promotional codes",
};

export default function CouponsPage() {
  return <CouponsClient />;
}
