import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Calendar } from "lucide-react";
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

const row = { hidden: { opacity: 0, y: 0 }, show: { opacity: 1, y: 0 } };

export default function ResidentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resident, setResident] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get(`/users/${id}`)
      .then((res) => { setResident(res.data.user); setComplaints(res.data.complaints); })
      .catch(() => setError("Failed to load resident"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <DashboardLayout>
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-32 bg-gray-100 rounded-xl" />
        <div className="h-40 bg-white rounded-2xl" />
        <div className="h-64 bg-white rounded-2xl" />
      </div>
    </DashboardLayout>
  );

  if (error || !resident) return (
    <DashboardLayout><p className="text-red-500">{error || "Not found"}</p></DashboardLayout>
  );

  const total      = complaints.length;
  const open       = complaints.filter((c) => c.status === "OPEN").length;
  const inProgress = complaints.filter((c) => c.status === "IN_PROGRESS").length;
  const resolved   = complaints.filter((c) => ["RESOLVED", "CLOSED"].includes(c.status)).length;

  const stats = [
    { label: "Total",       value: total,      color: "text-blue-600",   bg: "bg-blue-50" },
    { label: "Open",        value: open,       color: "text-orange-500", bg: "bg-orange-50" },
    { label: "In Progress", value: inProgress, color: "text-yellow-500", bg: "bg-yellow-50" },
    { label: "Resolved",    value: resolved,   color: "text-green-600",  bg: "bg-green-50" },
  ];

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
        <button onClick={() => navigate("/admin/residents")}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 mb-5 transition-colors">
          <ArrowLeft size={16} /> Back to Residents
        </button>

        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5 flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-sm">
            {resident.name[0].toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{resident.name}</h1>
            <div className="flex items-center gap-4 mt-1.5 text-sm text-gray-400">
              <span className="flex items-center gap-1.5"><Mail size={14} />{resident.email}</span>
              <span className="flex items-center gap-1.5"><Calendar size={14} />Joined {new Date(resident.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
          <span className="bg-purple-50 text-purple-600 border border-purple-200 px-3 py-1 rounded-lg text-xs font-medium">Resident</span>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-5">
          {stats.map((s, i) => (
            <motion.div key={s.label}
              initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4"
            >
              <p className="text-xs text-gray-400 font-medium">{s.label}</p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Complaints table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-800">Complaint History</h3>
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Title</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Category</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Priority</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
                <th className="px-5 py-3.5 text-xs font-semibold text-gray-400 uppercase tracking-wide">Action</th>
              </tr>
            </thead>
            <motion.tbody variants={{ show: { transition: { staggerChildren: 0.03 } } }} initial="hidden" animate="show">
              {complaints.length === 0 && (
                <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400 text-sm">No complaints raised yet</td></tr>
              )}
              {complaints.map((c) => (
                <motion.tr key={c._id} variants={row} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-800 text-sm max-w-[180px] truncate">{c.title}</td>
                  <td className="px-5 py-4 text-sm text-gray-500">{c.category}</td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${PRIORITY_STYLE[c.priority]}`}>{c.priority}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${STATUS_STYLE[c.status]}`}>
                      {c.status.replace("_", " ")}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-sm text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4">
                    <button onClick={() => navigate(`/admin/complaints/${c._id}`)}
                      className="text-xs text-blue-600 hover:underline font-medium">View</button>
                  </td>
                </motion.tr>
              ))}
            </motion.tbody>
          </table>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
