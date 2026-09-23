import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Wrench, CheckCircle2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../../components/layout/DashboardLayout";
import API from "@/api/axios";
import TechnicianDetailsDrawer from "@/components/technicians/TechnicianDetailsDrawer";

export const SPECIALTIES = [
  "Plumber", "Electrician", "Lift Technician",
  "AC Technician", "Carpenter", "Cleaner", "Security", "General",
];

const SPECIALTY_COLOR = {
  "Plumber":          "bg-blue-50 text-blue-600 border-blue-200",
  "Electrician":      "bg-yellow-50 text-yellow-600 border-yellow-200",
  "Lift Technician":  "bg-purple-50 text-purple-600 border-purple-200",
  "AC Technician":    "bg-cyan-50 text-cyan-600 border-cyan-200",
  "Carpenter":        "bg-orange-50 text-orange-600 border-orange-200",
  "Cleaner":          "bg-green-50 text-green-600 border-green-200",
  "Security":         "bg-red-50 text-red-500 border-red-200",
  "General":          "bg-gray-50 text-gray-500 border-gray-200",
};

const PRIORITY_COLOR = { HIGH: "text-red-500", MEDIUM: "text-yellow-600", LOW: "text-green-600" };
const row = { hidden: { opacity: 0 }, show: { opacity: 1 } };

export default function ManageTechnicians() {
  const navigate = useNavigate();
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", specialty: "" });
  const [formError, setFormError] = useState("");
  const [selectedTechnicianId, setSelectedTechnicianId] = useState(null);

  useEffect(() => {
    API.get("/users?role=TECHNICIAN")
      .then((res) => setTechnicians(res.data))
      .finally(() => setLoading(false));
  }, []);

  const available = technicians.filter((t) => t.isAvailable).length;
  const busy = technicians.filter((t) => !t.isAvailable).length;

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!formData.name || !formData.email || !formData.password || !formData.specialty) {
      setFormError("All fields are required");
      return;
    }
    try {
      setSubmitting(true);
      const res = await API.post("/users", { ...formData, role: "TECHNICIAN" });
      setTechnicians((prev) => [{ ...res.data.user, isAvailable: true, activeComplaints: [] }, ...prev]);
      setShowModal(false);
      setFormData({ name: "", email: "", password: "", specialty: "" });
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to add technician");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Technicians</h1>
            <p className="text-sm text-gray-400 mt-1">
              {technicians.length} total · {available} available · {busy} busy
            </p>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 shadow-sm">
            <UserPlus size={16} /> Add Technician
          </motion.button>
        </div>

        {/* Summary chips */}
        <div className="flex gap-3 mb-5">
          <div className="flex items-center gap-2 bg-green-50 border border-green-100 px-4 py-2 rounded-xl">
            <CheckCircle2 size={15} className="text-green-500" />
            <span className="text-sm font-medium text-green-700">{available} Available</span>
          </div>
          <div className="flex items-center gap-2 bg-red-50 border border-red-100 px-4 py-2 rounded-xl">
            <Clock size={15} className="text-red-400" />
            <span className="text-sm font-medium text-red-600">{busy} Busy</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Technician</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Specialty</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Currently Working On</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Joined</th>
                </tr>
              </thead>
              <motion.tbody variants={{ show: { transition: { staggerChildren: 0.03 } } }} initial="hidden" animate="show">
                {technicians.length === 0 && (
                  <tr><td colSpan={5} className="px-5 py-12 text-center text-gray-400 text-sm">No technicians yet</td></tr>
                )}
                {technicians.map((t) => (
                  <motion.tr key={t._id} variants={row} onClick={() => setSelectedTechnicianId(t._id)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") setSelectedTechnicianId(t._id); }} tabIndex={0} className="border-b border-gray-50 hover:bg-slate-50 transition-colors cursor-pointer focus:outline-none focus:bg-blue-50">
                    {/* Name + avatar */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                            <Wrench size={15} className="text-blue-600" />
                          </div>
                          <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white
                            ${t.isAvailable ? "bg-green-400" : "bg-red-400"}`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 text-sm">{t.name}</p>
                          <p className="text-xs text-gray-400">{t.email}</p>
                        </div>
                      </div>
                    </td>

                    {/* Specialty */}
                    <td className="px-5 py-4">
                      {t.specialty ? (
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${SPECIALTY_COLOR[t.specialty] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
                          {t.specialty}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-300 italic">Not set</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      {t.isAvailable ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-green-50 text-green-600 border border-green-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse inline-block" />
                          Available
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-red-50 text-red-500 border border-red-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse inline-block" />
                          Busy
                        </span>
                      )}
                    </td>

                    {/* Current task */}
                    <td className="px-5 py-4">
                      {t.isAvailable ? (
                        <span className="text-xs text-gray-300 italic">—</span>
                      ) : (
                        <div className="space-y-1">
                          {t.activeComplaints.map((c) => (
                            <div key={c._id} className="flex items-center gap-2">
                              <span className={`text-xs font-semibold ${PRIORITY_COLOR[c.priority]}`}>[{c.priority}]</span>
                              <span className="text-xs text-gray-700 font-medium truncate max-w-[180px]">{c.title}</span>
                              <span className="text-xs text-gray-400">· {c.category}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-4 text-sm text-gray-400">
                      {new Date(t.createdAt).toLocaleDateString()}
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          )}
        </div>
      </motion.div>

      {/* Add Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-[420px] shadow-xl">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Add Technician</h2>
              {formError && <p className="text-red-500 text-sm mb-3 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>}
              <form onSubmit={handleSubmit} className="space-y-3">
                <input name="name" type="text" placeholder="Full Name"
                  value={formData.name} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
                <input name="email" type="email" placeholder="Email address"
                  value={formData.email} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />
                <input name="password" type="password" placeholder="Password"
                  value={formData.password} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300" />

                {/* Specialty dropdown */}
                <select name="specialty" value={formData.specialty} onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300">
                  <option value="">— Select Specialty —</option>
                  {SPECIALTIES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); setFormError(""); }}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                    {submitting ? "Adding..." : "Add Technician"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <TechnicianDetailsDrawer key={selectedTechnicianId || "none"} technicianId={selectedTechnicianId} onClose={() => setSelectedTechnicianId(null)} onViewComplaint={(id) => navigate(`/admin/complaints/${id}`)} onUpdated={(updated) => setTechnicians((current) => current.map((item) => item._id === updated._id ? { ...item, ...updated } : item))} onRemoved={(id) => setTechnicians((current) => current.filter((item) => item._id !== id))} />
    </DashboardLayout>
  );
}
