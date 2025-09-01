"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Shield,
  Lock,
  KeyRound,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface PasswordChange {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SecuritySettings() {
  const [loading, setLoading] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordChange>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission started");

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwordData.newPassword.length < 8) {
      toast.error("New password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    console.log("Sending request to update password...");

    try {
      const requestBody = {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      };
      console.log("Request payload:", requestBody);

      const response = await fetch("/api/admin/settings/security", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);
      const responseText = await response.text();
      console.log("Response text:", responseText);

      if (!response.ok) {
        throw new Error(responseText || "Failed to update password");
      }

      toast.success("Password updated successfully");
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      console.error("Error details:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update password"
      );
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
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Security Settings
              </h1>
              <p className="text-white/80">
                Update your password and security preferences
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
            {/* Password Requirements Notice */}
            <div className="bg-[#050b2c]/5 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-[#050b2c] mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-[#050b2c]">
                  Password Requirements
                </h3>
                <p className="text-sm text-[#050b2c]/70 mt-1">
                  Password must be at least 8 characters long and should include
                  a mix of letters, numbers, and special characters.
                </p>
              </div>
            </div>

            {/* Current Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#050b2c]">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={passwordData.currentPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      currentPassword: e.target.value,
                    })
                  }
                  required
                  className="block w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-[#050b2c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ffa509] focus:border-[#ffa509] transition-colors"
                  placeholder="Enter current password"
                />
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#050b2c]">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={passwordData.newPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      newPassword: e.target.value,
                    })
                  }
                  required
                  className="block w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-[#050b2c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ffa509] focus:border-[#ffa509] transition-colors"
                  placeholder="Enter new password"
                />
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-[#050b2c]">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData({
                      ...passwordData,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  className="block w-full pl-12 pr-4 py-3 bg-white border border-gray-300 rounded-xl text-[#050b2c] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ffa509] focus:border-[#ffa509] transition-colors"
                  placeholder="Confirm new password"
                />
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
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Update Password</span>
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
