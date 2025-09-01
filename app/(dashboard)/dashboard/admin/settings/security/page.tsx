import { Metadata } from "next";
import SecuritySettings from "../components/SecuritySettings";

export const metadata: Metadata = {
  title: "Security Settings | Admin Dashboard",
  description: "Manage your security settings",
};

export default function SecuritySettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Security Settings</h2>
      </div>
      <SecuritySettings />
    </div>
  );
}
