import { Metadata } from "next";
import UsersClient from "./components/UsersClient";

export const metadata: Metadata = {
  title: "Users | Admin Dashboard",
  description: "Manage your store users and customers",
};

export default function UsersPage() {
  return <UsersClient />;
}
