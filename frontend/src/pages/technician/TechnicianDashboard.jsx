import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, ClipboardList, AlertTriangle } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import API from "@/api/axios";

const STATUS_STYLE = {
  IN_PROGRESS: "bg-blue-50 text-blue-600 border border-blue-200",
  RESOLVED:    "bg-green-50 text-green-600 border border-green-200",
  CLOSED:      "bg-gray-100 text-gray-500 border border-gray-200",
};

const PRIORITY_BORDER = { HIGH: "border-l-red-400", MEDIUM: "border-l-yellow-400", LOW: "border-l-green-400" };

const card = { hidden: { opacity: 0, y: 0 }, show: { opacity: 1, y: 0 } };

export default function TechnicianDashboard() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resolveModal, setResolveModal] = useState(null);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    API.get("/complaints?limit=100")
      .then((res) => setComplaints(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const handleResolve = async () => {
    try {
      setResolving(true);
      const res = await API.put(`/complaints/${resolveModal._id}/resolve`, {});
      setComplaints((prev) => prev.map((c) => (c._id === resolveModal._id ? res.data.complaint : c)));
      setResolveModal(null);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to resolve");
    } finally {
      setResolving(false);
    }
  };

  const inProgress = complaints.filter((c) => c.status === "IN_PROGRESS");
  const closed     = complaints.filter((c) => ["RESOLVED", "CLOSED"].includes(c.status));
  const now        = new Date();

  const stats = [
    { label: "Total Assigned", value: complaints.length, icon: ClipboardList, color: "bg-blue-50 text-blue-600" },
    { label: "In Progress",    value: inProgress.length, icon: Clock,         color: "bg-yellow-50 text-yellow-600" },
    { label: "Closed",         value: closed.length,     icon: CheckCircle2,  color: "bg-green-50 text-green-600" },
  ];

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <p className="text-sm text-gray-400 mt-1">Complaints assigned to you</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div key={s.label}
                initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
                  <Icon size={20} />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-medium">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-0.5">{s.value}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Task cards */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <motion.div variants={{ show: { transition: { staggerChildren: 0.03 } } }} initial="hidden" animate="show" className="space-y-3">
            {complaints.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
                No tasks assigned yet
              </div>
            )}
            {complaints.map((c) => {
              const slaBreached = c.slaDeadline && now > new Date(c.slaDeadline);
              return (
                <motion.div key={c._id} variants={card}
                  className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 border-l-4 ${PRIORITY_BORDER[c.priority] || "border-l-gray-200"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-800 text-sm">{c.title}</h3>
                        {c.status !== "CLOSED" && (
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${STATUS_STYLE[c.status] || ""}`}>
                            {c.status.replace("_", " ")}
                          </span>
                        )}
                        {slaBreached && c.status === "IN_PROGRESS" && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-red-50 text-red-500 border border-red-200">
                            <AlertTriangle size={11} /> SLA Breached
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mb-2 line-clamp-1">{c.description}</p>
                      <div className="flex gap-4 text-xs text-gray-400">
                        <span>Category: <span className="text-gray-600">{c.category}</span></span>
                        <span>Priority: <span className="text-gray-600">{c.priority}</span></span>
                        {c.slaDeadline && (
                          <span>SLA: <span className={slaBreached ? "text-red-500 font-medium" : "text-gray-600"}>
                            {new Date(c.slaDeadline).toLocaleDateString()}
                          </span></span>
                        )}
                      </div>
                    </div>
                    {c.status === "IN_PROGRESS" && (
                      <motion.button
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setResolveModal(c)}
                        className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-medium hover:bg-green-700 shadow-sm"
                      >
                        <CheckCircle2 size={14} /> Mark Resolved
                      </motion.button>
                    )}
                    {["RESOLVED", "CLOSED"].includes(c.status) && (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle2 size={14} /> Done
                      </span>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </motion.div>

      <AnimatePresence>
        {resolveModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-[400px] shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
                <CheckCircle2 size={24} className="text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Mark as Resolved</h2>
              <p className="text-sm text-gray-500 mb-1">"{resolveModal.title}"</p>
              <p className="text-sm text-gray-400 mb-6">Confirm that this issue has been fully resolved.</p>
              <div className="flex gap-3">
                <button onClick={() => setResolveModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleResolve} disabled={resolving}
                  className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                  {resolving ? "Resolving..." : "Confirm"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
