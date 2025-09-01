import { Metadata } from "next";
import ApprovedReviewsClient from "./components/ApprovedReviewsClient";

export const metadata: Metadata = {
  title: "Approved Reviews | Admin Dashboard",
  description: "View and manage approved customer reviews",
};

export default function ApprovedReviewsPage() {
  return <ApprovedReviewsClient />;
}
