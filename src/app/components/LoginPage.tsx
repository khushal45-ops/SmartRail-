import { useState } from "react";
import { RailLogo } from "./RailLogo";
import {
  Mail, Lock, LogIn, User, Shield, Eye, EyeOff, Loader2,
  Train, ArrowRight, Sparkles, Zap, CheckCircle, UserPlus
} from "lucide-react";

// ─── LocalStorage Registered Users Helpers ──────────
type StoredUser = { name: string; email: string; password: string; role: "passenger" | "admin" };

function getRegisteredUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem("registeredUsers");
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveRegisteredUser(user: StoredUser): void {
  const users = getRegisteredUsers();
  users.push(user);
  localStorage.setItem("registeredUsers", JSON.stringify(users));
}

// ─── Mock Users ─────────────────────────────────────
export const MOCK_USERS = [
  {
    email: "passenger@smartrail.in",
    password: "passenger123",
    name: "Rajesh Kumar",
    role: "passenger" as const,
  },
  {
    email: "admin@smartrail.in",
    password: "admin123",
    name: "Admin Verma",
    role: "admin" as const,
  },
];

export type AuthUser = {
  email: string;
  name: string;
  role: "passenger" | "admin";
};

type LoginPageProps = {
  onLogin: (user: AuthUser) => void;
};

// ─── Animated Background Track Lines ────────────────
function TrackLines() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Horizontal track lines */}
      {[18, 36, 54, 72, 88].map((top, i) => (
        <div
          key={`h-${i}`}
          className="absolute left-0 right-0 h-px opacity-[0.04]"
          style={{
            top: `${top}%`,
            background: `linear-gradient(90deg, transparent, rgba(16,185,129,0.6) 30%, rgba(6,182,212,0.6) 70%, transparent)`,
          }}
        />
      ))}
      {/* Moving train dots */}
      {[20, 40, 60, 80].map((top, i) => (
        <div
          key={`dot-${i}`}
          className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400/40"
          style={{
            top: `${top}%`,
            animation: `trainMove ${8 + i * 3}s linear infinite`,
            animationDelay: `${i * 2}s`,
          }}
        />
      ))}
      {/* Radial glow spots */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/3 rounded-full blur-[150px]" />
    </div>
  );
}

// ─── Feature Pill ───────────────────────────────────
function FeaturePill({ icon: Icon, text }: { icon: any; text: string }) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-xs">
      <Icon className="w-3 h-3 text-emerald-400" />
      {text}
    </div>
  );
}

