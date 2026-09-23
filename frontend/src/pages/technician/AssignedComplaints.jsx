import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, AlertTriangle, Mail, ImagePlus, X } from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import API from "@/api/axios";

// Downscale + compress an image file to a base64 JPEG data URL
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

const STATUS_STYLE = {
  IN_PROGRESS: "bg-blue-50 text-blue-600 border border-blue-200",
  RESOLVED:    "bg-green-50 text-green-600 border border-green-200",
  CLOSED:      "bg-gray-100 text-gray-500 border border-gray-200",
};

const PRIORITY_BORDER = { HIGH: "border-l-red-400", MEDIUM: "border-l-yellow-400", LOW: "border-l-green-400" };

const FILTERS = ["ALL", "IN_PROGRESS", "RESOLVED", "CLOSED"];

const card = { hidden: { opacity: 0, y: 0 }, show: { opacity: 1, y: 0 } };

export default function AssignedComplaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("ALL");
  const [resolveModal, setResolveModal] = useState(null);
  const [resolving, setResolving] = useState(false);
  const [beforeImg, setBeforeImg] = useState(null);
  const [afterImg, setAfterImg] = useState(null);

  useEffect(() => {
    API.get("/complaints?limit=100")
      .then((res) => setComplaints(res.data.data))
      .finally(() => setLoading(false));
  }, []);

  const closeResolve = () => {
    setResolveModal(null);
    setBeforeImg(null);
    setAfterImg(null);
  };

  const handleProofFile = (setter) => async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    try {
      setter(await compressImage(file));
    } catch {
      alert("Could not process that image. Please try another file.");
    } finally {
      e.target.value = "";
    }
  };

  const handleResolve = async () => {
    try {
      setResolving(true);
      const res = await API.put(`/complaints/${resolveModal._id}/resolve`, {
        beforeImage: beforeImg || undefined,
        afterImage: afterImg || undefined,
      });
      setComplaints((prev) => prev.map((c) => (c._id === resolveModal._id ? res.data.complaint : c)));
      closeResolve();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to resolve");
    } finally {
      setResolving(false);
    }
  };

  const filtered = activeFilter === "ALL" ? complaints : complaints.filter((c) => c.status === activeFilter);
  const now = new Date();

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">All Tasks</h1>
          <p className="text-sm text-gray-400 mt-1">{complaints.length} tasks in total</p>
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
          <motion.div variants={{ show: { transition: { staggerChildren: 0.03 } } }} initial="hidden" animate="show" className="space-y-3">
            {filtered.length === 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-400 text-sm">
                No tasks in this category
              </div>
            )}
            {filtered.map((c) => {
              const slaBreached = c.slaDeadline && now > new Date(c.slaDeadline);
              return (
                <motion.div key={c._id} variants={card}
                  className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 border-l-4 ${PRIORITY_BORDER[c.priority] || "border-l-gray-200"}`}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-gray-800 text-sm">{c.title}</h3>
                        <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${STATUS_STYLE[c.status] || "bg-gray-100 text-gray-500"}`}>
                          {c.status.replace("_", " ")}
                        </span>
                        {slaBreached && c.status === "IN_PROGRESS" && (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-lg text-xs font-medium bg-red-50 text-red-500 border border-red-200">
                            <AlertTriangle size={11} /> SLA Breached
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400 mb-2 line-clamp-2">{c.description}</p>

                      {/* Raised by (resident) */}
                      {c.createdBy && (
                        <div className="flex items-center gap-2.5 mb-2.5 bg-slate-50 rounded-xl px-3 py-2 w-fit">
                          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-semibold flex items-center justify-center shrink-0">
                            {c.createdBy.name?.[0]?.toUpperCase()}
                          </div>
                          <div className="leading-tight">
                            <p className="text-[11px] text-gray-400">Raised by</p>
                            <p className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                              {c.createdBy.name}
                              {c.createdBy.email && (
                                <span className="text-gray-400 font-normal flex items-center gap-1">
                                  <Mail size={10} /> {c.createdBy.email}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-4 text-xs text-gray-400 flex-wrap">
                        <span>Category: <span className="text-gray-600">{c.category}</span></span>
                        <span>Priority: <span className="text-gray-600">{c.priority}</span></span>
                        {c.slaDeadline && (
                          <span>SLA: <span className={slaBreached ? "text-red-500 font-medium" : "text-gray-600"}>
                            {new Date(c.slaDeadline).toLocaleDateString()}
                          </span></span>
                        )}
                        {c.resolvedAt && (
                          <span>Resolved: <span className="text-gray-600">{new Date(c.resolvedAt).toLocaleDateString()}</span></span>
                        )}
                      </div>
                      {c.images?.length > 0 && (
                        <div className="flex gap-2 mt-3">
                          {c.images.map((src, i) => (
                            <a key={i} href={src} target="_blank" rel="noopener noreferrer"
                              className="w-16 h-16 rounded-lg overflow-hidden border border-gray-100 hover:opacity-90 transition">
                              <img src={src} alt={`attachment ${i + 1}`} className="w-full h-full object-cover" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                    {c.status === "IN_PROGRESS" && (
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        onClick={() => setResolveModal(c)}
                        className="flex-shrink-0 flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-xl text-xs font-medium hover:bg-green-700 shadow-sm">
                        <CheckCircle2 size={14} /> Mark Resolved
                      </motion.button>
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
              className="bg-white rounded-2xl p-6 w-[440px] shadow-xl">
              <div className="w-12 h-12 rounded-2xl bg-green-50 flex items-center justify-center mb-4">
                <CheckCircle2 size={24} className="text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Mark as Resolved</h2>
              <p className="text-sm text-gray-500 mb-5">"{resolveModal.title}"</p>

              {/* Completion proof photos */}
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
                Completion proof <span className="text-gray-300 normal-case font-normal">(optional)</span>
              </p>
              <div className="grid grid-cols-2 gap-3 mb-5">
                {[
                  { label: "Before", img: beforeImg, set: setBeforeImg },
                  { label: "After (work done)", img: afterImg, set: setAfterImg },
                ].map(({ label, img, set }) => (
                  <div key={label}>
                    <p className="text-[11px] text-gray-400 mb-1.5">{label}</p>
                    {img ? (
                      <div className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                        <img src={img} alt={label} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => set(null)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center">
                          <X size={13} />
                        </button>
                      </div>
                    ) : (
                      <label className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 cursor-pointer hover:border-green-300 hover:bg-green-50 hover:text-green-600 transition">
                        <ImagePlus size={20} />
                        <span className="text-[11px] font-medium">Add photo</span>
                        <input type="file" accept="image/*" onChange={handleProofFile(set)} className="hidden" />
                      </label>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={closeResolve}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
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
