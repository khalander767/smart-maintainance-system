import {
  LayoutDashboard, ClipboardList, UserCog, Users,
  BarChart3, Settings, PlusCircle, FileText, Building2,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import logoIcon from "@/assets/logo-icon.png";

const MENUS = {
  ADMIN: [
    { name: "Dashboard",   path: "/admin/dashboard",   icon: LayoutDashboard },
    { name: "Complaints",  path: "/admin/complaints",  icon: ClipboardList },
    { name: "Technicians", path: "/admin/technicians", icon: UserCog },
    { name: "Residents",   path: "/admin/residents",   icon: Users },
    { name: "Reports",     path: "/admin/reports",     icon: BarChart3 },
  ],
  TECHNICIAN: [
    { name: "My Tasks",  path: "/technician/dashboard",  icon: LayoutDashboard },
    { name: "All Tasks", path: "/technician/complaints", icon: ClipboardList },
  ],
  RESIDENT: [
    { name: "Dashboard",       path: "/resident/dashboard",        icon: LayoutDashboard },
    { name: "My Complaints",   path: "/resident/complaints",       icon: FileText },
    { name: "Raise Complaint", path: "/resident/create-complaint", icon: PlusCircle },
  ],
};

const ROLE_LABEL = {
  ADMIN: "Admin Panel",
  TECHNICIAN: "Technician Panel",
  RESIDENT: "Resident Panel",
};

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const menu = MENUS[user?.role] || [];

  // Active when on the exact path OR any nested sub-route (e.g. /admin/complaints/:id)
  const isActivePath = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const settingsPath =
    user?.role === "ADMIN"      ? "/admin/settings" :
    user?.role === "TECHNICIAN" ? "/technician/settings" :
                                  "/resident/settings";

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
      {/* Brand */}
      <div className="px-4 pt-5 pb-4 border-b border-blue-100 bg-blue-50">
        {/* Logo + App name */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm flex-shrink-0 border border-blue-100">
            <img src={logoIcon} alt="AptCare" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900 text-[15px] leading-none">AptCare</h1>
            <p className="text-[11px] text-gray-400 mt-0.5">{ROLE_LABEL[user?.role]}</p>
          </div>
        </div>

        {/* Apartment name chip */}
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-100 rounded-xl px-3 py-2">
          <Building2 size={13} className="text-blue-500 flex-shrink-0" />
          <p className="text-xs font-medium text-blue-700 truncate">
            {user?.apartmentName || "Sunshine Apartments"}
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {menu.map((item) => {
          const Icon = item.icon;
          const isActive = isActivePath(item.path);
          return (
            <motion.button
              key={item.path}
              onClick={() => navigate(item.path)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                ${isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
            >
              <Icon size={18} className={isActive ? "text-blue-600" : "text-gray-400"} />
              {item.name}
              {isActive && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-3 py-4 border-t border-gray-100">
        {(() => {
          const isActive = isActivePath(settingsPath);
          return (
            <motion.button
              onClick={() => navigate(settingsPath)}
              whileHover={{ x: 2 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-800"
                }`}
            >
              <Settings size={18} className={isActive ? "text-blue-600" : "text-gray-400"} />
              Settings
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 inline-block" />}
            </motion.button>
          );
        })()}
      </div>
    </div>
  );
}
