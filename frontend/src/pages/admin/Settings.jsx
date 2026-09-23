import { useState } from "react";
import { motion } from "framer-motion";
import { User, Bell, Sliders, Shield } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";

const section = { hidden: { opacity: 0, y: 0 }, show: { opacity: 1, y: 0 } };

export default function Settings() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-5.5 rounded-full transition-colors duration-200 focus:outline-none
        ${checked ? "bg-blue-600" : "bg-gray-200"}`}
      style={{ height: "22px", width: "40px" }}
    >
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-200
        ${checked ? "translate-x-[18px]" : "translate-x-0"}`}
      />
    </button>
  );

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-sm text-gray-400 mt-1">Manage your account and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          {/* Profile */}
          <motion.div variants={section} initial="hidden" animate="show" transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <User size={18} className="text-blue-600" />
              </div>
              <h2 className="font-semibold text-gray-800">Profile Settings</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Full Name</label>
                <input defaultValue={user?.name || "Admin"}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Email</label>
                <input type="email" defaultValue={user?.email || "admin@example.com"}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div variants={section} initial="hidden" animate="show" transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                <Bell size={18} className="text-purple-600" />
              </div>
              <h2 className="font-semibold text-gray-800">Notifications</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: "Push Notifications", sub: "Get in-app alerts for new complaints", val: notifications, fn: setNotifications },
                { label: "Email Alerts",       sub: "Receive email for SLA breaches",        val: emailAlerts,   fn: setEmailAlerts },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-700">{item.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.sub}</p>
                  </div>
                  <Toggle checked={item.val} onChange={item.fn} />
                </div>
              ))}
            </div>
          </motion.div>

          {/* System */}
          <motion.div variants={section} initial="hidden" animate="show" transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                <Sliders size={18} className="text-green-600" />
              </div>
              <h2 className="font-semibold text-gray-800">System Settings</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Default Response Time</label>
                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100">
                  <option>24 Hours (HIGH priority)</option>
                  <option>48 Hours (MEDIUM priority)</option>
                  <option>72 Hours (LOW priority)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Auto-close After Resolve</label>
                <select className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100">
                  <option>24 Hours</option>
                  <option>48 Hours</option>
                  <option>72 Hours</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Security */}
          <motion.div variants={section} initial="hidden" animate="show" transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                <Shield size={18} className="text-red-500" />
              </div>
              <h2 className="font-semibold text-gray-800">Security</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">Current Password</label>
                <input type="password" placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 block mb-1.5">New Password</label>
                <input type="password" placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Save */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mt-5 flex items-center gap-3">
          <motion.button
            onClick={handleSave}
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors"
          >
            Save Changes
          </motion.button>
          {saved && (
            <motion.span initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
              className="text-sm text-green-600 font-medium">
              Saved successfully
            </motion.span>
          )}
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
