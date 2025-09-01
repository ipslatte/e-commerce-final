"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Settings, Store, Shield, ChevronRight } from "lucide-react";

const settingsCategories = [
  {
    title: "General Settings",
    description: "Manage store information and preferences",
    icon: Store,
    href: "/dashboard/admin/settings/general",
    color: "bg-blue-50",
    iconColor: "text-blue-500",
  },
  {
    title: "Security",
    description: "Update password and security settings",
    icon: Shield,
    href: "/dashboard/admin/settings/security",
    color: "bg-orange-50",
    iconColor: "text-[#ffa509]",
  },
];

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-white p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto space-y-8"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-[#050b2c] to-[#050b2c]/90 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#ffa509] rounded-xl">
              <Settings className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Settings</h1>
              <p className="text-white/80">
                Manage your store preferences and configurations
              </p>
            </div>
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          {settingsCategories.map((category, index) => {
            const Icon = category.icon;
            return (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link href={category.href}>
                  <div className="group relative overflow-hidden bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="p-6">
                      <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${category.color}`}>
                          <Icon className={`h-6 w-6 ${category.iconColor}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[#050b2c] group-hover:text-[#ffa509] transition-colors">
                            {category.title}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {category.description}
                          </p>
                        </div>
                        <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-[#ffa509] transition-colors" />
                      </div>
                    </div>
                    <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-[#ffa509] to-[#ff8c00] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
