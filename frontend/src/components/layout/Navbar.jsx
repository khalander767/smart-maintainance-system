import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LogOut, User, ChevronDown, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const TITLES = {
  "/admin/dashboard":           "Dashboard",
  "/admin/complaints":          "Manage Complaints",
  "/admin/technicians":         "Technicians",
  "/admin/residents":           "Residents",
  "/admin/reports":             "Reports",
  "/admin/settings":            "Settings",
  "/technician/dashboard":      "My Tasks",
  "/technician/complaints":     "All Tasks",
  "/technician/settings":       "Settings",
  "/resident/dashboard":        "Dashboard",
  "/resident/complaints":       "My Complaints",
  "/resident/create-complaint": "Raise Complaint",
  "/resident/settings":         "Settings",
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const title = TITLES[location.pathname] || "AptCare";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const ROLE_COLOR = {
    ADMIN:      "bg-blue-600",
    TECHNICIAN: "bg-green-600",
    RESIDENT:   "bg-purple-600",
  };

  const ROLE_BADGE = {
    ADMIN:      "bg-blue-50 text-blue-600 border-blue-200",
    TECHNICIAN: "bg-green-50 text-green-600 border-green-200",
    RESIDENT:   "bg-purple-50 text-purple-600 border-purple-200",
  };

  return (
    <div className="h-16 bg-blue-50 border-b border-blue-100 flex items-center justify-between px-6 flex-shrink-0">
      <h2 className="text-lg font-semibold text-gray-800">{title}</h2>

      <div className="flex items-center gap-3">
        {/* Bell */}
        <button className="w-9 h-9 rounded-xl bg-white hover:bg-blue-100 flex items-center justify-center transition-colors border border-blue-100">
          <Bell size={17} className="text-gray-500" />
        </button>

        {/* Profile dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-xl hover:bg-blue-100 transition-colors"
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-sm ${ROLE_COLOR[user?.role] || "bg-blue-600"}`}>
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div className="hidden md:block text-left">
              <p className="text-sm font-medium text-gray-800 leading-none">{user?.name}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 capitalize">{user?.role?.toLowerCase()}</p>
            </div>
            <ChevronDown size={15} className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.97 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden z-50"
              >
                {/* Account info */}
                <div className="px-4 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-base shadow-sm ${ROLE_COLOR[user?.role] || "bg-blue-600"}`}>
                      {user?.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{user?.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{user?.email}</p>
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border mt-1 inline-block ${ROLE_BADGE[user?.role]}`}>
                        {user?.role}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-2">
                  <button
                    onClick={() => {
                      setOpen(false);
                      navigate(
                        user?.role === "ADMIN"      ? "/admin/settings" :
                        user?.role === "TECHNICIAN" ? "/technician/settings" :
                                                      "/resident/settings"
                      );
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    <User size={16} className="text-gray-400" />
                    Account Settings
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
