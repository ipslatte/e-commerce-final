import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings | Dashboard",
  description: "Manage your account settings and preferences",
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen">{children}</div>;
}
