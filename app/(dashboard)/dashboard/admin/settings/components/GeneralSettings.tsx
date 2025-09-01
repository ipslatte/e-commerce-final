"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Store,
  Mail,
  Phone,
  MapPin,
  DollarSign,
  Globe,
  ArrowLeft,
  Loader2,
} from "lucide-react";

interface StoreSettings {
  name: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  currency: string;
  timezone: string;
}

export default function GeneralSettings() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState<StoreSettings>({
    name: "",
    description: "",
    email: "",
    phone: "",
    address: "",
    currency: "USD",
    timezone: "UTC",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/admin/settings/general");
        if (!response.ok) {
          throw new Error("Failed to fetch settings");
        }
        const data = await response.json();
        if (data) {
          setSettings({
            name: data.name || "",
            description: data.description || "",
            email: data.email || "",
            phone: data.phone || "",
            address: data.address || "",
            currency: data.currency || "USD",
            timezone: data.timezone || "UTC",
          });
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load settings");
      }
    };

    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("/api/admin/settings/general", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Failed to update settings");
      }

      toast.success("Settings updated successfully");
    } catch (error) {
      toast.error("Failed to update settings");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

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
              <Store className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                General Settings
              </h1>
              <p className="text-white/80">
                Manage your store information and preferences
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
        >
          <div className="p-8 space-y-6">
            {/* Store Name */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#050b2c]">
                Store Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Store className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={settings.name}
                  onChange={(e) =>
                    setSettings({ ...settings, name: e.target.value })
                  }
                  required
                  className="block w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-[#050b2c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ffa509] focus:border-[#ffa509] transition-colors"
                  placeholder="Enter store name"
                />
              </div>
            </div>

            {/* Store Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#050b2c]">
                Store Description
              </label>
              <textarea
                value={settings.description}
                onChange={(e) =>
                  setSettings({ ...settings, description: e.target.value })
                }
                required
                rows={4}
                className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-[#050b2c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ffa509] focus:border-[#ffa509] transition-colors resize-none"
                placeholder="Enter store description"
              />
            </div>

            {/* Contact Information */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Email */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#050b2c]">
                  Contact Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="email"
                    value={settings.email}
                    onChange={(e) =>
                      setSettings({ ...settings, email: e.target.value })
                    }
                    required
                    className="block w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-[#050b2c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ffa509] focus:border-[#ffa509] transition-colors"
                    placeholder="Enter contact email"
                  />
                </div>
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#050b2c]">
                  Contact Phone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="tel"
                    value={settings.phone}
                    onChange={(e) =>
                      setSettings({ ...settings, phone: e.target.value })
                    }
                    required
                    className="block w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-[#050b2c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ffa509] focus:border-[#ffa509] transition-colors"
                    placeholder="Enter contact phone"
                  />
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#050b2c]">
                Business Address
              </label>
              <div className="relative">
                <div className="absolute top-3 left-4 pointer-events-none">
                  <MapPin className="h-5 w-5 text-gray-400" />
                </div>
                <textarea
                  value={settings.address}
                  onChange={(e) =>
                    setSettings({ ...settings, address: e.target.value })
                  }
                  required
                  rows={3}
                  className="block w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-[#050b2c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ffa509] focus:border-[#ffa509] transition-colors resize-none"
                  placeholder="Enter business address"
                />
              </div>
            </div>

            {/* Preferences */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Currency */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#050b2c]">
                  Currency
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <DollarSign className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={settings.currency}
                    onChange={(e) =>
                      setSettings({ ...settings, currency: e.target.value })
                    }
                    required
                    className="block w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-[#050b2c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ffa509] focus:border-[#ffa509] transition-colors"
                    placeholder="Enter currency code"
                  />
                </div>
              </div>

              {/* Timezone */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-[#050b2c]">
                  Timezone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Globe className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={settings.timezone}
                    onChange={(e) =>
                      setSettings({ ...settings, timezone: e.target.value })
                    }
                    required
                    className="block w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-[#050b2c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ffa509] focus:border-[#ffa509] transition-colors"
                    placeholder="Enter timezone"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 px-8 py-6 bg-gray-50 border-t border-gray-200">
            <motion.button
              type="submit"
              disabled={loading}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#050b2c] text-white rounded-xl font-medium hover:bg-[#050b2c]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Saving Changes...</span>
                </>
              ) : (
                <span>Save Changes</span>
              )}
            </motion.button>
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Go Back</span>
            </button>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
}
