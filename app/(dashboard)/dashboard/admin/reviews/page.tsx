import { Metadata } from "next";
import ReviewsClient from "./components/ReviewsClient";

export const metadata: Metadata = {
  title: "Reviews | Admin Dashboard",
  description: "Manage and moderate customer reviews",
};

export default function ReviewsPage() {
  return <ReviewsClient />;
}
