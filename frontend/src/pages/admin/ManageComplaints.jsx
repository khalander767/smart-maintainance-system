import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Plus, Search, SlidersHorizontal, Sparkles } from "lucide-react";

const CATEGORY_SPECIALTY = {
  Plumbing:   "Plumber",
  Electrical: "Electrician",
  Lift:       "Lift Technician",
  AC:         "AC Technician",
  Carpentry:  "Carpenter",
  Cleaning:   "Cleaner",
  Security:   "Security",
  Other:      "General",
};
import DashboardLayout from "../../components/layout/DashboardLayout";
import API from "@/api/axios";

const STATUS_STYLE = {
  OPEN:        "bg-orange-50 text-orange-600 border border-orange-200",
  IN_PROGRESS: "bg-blue-50 text-blue-600 border border-blue-200",
  RESOLVED:    "bg-green-50 text-green-600 border border-green-200",
  CLOSED:      "bg-gray-100 text-gray-500 border border-gray-200",
  REOPENED:    "bg-purple-50 text-purple-600 border border-purple-200",
};

const PRIORITY_STYLE = {
  HIGH:   "bg-red-50 text-red-500 border border-red-200",
  MEDIUM: "bg-yellow-50 text-yellow-600 border border-yellow-200",
  LOW:    "bg-green-50 text-green-600 border border-green-200",
};

const FILTERS = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED", "REOPENED"];

const row = { hidden: { opacity: 0, y: 0 }, show: { opacity: 1, y: 0 } };