// ─── Login Page ─────────────────────────────────────
export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 900));

    const emailLower = email.toLowerCase().trim();

    // Check mock users first
    const mockUser = MOCK_USERS.find(
      (u) => u.email === emailLower && u.password === password
    );

    if (mockUser) {
      localStorage.setItem("token", `smartrail-jwt-${mockUser.role}-${Date.now()}`);
      localStorage.setItem("user", JSON.stringify({ email: mockUser.email, name: mockUser.name, role: mockUser.role }));
      setIsLoading(false);
      onLogin({ email: mockUser.email, name: mockUser.name, role: mockUser.role });
      return;
    }

    // Check localStorage registered users
    const registeredUser = getRegisteredUsers().find(
      (u) => u.email === emailLower && u.password === password
    );

    if (registeredUser) {
      localStorage.setItem("token", `smartrail-jwt-${registeredUser.role}-${Date.now()}`);
      localStorage.setItem("user", JSON.stringify({ email: registeredUser.email, name: registeredUser.name, role: registeredUser.role }));
      setIsLoading(false);
      onLogin({ email: registeredUser.email, name: registeredUser.name, role: registeredUser.role });
      return;
    }

    setError("Invalid email or password");
    setIsLoading(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setRegError("All fields are required");
      return;
    }
    if (regPassword.length < 4) {
      setRegError("Password must be at least 4 characters");
      return;
    }

    const emailLower = regEmail.toLowerCase().trim();

    // Check if email already exists
    const allUsers = [...MOCK_USERS, ...getRegisteredUsers()];
    if (allUsers.some((u) => u.email === emailLower)) {
      setRegError("An account with this email already exists");
      return;
    }

    setRegLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const newUser: StoredUser = {
      name: regName.trim(),
      email: emailLower,
      password: regPassword,
      role: "passenger",
    };

    saveRegisteredUser(newUser);
    setRegLoading(false);
    setRegSuccess(true);

    // Redirect to login after 1 second
    setTimeout(() => {
      setShowRegister(false);
      setRegSuccess(false);
      setRegName("");
      setRegEmail("");
      setRegPassword("");
      // Pre-fill login form with new credentials
      setEmail(emailLower);
      setPassword("");
    }, 1000);
  };

  const quickLogin = async (role: "passenger" | "admin") => {
    const user = MOCK_USERS.find((u) => u.role === role)!;
    setEmail(user.email);
    setPassword(user.password);
    setError("");
    setIsLoading(true);

    await new Promise((r) => setTimeout(r, 700));

    localStorage.setItem("token", `smartrail-jwt-${user.role}-${Date.now()}`);
    localStorage.setItem("user", JSON.stringify({ email: user.email, name: user.name, role: user.role }));
    onLogin({ email: user.email, name: user.name, role: user.role });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0a192f] via-[#050b14] to-[#03060c] overflow-hidden">
      {/* CSS Animation */}
      <style>{`
        @keyframes trainMove {
          0% { left: -2%; }
          100% { left: 102%; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.6s ease-out forwards; }
        .fade-up-delay-1 { animation: fadeUp 0.6s ease-out 0.1s forwards; opacity: 0; }
        .fade-up-delay-2 { animation: fadeUp 0.6s ease-out 0.2s forwards; opacity: 0; }
        .fade-up-delay-3 { animation: fadeUp 0.6s ease-out 0.3s forwards; opacity: 0; }
        .fade-up-delay-4 { animation: fadeUp 0.6s ease-out 0.4s forwards; opacity: 0; }
        .shimmer-btn {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent);
          background-size: 200% 100%;
          animation: shimmer 3s linear infinite;
        }
      `}</style>

      <TrackLines />

      {/* Grain overlay */}
      <div className="grain-overlay" />

      {/* Main Login Card */}
      <div className="relative z-20 w-full max-w-md mx-4">
        {/* Top Badge */}
        <div className="flex justify-center mb-8 fade-up">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-400 text-xs font-medium tracking-wide">SYSTEM ONLINE</span>
            <span className="text-slate-500 text-xs">·</span>
            <span className="text-slate-400 text-xs font-mono">v1.0.0</span>
          </div>
        </div>

        {/* Card */}
        <div className="glass-panel rounded-2xl overflow-hidden fade-up-delay-1">
          {/* Header */}
          <div className="relative px-8 pt-10 pb-6 text-center">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-emerald-500/5 to-transparent pointer-events-none" />

            <div className="relative z-10 flex justify-center mb-5" style={{ animation: "float 4s ease-in-out infinite" }}>
              <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/10 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.15)]">
                <RailLogo className="w-14 h-14" />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight mb-1.5">
              Welcome to <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">SmartRail</span>
            </h1>
            <p className="text-slate-400 text-sm">AI Powered Railway Management System</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 pb-8 space-y-5">
            {/* Error Message */}
            {error && (
              <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2">
                <span className="mt-0.5 text-red-400">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-emerald-400/70" />
                Email Address
              </label>
              <div className="relative group">
                <input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                  className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-400/70" />
                Password
              </label>
              <div className="relative group">
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3 pr-12 rounded-xl bg-black/30 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Login Button */}
            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="relative w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-sm transition-all shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_30px_rgba(16,185,129,0.45)] disabled:opacity-60 disabled:cursor-not-allowed overflow-hidden flex items-center justify-center gap-2"
            >
              <div className="shimmer-btn absolute inset-0" />
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Login
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-slate-500 text-xs font-medium">QUICK ACCESS</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Quick Access Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                id="quick-passenger"
                type="button"
                onClick={() => quickLogin("passenger")}
                disabled={isLoading}
                className="group flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/20 hover:border-blue-400/30 transition-all disabled:opacity-50"
              >
                <User className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Passenger Login
              </button>
              <button
                id="quick-admin"
                type="button"
                onClick={() => quickLogin("admin")}
                disabled={isLoading}
                className="group flex items-center justify-center gap-2 py-3 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 text-sm font-medium hover:bg-violet-500/20 hover:border-violet-400/30 transition-all disabled:opacity-50"
              >
                <Shield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Admin Login
              </button>
            </div>

            {/* Register Link */}
            <div className="text-center pt-2">
              <p className="text-slate-500 text-sm">
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setShowRegister(true)}
                  className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                >
                  Register
                </button>
              </p>
            </div>
          </form>
        </div>

        {/* Feature Pills */}
        <div className="flex flex-wrap justify-center gap-2 mt-6 fade-up-delay-3">
          <FeaturePill icon={Train} text="Real-time Tracking" />
          <FeaturePill icon={Sparkles} text="AI Predictions" />
          <FeaturePill icon={Zap} text="Smart Alerts" />
        </div>

        {/* Footer */}
        <div className="text-center mt-6 fade-up-delay-4">
          <p className="text-slate-600 text-xs">SmartRail v1.0.0 · Indian Railways</p>
          <p className="text-slate-700 text-xs mt-1">© 2026 SmartRail. All rights reserved.</p>
        </div>
      </div>

      {/* Register Modal */}
      {showRegister && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => { if (!regLoading) { setShowRegister(false); setRegError(""); setRegSuccess(false); } }}>
          <div className="glass-panel rounded-2xl p-8 max-w-sm w-full mx-4" onClick={(e) => e.stopPropagation()}>

            {regSuccess ? (
              /* ── Success State ── */
              <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">Account Created!</h2>
                <p className="text-slate-400 text-sm">Account created successfully!</p>
                <p className="text-slate-500 text-xs mt-2">Redirecting to login...</p>
              </div>
            ) : (
              /* ── Register Form ── */
              <form onSubmit={handleRegister}>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/20 flex items-center justify-center">
                    <UserPlus className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Create Account</h2>
                    <p className="text-slate-400 text-xs">Join SmartRail as a passenger</p>
                  </div>
                </div>

                {regError && (
                  <div className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-start gap-2 mb-4">
                    <span className="mt-0.5">⚠</span>
                    <span>{regError}</span>
                  </div>
                )}

                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm text-slate-300 mb-1.5 block">Full Name</label>
                    <input
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-emerald-500/50 transition-all"
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 mb-1.5 block">Email</label>
                    <input
                      type="email"
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-emerald-500/50 transition-all"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-300 mb-1.5 block">Password</label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl bg-black/30 border border-white/10 text-white placeholder:text-slate-500 text-sm outline-none focus:border-emerald-500/50 transition-all"
                      placeholder="Create a password (min 4 chars)"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={regLoading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white font-semibold text-sm shadow-[0_4px_20px_rgba(16,185,129,0.3)] hover:shadow-[0_4px_30px_rgba(16,185,129,0.45)] transition-all mb-3 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {regLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserPlus className="w-4 h-4" /> Create Account</>}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowRegister(false); setRegError(""); }}
                  className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-sm hover:bg-white/10 transition-all"
                >
                  Back to Login
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
