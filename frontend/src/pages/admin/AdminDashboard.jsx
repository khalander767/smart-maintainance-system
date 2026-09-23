import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import {
  ClipboardList, Clock, CheckCircle2, RefreshCw,
  TrendingUp, ShieldCheck, ChevronRight,
} from "lucide-react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import API from "@/api/axios";

const STATUS_STYLE = {
  OPEN:        "bg-orange-50 text-orange-600 border border-orange-200",
  IN_PROGRESS: "bg-blue-50 text-blue-600 border border-blue-200",
  CLOSED:      "bg-gray-100 text-gray-500 border border-gray-200",
  REOPENED:    "bg-purple-50 text-purple-600 border border-purple-200",
};

const PRIORITY_STYLE = {
  HIGH:   "bg-red-50 text-red-500 border border-red-200",
  MEDIUM: "bg-yellow-50 text-yellow-600 border border-yellow-200",
  LOW:    "bg-green-50 text-green-600 border border-green-200",
};

const CATEGORY_COLORS = [
  "#3b82f6", "#f59e0b", "#8b5cf6", "#f97316",
  "#22c55e", "#06b6d4", "#ef4444", "#6b7280",
];

const STAT_CARDS = [
  { key: "total",       label: "Total Complaints", icon: ClipboardList, bg: "bg-blue-50",   text: "text-blue-600",   border: "border-blue-100" },
  { key: "OPEN",        label: "Open",             icon: Clock,         bg: "bg-orange-50", text: "text-orange-500", border: "border-orange-100" },
  { key: "IN_PROGRESS", label: "In Progress",      icon: RefreshCw,     bg: "bg-yellow-50", text: "text-yellow-500", border: "border-yellow-100" },
  { key: "CLOSED",      label: "Closed",           icon: CheckCircle2,  bg: "bg-green-50",  text: "text-green-600",  border: "border-green-100" },
  { key: "REOPENED",    label: "Reopened",         icon: RefreshCw,     bg: "bg-purple-50", text: "text-purple-600", border: "border-purple-100" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.03 } } };
