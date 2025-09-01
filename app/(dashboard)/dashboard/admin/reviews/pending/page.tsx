import { Metadata } from "next";
import PendingReviewsClient from "./components/PendingReviewsClient";

export const metadata: Metadata = {
  title: "Pending Reviews | Admin Dashboard",
  description: "Review and moderate customer reviews awaiting approval",
};

export default function PendingReviewsPage() {
  return <PendingReviewsClient />;
}
