import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, AlertTriangle, Clock, Ban } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import API from "@/api/axios";

const STATUS_STYLE = {
  OPEN:        "bg-orange-50 text-orange-600 border border-orange-200",
  IN_PROGRESS: "bg-blue-50 text-blue-600 border border-blue-200",
  RESOLVED:    "bg-green-50 text-green-600 border border-green-200",
  CLOSED:      "bg-gray-100 text-gray-500 border border-gray-200",
  REOPENED:    "bg-purple-50 text-purple-600 border border-purple-200",
  CANCELLED:   "bg-gray-100 text-gray-400 border border-gray-200",
};

const PRIORITY_DOT = { HIGH: "bg-red-400", MEDIUM: "bg-yellow-400", LOW: "bg-green-400" };

const FILTERS = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REOPENED", "CANCELLED"];

const card = { hidden: { opacity: 0, y: 0 }, show: { opacity: 1, y: 0 } };

export default function MyComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [reopening, setReopening] = useState(null);
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    API.get("/complaints?limit=100")
      .then((res) => setComplaints(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const handleReopen = async (id) => {
    try {
      setReopening(id);
      const res = await API.put(`/complaints/${id}/reopen`);
      setComplaints((prev) => prev.map((c) => (c._id === id ? res.data.complaint : c)));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reopen");
    } finally {
      setReopening(null);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm("Revoke this complaint? This cannot be undone.")) return;
    try {
      setCancelling(id);
      const res = await API.put(`/complaints/${id}/cancel`);
      setComplaints((prev) => prev.map((c) => (c._id === id ? res.data.complaint : c)));
    } catch (err) {
      alert(err.response?.data?.message || "Failed to revoke");
    } finally {
      setCancelling(null);
    }
  };

  const filtered = activeFilter === "ALL" ? complaints : complaints.filter((c) => c.status === activeFilter);
  const now = new Date();

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">My Complaints</h1>
          <p className="text-sm text-gray-400 mt-1">{complaints.length} complaints raised</p>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 mb-5 flex-wrap">
          {FILTERS.map((f) => (
            <button key={f} onClick={() => setActiveFilter(f)}
              className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all
                ${activeFilter === f ? "bg-blue-600 text-white shadow-sm" : "bg-white text-gray-500 border border-gray-200 hover:bg-gray-50"}`}>
              {f.replace("_", " ")}
              <span className="ml-1.5 opacity-70">
                ({f === "ALL" ? complaints.length : complaints.filter((c) => c.status === f).length})
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl animate-pulse" />)}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div key={activeFilter} variants={{ show: { transition: { staggerChildren: 0.03 } } }} initial="hidden" animate="show" className="space-y-3">
              {filtered.length === 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
                  No complaints in this category
                </div>
              )}
              {filtered.map((c) => {
                const slaBreached = c.slaDeadline && now > new Date(c.slaDeadline);
                return (
                  <motion.div key={c._id} variants={card}
                    className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className={`w-2 h-2 rounded-full flex-shrink-0 ${PRIORITY_DOT[c.priority]}`} />
                          <h3 className="font-semibold text-gray-800 text-sm">{c.title}</h3>
                          <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${STATUS_STYLE[c.status]}`}>
                            {c.status.replace("_", " ")}
                          </span>
                          {c.isSLABreached && (
                            <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs bg-red-50 text-red-500 border border-red-200">
                              <AlertTriangle size={11} /> SLA Breached
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-gray-500 mb-3 line-clamp-2">{c.description}</p>

                        <div className="flex gap-4 text-xs text-gray-400 flex-wrap">
                          <span>Category: <span className="text-gray-600">{c.category}</span></span>
                          <span>Priority: <span className="text-gray-600">{c.priority}</span></span>
                          <span className="flex items-center gap-1">
                            <Clock size={11} />
                            {new Date(c.createdAt).toLocaleDateString()}
                          </span>
                          {c.assignedTo?.name && (
                            <span>Technician: <span className="text-gray-600">{c.assignedTo.name}</span></span>
                          )}
                          {c.slaDeadline && (
                            <span>SLA: <span className={slaBreached ? "text-red-500 font-medium" : "text-gray-600"}>
                              {new Date(c.slaDeadline).toLocaleDateString()}
                            </span></span>
                          )}
                        </div>

                        {/* Completion proof from technician */}
                        {(c.proofImages?.before || c.proofImages?.after) && (
                          <div className="mt-3">
                            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Completion proof</p>
                            <div className="flex gap-2">
                              {c.proofImages.before && (
                                <a href={c.proofImages.before} target="_blank" rel="noopener noreferrer" className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-100 hover:opacity-90 transition">
                                  <img src={c.proofImages.before} alt="before" className="w-full h-full object-cover" />
                                  <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[9px] text-center py-0.5">Before</span>
                                </a>
                              )}
                              {c.proofImages.after && (
                                <a href={c.proofImages.after} target="_blank" rel="noopener noreferrer" className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-100 hover:opacity-90 transition">
                                  <img src={c.proofImages.after} alt="after" className="w-full h-full object-cover" />
                                  <span className="absolute bottom-0 inset-x-0 bg-black/50 text-white text-[9px] text-center py-0.5">After</span>
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {["RESOLVED", "CLOSED"].includes(c.status) && (
                        <motion.button
                          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          onClick={() => handleReopen(c._id)}
                          disabled={reopening === c._id}
                          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl text-xs font-medium hover:bg-purple-100 disabled:opacity-50 transition"
                        >
                          <RotateCcw size={13} />
                          {reopening === c._id ? "Reopening..." : "Reopen"}
                        </motion.button>
                      )}

                      {["OPEN", "REOPENED"].includes(c.status) && (
                        <motion.button
                          whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                          onClick={() => handleCancel(c._id)}
                          disabled={cancelling === c._id}
                          className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-medium hover:bg-red-100 disabled:opacity-50 transition"
                        >
                          <Ban size={13} />
                          {cancelling === c._id ? "Revoking..." : "Revoke"}
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}
      </motion.div>
    </DashboardLayout>
  );
}
