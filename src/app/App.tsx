import { useState, useEffect } from "react";
import { TrainMonitor } from "./components/TrainMonitor";
import { AlertSystem } from "./components/AlertSystem";
import { AdminPortal } from "./components/AdminPortal";
import { Analytics } from "./components/Analytics";
import { AIChatbot } from "./components/AIChatbot";
import { Settings } from "./components/Settings";
import { Reports } from "./components/Reports";
import { Dashboard } from "./components/Dashboard";
import { PassengerPortal } from "./components/PassengerPortal";
import { RailwayOperationsMap } from "./components/RailwayOperationsMap";
import { RailLogo } from "./components/RailLogo";
import { LoginPage, AuthUser } from "./components/LoginPage";
import { alerts } from "./data/mockData";
import {
  Train, Bell, Shield, BarChart3, Bot, Settings2, FileText,
  Menu, X, ChevronRight, Zap, Search, Sun, MapPin, Clock, Map,
  LayoutDashboard, TicketIcon, Loader2, LogOut, LogIn
} from "lucide-react";
import { toast } from "sonner";

type View = "dashboard" | "trains" | "alerts" | "passenger" | "admin" | "analytics" | "chatbot" | "reports" | "settings" | "map";
type Role = "passenger" | "admin";

const navItems: { id: View; label: string; icon: any; adminOnly?: boolean; passengerOnly?: boolean; badge?: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, passengerOnly: true },
  { id: "trains", label: "Train Monitor", icon: Train },
  { id: "alerts", label: "Alerts & Notifications", icon: Bell },
  { id: "passenger", label: "Passenger Portal", icon: TicketIcon, passengerOnly: true },
  { id: "admin", label: "Admin Portal", icon: Shield, adminOnly: true },
  { id: "analytics", label: "Analytics", icon: BarChart3, adminOnly: true },
  { id: "chatbot", label: "AI Assistant", icon: Bot },
  { id: "reports", label: "Reports", icon: FileText, adminOnly: true },
  { id: "settings", label: "Settings", icon: Settings2, adminOnly: true },
];

