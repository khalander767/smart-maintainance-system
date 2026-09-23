import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, User, Building2, MapPin, ArrowRight, Eye, EyeOff } from "lucide-react";
import API from "@/api/axios";
import logoIcon from "@/assets/logo-icon.png";

const FIELDS = [
  { name: "name",          type: "text",     placeholder: "Enter your full name",         icon: User,      label: "Full Name" },
  { name: "email",         type: "email",    placeholder: "admin@example.com",            icon: Mail,      label: "Email Address" },
  { name: "password",      type: "password", placeholder: "Create a password",            icon: Lock,      label: "Password" },
  { name: "apartmentName", type: "text",     placeholder: "e.g. Sunshine Apartments",     icon: Building2, label: "Apartment Name" },
  { name: "address",       type: "text",     placeholder: "e.g. 123 Main Street, City",   icon: MapPin,    label: "Address" },
];

const STEPS = [
  "Create your admin account",
  "Add technicians and residents",
  "Start managing complaints",
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } } };

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", apartmentName: "", address: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const { name, email, password, apartmentName, address } = form;
    if (!name || !email || !password || !apartmentName || !address) {
      setError("All fields are required");
      return;
    }
    try {
      setLoading(true);
      await API.post("/auth/register", form);
      navigate("/login");
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Cannot reach the backend. Start the API server and verify its MongoDB connection."
      );
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
        {/* LEFT — brand + steps */}
        <div className="relative hidden lg:flex flex-col items-center justify-center text-center px-12 py-12 overflow-hidden">
          {/* dotted accent */}
          <div className="absolute top-8 left-8 grid grid-cols-6 gap-1.5 opacity-40">
            {Array.from({ length: 24 }).map((_, i) => <span key={i} className="h-1 w-1 rounded-full bg-blue-300" />)}
          </div>

          <motion.div variants={container} initial="hidden" animate="show" className="relative z-10 flex flex-col items-center max-w-md">
            <motion.img variants={item} src={logoIcon} alt="AptCare" className="h-20 mb-5 drop-shadow-sm" />

            <motion.h1 variants={item} className="text-3xl font-bold text-slate-800">
              Set up your <span className="text-blue-600">smart building</span>
            </motion.h1>
            <motion.p variants={item} className="text-slate-500 mt-3 leading-relaxed">
              Register as an admin and start managing maintenance requests, technicians, and residents — all from one dashboard.
            </motion.p>

            <motion.div variants={item} className="mt-10 w-full space-y-4 text-left">
              {STEPS.map((step, i) => (
                <div key={step} className="flex items-center gap-4 rounded-2xl bg-white/60 backdrop-blur-sm ring-1 ring-black/5 px-4 py-3.5">
                  <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-md shadow-blue-500/30">
                    {i + 1}
                  </div>
                  <p className="text-sm font-medium text-slate-700">{step}</p>
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
              <p className="text-sm text-slate-400 mt-2">Register as admin</p>
            </div>

            {error && (
              <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                className="mb-5 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {FIELDS.map((f) => {
                const Icon = f.icon;
                const isPwd = f.name === "password";
                return (
                  <div key={f.name}>
                    <label className="text-sm font-semibold text-slate-700 block mb-2">{f.label}</label>
                    <div className="relative">
                      <Icon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input name={f.name}
                        type={isPwd ? (showPassword ? "text" : "password") : f.type}
                        placeholder={f.placeholder}
                        value={form[f.name]} onChange={handleChange}
                        className="w-full pl-11 pr-11 py-3.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition" />
                      {isPwd && (
                        <button type="button" onClick={() => setShowPassword((s) => !s)}
                          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition">
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

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
              Joining as a resident?{" "}
              <span onClick={() => navigate("/register/resident")} className="text-blue-600 font-medium cursor-pointer hover:underline">
                Sign up with a code
              </span>
            </p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
