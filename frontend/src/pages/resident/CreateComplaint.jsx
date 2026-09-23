import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Lightbulb, Clock, CheckCircle2, ImagePlus, X } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import API from "@/api/axios";

const CATEGORIES = ["Plumbing", "Electrical", "Lift", "Carpentry", "Cleaning", "AC", "Security", "Other"];

const MAX_IMAGES = 4;

// Downscale + compress an image file to a base64 JPEG data URL to keep payloads small
const compressImage = (file, maxDim = 1200, quality = 0.7) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) { height = (height * maxDim) / width; width = maxDim; }
        else if (height >= width && height > maxDim) { width = (width * maxDim) / height; height = maxDim; }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const PRIORITIES = [
  { value: "LOW",    label: "Low",    desc: "Minor issue, not urgent",         color: "border-green-300 bg-green-50 text-green-700",  active: "border-green-500 bg-green-500 text-white" },
  { value: "MEDIUM", label: "Medium", desc: "Needs attention soon",            color: "border-yellow-300 bg-yellow-50 text-yellow-700", active: "border-yellow-500 bg-yellow-500 text-white" },
  { value: "HIGH",   label: "High",   desc: "Urgent, affects daily life",      color: "border-red-300 bg-red-50 text-red-700",        active: "border-red-500 bg-red-500 text-white" },
];

export default function CreateComplaint() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: "", description: "", category: "", priority: "MEDIUM", isEmergency: false });
  const [images, setImages] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
    const room = MAX_IMAGES - images.length;
    if (room <= 0) return;
    try {
      const compressed = await Promise.all(files.slice(0, room).map((f) => compressImage(f)));
      setImages((prev) => [...prev, ...compressed]);
    } catch {
      setError("Could not process one of the images. Please try another file.");
    } finally {
      e.target.value = "";
    }
  };

  const removeImage = (index) => setImages((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.title || !form.description || !form.category) {
      setError("Title, description and category are required");
      return;
    }
    try {
      setLoading(true);
      await API.post("/complaints", { ...form, images });
      navigate("/resident/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit complaint");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }}>
        <button onClick={() => navigate("/resident/dashboard")}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-700 mb-5 transition-colors">
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Raise a Complaint</h1>
          <p className="text-sm text-gray-400 mt-1">Describe your issue and we'll get it resolved</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
              className="mb-5 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5 uppercase tracking-wide">
                Issue Title <span className="text-red-400">*</span>
              </label>
              <input name="title" type="text" value={form.title} onChange={handleChange}
                placeholder="e.g. Water leakage in kitchen sink"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition" />
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5 uppercase tracking-wide">
                Category <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {CATEGORIES.map((cat) => (
                  <button key={cat} type="button"
                    onClick={() => setForm({ ...form, category: cat })}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all
                      ${form.category === cat
                        ? "bg-blue-600 border-blue-600 text-white shadow-sm"
                        : "border-gray-200 text-gray-500 hover:border-blue-300 hover:bg-blue-50"}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5 uppercase tracking-wide">Priority</label>
              <div className="grid grid-cols-3 gap-3">
                {PRIORITIES.map((p) => (
                  <button key={p.value} type="button"
                    onClick={() => setForm({ ...form, priority: p.value })}
                    className={`py-3 px-4 rounded-xl border-2 text-left transition-all
                      ${form.priority === p.value ? p.active : p.color}`}>
                    <p className="text-sm font-semibold">{p.label}</p>
                    <p className="text-xs opacity-80 mt-0.5">{p.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            <label className={`flex gap-3 p-4 rounded-xl border cursor-pointer transition ${form.isEmergency ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-red-200"}`}>
              <input type="checkbox" checked={form.isEmergency} onChange={(e) => setForm({ ...form, isEmergency: e.target.checked })} className="mt-0.5 accent-red-600" />
              <span><span className="block text-sm font-semibold text-red-700">Emergency complaint</span><span className="block text-xs text-red-600 mt-0.5">Use only for urgent safety or major service interruptions. An admin may use emergency routing.</span></span>
            </label>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5 uppercase tracking-wide">
                Description <span className="text-red-400">*</span>
              </label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                placeholder="Describe the issue in detail — include location, duration, and any other relevant info..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300 resize-none transition" />
            </div>

            {/* Photos */}
            <div>
              <label className="text-xs font-semibold text-gray-500 block mb-1.5 uppercase tracking-wide">
                Photos <span className="text-gray-300 normal-case font-normal">(optional, up to {MAX_IMAGES})</span>
              </label>
              <div className="grid grid-cols-4 gap-3">
                {images.map((src, i) => (
                  <div key={i} className="relative group aspect-square rounded-xl overflow-hidden border border-gray-200">
                    <img src={src} alt={`attachment ${i + 1}`} className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <X size={13} />
                    </button>
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 cursor-pointer hover:border-blue-300 hover:bg-blue-50 hover:text-blue-500 transition">
                    <ImagePlus size={20} />
                    <span className="text-[11px] font-medium">Add photo</span>
                    <input type="file" accept="image/*" multiple onChange={handleFiles} className="hidden" />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">A photo helps the technician understand the issue faster.</p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => navigate("/resident/dashboard")}
                className="flex-1 py-3 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition">
                Cancel
              </button>
              <motion.button type="submit" disabled={loading}
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-sm disabled:opacity-50 flex items-center justify-center gap-2 transition">
                <Send size={15} />
                {loading ? "Submitting..." : "Submit Complaint"}
              </motion.button>
            </div>
          </form>
        </div>

        {/* Info sidebar */}
        <div className="space-y-5">
          {/* Tips */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center">
                <Lightbulb size={18} className="text-amber-500" />
              </div>
              <h2 className="font-semibold text-gray-800">Tips for a faster fix</h2>
            </div>
            <ul className="space-y-3">
              {[
                "Use a clear, specific title so it's easy to identify.",
                "Pick the right category to reach the correct technician.",
                "Add location, duration, and photos-worthy detail in the description.",
                "Set the priority honestly — it drives the response deadline.",
              ].map((tip) => (
                <li key={tip} className="flex items-start gap-2.5 text-sm text-gray-600">
                  <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* SLA guide */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                <Clock size={18} className="text-blue-600" />
              </div>
              <h2 className="font-semibold text-gray-800">Response time</h2>
            </div>
            <div className="space-y-2.5">
              {[
                { label: "High",   time: "Within 24 hours", dot: "bg-red-500" },
                { label: "Medium", time: "Within 48 hours", dot: "bg-yellow-500" },
                { label: "Low",    time: "Within 72 hours", dot: "bg-green-500" },
              ].map((s) => (
                <div key={s.label} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5">
                  <span className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                    {s.label}
                  </span>
                  <span className="text-xs text-gray-500">{s.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
}
