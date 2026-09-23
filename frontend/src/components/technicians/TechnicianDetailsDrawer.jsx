import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Bell, Calendar, CheckCircle2, Clock, Mail, Pencil, Send, Trash2, Wrench, X } from "lucide-react";
import API from "@/api/axios";

const STATUS_STYLE = {
  OPEN: "bg-orange-50 text-orange-600 border-orange-200",
  IN_PROGRESS: "bg-blue-50 text-blue-600 border-blue-200",
  RESOLVED: "bg-green-50 text-green-600 border-green-200",
  CLOSED: "bg-gray-100 text-gray-600 border-gray-200",
  REOPENED: "bg-purple-50 text-purple-600 border-purple-200",
};

function ComplaintRow({ complaint, onView }) {
  const completedAt = complaint.resolvedAt || (complaint.status === "CLOSED" ? complaint.updatedAt : null);
  return (
    <button onClick={() => onView(complaint._id)} className="w-full text-left p-3 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/40 transition">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-gray-800 truncate">{complaint.title}</p>
          <p className="text-xs text-gray-400 mt-1">{complaint.category} · {complaint.priority} · {new Date(complaint.createdAt).toLocaleDateString()}</p>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{complaint.description}</p>
          {completedAt && <p className="text-xs text-green-600 mt-1">Completed: {new Date(completedAt).toLocaleDateString()}</p>}
        </div>
        <span className={`shrink-0 px-2 py-0.5 rounded-lg text-[11px] font-medium border ${STATUS_STYLE[complaint.status] || "bg-gray-50 text-gray-500 border-gray-200"}`}>
          {complaint.status.replace("_", " ")}
        </span>
      </div>
    </button>
  );
}

const SPECIALTIES = ["Plumber", "Electrician", "Lift Technician", "AC Technician", "Carpenter", "Cleaner", "Security", "General"];
const WARNING_REASONS = ["SLA Breach", "Too Many Active Complaints", "Delayed Resolution", "Emergency Assignment", "General Warning"];

