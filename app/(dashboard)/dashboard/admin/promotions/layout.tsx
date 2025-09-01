import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Promotions | Admin Dashboard",
  description: "Manage all your store promotions, coupons, and flash sales",
};

export default function PromotionsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
