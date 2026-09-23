import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight, Activity, Bell, Clock, ShieldCheck, Camera, History,
  Users, UserCog, HardHat, Zap, CheckCircle2,
} from "lucide-react";
import buildingImg from "@/assets/login_image_real.jpg";
import logoIcon from "@/assets/logo-icon.png";

const NAV_LINKS = [
  { id: "features", label: "Features" },
  { id: "how",      label: "How it works" },
  { id: "roles",    label: "For everyone" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };

const FEATURES = [
  { icon: Activity,    tint: "bg-blue-100 text-blue-600",       title: "Real-time Tracking",  desc: "Watch every request move from raised to resolved, live." },
  { icon: Zap,         tint: "bg-amber-100 text-amber-600",     title: "Smart Assignment",    desc: "Route complaints to the right technician by category." },
  { icon: Clock,       tint: "bg-emerald-100 text-emerald-600", title: "SLA Deadlines",       desc: "Priority-based time limits so nothing slips through." },
  { icon: Bell,        tint: "bg-violet-100 text-violet-600",   title: "Instant Alerts",      desc: "Stay notified the moment something changes." },
  { icon: Camera,      tint: "bg-pink-100 text-pink-600",       title: "Photo Evidence",      desc: "Attach photos so issues are understood at a glance." },
  { icon: History,     tint: "bg-cyan-100 text-cyan-600",       title: "Full Audit Trail",    desc: "A clear, timestamped history of every action." },
];

const ROLES = [
  { icon: Users,   tint: "bg-purple-100 text-purple-600", title: "Residents",   points: ["Raise complaints in seconds", "Attach photos of the issue", "Track status & reopen if needed"] },
  { icon: UserCog, tint: "bg-blue-100 text-blue-600",     title: "Admins",      points: ["Assign technicians by category", "Monitor SLA compliance", "View live analytics & reports"] },
  { icon: HardHat, tint: "bg-orange-100 text-orange-600", title: "Technicians", points: ["See assigned tasks at a glance", "Track SLA warnings", "Resolve with before/after proof"] },
];

const STEPS = [
  { n: "1", title: "Resident raises a request", desc: "Describe the issue, set a priority, and attach a photo." },
  { n: "2", title: "Admin assigns a technician", desc: "The right specialist is assigned and an SLA clock starts." },
  { n: "3", title: "Technician resolves it",     desc: "Work gets done, proof is uploaded, the resident is notified." },
];

const STATS = [
  { value: "98%",  label: "Resolved within SLA" },
  { value: "2.4h", label: "Average response time" },
  { value: "12k+", label: "Requests handled" },
  { value: "8",    label: "Service categories" },
];

export default function Landing() {
  const navigate = useNavigate();
  const [active, setActive] = useState("");

  // Highlight the nav link for whichever section is currently in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    NAV_LINKS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const handleNav = (id) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-slate-800">
      {/* NAVBAR */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-white/70 border-b border-white/60">
        <nav className="max-w-[1400px] mx-auto px-8 lg:px-12 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logoIcon} alt="AptCare" className="h-9 w-9 object-contain" />
            <span className="text-lg font-bold text-slate-800">AptCare</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {NAV_LINKS.map(({ id, label }) => (
              <button key={id} onClick={() => handleNav(id)}
                className={`relative py-1 transition-colors ${active === id ? "text-blue-600" : "text-slate-600 hover:text-blue-600"}`}>
                {label}
                {active === id && (
                  <motion.span layoutId="nav-underline"
                    className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }} />
                )}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/login")}
              className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition">Sign in</button>
            <button onClick={() => navigate("/register")}
              className="text-sm font-semibold bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition">
              Get Started
            </button>
          </div>
        </nav>
      </header>

      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* orbs */}
        <motion.div aria-hidden className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-blue-300/30 blur-3xl"
          animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }} />
        <motion.div aria-hidden className="pointer-events-none absolute top-10 -right-32 h-[26rem] w-[26rem] rounded-full bg-indigo-300/30 blur-3xl"
          animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 1 }} />

        <div className="relative max-w-[1400px] mx-auto px-8 lg:px-12 py-20 grid lg:grid-cols-2 gap-12 items-center">
          <motion.div variants={stagger} initial="hidden" animate="show">
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full bg-blue-100/70 text-blue-700 text-xs font-semibold ring-1 ring-blue-200">
              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
              Smart building maintenance, simplified
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-4xl sm:text-5xl xl:text-6xl font-bold leading-[1.1] text-slate-900">
              Maintenance,{" "}
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">made effortless.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="mt-5 text-lg text-slate-500 leading-relaxed max-w-lg">
              AptCare brings residents, admins, and technicians onto one platform — raise a request,
              auto-assign the right person, and track it to resolution with full transparency.
            </motion.p>
            <motion.div variants={fadeUp} className="mt-8 flex flex-wrap gap-3">
              <button onClick={() => navigate("/register")}
                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3.5 rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition">
                Register your apartment <ArrowRight size={16} />
              </button>
              <button onClick={() => navigate("/register/resident")}
                className="flex items-center gap-2 bg-white text-slate-700 px-6 py-3.5 rounded-xl text-sm font-semibold hover:bg-slate-50 ring-1 ring-slate-200 transition">
                I'm a resident
              </button>
            </motion.div>
            <motion.p variants={fadeUp} className="mt-4 text-xs text-slate-400">
              Already have an account?{" "}
              <span onClick={() => navigate("/login")} className="text-blue-600 font-semibold cursor-pointer hover:underline">Sign in</span>
            </motion.p>
          </motion.div>

          {/* Dashboard illustration */}
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.2 }}
            className="relative">
            {/* floating shield */}
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -top-4 -right-3 z-20 w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <ShieldCheck size={22} className="text-white" />
            </motion.div>

            {/* floating "resolved" toast */}
            <motion.div
              initial={{ opacity: 0, x: 20, y: 10 }} animate={{ opacity: 1, x: 0, y: [0, -8, 0] }}
              transition={{ opacity: { delay: 1.2 }, x: { delay: 1.2 }, y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1.2 } }}
              className="absolute -bottom-5 -left-4 z-20 flex items-center gap-2.5 bg-white rounded-2xl shadow-xl shadow-blue-900/10 ring-1 ring-black/5 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 size={16} className="text-green-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-800">Complaint resolved</p>
                <p className="text-[11px] text-slate-400">within SLA · just now</p>
              </div>
            </motion.div>

            <div className="rounded-3xl bg-white ring-1 ring-blue-100 shadow-2xl shadow-blue-900/15 p-5">
              {/* header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-bold text-slate-800">Maintenance Overview</p>
                  <p className="text-[11px] text-slate-400">This week</p>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] font-semibold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Live
                </span>
              </div>

              {/* stat tiles */}
              <div className="grid grid-cols-3 gap-2.5 mb-4">
                {[
                  { label: "Open", value: 12, tint: "bg-orange-50 text-orange-600" },
                  { label: "In Progress", value: 7, tint: "bg-blue-50 text-blue-600" },
                  { label: "Resolved", value: 89, tint: "bg-green-50 text-green-600" },
                ].map((t, i) => (
                  <motion.div key={t.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.12 }}
                    className={`rounded-xl px-3 py-2.5 ${t.tint}`}>
                    <p className="text-xl font-bold leading-none">{t.value}</p>
                    <p className="text-[10px] mt-1 opacity-80">{t.label}</p>
                  </motion.div>
                ))}
              </div>

              {/* line chart */}
              <div className="rounded-xl bg-slate-50 p-4 mb-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[11px] font-semibold text-slate-600">Requests this week</p>
                  <p className="text-[10px] text-slate-400">+18%</p>
                </div>
                <svg viewBox="0 0 120 40" className="w-full h-16">
                  <motion.polygon fill="url(#lg)" points="0,32 20,24 40,28 60,14 80,20 100,8 120,12 120,40 0,40"
                    initial={{ opacity: 0 }} animate={{ opacity: 0.2 }} transition={{ delay: 1.4, duration: 0.6 }} />
                  <motion.polyline fill="none" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    points="0,32 20,24 40,28 60,14 80,20 100,8 120,12"
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.6, duration: 1.4, ease: "easeInOut" }} />
                  <defs><linearGradient id="lg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#3b82f6" stopOpacity="0" /></linearGradient></defs>
                </svg>
              </div>

              {/* donut + recent list */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-indigo-50/60 p-4 flex flex-col items-center justify-center">
                  <div className="relative">
                    <svg viewBox="0 0 36 36" className="w-16 h-16 -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e0e7ff" strokeWidth="4" />
                      <motion.circle cx="18" cy="18" r="15.9" fill="none" stroke="#6366f1" strokeWidth="4" strokeLinecap="round"
                        initial={{ pathLength: 0 }} animate={{ pathLength: 0.98 }} transition={{ delay: 0.8, duration: 1.4, ease: "easeOut" }} />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-indigo-600">98%</span>
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1.5">SLA compliance</p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 space-y-2">
                  {[
                    { init: "W", color: "bg-blue-500", title: "Water leakage", badge: "High", bt: "bg-red-100 text-red-600" },
                    { init: "L", color: "bg-violet-500", title: "Lift issue", badge: "Active", bt: "bg-blue-100 text-blue-600" },
                    { init: "A", color: "bg-emerald-500", title: "AC repair", badge: "Done", bt: "bg-green-100 text-green-600" },
                  ].map((r, i) => (
                    <motion.div key={r.title} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + i * 0.15 }}
                      className="flex items-center gap-2">
                      <span className={`w-5 h-5 rounded-md ${r.color} text-white text-[9px] font-bold flex items-center justify-center shrink-0`}>{r.init}</span>
                      <span className="text-[10px] text-slate-600 truncate flex-1">{r.title}</span>
                      <span className={`text-[8px] font-semibold px-1.5 py-0.5 rounded ${r.bt}`}>{r.badge}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="max-w-[1400px] mx-auto px-8 lg:px-12 -mt-6 mb-8">
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s) => (
            <motion.div key={s.label} variants={fadeUp}
              className="rounded-2xl bg-white/70 backdrop-blur-sm ring-1 ring-black/5 px-5 py-5 text-center shadow-sm">
              <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* FEATURES */}
      <section id="features" className="scroll-mt-16 max-w-[1400px] mx-auto px-8 lg:px-12 py-20">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Everything you need to stay on top of maintenance</h2>
          <p className="mt-4 text-slate-500">From the first report to the final fix — AptCare keeps every step organized and visible.</p>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, tint, title, desc }) => (
            <motion.div key={title} variants={fadeUp}
              className="bg-white rounded-2xl p-6 ring-1 ring-black/5 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${tint}`}>
                <Icon size={22} />
              </div>
              <h3 className="font-semibold text-slate-800 text-lg">{title}</h3>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="scroll-mt-16 bg-white/60 backdrop-blur-sm border-y border-white/60">
        <div className="max-w-[1400px] mx-auto px-8 lg:px-12 py-20">
          <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">How it works</h2>
            <p className="mt-4 text-slate-500">Three simple steps from problem to resolution.</p>
          </motion.div>
          <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-6">
            {STEPS.map((s) => (
              <motion.div key={s.n} variants={fadeUp} className="relative bg-white rounded-2xl p-7 ring-1 ring-black/5 shadow-sm">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-bold flex items-center justify-center shadow-md shadow-blue-500/30 mb-4">
                  {s.n}
                </div>
                <h3 className="font-semibold text-slate-800 text-lg">{s.title}</h3>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" className="scroll-mt-16 max-w-[1400px] mx-auto px-8 lg:px-12 py-20">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }} className="text-center max-w-2xl mx-auto mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Built for everyone in the building</h2>
          <p className="mt-4 text-slate-500">One platform, tailored to each role.</p>
        </motion.div>
        <motion.div variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6">
          {ROLES.map(({ icon: Icon, tint, title, points }) => (
            <motion.div key={title} variants={fadeUp} className="bg-white rounded-2xl p-7 ring-1 ring-black/5 shadow-sm">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-5 ${tint}`}>
                <Icon size={22} />
              </div>
              <h3 className="font-semibold text-slate-800 text-xl mb-4">{title}</h3>
              <ul className="space-y-3">
                {points.map((p) => (
                  <li key={p} className="flex items-start gap-2.5 text-sm text-slate-600">
                    <CheckCircle2 size={16} className="text-green-500 shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* CTA with building image */}
      <section className="max-w-[1400px] mx-auto px-8 lg:px-12 pb-20">
        <motion.div variants={fadeUp} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl shadow-2xl shadow-blue-900/20">
          <img src={buildingImg} alt="Apartment building" className="absolute inset-0 w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 via-blue-800/80 to-indigo-900/70" />
          <div className="relative px-8 sm:px-14 py-16 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white">Ready to fix things faster?</h2>
            <p className="mt-4 text-blue-100 max-w-xl mx-auto">
              Set up your apartment in minutes and bring all your maintenance into one calm, organized place.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button onClick={() => navigate("/register")}
                className="flex items-center gap-2 bg-white text-blue-700 px-6 py-3.5 rounded-xl text-sm font-semibold hover:bg-blue-50 shadow-lg transition">
                Register as Admin <ArrowRight size={16} />
              </button>
              <button onClick={() => navigate("/login")}
                className="bg-white/10 text-white ring-1 ring-white/40 px-6 py-3.5 rounded-xl text-sm font-semibold hover:bg-white/20 transition">
                Sign in
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/60 bg-white/60 backdrop-blur-sm">
        <div className="max-w-[1400px] mx-auto px-8 lg:px-12 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src={logoIcon} alt="AptCare" className="h-8 w-8 object-contain" />
            <span className="font-bold text-slate-800">AptCare</span>
          </div>
          <p className="text-sm text-slate-400">© {new Date().getFullYear()} AptCare. Smart building maintenance.</p>
        </div>
      </footer>
    </div>
  );
}
