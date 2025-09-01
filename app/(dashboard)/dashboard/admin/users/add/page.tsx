"use client";

import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import AddUserForm from "../components/AddUserForm";

export default function AddUserPage() {
  return (
    <div className="min-h-screen bg-white p-6 md:p-8">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto space-y-6"
      >
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-[#050b2c] to-[#050b2c]/90 rounded-2xl p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#ffa509] rounded-xl">
              <UserPlus className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Add Customer</h1>
              <p className="text-white/80">Create a new customer account</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          <AddUserForm />
        </div>
      </motion.div>
    </div>
  );
}
