import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add User | Admin Dashboard",
  description: "Add a new customer to your store",
};

export default function AddUserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
