import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, KeyRound, Copy, Check } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import { useAuth } from "@/hooks/useAuth";
import API from "@/api/axios";

const row = { hidden: { opacity: 0, y: 0 }, show: { opacity: 1, y: 0 } };

export default function ManageResidents() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [residents, setResidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [formError, setFormError] = useState("");
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    if (!user?.apartmentCode) return;
    navigator.clipboard.writeText(user.apartmentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    API.get("/users?role=RESIDENT")
      .then((res) => setResidents(res.data))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (!formData.name || !formData.email || !formData.password) {
      setFormError("All fields are required");
      return;
    }
    try {
      setSubmitting(true);
      const res = await API.post("/users", { ...formData, role: "RESIDENT" });
      setResidents((prev) => [res.data.user, ...prev]);
      setShowModal(false);
      setFormData({ name: "", email: "", password: "" });
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to add resident");
    } finally {
      setSubmitting(false);
    }
  };

  const COLORS = ["bg-purple-100 text-purple-600", "bg-green-100 text-green-600", "bg-orange-100 text-orange-600", "bg-pink-100 text-pink-600", "bg-blue-100 text-blue-600"];

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Residents</h1>
            <p className="text-sm text-gray-400 mt-1">{residents.length} registered residents</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 shadow-sm"
          >
            <UserPlus size={16} />
            Add Resident
          </motion.button>
        </div>

        {/* Apartment join code — share with residents to self-register */}
        {user?.apartmentCode && (
          <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                <KeyRound size={18} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Apartment join code</p>
                <p className="text-xs text-gray-500">Share this with residents so they can sign up themselves.</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold tracking-widest text-blue-700 bg-white border border-blue-200 rounded-lg px-4 py-2 text-base">
                {user.apartmentCode}
              </span>
              <button onClick={copyCode}
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 bg-white border border-blue-200 rounded-lg px-3 py-2 transition">
                {copied ? <><Check size={15} /> Copied</> : <><Copy size={15} /> Copy</>}
              </button>
            </div>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(5)].map((_, i) => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />)}
            </div>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/60">
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Resident</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Email</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Joined</th>
                  <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Action</th>
                </tr>
              </thead>
              <motion.tbody variants={{ show: { transition: { staggerChildren: 0.03 } } }} initial="hidden" animate="show">
                {residents.length === 0 && (
                  <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-400 text-sm">No residents yet</td></tr>
                )}
                {residents.map((r, i) => (
                  <motion.tr key={r._id} variants={row} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-semibold text-sm ${COLORS[i % COLORS.length]}`}>
                          {r.name[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-800 text-sm">{r.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">{r.email}</td>
                    <td className="px-5 py-4 text-sm text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      <button onClick={() => navigate(`/admin/residents/${r._id}`)}
                        className="text-xs text-blue-600 hover:text-blue-700 font-medium hover:underline">
                        View Profile
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </motion.tbody>
            </table>
          )}
        </div>
      </motion.div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 w-[420px] shadow-xl"
            >
              <h2 className="text-lg font-bold text-gray-900 mb-5">Add Resident</h2>
              {formError && <p className="text-red-500 text-sm mb-3 bg-red-50 px-3 py-2 rounded-lg">{formError}</p>}
              <form onSubmit={handleSubmit} className="space-y-3">
                {[
                  { name: "name", type: "text", placeholder: "Full Name" },
                  { name: "email", type: "email", placeholder: "Email address" },
                  { name: "password", type: "password", placeholder: "Password" },
                ].map((f) => (
                  <input key={f.name} name={f.name} type={f.type} placeholder={f.placeholder}
                    value={formData[f.name]} onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
                  />
                ))}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowModal(false); setFormError(""); }}
                    className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">
                    Cancel
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
                    {submitting ? "Adding..." : "Add Resident"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
