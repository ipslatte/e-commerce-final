import { Metadata } from "next";
import PendingOrdersClient from "./components/PendingOrdersClient";

export const metadata: Metadata = {
  title: "Pending Orders | Admin Dashboard",
  description: "Manage and process pending orders",
};

export default function PendingOrdersPage() {
  return <PendingOrdersClient />;
}
