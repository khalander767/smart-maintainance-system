import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, KeyRound, ArrowRight, Eye, EyeOff } from "lucide-react";
import API from "@/api/axios";
import logoIcon from "@/assets/logo-icon.png";

const PERKS = [
  "Raise maintenance requests in seconds",
  "Track every request from report to fix",
  "Get notified the moment it's resolved",
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } } };

export default function ResidentRegister() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", apartmentCode: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const { name, email, password, apartmentCode } = form;
    if (!name || !email || !password || !apartmentCode) {
      setError("All fields are required");
      return;
    }
    try {
      setLoading(true);
      await API.post("/auth/register-resident", { ...form, apartmentCode: apartmentCode.trim().toUpperCase() });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100">
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }}
        className="min-h-screen w-full grid lg:grid-cols-2 overflow-hidden"
      >
        {/* LEFT — brand + perks */}
        <div className="relative hidden lg:flex flex-col items-center justify-center text-center px-12 py-12 overflow-hidden">
          <div className="absolute top-8 left-8 grid grid-cols-6 gap-1.5 opacity-40">
            {Array.from({ length: 24 }).map((_, i) => <span key={i} className="h-1 w-1 rounded-full bg-blue-300" />)}
          </div>

          <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 flex flex-col items-center max-w-md">
            <motion.img variants={item} src={logoIcon} alt="AptCare" className="h-20 mb-5 drop-shadow-sm" />

            <motion.h1 variants={item} className="text-3xl font-bold text-slate-800">
              Join your <span className="text-blue-600">building</span>
            </motion.h1>
            <motion.p variants={item} className="text-slate-500 mt-3 leading-relaxed">
              Sign up as a resident with the join code from your apartment admin and stay on top of every maintenance request.
            </motion.p>

            <motion.div variants={item} className="mt-10 w-full space-y-4 text-left">
              {PERKS.map((perk) => (
                <div key={perk} className="flex items-center gap-4 rounded-2xl bg-white/60 backdrop-blur-sm ring-1 ring-black/5 px-4 py-3.5">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/30">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12 5 5L20 7" /></svg>
                  </div>
                  <p className="text-sm font-medium text-slate-700">{perk}</p>
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
              <h2 className="text-3xl font-bold text-slate-800">Create account</h2>
              <p className="text-sm text-slate-400 mt-2">Register as a resident</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                className="mb-5 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Full Name</label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input name="name" type="text" placeholder="Enter your full name"
                    value={form.name} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition" />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Email Address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input name="email" type="email" placeholder="you@example.com"
                    value={form.email} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition" />
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input name="password" type={showPassword ? "text" : "password"} placeholder="Create a password"
                    value={form.password} onChange={handleChange}
                    className="w-full pl-11 pr-11 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition" />
                  <button type="button" onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700 block mb-2">Apartment Code</label>
                <div className="relative">
                  <KeyRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input name="apartmentCode" type="text" placeholder="e.g. SUN123"
                    value={form.apartmentCode} onChange={handleChange}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition" />
                </div>
                <p className="text-xs text-slate-400 mt-1.5">Ask your apartment admin for this code.</p>
              </div>

              <motion.button type="submit" disabled={loading}
                whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 shadow-lg shadow-blue-500/25 disabled:opacity-60 flex items-center justify-center gap-2 mt-2 transition">
                {loading ? "Creating account..." : (<>Create Account <ArrowRight size={18} /></>)}
              </motion.button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{" "}
              <span onClick={() => navigate("/login")} className="text-blue-600 font-semibold cursor-pointer hover:underline">
                Sign in
              </span>
            </p>
            <p className="text-center text-xs text-slate-400 mt-2">
              Want to register a new apartment?{" "}
              <span onClick={() => navigate("/register")} className="text-blue-600 font-medium cursor-pointer hover:underline">
                Register as Admin
              </span>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
