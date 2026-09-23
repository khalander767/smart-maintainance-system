import { useState } from "react";
import { motion } from "framer-motion";
import { User, Bell, Lock, Wrench } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";

const section = { hidden: { opacity: 0, y: 0 }, show: { opacity: 1, y: 0 } };

export default function TechnicianSettings() {
  const { user } = useAuth();
  const [taskAlerts, setTaskAlerts] = useState(true);
  const [slaAlerts, setSlaAlerts] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Toggle = ({ checked, onChange }) => (
    <button
      onClick={() => onChange(!checked)}
      style={{ height: "22px", width: "40px" }}
      className={`relative rounded-full transition-colors duration-200 focus:outline-none
        ${checked ? "bg-blue-600" : "bg-gray-200"}`}
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
          <p className="text-sm text-gray-400 mt-1">Manage your profile and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
          {/* LEFT COLUMN */}
          <div className="space-y-5">
          {/* Profile */}
          <motion.div variants={section} initial="hidden" animate="show" transition={{ delay: 0.05 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <User size={18} className="text-blue-600" />
              </div>
              <h2 className="font-semibold text-gray-800">Profile</h2>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-gray-100">
              <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-xl font-bold">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{user?.name}</p>
                <p className="text-sm text-gray-400">{user?.email}</p>
                <span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-lg mt-1 inline-block">
                  Technician
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Full Name</label>
                <input defaultValue={user?.name}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">Email</label>
                <input type="email" defaultValue={user?.email}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
              </div>
            </div>
          </motion.div>

          {/* Work Info */}
          <motion.div variants={section} initial="hidden" animate="show" transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                <Wrench size={18} className="text-orange-500" />
              </div>
              <h2 className="font-semibold text-gray-800">Work Info</h2>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Apartment ID</span>
                <span className="text-gray-700 font-medium font-mono text-xs">{user?.apartmentId}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Role</span>
                <span className="text-gray-700 font-medium">Technician</span>
              </div>
            </div>
          </motion.div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-5">
          {/* Notifications */}
          <motion.div variants={section} initial="hidden" animate="show" transition={{ delay: 0.15 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                <Bell size={18} className="text-purple-600" />
              </div>
              <h2 className="font-semibold text-gray-800">Notifications</h2>
            </div>
            <div className="space-y-4">
              {[
                { label: "New Task Alerts",  sub: "Get notified when a new task is assigned to you", val: taskAlerts, fn: setTaskAlerts },
                { label: "SLA Warnings",     sub: "Alert when a task is approaching SLA deadline",  val: slaAlerts,  fn: setSlaAlerts },
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

          {/* Change Password */}
          <motion.div variants={section} initial="hidden" animate="show" transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
                <Lock size={18} className="text-red-500" />
              </div>
              <h2 className="font-semibold text-gray-800">Change Password</h2>
            </div>
            <div className="space-y-3">
              {[
                { label: "Current Password", placeholder: "••••••••" },
                { label: "New Password",     placeholder: "Min. 8 characters" },
                { label: "Confirm Password", placeholder: "Repeat new password" },
              ].map((f) => (
                <div key={f.label}>
                  <label className="text-xs font-semibold text-gray-500 block mb-1.5">{f.label}</label>
                  <input type="password" placeholder={f.placeholder}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
                </div>
              ))}
            </div>
          </motion.div>
          </div>
        </div>

        {/* Save */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }}
          className="mt-5 flex items-center gap-3">
            <motion.button onClick={handleSave}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 shadow-sm transition-colors">
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
