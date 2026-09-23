import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wrench, Mail, Lock, Eye, EyeOff, LogIn, Activity, Bell } from "lucide-react";
import API from "@/api/axios";
import { AuthContext } from "@/context/AuthContext";
import logo from "@/assets/logo.png";
import logoIcon from "@/assets/logo-icon.png";

const ROLE_REDIRECTS = {
  ADMIN:      "/admin/dashboard",
  TECHNICIAN: "/technician/dashboard",
  RESIDENT:   "/resident/dashboard",
};

const DEMO_ADMIN = {
  _id: "local-demo-admin",
  name: "Demo Admin",
  email: "demo@aptcare.local",
  role: "ADMIN",
  apartmentId: "local-demo-apartment",
  apartmentName: "Demo Apartments",
  apartmentCode: "DEMO01",
};

const FEATURES = [
  { icon: Activity, tint: "bg-blue-100 text-blue-600",     title: "Real-time Monitoring", sub: "Track assets and performance in real-time" },
  { icon: Wrench,   tint: "bg-emerald-100 text-emerald-600", title: "Smart Maintenance",   sub: "Plan and schedule maintenance efficiently" },
  { icon: Bell,     tint: "bg-violet-100 text-violet-600",  title: "Instant Alerts",       sub: "Get notified and resolve issues faster" },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } } };

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setInfo("");
    if (!email || !password) { setError("Please enter your email and password"); return; }
    try {
      setLoading(true);
      const res = await API.post("/auth/login", { email, password });
      login(res.data);
      navigate(ROLE_REDIRECTS[res.data.user.role] || "/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Cannot reach the backend. Start the API server and verify its MongoDB connection."
      );
    } finally {
      setLoading(false);
    }
  };

  const notReady = (msg) => () => { setError(""); setInfo(msg); };

  const handleDemoLogin = () => {
    login({ token: "local-demo-session", user: DEMO_ADMIN });
    navigate(ROLE_REDIRECTS[DEMO_ADMIN.role]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }}
        className="min-h-screen w-full grid lg:grid-cols-2 overflow-hidden"
      >
        {/* LEFT — brand + illustration */}
        <div className="relative hidden lg:flex flex-col items-center justify-center text-center px-12 py-12 overflow-hidden">
          {/* dotted accent */}
          <div className="absolute top-8 left-8 grid grid-cols-6 gap-1.5 opacity-40">
            {Array.from({ length: 24 }).map((_, i) => <span key={i} className="h-1 w-1 rounded-full bg-blue-300" />)}
          </div>

          <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 flex flex-col items-center max-w-md">
            <motion.img variants={item} src={logo} alt="AptCare" className="w-56 mb-4 drop-shadow-sm" />
            <motion.p variants={item} className="text-slate-500 max-w-sm leading-relaxed">
              A smarter way to manage, monitor and maintain your building — all in one place.
            </motion.p>

            {/* feature list */}
            <motion.div variants={item} className="mt-10 w-full space-y-3.5 text-left">
              {FEATURES.map(({ icon: Icon, tint, title, sub }) => (
                <div key={title} className="flex items-center gap-4 rounded-2xl bg-white/70 backdrop-blur-sm ring-1 ring-black/5 px-4 py-3.5 shadow-sm">
                  <div className={`w-11 h-11 shrink-0 rounded-xl flex items-center justify-center ${tint}`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>

        {/* RIGHT — form */}
        <div className="flex items-center justify-center px-6 py-12 sm:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl shadow-blue-900/10 ring-1 ring-black/5 p-8 sm:p-10"
          >
            <div className="text-center mb-8">
              <img src={logoIcon} alt="AptCare" className="h-14 mx-auto mb-4 lg:hidden" />
              <h2 className="text-3xl font-bold text-slate-800">Welcome Back! 👋</h2>
              <p className="text-sm text-slate-400 mt-2">Login to continue to your account</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                className="mb-5 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">{error}</motion.div>
            )}
            {info && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                className="mb-5 bg-blue-50 border border-blue-100 text-blue-600 text-sm px-4 py-3 rounded-xl">{info}</motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition" />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full pl-11 pr-11 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition" />
                  <button type="button" onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-200" />
                  Remember me
                </label>
                <button type="button" onClick={notReady("Password reset isn't set up yet — contact your admin.")}
                  className="text-blue-600 font-semibold hover:underline">Forgot Password?</button>
              </div>

              <motion.button type="submit" disabled={loading}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/25 disabled:opacity-60 flex items-center justify-center gap-2 transition">
                {loading ? "Logging in..." : (<><LogIn size={18} /> Login</>)}
              </motion.button>
            </form>

            {import.meta.env.DEV && (
              <button type="button" onClick={handleDemoLogin}
                className="w-full mt-3 py-3 border border-dashed border-blue-300 rounded-xl text-sm font-semibold text-blue-600 hover:bg-blue-50 transition">
                Continue in local demo mode
              </button>
            )}

            <div className="flex items-center gap-4 my-6">
              <div className="h-px flex-1 bg-slate-200" />
              <span className="text-xs text-slate-400">or</span>
              <div className="h-px flex-1 bg-slate-200" />
            </div>

            <button type="button" onClick={notReady("Google sign-in isn't set up yet.")}
              className="w-full py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 flex items-center justify-center gap-3 transition">
              <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="m6.306 14.691 6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
              Login with Google
            </button>

            <p className="text-center text-sm text-slate-500 mt-6">
              Don't have an account?{" "}
              <span onClick={() => navigate("/register/resident")} className="text-blue-600 font-semibold cursor-pointer hover:underline">Sign up</span>
            </p>
            <p className="text-center text-xs text-slate-400 mt-2">
              Want to register a new apartment?{" "}
              <span onClick={() => navigate("/register")} className="text-blue-600 font-medium cursor-pointer hover:underline">Register as Admin</span>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