export default function ManageComplaints() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [assignModal, setAssignModal] = useState(null);
  const [selectedTech, setSelectedTech] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [newComplaint, setNewComplaint] = useState({ title: "", description: "", category: "", priority: "MEDIUM", isEmergency: false });

  useEffect(() => {
    Promise.all([API.get("/complaints?limit=100"), API.get("/users?role=TECHNICIAN")])
      .then(([cRes, tRes]) => {
        setComplaints(cRes.data.data);
        setTechnicians(tRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = complaints
    .filter((c) => activeFilter === "ALL" || c.status === activeFilter)
    .filter((c) => c.title.toLowerCase().includes(search.toLowerCase()));

  const handleAssign = async () => {
    if (!selectedTech) return;
    setAssignError("");
    const technician = technicians.find((item) => item._id === selectedTech);
    const requiredSpecialty = CATEGORY_SPECIALTY[assignModal.category];
    const allTechniciansBusy = technicians.length > 0 && technicians.every((item) => !item.isAvailable);
    const requiresOverride = assignModal.isEmergency && (
      technician?.specialty !== requiredSpecialty || (allTechniciansBusy && !technician?.isAvailable)
    );
    if (requiresOverride && !window.confirm(`Emergency override: ${technician.name} is ${technician.specialty}, while this complaint is ${assignModal.category}.${!technician.isAvailable ? " All technicians are busy." : ""} Continue?`)) return;
    try {
      setAssigning(true);
      const res = await API.put(`/complaints/${assignModal._id}/assign`, {
        technicianId: selectedTech,
        emergencyOverride: requiresOverride,
      });
      setComplaints((prev) => prev.map((c) => (c._id === assignModal._id ? res.data.complaint : c)));
      setAssignModal(null);
    } catch (err) {
      setAssignError(err.response?.data?.message || "Failed to assign");
    } finally {
      setAssigning(false);
    }
  };

  const handleCreateComplaint = async (event) => {
    event.preventDefault();
    setCreateError("");
    if (!newComplaint.title || !newComplaint.description || !newComplaint.category) {
      setCreateError("Title, category, and description are required.");
      return;
    }
    try {
      setCreating(true);
      const response = await API.post("/complaints", newComplaint);
      setComplaints((current) => [response.data.complaint, ...current]);
      setShowCreateModal(false);
      setNewComplaint({ title: "", description: "", category: "", priority: "MEDIUM", isEmergency: false });
    } catch (err) {
      setCreateError(err.response?.data?.message || "Could not create complaint.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
            <p className="text-sm text-gray-400 mt-1">{complaints.length} total complaints</p>
          </div>
          <button onClick={() => { setShowCreateModal(true); setCreateError(""); }} className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"><Plus size={16} />Create complaint</button>
        </div>

        {/* Search + Filter bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-4">
          <div className="flex gap-3 flex-wrap items-center">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search complaints..."
                className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
              />
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <SlidersHorizontal size={15} className="text-gray-400 mr-1" />
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                    ${activeFilter === f ? "bg-blue-600 text-white shadow-sm" : "bg-gray-50 text-gray-500 hover:bg-gray-100"}`}
                >
                  {f.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-50 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Title</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Category</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Priority</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Assigned To</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <motion.tbody variants={{ show: { transition: { staggerChildren: 0.03 } } }} initial="hidden" animate="show">
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">No complaints found</td></tr>
                )}
                {filtered.map((c) => (
                  <motion.tr key={c._id} variants={row} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800 text-sm max-w-[200px] truncate">{c.title}</p>
                        {c.isEmergency && <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-600 border border-red-200">EMERGENCY</span>}
                      </div>
                      <p className="text-xs text-gray-400 mt-0.5">{new Date(c.createdAt).toLocaleDateString()}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{c.category}</td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${STATUS_STYLE[c.status]}`}>
                        {c.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${PRIORITY_STYLE[c.priority]}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {c.assignedTo?.name || <span className="text-gray-300 italic text-xs">Unassigned</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => navigate(`/admin/complaints/${c._id}`)}
                          className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline">
                          View
                        </button>
                        {["OPEN", "REOPENED"].includes(c.status) && (
                          <button onClick={() => { setAssignModal(c); setSelectedTech(""); setAssignError(""); }}
                            className="text-xs bg-blue-600 text-white px-2.5 py-1 rounded-lg hover:bg-blue-700 transition-colors">
                            Assign
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* Assign modal */}
      <AnimatePresence>
        {assignModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-[400px] shadow-xl"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-1">Assign Technician</h2>
              <p className="text-sm text-gray-400 mb-1 truncate">"{assignModal.title}"</p>
              <p className="text-xs text-gray-400 mb-4">
                Category: <span className="font-medium text-gray-600">{assignModal.category}</span>
              </p>
              {assignModal.isEmergency && (
                <div className="flex gap-2 mb-4 p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-700">
                  <AlertTriangle size={17} className="shrink-0 mt-0.5" />
                  <p><strong>Emergency complaint.</strong> Any same-apartment technician may be selected. A specialty mismatch, or a busy-tech override when everyone is busy, requires confirmation.</p>
                </div>
              )}
              {assignError && <p className="mb-3 p-3 rounded-xl bg-red-50 text-red-600 text-sm">{assignError}</p>}

              {/* Suggested */}
              {(() => {
                const suggested = CATEGORY_SPECIALTY[assignModal.category];
                const allTechniciansBusy = technicians.length > 0 && technicians.every((t) => !t.isAvailable);
                const suggestedTechs = technicians.filter((t) => t.specialty === suggested);
                const otherTechs = assignModal.isEmergency ? technicians.filter((t) => t.specialty !== suggested) : [];
                const disabled = (t) => !t.isAvailable && !allTechniciansBusy;
                return (
                  <div className="space-y-3 max-h-64 overflow-y-auto mb-4 pr-1">
                    {suggestedTechs.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Sparkles size={13} className="text-yellow-500" />
                          <p className="text-xs font-semibold text-yellow-600 uppercase tracking-wide">Suggested — {suggested}</p>
                        </div>
                        {suggestedTechs.map((t) => (
                          <button key={t._id} disabled={disabled(t)} onClick={() => setSelectedTech(t._id)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border mb-1.5 text-left transition-all
                              ${selectedTech === t._id ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-200 hover:bg-gray-50"} disabled:opacity-45 disabled:cursor-not-allowed`}>
                            <div className="flex items-center gap-2.5">
                              <div className="relative w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs flex-shrink-0">
                                {t.name[0]}
                                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white ${t.isAvailable ? "bg-green-400" : "bg-red-400"}`} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">{t.name}</p>
                                <p className="text-xs text-gray-400">{t.specialty}</p>
                              </div>
                            </div>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${t.isAvailable ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                              {t.isAvailable ? "Available" : "Busy"}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                    {otherTechs.length > 0 && (
                      <div>
                        {suggestedTechs.length > 0 && <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Others</p>}
                        {otherTechs.map((t) => (
                          <button key={t._id} disabled={disabled(t)} onClick={() => setSelectedTech(t._id)}
                            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border mb-1.5 text-left transition-all
                              ${selectedTech === t._id ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-blue-200 hover:bg-gray-50"} disabled:opacity-45 disabled:cursor-not-allowed`}>
                            <div className="flex items-center gap-2.5">
                              <div className="relative w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-xs flex-shrink-0">
                                {t.name[0]}
                                <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-white ${t.isAvailable ? "bg-green-400" : "bg-red-400"}`} />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-800">{t.name}</p>
                                <p className="text-xs text-gray-400">{t.specialty || "General"}</p>
                              </div>
                            </div>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${t.isAvailable ? "bg-green-50 text-green-600" : "bg-red-50 text-red-500"}`}>
                              {t.isAvailable ? "Available" : "Busy"}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
              <div className="flex gap-3">
                <button onClick={() => setAssignModal(null)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                  Cancel
                </button>
                <button onClick={handleAssign} disabled={!selectedTech || assigning}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                  {assigning ? "Assigning..." : "Assign"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCreateModal && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.form initial={{ scale: 0.96, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }} onSubmit={handleCreateComplaint} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl space-y-4">
            <div><h2 className="text-lg font-bold text-gray-900">Create complaint</h2><p className="text-sm text-gray-400 mt-1">Created complaints follow the same assignment rules.</p></div>
            {createError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{createError}</p>}
            <input value={newComplaint.title} onChange={(event) => setNewComplaint({ ...newComplaint, title: event.target.value })} placeholder="Complaint title" className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm" />
            <select value={newComplaint.category} onChange={(event) => setNewComplaint({ ...newComplaint, category: event.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm"><option value="">Select category</option>{Object.keys(CATEGORY_SPECIALTY).map((category) => <option key={category} value={category}>{category}</option>)}</select>
            <select value={newComplaint.priority} onChange={(event) => setNewComplaint({ ...newComplaint, priority: event.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm">{["LOW", "MEDIUM", "HIGH"].map((priority) => <option key={priority} value={priority}>{priority}</option>)}</select>
            <textarea value={newComplaint.description} onChange={(event) => setNewComplaint({ ...newComplaint, description: event.target.value })} placeholder="Describe the issue" rows={4} className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm resize-none" />
            <label className={`flex gap-3 rounded-xl border p-3 cursor-pointer ${newComplaint.isEmergency ? "border-red-200 bg-red-50" : "border-gray-200"}`}><input type="checkbox" checked={newComplaint.isEmergency} onChange={(event) => setNewComplaint({ ...newComplaint, isEmergency: event.target.checked })} className="accent-red-600 mt-0.5" /><span><span className="block text-sm font-semibold text-red-700">Emergency</span><span className="block text-xs text-red-600">Allows confirmed specialty/availability override during Admin assignment.</span></span></label>
            <div className="flex gap-3"><button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm text-gray-600">Cancel</button><button disabled={creating} className="flex-1 rounded-xl bg-blue-600 py-2.5 text-sm font-medium text-white disabled:opacity-50">{creating ? "Creating…" : "Create complaint"}</button></div>
          </motion.form>
        </motion.div>}
      </AnimatePresence>
    </DashboardLayout>
  );
}
