import { Metadata } from "next";
import GeneralSettings from "../components/GeneralSettings";

export const metadata: Metadata = {
  title: "General Settings | Admin Dashboard",
  description: "Manage your store settings",
};

export default function GeneralSettingsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">General Settings</h2>
      </div>
      <GeneralSettings />
    </div>
  );
}
