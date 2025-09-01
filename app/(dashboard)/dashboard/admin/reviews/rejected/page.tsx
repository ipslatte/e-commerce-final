import { Metadata } from "next";
import RejectedReviewsClient from "./components/RejectedReviewsClient";

export const metadata: Metadata = {
  title: "Rejected Reviews | Admin Dashboard",
  description: "View and manage rejected customer reviews",
};

export default function RejectedReviewsPage() {
  return <RejectedReviewsClient />;
}
