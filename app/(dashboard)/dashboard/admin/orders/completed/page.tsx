import { Metadata } from "next";
import CompletedOrdersClient from "./components/CompletedOrdersClient";

export const metadata: Metadata = {
  title: "Completed Orders | Admin Dashboard",
  description: "View and manage completed orders",
};

export default function CompletedOrdersPage() {
  return <CompletedOrdersClient />;
}
