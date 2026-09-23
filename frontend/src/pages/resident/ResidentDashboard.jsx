import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { PlusCircle, ClipboardList, Clock, CheckCircle2, RefreshCw } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import API from "@/api/axios";
import { useAuth } from "@/hooks/useAuth";

const STATUS_STYLE = {
  OPEN:        "bg-orange-50 text-orange-600 border border-orange-200",
  IN_PROGRESS: "bg-blue-50 text-blue-600 border border-blue-200",
  RESOLVED:    "bg-green-50 text-green-600 border border-green-200",
  CLOSED:      "bg-gray-100 text-gray-500 border border-gray-200",
  REOPENED:    "bg-purple-50 text-purple-600 border border-purple-200",
};

const card = { hidden: { opacity: 0, y: 0 }, show: { opacity: 1, y: 0 } };

export default function ResidentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/complaints?limit=5")
      .then((res) => setComplaints(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const total      = complaints.length;
  const open       = complaints.filter((c) => c.status === "OPEN").length;
  const inProgress = complaints.filter((c) => c.status === "IN_PROGRESS").length;
  const closed     = complaints.filter((c) => ["RESOLVED", "CLOSED"].includes(c.status)).length;

  const stats = [
    { label: "Total",       value: total,      icon: ClipboardList, color: "bg-blue-50 text-blue-600" },
    { label: "Open",        value: open,       icon: Clock,         color: "bg-orange-50 text-orange-500" },
    { label: "In Progress", value: inProgress, icon: RefreshCw,     color: "bg-yellow-50 text-yellow-600" },
    { label: "Closed",      value: closed,     icon: CheckCircle2,  color: "bg-green-50 text-green-600" },
  ];

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
        {/* Welcome banner */}
        <motion.div
          initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-6 mb-6 flex items-center justify-between"
        >
          <div>
            <h1 className="text-xl font-bold text-white">Welcome back, {user?.name?.split(" ")[0]}!</h1>
            <p className="text-blue-100 text-sm mt-1">Track and manage your maintenance requests</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={() => navigate("/resident/create-complaint")}
            className="flex items-center gap-2 bg-white text-blue-600 px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm hover:bg-blue-50 transition-colors"
          >
            <PlusCircle size={16} /> Raise Complaint
          </motion.button>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${s.color}`}>
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xs text-gray-400">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{s.value}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Recent complaints */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-800">Recent Complaints</h2>
            <button onClick={() => navigate("/resident/complaints")}
              className="text-xs text-blue-600 hover:underline font-medium">View All →</button>
          </div>

          {loading ? (
            <div className="p-5 space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)}
            </div>
          ) : complaints.length === 0 ? (
            <div className="py-12 text-center">
              <ClipboardList size={32} className="text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400">No complaints yet</p>
              <button onClick={() => navigate("/resident/create-complaint")}
                className="mt-3 text-sm text-blue-600 hover:underline font-medium">Raise your first complaint</button>
            </div>
          ) : (
            <motion.div variants={{ show: { transition: { staggerChildren: 0.03 } } }} initial="hidden" animate="show">
              {complaints.map((c) => (
                <motion.div key={c._id} variants={card}
                  className="flex items-center justify-between px-5 py-4 border-b border-gray-50 last:border-0 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{c.title}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{c.category} · {new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${STATUS_STYLE[c.status]}`}>
                    {c.status.replace("_", " ")}
                  </span>
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
