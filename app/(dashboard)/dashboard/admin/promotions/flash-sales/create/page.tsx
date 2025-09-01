import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import CreateFlashSaleForm from "./components/CreateFlashSaleForm";

export const metadata: Metadata = {
  title: "Create Flash Sale | Admin Dashboard",
  description: "Create a new flash sale promotion",
};

export default async function CreateFlashSalePage() {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/");
  }

  return <CreateFlashSaleForm />;
}