export default function TechnicianDetailsDrawer({ technicianId, onClose, onViewComplaint, onUpdated, onRemoved }) {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showWarningForm, setShowWarningForm] = useState(false);
  const [warningForm, setWarningForm] = useState({ reason: "General Warning", message: "" });
  const [sendingWarning, setSendingWarning] = useState(false);
  const [warningSuccess, setWarningSuccess] = useState("");

  useEffect(() => {
    if (!technicianId) return;
    API.get(`/users/${technicianId}/details`)
      .then((res) => setDetails(res.data))
      .catch((err) => setError(err.response?.data?.message || "Could not load technician details."))
      .finally(() => setLoading(false));
  }, [technicianId]);

  const beginEdit = () => {
    setForm({ name: details.technician.name, email: details.technician.email, specialty: details.technician.specialty || "" });
    setEditing(true);
    setError("");
  };

  const saveEdit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    try {
      const response = await API.put(`/users/${technicianId}`, form);
      setDetails((current) => ({ ...current, technician: response.data.technician }));
      onUpdated?.(response.data.technician);
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || "Could not update technician.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!window.confirm("Remove this technician? This is only possible when no complaint records reference them.")) return;
    setSaving(true);
    setError("");
    try {
      await API.delete(`/users/${technicianId}`);
      onRemoved?.(technicianId);
      onClose();
    } catch (err) {
      const data = err.response?.data;
      const active = data?.activeComplaintCount ? ` ${data.activeComplaintCount} active complaint(s) need handling.` : "";
      setError((data?.message || "Could not remove technician.") + active);
    } finally {
      setSaving(false);
    }
  };

  const sendWarning = async (event) => {
    event.preventDefault();
    if (!window.confirm(`Send a ${warningForm.reason} warning to this technician?`)) return;
    setSendingWarning(true);
    setError("");
    setWarningSuccess("");
    try {
      const response = await API.post(`/users/${technicianId}/warnings`, warningForm);
      setDetails((current) => ({
        ...current,
        warnings: [response.data.warning, ...current.warnings],
        activeWarningCount: current.activeWarningCount + 1,
      }));
      setWarningForm({ reason: "General Warning", message: "" });
      setShowWarningForm(false);
      setWarningSuccess("Warning sent successfully.");
    } catch (err) {
      setError(err.response?.data?.message || "Could not send warning.");
    } finally {
      setSendingWarning(false);
    }
  };

  return (
    <AnimatePresence>
      {technicianId && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex justify-end" onMouseDown={onClose}>
          <motion.aside initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.2 }}
            onMouseDown={(event) => event.stopPropagation()} className="h-full w-full max-w-2xl overflow-y-auto bg-white shadow-2xl p-5 sm:p-7">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Technician details</p>
                <h2 className="text-xl font-bold text-gray-900 mt-1">{details?.technician.name || "Loading technician…"}</h2>
              </div>
              <button aria-label="Close technician details" onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><X size={20} /></button>
            </div>

            {loading && <div className="space-y-4 animate-pulse"><div className="h-24 rounded-2xl bg-gray-100" /><div className="grid grid-cols-2 gap-3">{[1, 2, 3, 4].map((item) => <div key={item} className="h-20 rounded-xl bg-gray-100" />)}</div></div>}
            {error && <div className="flex gap-2 p-4 rounded-xl bg-red-50 text-red-600 text-sm"><AlertCircle size={18} />{error}</div>}

            {details && (() => {
              const { technician, apartment, stats, isAvailable, activeWarningCount, warnings, activeComplaints, recentlyCompleted, workHistory } = details;
              return <div className="space-y-5">
                <section className="rounded-2xl border border-gray-100 p-4 bg-slate-50/60">
                  <div className="flex flex-wrap items-center gap-3 mb-3">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg bg-blue-50 text-blue-600 border border-blue-100"><Wrench size={13} />{technician.specialty || "General"}</span>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-lg border ${isAvailable ? "bg-green-50 text-green-600 border-green-200" : "bg-red-50 text-red-500 border-red-200"}`}><span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? "bg-green-500" : "bg-red-400"}`} />{isAvailable ? "Available" : "Busy"}</span>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3 text-sm">
                    <p className="flex items-center gap-2 text-gray-600"><Mail size={15} className="text-gray-400" />{technician.email}</p>
                    <p className="flex items-center gap-2 text-gray-600"><Calendar size={15} className="text-gray-400" />Joined {new Date(technician.createdAt).toLocaleDateString()}</p>
                    <p className="sm:col-span-2 text-gray-600">Apartment: <span className="font-medium text-gray-800">{apartment?.name || "—"}</span>{apartment?.code ? ` (${apartment.code})` : ""}</p>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button onClick={beginEdit} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"><Pencil size={14} />Edit technician</button>
                    <button onClick={remove} disabled={saving} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 disabled:opacity-50"><Trash2 size={14} />Remove technician</button>
                  </div>
                </section>

                {editing && <form onSubmit={saveEdit} className="rounded-2xl border border-blue-100 bg-blue-50/40 p-4 space-y-3">
                  <div className="flex items-center justify-between"><h3 className="font-semibold text-gray-800">Edit technician</h3><button type="button" onClick={() => setEditing(false)} className="text-xs text-gray-500">Cancel</button></div>
                  <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Name" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                  <input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} placeholder="Email" className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                  <select value={form.specialty} onChange={(event) => setForm({ ...form, specialty: event.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"><option value="">Select specialty</option>{SPECIALTIES.map((specialty) => <option key={specialty} value={specialty}>{specialty}</option>)}</select>
                  <button type="submit" disabled={saving} className="w-full rounded-xl bg-blue-600 text-white py-2 text-sm font-medium disabled:opacity-50">{saving ? "Saving…" : "Save changes"}</button>
                </form>}

                <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    ["Total assigned", stats.totalAssigned], ["Completed", stats.totalCompleted], ["Completion rate", `${stats.completionRate}%`],
                    ["Active", stats.activeCount], ["Open", stats.openCount], ["In progress", stats.inProgressCount],
                  ].map(([label, value]) => <div key={label} className="rounded-xl border border-gray-100 p-3"><p className="text-xs text-gray-400">{label}</p><p className="text-xl font-bold text-gray-800 mt-1">{value}</p></div>)}
                </section>

                <section className={`rounded-2xl border p-4 ${stats.slaPerformance === "GOOD" ? "bg-green-50 border-green-100" : "bg-amber-50 border-amber-100"}`}>
                  <div className="flex items-center justify-between gap-3"><div><h3 className="font-semibold text-gray-800">SLA performance</h3><p className="text-xs text-gray-500 mt-1">Calculated from the technician's assigned complaint data.</p></div><span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${stats.slaPerformance === "GOOD" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{stats.slaPerformance === "GOOD" ? "Good" : "Needs attention"}</span></div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">{[["Total handled", stats.totalHandled], ["Within SLA", stats.completedWithinSLA], ["Breached", stats.slaBreached], ["Compliance", `${stats.slaCompliance}%`]].map(([label, value]) => <div key={label}><p className="text-xs text-gray-500">{label}</p><p className="text-lg font-bold text-gray-800">{value}</p></div>)}</div>
                </section>

                <section className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div><div className="flex items-center gap-2"><Bell size={17} className="text-amber-600" /><h3 className="font-semibold text-gray-800">Warnings &amp; Notifications</h3>{activeWarningCount > 0 && <span className="rounded-full bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">{activeWarningCount} active</span>}</div><p className="text-xs text-gray-500 mt-1">Admin-issued performance and workload notices.</p></div>
                    <button onClick={() => { setShowWarningForm((value) => !value); setWarningSuccess(""); }} className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-amber-600 px-3 py-2 text-xs font-medium text-white hover:bg-amber-700"><Send size={13} />Send Warning</button>
                  </div>
                  {warningSuccess && <p className="mt-3 rounded-xl bg-green-50 border border-green-100 px-3 py-2 text-sm text-green-700">{warningSuccess}</p>}
                  {showWarningForm && <form onSubmit={sendWarning} className="mt-4 space-y-3 rounded-xl border border-amber-100 bg-white p-3">
                    <select value={warningForm.reason} onChange={(event) => setWarningForm({ ...warningForm, reason: event.target.value })} className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm">{WARNING_REASONS.map((reason) => <option key={reason} value={reason}>{reason}</option>)}</select>
                    <textarea value={warningForm.message} onChange={(event) => setWarningForm({ ...warningForm, message: event.target.value })} rows={3} maxLength={1000} placeholder="Optional details for the technician" className="w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm" />
                    <div className="flex gap-2"><button type="button" onClick={() => setShowWarningForm(false)} className="flex-1 rounded-xl border border-gray-200 py-2 text-sm text-gray-600">Cancel</button><button disabled={sendingWarning} className="flex-1 rounded-xl bg-amber-600 py-2 text-sm font-medium text-white disabled:opacity-50">{sendingWarning ? "Sending…" : "Confirm & send"}</button></div>
                  </form>}
                  <div className="mt-4 space-y-2">
                    {warnings.length ? warnings.map((warning) => <div key={warning._id} className="rounded-xl border border-amber-100 bg-white p-3"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold text-gray-800">{warning.reason}</p>{warning.message && <p className="mt-1 text-xs text-gray-600 whitespace-pre-wrap">{warning.message}</p>}<p className="mt-2 text-xs text-gray-400">Issued {new Date(warning.createdAt).toLocaleString()} by {warning.issuedBy?.name || "Admin"}</p></div><span className={`shrink-0 rounded-lg px-2 py-0.5 text-[11px] font-medium ${warning.isActive ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-500"}`}>{warning.isActive ? "Active" : "Closed"}</span></div></div>) : <p className="rounded-xl border border-dashed border-amber-200 bg-white p-4 text-sm text-gray-400">No warnings have been issued for this technician.</p>}
                  </div>
                </section>

                <section>
                  <h3 className="font-semibold text-gray-800 mb-2">Currently active complaints</h3>
                  <div className="space-y-2">{activeComplaints.length ? activeComplaints.map((complaint) => <ComplaintRow key={complaint._id} complaint={complaint} onView={onViewComplaint} />) : <p className="text-sm text-gray-400 p-4 border border-dashed rounded-xl">No active complaints.</p>}</div>
                </section>
                <section>
                  <h3 className="font-semibold text-gray-800 mb-2">Recently completed</h3>
                  <div className="space-y-2">{recentlyCompleted.length ? recentlyCompleted.map((complaint) => <ComplaintRow key={complaint._id} complaint={complaint} onView={onViewComplaint} />) : <p className="text-sm text-gray-400 p-4 border border-dashed rounded-xl">No completed complaints yet.</p>}</div>
                </section>
                <section>
                  <h3 className="font-semibold text-gray-800 mb-2">Full work history <span className="text-sm font-normal text-gray-400">({workHistory.length})</span></h3>
                  <div className="space-y-2">{workHistory.length ? workHistory.map((complaint) => <ComplaintRow key={complaint._id} complaint={complaint} onView={onViewComplaint} />) : <p className="text-sm text-gray-400 p-4 border border-dashed rounded-xl">No work history yet.</p>}</div>
                </section>
              </div>;
            })()}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
