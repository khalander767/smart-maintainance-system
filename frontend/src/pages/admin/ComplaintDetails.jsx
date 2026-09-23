import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Calendar, User, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
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

const CATEGORY_SPECIALTY = {
  Plumbing: "Plumber", Electrical: "Electrician", Lift: "Lift Technician", AC: "AC Technician",
  Carpentry: "Carpenter", Cleaning: "Cleaner", Security: "Security", Other: "General",
};

function InfoRow({ icon: Icon, label, value, valueClass = "" }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
        <Icon size={15} className="text-gray-400" />
      </div>
      <div>
        <p className="text-xs text-gray-400 mb-0.5">{label}</p>
        <p className={`text-sm font-medium text-gray-800 ${valueClass}`}>{value || "—"}</p>
      </div>
    </div>
  );
}

export default function ComplaintDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedTech, setSelectedTech] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    Promise.all([API.get(`/complaints/${id}`), API.get("/users?role=TECHNICIAN")])
      .then(([cRes, tRes]) => { setComplaint(cRes.data); setTechnicians(tRes.data); })
      .catch(() => setError("Failed to load complaint"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAssign = async () => {
    if (!selectedTech) return;
    const technician = technicians.find((item) => item._id === selectedTech);
    const allTechniciansBusy = technicians.length > 0 && technicians.every((item) => !item.isAvailable);
    const requiresOverride = complaint.isEmergency && (
      technician?.specialty !== CATEGORY_SPECIALTY[complaint.category] || (allTechniciansBusy && !technician?.isAvailable)
    );
    if (requiresOverride && !window.confirm(`Emergency override: assign ${technician.name} despite the specialty or all-busy warning?`)) return;
    try {
      setAssigning(true);
      const res = await API.put(`/complaints/${id}/assign`, { technicianId: selectedTech, emergencyOverride: requiresOverride });
      setComplaint(res.data.complaint);
      setSelectedTech("");
    } catch (err) {
      alert(err.response?.data?.message || "Failed to assign");
    } finally {
      setAssigning(false);
    }
  };

  if (loading) return (
    <DashboardLayout>
      <div className="space-y-4 animate-pulse">
        <div className="h-8 w-32 bg-gray-100 rounded-xl" />
        <div className="h-64 bg-white rounded-2xl" />
      </div>
    </DashboardLayout>
  );

  if (error || !complaint) return (
    <DashboardLayout>
      <p className="text-red-500">{error || "Complaint not found"}</p>
    </DashboardLayout>
  );

  const canAssign = ["OPEN", "REOPENED"].includes(complaint.status);
  const slaBreached = complaint.slaDeadline && new Date() > new Date(complaint.slaDeadline);

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
        {/* Back button */}
        <button onClick={() => navigate("/admin/complaints")}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 mb-5 transition-colors">
          <ArrowLeft size={16} /> Back to Complaints
        </button>

        <div className="grid grid-cols-3 gap-5">
          {/* LEFT — main details */}
          <div className="col-span-2 space-y-4">
            {/* Title card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start justify-between gap-4 mb-4">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">{complaint.title}</h1>
                <div className="flex gap-2 flex-shrink-0">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${STATUS_STYLE[complaint.status]}`}>
                    {complaint.status.replace("_", " ")}
                  </span>
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${PRIORITY_STYLE[complaint.priority]}`}>
                    {complaint.priority}
                  </span>
                  {complaint.isEmergency && <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-200">EMERGENCY</span>}
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">{complaint.description}</p>
            </div>

            {/* Attached photos (from resident) */}
            {complaint.images?.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Attached Photos</h3>
                <div className="grid grid-cols-3 gap-3">
                  {complaint.images.map((src, i) => (
                    <a key={i} href={src} target="_blank" rel="noopener noreferrer"
                      className="block aspect-square rounded-xl overflow-hidden border border-gray-100 hover:opacity-90 transition">
                      <img src={src} alt={`attachment ${i + 1}`} className="w-full h-full object-cover" />
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Details card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Details</h3>
              <InfoRow icon={User}         label="Raised By"    value={complaint.createdBy?.name} />
              <InfoRow icon={Clock}        label="Category"     value={complaint.category} />
              <InfoRow icon={Calendar}     label="Raised On"    value={new Date(complaint.createdAt).toLocaleString()} />
              <InfoRow
                icon={AlertTriangle}
                label="SLA Deadline"
                value={complaint.slaDeadline ? new Date(complaint.slaDeadline).toLocaleString() : null}
                valueClass={slaBreached ? "text-red-500" : ""}
              />
              {complaint.resolvedAt && (
                <InfoRow icon={CheckCircle2} label="Resolved At" value={new Date(complaint.resolvedAt).toLocaleString()} />
              )}
              {complaint.reopenedCount > 0 && (
                <InfoRow icon={Clock} label="Reopened" value={`${complaint.reopenedCount} time(s)`} valueClass="text-purple-600" />
              )}
            </div>

            {/* SLA breach banner */}
            {complaint.isSLABreached && (
              <div className="bg-red-50 border border-red-100 rounded-2xl px-5 py-4 flex items-center gap-3">
                <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
                <p className="text-sm text-red-600 font-medium">SLA has been breached for this complaint</p>
              </div>
            )}

            {/* Proof images */}
            {(complaint.proofImages?.before || complaint.proofImages?.after) && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-sm font-semibold text-gray-700 mb-4">Proof Images</h3>
                <div className="grid grid-cols-2 gap-4">
                  {complaint.proofImages.before && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2">Before</p>
                      <img src={complaint.proofImages.before} alt="before" className="w-full h-44 object-cover rounded-xl" />
                    </div>
                  )}
                  {complaint.proofImages.after && (
                    <div>
                      <p className="text-xs text-gray-400 mb-2">After</p>
                      <img src={complaint.proofImages.after} alt="after" className="w-full h-44 object-cover rounded-xl" />
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT — assignment */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Assigned Technician</h3>

              {complaint.assignedTo ? (
                <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 rounded-xl">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                    {complaint.assignedTo.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">{complaint.assignedTo.name}</p>
                    <p className="text-xs text-gray-400">{complaint.assignedTo.email}</p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-xl text-center mb-4">
                  <p className="text-xs text-gray-400 italic">No technician assigned yet</p>
                </div>
              )}

              {canAssign && (
                <>
                  {complaint.isEmergency && <p className="mb-3 rounded-xl bg-red-50 border border-red-100 p-3 text-xs text-red-700">Emergency routing may override specialty only after confirmation. A busy technician can be overridden only when all technicians are busy.</p>}
                  <p className="text-xs text-gray-400 mb-2">
                    {complaint.assignedTo ? "Reassign to a different technician:" : "Select a technician to assign:"}
                  </p>
                  <select value={selectedTech} onChange={(e) => setSelectedTech(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-blue-100">
                    <option value="">— Select —</option>
                    {technicians.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                  </select>
                  <button onClick={handleAssign} disabled={!selectedTech || assigning}
                    className="w-full py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors">
                    {assigning ? "Assigning..." : complaint.assignedTo ? "Reassign" : "Assign Technician"}
                  </button>
                </>
              )}
            </div>

            {complaint.autoCloseAt && complaint.status === "RESOLVED" && (
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                <p className="text-xs text-amber-600 font-medium">Auto-closes on</p>
                <p className="text-sm text-amber-700 mt-1">{new Date(complaint.autoCloseAt).toLocaleString()}</p>
                <p className="text-xs text-amber-500 mt-1">if not reopened by resident</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