function NavItem({ item, active, onClick, role }: { item: typeof navItems[0]; active: boolean; onClick: () => void; role: Role }) {
  const Icon = item.icon;
  if (item.adminOnly && role !== "admin") return null;
  if (item.passengerOnly && role !== "passenger") return null;
  return (
    <button
      onClick={onClick}
      className={`relative flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm transition-all duration-300 group overflow-hidden ${
        active ? "text-white bg-emerald-500/10 shadow-[inset_0_0_20px_rgba(16,185,129,0.1)] border border-emerald-500/20" : "text-slate-400 hover:bg-white/5 hover:text-slate-200 border border-transparent"
      }`}
    >
      {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-emerald-500 rounded-r-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" />}
      <Icon className={`w-4 h-4 flex-shrink-0 transition-colors ${active ? "text-emerald-400" : "text-slate-400 group-hover:text-emerald-400/70"}`} />
      <span className="font-medium tracking-wide">{item.label}</span>
      {item.badge && (
        <span className="ml-auto px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[9px] font-bold rounded-md border border-emerald-500/30 tracking-wider">
          {item.badge}
        </span>
      )}
      {item.id === "alerts" && (
        <span className="ml-auto w-5 h-5 bg-red-500/80 rounded-full text-white text-xs flex items-center justify-center flex-shrink-0 shadow-[0_0_10px_rgba(239,68,68,0.5)] border border-red-400/30">
          {alerts.filter(a => !a.read).length}
        </span>
      )}
    </button>
  );
}

export default function App() {
  // Restore user session from localStorage
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored && localStorage.getItem("token")) return JSON.parse(stored);
    } catch { /* ignore */ }
    return null;
  });

  const isLoggedIn = !!authUser;
  const [view, setView] = useState<View>(authUser?.role === "passenger" ? "dashboard" : "trains");
  const [role, setRole] = useState<Role>(authUser?.role ?? "admin");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [time, setTime] = useState(new Date());

  const handleAuthLogin = (user: AuthUser) => {
    setAuthUser(user);
    setRole(user.role);
    setView(user.role === "passenger" ? "dashboard" : "trains");
    toast.success(`Welcome back, ${user.name}!`);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setAuthUser(null);
    toast.success("Logged out successfully.");
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const renderView = () => {
    switch (view) {
      case "dashboard": return <Dashboard onNavigate={(v) => setView(v as View)} role={role} />;
      case "trains": return <TrainMonitor />;
      case "alerts": return <AlertSystem />;
      case "passenger": return <PassengerPortal />;
      case "map": return <RailwayOperationsMap />;
      case "admin": return <AdminPortal />;
      case "analytics": return <Analytics />;
      case "chatbot": return <AIChatbot />;
      case "reports": return <Reports />;
      case "settings": return <Settings />;
      default: return <TrainMonitor />;
    }
  };

  const currentNav = navItems.find((n) => n.id === view);

  // Gate: show login page when not authenticated
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleAuthLogin} />;
  }

  const userName = authUser?.name ?? (role === "admin" ? "Admin User" : "Rajesh Kumar");
  const userInitials = userName.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="h-screen flex text-foreground overflow-hidden font-sans">
      <div className="grain-overlay" />
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 glass-panel border-r-0 border-r-white/5 flex flex-col transition-transform duration-300 ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-emerald-500/10 to-transparent opacity-50 pointer-events-none" />
          <RailLogo className="w-10 h-10 relative z-10" />
          <div className="relative z-10">
            <div className="text-white font-bold text-base tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">SmartRail</div>
            <div className="text-emerald-400/80 text-xs font-medium tracking-wider">INDIAN RAILWAYS</div>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-auto relative z-10 lg:hidden text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Role Indicator (locked to login role) */}
        <div className="px-4 py-4 border-b border-white/5">
          <div className="flex rounded-xl overflow-hidden bg-black/20 p-1 border border-white/5 shadow-inner">
            {authUser?.role === "passenger" ? (
              <div className="flex-1 py-2 text-xs font-medium rounded-lg text-center bg-emerald-600/90 text-white shadow-md">
                Passenger Mode
              </div>
            ) : (
              <div className="flex-1 py-2 text-xs font-medium rounded-lg text-center bg-emerald-600/90 text-white shadow-md">
                Admin Mode
              </div>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1.5 custom-scrollbar">
          {navItems.map((item) => (
            <NavItem
              key={item.id}
              item={item}
              active={view === item.id}
              onClick={() => { setView(item.id); setSidebarOpen(false); }}
              role={role}
            />
          ))}
        </nav>

        {/* Live Indicator */}
        <div className="px-6 py-5 border-t border-white/5 bg-black/10 backdrop-blur-md">
          <div className="flex items-center gap-2 text-sm text-slate-300 font-medium">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            System Online
          </div>
          <div className="text-xs text-slate-500 mt-1.5 font-mono">SmartRail v1.0.0 · Core Node Sync</div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Bar */}
        <header className="flex items-center gap-4 px-4 lg:px-8 py-4 glass-panel border-b-0 border-b-white/5 flex-shrink-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-slate-400 hover:text-white">
            <Menu className="w-6 h-6" />
          </button>

          {/* Breadcrumb / Title */}
          <div className="hidden md:flex items-center gap-2 text-sm font-medium">
            <span className="text-slate-400">SmartRail</span>
            <ChevronRight className="w-4 h-4 text-slate-600" />
            <span className="text-emerald-50">{currentNav?.label ?? "Dashboard"}</span>
          </div>

          {/* Smart Search */}
          <div className="ml-auto md:ml-8 flex-1 max-w-md hidden lg:flex items-center bg-black/20 border border-white/10 rounded-full px-4 py-2 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all">
            <Search className="w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search PNR, Train No, or Station..." className="bg-transparent border-none outline-none text-sm text-white ml-3 w-full placeholder:text-slate-500" />
          </div>

          {/* Right side icons */}
          <div className="ml-auto lg:ml-4 flex items-center gap-3 sm:gap-5">
            {/* Live Status */}
            <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.05)]">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400 text-xs font-medium">Network Optimal</span>
            </div>

            {/* Time */}
            <div className="hidden sm:flex items-center gap-2 text-slate-300 text-sm font-mono border-l border-white/10 pl-4">
              <Clock className="w-4 h-4 text-emerald-400/80" />
              {time.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>

            {/* Zone Selector */}
            <div className="hidden md:flex items-center gap-2 text-slate-300 text-sm border-l border-white/10 pl-4 cursor-pointer hover:text-white transition-colors">
              <MapPin className="w-4 h-4 text-emerald-400/80" />
              Northern Zone
            </div>

            <div className="h-6 w-px bg-white/10 hidden sm:block mx-1"></div>

            <button className="text-slate-400 hover:text-emerald-400 transition-colors">
              <Sun className="w-5 h-5" />
            </button>
            <button className="text-slate-400 hover:text-emerald-400 transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-[#0B1D3A]"></span>
            </button>

            <div className="flex items-center gap-3 pl-2">
                  <div className="text-right hidden sm:block">
                    <div className="text-sm font-medium text-white">{userName}</div>
                    <div className="text-xs text-emerald-400">{role === "admin" ? "Operations Control" : "Gold Member"}</div>
                  </div>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-sm font-bold text-white shadow-lg border border-white/20">
                    {userInitials}
                  </div>
                  <button onClick={handleLogout} className="ml-2 text-slate-400 hover:text-red-400 transition-colors" title="Logout">
                    <LogOut className="w-5 h-5" />
                  </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className={`flex-1 relative z-10 ${view === "map" ? "overflow-hidden p-0" : "overflow-y-auto p-4 lg:p-8 custom-scrollbar"}`}>
          {view !== "map" && (
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[400px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
          )}
          <div className={`relative z-10 h-full ${view === "map" ? "" : "max-w-7xl mx-auto"}`}>
            {renderView()}
          </div>
        </main>
      </div>
    </div>
  );
}