const item      = { hidden: { opacity: 0, y: 0 }, show: { opacity: 1, y: 0, transition: { duration: 0.15 } } };

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl shadow-lg px-4 py-2.5 text-sm">
        <p className="text-gray-500 mb-1">{label}</p>
        <p className="font-semibold text-blue-600">{payload[0].value} complaints</p>
      </div>
    );
  }
  return null;
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/complaints/admin/dashboard")
      .then((res) => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  const getValue = (key) => {
    if (!data) return 0;
    if (key === "total") return data.total;
    return data.statusCounts[key] ?? 0;
  };

  if (loading) return (
    <DashboardLayout>
      <div className="space-y-4 animate-pulse">
        <div className="grid grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-28 bg-white rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 h-64 bg-white rounded-2xl" />
          <div className="h-64 bg-white rounded-2xl" />
        </div>
      </div>
    </DashboardLayout>
  );

  const slaCompliance = parseFloat(data?.slaCompliance || 100);

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.15 }}>

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-sm text-gray-400 mt-1">Live analytics for your apartment</p>
        </div>

        {/* ROW 1 — Stat Cards */}
        <motion.div variants={container} initial="hidden" animate="show"
          className="grid grid-cols-5 gap-4 mb-5">
          {STAT_CARDS.map((card) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.key} variants={item}
                whileHover={{ y: -3, transition: { duration: 0.2 } }}
                className={`bg-white rounded-2xl border ${card.border} shadow-sm p-5`}>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm text-gray-500 font-medium">{card.label}</span>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${card.bg}`}>
                    <Icon size={18} className={card.text} />
                  </div>
                </div>
                <p className={`text-3xl font-bold ${card.text}`}>{getValue(card.key)}</p>
                {data?.total > 0 && (
                  <div className="mt-3 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${card.bg.replace("50", "400")}`}
                      style={{ width: `${Math.round((getValue(card.key) / data.total) * 100)}%` }}
                    />
                  </div>
                )}
              </motion.div>
            );
          })}
        </motion.div>

        {/* ROW 2 — Weekly Trend + Category Donut */}
        <div className="grid grid-cols-3 gap-5 mb-5">
          {/* Weekly Trend */}
          <motion.div initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-gray-800">Weekly Trend</h3>
                <p className="text-xs text-gray-400 mt-0.5">Complaints raised in the last 7 days</p>
              </div>
              <TrendingUp size={18} className="text-blue-500" />
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data?.weeklyTrend || []}>
                <defs>
                  <linearGradient id="blueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2.5}
                  fill="url(#blueGrad)" dot={{ fill: "#3b82f6", r: 4 }} activeDot={{ r: 6 }} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category Donut */}
          <motion.div initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-800">By Category</h3>
              <p className="text-xs text-gray-400 mt-0.5">Complaint distribution</p>
            </div>
            {data?.categoryBreakdown?.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={data.categoryBreakdown} cx="50%" cy="50%"
                      innerRadius={45} outerRadius={70} dataKey="count" paddingAngle={3}>
                      {data.categoryBreakdown.map((_, i) => (
                        <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(val, name) => [`${val} complaints`, name]} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-2">
                  {data.categoryBreakdown.slice(0, 4).map((cat, i) => (
                    <div key={cat.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} />
                        <span className="text-gray-600">{cat.name}</span>
                      </div>
                      <span className="font-medium text-gray-800">{cat.count}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-gray-400 text-center mt-8">No data yet</p>
            )}
          </motion.div>
        </div>

        {/* ROW 3 — Technician Performance + SLA */}
        <div className="grid grid-cols-3 gap-5 mb-5">
          {/* Technician Table */}
          <motion.div initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-800">Technician Performance</h3>
              <p className="text-xs text-gray-400 mt-0.5">Assigned vs completed by each technician</p>
            </div>
            {data?.technicianStats?.length > 0 ? (
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50 bg-gray-50/60">
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Technician</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Assigned</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Completed</th>
                    <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data.technicianStats.map((t, i) => {
                    const rate = t.assigned > 0 ? Math.round((t.resolved / t.assigned) * 100) : 0;
                    return (
                      <tr key={i} className="border-b border-gray-50 hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs">
                              {t.name?.[0]?.toUpperCase()}
                            </div>
                            <span className="text-sm font-medium text-gray-800">{t.name}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-600">{t.assigned}</td>
                        <td className="px-5 py-3 text-sm text-gray-600">{t.resolved}</td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-green-500 rounded-full" style={{ width: `${rate}%` }} />
                            </div>
                            <span className={`text-xs font-semibold ${rate >= 70 ? "text-green-600" : rate >= 40 ? "text-yellow-600" : "text-red-500"}`}>
                              {rate}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <p className="px-5 py-8 text-sm text-gray-400">No technicians assigned yet</p>
            )}
          </motion.div>

          {/* SLA Compliance */}
          <motion.div initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
            <div className="mb-4">
              <h3 className="font-semibold text-gray-800">SLA Compliance</h3>
              <p className="text-xs text-gray-400 mt-0.5">Complaints resolved within SLA</p>
            </div>

            {/* Big number */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <div className={`text-5xl font-bold mb-1 ${slaCompliance >= 70 ? "text-green-600" : slaCompliance >= 50 ? "text-yellow-500" : "text-red-500"}`}>
                {slaCompliance}%
              </div>
              <p className={`text-sm font-medium mb-6 ${slaCompliance >= 70 ? "text-green-500" : slaCompliance >= 50 ? "text-yellow-500" : "text-red-400"}`}>
                {slaCompliance >= 70 ? "Good" : slaCompliance >= 50 ? "Needs Attention" : "Critical"}
              </p>

              {/* Progress bar */}
              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden mb-5">
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${slaCompliance}%` }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className={`h-full rounded-full ${slaCompliance >= 70 ? "bg-green-500" : slaCompliance >= 50 ? "bg-yellow-400" : "bg-red-500"}`}
                />
              </div>

              {/* Stats */}
              <div className="w-full grid grid-cols-2 gap-3">
                <div className="bg-green-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-green-600">{data?.total - data?.slaBreached}</p>
                  <p className="text-xs text-green-500 mt-0.5">On Time</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-red-500">{data?.slaBreached}</p>
                  <p className="text-xs text-red-400 mt-0.5">Breached</p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400">
              <ShieldCheck size={13} />
              Auto-updated every refresh
            </div>
          </motion.div>
        </div>

        {/* ROW 4 — Recent Complaints */}
        <motion.div initial={{ opacity: 0, y: 0 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-800">Recent Complaints</h3>
              <p className="text-xs text-gray-400 mt-0.5">Latest 5 complaints raised</p>
            </div>
            <button onClick={() => navigate("/admin/complaints")}
              className="flex items-center gap-1 text-xs text-blue-600 hover:underline font-medium">
              View All <ChevronRight size={14} />
            </button>
          </div>

          {data?.recentComplaints?.length > 0 ? (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/60">
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Title</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Raised By</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Category</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Priority</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Status</th>
                  <th className="px-5 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">Date</th>
                </tr>
              </thead>
              <tbody>
                {data.recentComplaints.map((c) => (
                  <tr key={c._id}
                    onClick={() => navigate(`/admin/complaints/${c._id}`)}
                    className="border-b border-gray-50 hover:bg-slate-50 transition-colors cursor-pointer">
                    <td className="px-5 py-3 font-medium text-gray-800 text-sm max-w-[180px] truncate">{c.title}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{c.createdBy || "—"}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{c.category}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${PRIORITY_STYLE[c.priority]}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${STATUS_STYLE[c.status]}`}>
                        {c.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="px-5 py-8 text-sm text-gray-400">No complaints yet</p>
          )}
        </motion.div>

      </motion.div>
    </DashboardLayout>
  );
}
