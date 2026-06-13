import { useState } from "react";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { trains, staffMembers, alerts, weeklyPerformance, platformData } from "../data/mockData";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line
} from "recharts";
import {
  Shield, Users, Train, AlertTriangle, Settings, Search, CheckCircle, XCircle,
  Clock, MapPin, Activity, Terminal, TrendingUp, TrendingDown, IndianRupee,
  Ticket, BarChart2, UserPlus, Plus, Download, Bell, Zap, RefreshCw,
  Lock, Unlock, Eye, Edit, Trash2, ChevronUp, ChevronDown, Server,
  Wifi, HardDrive, AlertCircle, FileText, LogOut, ArrowRight, Filter,
  ChevronRight, Info, Loader2
} from "lucide-react";
import { generateReport, updateTrainStatus, sendAlert } from "../../api";
import { toast } from "sonner";

// ─────────────── MOCK EXTENDED DATA ───────────────
const bookingStats = {
  total: 48320, pendingRefunds: 312, cancelled: 89, complaints: 47,
};

const auditLogs = [
  { id: 1, user: "Admin Verma", action: "Updated schedule for Train 12951", module: "Train Mgmt", time: "2 min ago", icon: "train" },
  { id: 2, user: "Admin Sharma", action: "Assigned Platform 3 to Rajdhani Express", module: "Platform Mgmt", time: "8 min ago", icon: "map" },
  { id: 3, user: "Super Admin", action: "Added new user: ops_controller_02", module: "User Mgmt", time: "22 min ago", icon: "user" },
  { id: 4, user: "Admin Patel", action: "Resolved Alert #6 - Emergency Stop", module: "Alerts", time: "35 min ago", icon: "alert" },
  { id: 5, user: "Admin Verma", action: "Exported revenue report (June 2026)", module: "Reports", time: "1 hr ago", icon: "file" },
  { id: 6, user: "Super Admin", action: "Blocked user: guest_access_01", module: "User Mgmt", time: "2 hr ago", icon: "user" },
];

const adminUsers = [
  { id: "ADM-001", name: "Rajiv Verma", role: "Super Admin", email: "r.verma@smartrail.in", status: "Active", lastLogin: "2 min ago" },
  { id: "ADM-002", name: "Seema Patel", role: "Ops Controller", email: "s.patel@smartrail.in", status: "Active", lastLogin: "15 min ago" },
  { id: "ADM-003", name: "Arjun Nair", role: "Zone Manager", email: "a.nair@smartrail.in", status: "Active", lastLogin: "1 hr ago" },
  { id: "ADM-004", name: "Priya Sharma", role: "Safety Officer", email: "p.sharma@smartrail.in", status: "Inactive", lastLogin: "2 days ago" },
  { id: "ADM-005", name: "Guest Access", role: "Read-only", email: "guest@smartrail.in", status: "Blocked", lastLogin: "3 days ago" },
];

const systemHealth = [
  { name: "PRS Ticketing API", status: "Operational", uptime: "99.98%", latency: "42ms", icon: "server" },
  { name: "Train Tracking Node", status: "Operational", uptime: "99.95%", latency: "38ms", icon: "wifi" },
  { name: "CCTV AI Pipeline", status: "Operational", uptime: "99.87%", latency: "115ms", icon: "eye" },
  { name: "Signaling Network", status: "Operational", uptime: "99.72%", latency: "28ms", icon: "zap" },
  { name: "Freight Logistics API", status: "Maintenance", uptime: "97.12%", latency: "—", icon: "hdd" },
  { name: "Weather Integration", status: "Operational", uptime: "99.91%", latency: "88ms", icon: "activity" },
];

const delayTrendData = [
  { day: "Mon", delays: 15, avg: 28 },
  { day: "Tue", delays: 19, avg: 35 },
  { day: "Wed", delays: 13, avg: 22 },
  { day: "Thu", delays: 10, avg: 18 },
  { day: "Fri", delays: 24, avg: 42 },
  { day: "Sat", delays: 18, avg: 31 },
  { day: "Sun", delays: 16, avg: 26 },
];

const TABS = [
  { id: "overview",   label: "Overview",          icon: BarChart2 },
  { id: "trains",     label: "Train Mgmt",         icon: Train },
  { id: "bookings",   label: "Bookings",           icon: Ticket },
  { id: "platforms",  label: "Stations",           icon: MapPin },
  { id: "users",      label: "Users & Roles",      icon: Users },
  { id: "alerts",     label: "Alerts",             icon: Bell },
  { id: "audit",      label: "Audit Logs",         icon: FileText },
  { id: "system",     label: "System Health",      icon: Server },
];

// ─────────────── KPI CARD ───────────────
function KpiCard({ label, value, sub, trend, icon: Icon, color, bg, border, up }:
  { label: string; value: string | number; sub: string; trend: string; icon: any; color: string; bg: string; border: string; up: boolean }) {
  return (
    <div className="glass-panel rounded-xl p-5 relative overflow-hidden group cursor-pointer hover:border-white/10 transition-all border border-white/5">
      <div className={`absolute -right-6 -top-6 w-24 h-24 ${bg} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500 opacity-60`} />
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className={`p-2 rounded-lg ${bg} ${border} border shadow-inner`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <Badge className={`${up ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"} text-xs font-mono`}>
          {up ? "↑" : "↓"} {trend}
        </Badge>
      </div>
      <div className="text-3xl font-semibold text-white mb-1 tracking-tight relative z-10 font-mono">{value}</div>
      <div className="text-slate-400 text-sm font-medium relative z-10">{label}</div>
      <div className="text-slate-500 text-xs mt-1 relative z-10">{sub}</div>
    </div>
  );
}

// ─────────────── TOOLTIP STYLE ───────────────
const tooltipStyle = {
  contentStyle: { backgroundColor: "#0B1D3A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", boxShadow: "0 10px 25px -5px rgba(0,0,0,0.5)" },
};

// ─────────────── SECTION HEADER ───────────────
function SectionHeader({ icon: Icon, title, iconColor = "text-emerald-400", children }: { icon: any; title: string; iconColor?: string; children?: React.ReactNode }) {
  return (
    <div className="p-5 border-b border-white/5 bg-[#0B1D3A]/50 flex items-center justify-between flex-shrink-0">
      <h3 className="text-white font-semibold flex items-center gap-2">
        <Icon className={`w-4 h-4 ${iconColor}`} /> {title}
      </h3>
      {children}
    </div>
  );
}

// ─────────────── DATE FILTER ───────────────
function DateFilter({ active, setActive }: { active: string; setActive: (v: string) => void }) {
  return (
    <div className="flex gap-1">
      {["Today", "7D", "30D"].map((d) => (
        <button key={d} onClick={() => setActive(d)}
          className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${active === d ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"}`}>
          {d}
        </button>
      ))}
    </div>
  );
}

// ─────────────── OVERVIEW TAB ───────────────
function OverviewTab() {
  const [dateFilter, setDateFilter] = useState("7D");

  const kpis = [
    { label: "Active Trains", value: trains.length, sub: `${trains.filter(t => t.status === "On Time").length} running on time`, trend: "12%", up: true, icon: Train, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "Today's Passengers", value: "1.24M", sub: "↑ 4.2% vs yesterday", trend: "4.2%", up: true, icon: Users, color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" },
    { label: "Delayed Trains", value: trains.filter(t => t.status === "Delayed").length, sub: "Avg 35 min delay", trend: "2.1%", up: false, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { label: "Unread Alerts", value: alerts.filter(a => !a.read).length, sub: "2 critical pending", trend: "5.4%", up: false, icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    { label: "Revenue Today", value: "₹ 15.6Cr", sub: "Ticket + freight", trend: "8.3%", up: true, icon: IndianRupee, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
    { label: "Occupancy Rate", value: "84%", sub: "Avg across all trains", trend: "1.8%", up: true, icon: Activity, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpis.map((k) => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Passenger Traffic */}
        <div className="glass-panel rounded-xl flex flex-col overflow-hidden">
          <div className="p-5 border-b border-white/5 bg-[#0B1D3A]/50 flex items-center justify-between">
            <h3 className="text-white font-semibold flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400" /> Passenger Traffic</h3>
            <DateFilter active={dateFilter} setActive={setDateFilter} />
          </div>
          <div className="p-5 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyPerformance}>
                <defs>
                  <linearGradient id="pgGrad2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip {...tooltipStyle} itemStyle={{ color: "#10b981" }} formatter={(v: number) => v.toLocaleString()} />
                <Area type="monotone" dataKey="passengers" name="Passengers" stroke="#10b981" fill="url(#pgGrad2)" strokeWidth={2.5} activeDot={{ r: 5, fill: "#10b981", stroke: "#0B1D3A", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Delay Trend */}
        <div className="glass-panel rounded-xl flex flex-col overflow-hidden">
          <div className="p-5 border-b border-white/5 bg-[#0B1D3A]/50 flex items-center justify-between">
            <h3 className="text-white font-semibold flex items-center gap-2"><TrendingDown className="w-4 h-4 text-amber-400" /> Train Delay Trend</h3>
            <DateFilter active={dateFilter} setActive={setDateFilter} />
          </div>
          <div className="p-5 h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={delayTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="delays" name="Delayed Trains" stroke="#f59e0b" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
                <Line type="monotone" dataKey="avg" name="Avg Delay (min)" stroke="#ef4444" strokeWidth={2} strokeDasharray="4 2" dot={false} activeDot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Platform utilization chart */}
      <div className="glass-panel rounded-xl flex flex-col overflow-hidden">
        <div className="p-5 border-b border-white/5 bg-[#0B1D3A]/50 flex items-center justify-between">
          <h3 className="text-white font-semibold flex items-center gap-2"><MapPin className="w-4 h-4 text-blue-400" /> Platform Utilization — New Delhi</h3>
          <DateFilter active={dateFilter} setActive={setDateFilter} />
        </div>
        <div className="p-5 h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={platformData.filter(p => p.station === "New Delhi")} barSize={28}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="platform" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
              <Tooltip {...tooltipStyle} formatter={(v: number) => `${v}%`} />
              <Bar dataKey="utilization" name="Utilization" radius={[4, 4, 0, 0]}
                fill="url(#barGrad)"
              />
              <defs>
                <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#1d4ed8" stopOpacity={0.7} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Add Train", icon: Plus, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", hover: "hover:bg-emerald-500/20" },
          { label: "Add User", icon: UserPlus, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", hover: "hover:bg-blue-500/20" },
          { label: "Export Report", icon: Download, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", hover: "hover:bg-violet-500/20",
            onClick: async () => {
              try {
                toast.loading("Generating report...", { id: "report" });
                await generateReport("daily", { date: "today" });
                toast.success("Report generated and downloaded successfully.", { id: "report" });
              } catch (e) {
                toast.error("Failed to generate report.", { id: "report" });
              }
            }
          },
          { label: "Resolve Alert", icon: CheckCircle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", hover: "hover:bg-amber-500/20",
            onClick: async () => {
              try {
                toast.loading("Resolving alert...", { id: "alert" });
                await sendAlert({ id: "1", status: "resolved" });
                toast.success("Alert resolved.", { id: "alert" });
              } catch (e) {
                toast.error("Failed to resolve alert.", { id: "alert" });
              }
            }
          },
        ].map(a => {
          const Icon = a.icon;
          return (
            <button key={a.label} onClick={a.onClick || (() => toast.success(`${a.label} clicked.`))} className={`flex items-center justify-center gap-2 p-4 rounded-xl border ${a.bg} ${a.border} ${a.color} ${a.hover} transition-all font-medium text-sm shadow-inner`}>
              <Icon className="w-4 h-4" /> {a.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────── TRAIN MANAGEMENT TAB ───────────────
function TrainMgmtTab() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<"id" | "status" | "delay">("id");
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = trains
    .filter(t => t.id.includes(search) || t.name.toLowerCase().includes(search.toLowerCase()) || t.from.includes(search.toUpperCase()) || t.to.includes(search.toUpperCase()))
    .sort((a, b) => {
      const va = a[sortKey] ?? "", vb = b[sortKey] ?? "";
      return sortAsc ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });

  const SortTh = ({ label, k }: { label: string; k: typeof sortKey }) => (
    <th className="py-3 px-4 text-slate-400 text-xs font-semibold uppercase tracking-wider cursor-pointer hover:text-white transition-colors select-none"
      onClick={() => { if (sortKey === k) setSortAsc(!sortAsc); else { setSortKey(k); setSortAsc(true); } }}>
      <span className="flex items-center gap-1">{label}
        {sortKey === k ? (sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />) : null}
      </span>
    </th>
  );

  return (
    <div className="flex flex-col gap-6 animate-in fade-in">
      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Add Train", icon: Plus, c: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", h: "hover:bg-emerald-500/20" },
          { label: "Update Schedule", icon: Edit, c: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", h: "hover:bg-blue-500/20" },
          { label: "Assign Platform", icon: MapPin, c: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20", h: "hover:bg-teal-500/20" },
          { label: "Mark Delay", icon: Clock, c: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", h: "hover:bg-amber-500/20" },
          { label: "Cancel Train", icon: XCircle, c: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", h: "hover:bg-red-500/20" },
        ].map(a => { const Icon = a.icon; return (
          <button key={a.label} className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${a.bg} ${a.border} ${a.c} ${a.h} transition-all text-sm font-medium`}>
            <Icon className="w-4 h-4" /> {a.label}
          </button>
        ); })}
      </div>

      {/* Live train table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <SectionHeader icon={Train} title="Live Train Status Board" iconColor="text-emerald-400">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input placeholder="Search by ID, name, route…" value={search} onChange={e => setSearch(e.target.value)}
                className="pl-9 bg-black/40 border-white/10 text-white placeholder:text-slate-500 w-56 h-9 focus-visible:ring-emerald-500/50 text-sm" />
            </div>
            <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition-colors">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-2 inline-block" /> Live
            </Badge>
          </div>
        </SectionHeader>
        <div className="overflow-x-auto bg-black/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/40">
                <SortTh label="Train No" k="id" />
                <th className="py-3 px-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Train Name</th>
                <th className="py-3 px-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Route</th>
                <th className="py-3 px-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Departure</th>
                <th className="py-3 px-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Arrival</th>
                <th className="py-3 px-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Platform</th>
                <SortTh label="Delay" k="delay" />
                <SortTh label="Status" k="status" />
                <th className="py-3 px-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                        <Train className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <span className="text-white font-mono font-semibold text-sm">{t.id}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-300 text-sm font-medium">{t.name}</td>
                  <td className="py-3 px-4">
                    <span className="text-slate-300 text-sm">{t.from}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500 inline mx-1" />
                    <span className="text-slate-300 text-sm">{t.to}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-sm font-mono">{t.departure}</td>
                  <td className="py-3 px-4 text-slate-400 text-sm font-mono">{t.arrival}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-black/30 border border-white/10 text-slate-300 text-xs font-mono">PF {t.platform}</span>
                  </td>
                  <td className="py-3 px-4">
                    {t.delay > 0 ? (
                      <span className="text-amber-400 font-mono text-sm font-semibold">+{t.delay}m</span>
                    ) : (
                      <span className="text-emerald-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <Badge className={`text-xs font-mono font-medium ${t.status === "On Time" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                      {t.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="px-2.5 py-1 rounded-md text-xs font-medium bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 hover:text-white transition-colors">Track</button>
                      <button className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors">Edit</button>
                      <button className="px-2.5 py-1 rounded-md text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">Halt</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────── BOOKINGS TAB ───────────────
function BookingsTab() {
  const bCards = [
    { label: "Total Bookings", value: bookingStats.total.toLocaleString(), icon: Ticket, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { label: "Pending Refunds", value: bookingStats.pendingRefunds, icon: RefreshCw, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { label: "Cancelled Tickets", value: bookingStats.cancelled, icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
    { label: "Passenger Complaints", value: bookingStats.complaints, icon: AlertCircle, color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20" },
  ];

  const recentBookings = [
    { pnr: "2451369874", passenger: "Rahul Sharma", train: "12301 Rajdhani", route: "NDLS→HWH", class: "3A", amount: "₹2,145", status: "Confirmed", date: "02 Jun" },
    { pnr: "4867293015", passenger: "Amit Patel", train: "12951 Mumbai Raj.", route: "NDLS→BCT", class: "2A", amount: "₹3,480", status: "Waitlisted", date: "02 Jun" },
    { pnr: "7234891056", passenger: "Sneha Gupta", train: "22439 Vande Bharat", route: "NDLS→LKO", class: "CC", amount: "₹1,250", status: "Confirmed", date: "03 Jun" },
    { pnr: "1234567890", passenger: "Mohan Das", train: "12627 Karnataka Exp", route: "NDLS→SBC", class: "SL", amount: "₹ 985", status: "Cancelled", date: "01 Jun" },
    { pnr: "9876543210", passenger: "Lakshmi Iyer", train: "12002 Shatabdi", route: "NDLS→CDG", class: "CC", amount: "₹ 780", status: "Refund Pending", date: "01 Jun" },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {bCards.map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="glass-panel rounded-xl p-5 border border-white/5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.bg} ${c.border} border mb-3`}>
                <Icon className={`w-5 h-5 ${c.color}`} />
              </div>
              <div className="text-2xl font-bold text-white font-mono tracking-tight">{c.value}</div>
              <div className="text-slate-400 text-sm mt-1">{c.label}</div>
            </div>
          );
        })}
      </div>

      <div className="glass-panel rounded-xl overflow-hidden">
        <SectionHeader icon={Ticket} title="Recent Bookings" iconColor="text-emerald-400">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition-colors">
            <Download className="w-4 h-4" /> Export
          </button>
        </SectionHeader>
        <div className="overflow-x-auto bg-black/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/40">
                {["PNR", "Passenger", "Train", "Route", "Class", "Amount", "Status", "Date", "Action"].map(h => (
                  <th key={h} className="py-3 px-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentBookings.map(b => (
                <tr key={b.pnr} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="py-3 px-4 text-slate-300 text-xs font-mono">{b.pnr}</td>
                  <td className="py-3 px-4 text-white text-sm font-medium">{b.passenger}</td>
                  <td className="py-3 px-4 text-slate-300 text-sm">{b.train}</td>
                  <td className="py-3 px-4 text-slate-400 text-sm">{b.route}</td>
                  <td className="py-3 px-4"><span className="px-2 py-0.5 rounded bg-black/30 border border-white/10 text-slate-300 text-xs font-mono">{b.class}</span></td>
                  <td className="py-3 px-4 text-emerald-400 text-sm font-mono font-semibold">{b.amount}</td>
                  <td className="py-3 px-4">
                    <Badge className={`text-xs font-medium ${
                      b.status === "Confirmed" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      b.status === "Waitlisted" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      b.status === "Cancelled" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      "bg-violet-500/10 text-violet-400 border-violet-500/20"
                    }`}>{b.status}</Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-sm font-mono">{b.date}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="px-2 py-1 rounded-md text-xs bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-colors">View</button>
                      <button className="px-2 py-1 rounded-md text-xs bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors">Refund</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────── PLATFORMS TAB ───────────────
function PlatformsTab() {
  const statusColor = (s: string) =>
    s === "Critical" ? "bg-red-500/10 text-red-400 border-red-500/20" :
    s === "High Load" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
    s === "Low" ? "bg-slate-500/10 text-slate-400 border-slate-500/20" :
    "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";

  return (
    <div className="flex flex-col gap-6 animate-in fade-in">
      {/* Quick action buttons */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: "Assign Platform", icon: MapPin, c: "text-teal-400", bg: "bg-teal-500/10", b: "border-teal-500/20", h: "hover:bg-teal-500/20" },
          { label: "Schedule Maintenance", icon: Settings, c: "text-amber-400", bg: "bg-amber-500/10", b: "border-amber-500/20", h: "hover:bg-amber-500/20" },
          { label: "View Occupancy Map", icon: Eye, c: "text-blue-400", bg: "bg-blue-500/10", b: "border-blue-500/20", h: "hover:bg-blue-500/20" },
        ].map(a => { const Icon = a.icon; return (
          <button key={a.label} className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${a.bg} ${a.b} ${a.c} ${a.h} transition-all text-sm font-medium`}>
            <Icon className="w-4 h-4" /> {a.label}
          </button>
        ); })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Platform list */}
        <div className="glass-panel rounded-xl overflow-hidden">
          <SectionHeader icon={MapPin} title="Platform Occupancy" iconColor="text-blue-400" />
          <div className="p-4 flex flex-col gap-3 bg-black/20">
            {platformData.map((p, i) => (
              <div key={i} className="flex flex-col gap-2 p-3 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">{p.platform}</span>
                    <span className="text-slate-500 text-xs">· {p.station}</span>
                  </div>
                  <Badge className={`text-xs ${statusColor(p.status)}`}>{p.status}</Badge>
                </div>
                <Progress value={p.utilization} className="h-1.5 bg-black/40"
                  indicatorColor={p.utilization > 90 ? "bg-red-500" : p.utilization > 75 ? "bg-amber-500" : "bg-emerald-500"} />
                <div className="flex justify-between text-xs text-slate-500">
                  <span>{p.trains} trains today</span>
                  <span>{p.utilization}% utilized</span>
                  <span>Peak: {p.peakHour}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance status */}
        <div className="glass-panel rounded-xl overflow-hidden">
          <SectionHeader icon={Settings} title="Maintenance Schedule" iconColor="text-amber-400" />
          <div className="p-4 flex flex-col gap-3 bg-black/20">
            {[
              { platform: "P5 - New Delhi", task: "Signal system inspection", due: "Today 23:00", priority: "High" },
              { platform: "P3 - Howrah", task: "Platform surface repair", due: "07 Jun", priority: "Medium" },
              { platform: "P2 - Mumbai Central", task: "LED board replacement", due: "08 Jun", priority: "Low" },
              { platform: "P1 - Chennai Central", task: "Safety barrier installation", due: "10 Jun", priority: "High" },
              { platform: "P6 - New Delhi", task: "Routine cleaning & inspection", due: "06 Jun", priority: "Low" },
            ].map((m, i) => (
              <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 transition-colors">
                <div>
                  <div className="text-white text-sm font-medium">{m.platform}</div>
                  <div className="text-slate-400 text-xs mt-0.5">{m.task}</div>
                  <div className="text-slate-500 text-xs mt-1 font-mono">Due: {m.due}</div>
                </div>
                <Badge className={`text-xs ml-2 flex-shrink-0 ${
                  m.priority === "High" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                  m.priority === "Medium" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                  "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                }`}>{m.priority}</Badge>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────── USERS TAB ───────────────
function UsersTab() {
  const [search, setSearch] = useState("");
  const filtered = adminUsers.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const statusStyle = (s: string) =>
    s === "Active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
    s === "Inactive" ? "bg-slate-500/10 text-slate-400 border-slate-500/20" :
    "bg-red-500/10 text-red-400 border-red-500/20";

  return (
    <div className="flex flex-col gap-6 animate-in fade-in">
      {/* Action bar */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex gap-3 flex-wrap">
          {[
            { label: "Add Admin", icon: UserPlus, c: "text-emerald-400", bg: "bg-emerald-500/10", b: "border-emerald-500/20", h: "hover:bg-emerald-500/20" },
            { label: "Assign Role", icon: Shield, c: "text-blue-400", bg: "bg-blue-500/10", b: "border-blue-500/20", h: "hover:bg-blue-500/20" },
            { label: "Permissions", icon: Lock, c: "text-violet-400", bg: "bg-violet-500/10", b: "border-violet-500/20", h: "hover:bg-violet-500/20" },
          ].map(a => { const Icon = a.icon; return (
            <button key={a.label} className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${a.bg} ${a.b} ${a.c} ${a.h} transition-all text-sm font-medium`}>
              <Icon className="w-4 h-4" /> {a.label}
            </button>
          ); })}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)}
            className="pl-9 bg-black/40 border-white/10 text-white placeholder:text-slate-500 w-52 h-9 focus-visible:ring-blue-500/50 text-sm" />
        </div>
      </div>

      {/* User table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <SectionHeader icon={Users} title="Admin Users & Roles" iconColor="text-blue-400" />
        <div className="overflow-x-auto bg-black/20">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-black/40">
                {["User", "Role", "Email", "Status", "Last Login", "Actions"].map(h => (
                  <th key={h} className="py-3 px-4 text-slate-400 text-xs font-semibold uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs font-bold">
                        {u.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <div className="text-white text-sm font-medium">{u.name}</div>
                        <div className="text-slate-500 text-xs font-mono">{u.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge className="bg-violet-500/10 text-violet-300 border-violet-500/20 text-xs">{u.role}</Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-400 text-sm">{u.email}</td>
                  <td className="py-3 px-4">
                    <Badge className={`text-xs font-medium ${statusStyle(u.status)}`}>
                      <div className={`w-1.5 h-1.5 rounded-full inline-block mr-1.5 ${u.status === "Active" ? "bg-emerald-400 animate-pulse" : u.status === "Blocked" ? "bg-red-400" : "bg-slate-400"}`} />
                      {u.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-500 text-xs font-mono">{u.lastLogin}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="px-2 py-1 rounded-md text-xs bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 transition-colors">Edit</button>
                      {u.status === "Blocked" ? (
                        <button className="px-2 py-1 rounded-md text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors flex items-center gap-1"><Unlock className="w-3 h-3" />Unblock</button>
                      ) : (
                        <button className="px-2 py-1 rounded-md text-xs bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center gap-1"><Lock className="w-3 h-3" />Block</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Permission matrix */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <SectionHeader icon={Lock} title="Role Permission Matrix" iconColor="text-violet-400" />
        <div className="p-5 overflow-x-auto bg-black/20">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="border-b border-white/10">
                <th className="py-3 px-4 text-slate-400 text-xs font-semibold uppercase">Module</th>
                {["Super Admin", "Ops Controller", "Zone Manager", "Read-only"].map(r => (
                  <th key={r} className="py-3 px-4 text-slate-400 text-xs font-semibold uppercase text-center">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                { module: "Train Management", perms: [true, true, true, false] },
                { module: "User Management", perms: [true, false, false, false] },
                { module: "Booking & Refunds", perms: [true, true, false, true] },
                { module: "Platform Assignment", perms: [true, true, true, false] },
                { module: "Alert Resolution", perms: [true, true, false, false] },
                { module: "Reports & Export", perms: [true, true, true, true] },
                { module: "System Settings", perms: [true, false, false, false] },
              ].map(row => (
                <tr key={row.module} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-3 px-4 text-slate-300 text-sm font-medium">{row.module}</td>
                  {row.perms.map((p, i) => (
                    <td key={i} className="py-3 px-4 text-center">
                      {p ? <CheckCircle className="w-4 h-4 text-emerald-400 mx-auto" /> : <XCircle className="w-4 h-4 text-slate-600 mx-auto" />}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────── ALERTS TAB ───────────────
function AlertsTab() {
  const [filter, setFilter] = useState("all");
  const filtered = filter === "all" ? alerts : alerts.filter(a => a.type === filter);

  const typeStyle = (t: string) =>
    t === "critical" ? { badge: "bg-red-500/10 text-red-400 border-red-500/20", panel: "border-red-500/20 bg-red-500/5", icon: <XCircle className="w-4 h-4 text-red-400" /> } :
    t === "warning" ? { badge: "bg-amber-500/10 text-amber-400 border-amber-500/20", panel: "border-amber-500/20 bg-amber-500/5", icon: <AlertTriangle className="w-4 h-4 text-amber-400" /> } :
    t === "success" ? { badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", panel: "border-emerald-500/20 bg-emerald-500/5", icon: <CheckCircle className="w-4 h-4 text-emerald-400" /> } :
    { badge: "bg-blue-500/10 text-blue-400 border-blue-500/20", panel: "border-blue-500/20 bg-blue-500/5", icon: <Info className="w-4 h-4 text-blue-400" /> };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in">
      <div className="flex gap-2 flex-wrap">
        {["all", "critical", "warning", "info", "success"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all border ${filter === f ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" : "text-slate-400 hover:text-white hover:bg-white/5 border-transparent"}`}>
            {f === "all" ? `All (${alerts.length})` : `${f.charAt(0).toUpperCase() + f.slice(1)} (${alerts.filter(a => a.type === f).length})`}
          </button>
        ))}
      </div>
      <div className="flex flex-col gap-3">
        {filtered.map(alert => {
          const s = typeStyle(alert.type);
          return (
            <div key={alert.id} className={`glass-panel p-4 rounded-xl border ${s.panel} flex items-start gap-4`}>
              <div className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center flex-shrink-0">{s.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className={`text-sm font-semibold ${alert.read ? "text-slate-400" : "text-white"}`}>{alert.title}</div>
                    <div className="text-slate-400 text-xs mt-1 leading-relaxed">{alert.message}</div>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-slate-500 text-xs font-mono">{alert.time}</span>
                      {alert.train && <Badge className="text-[10px] font-mono bg-white/10 text-slate-300 border-white/20 px-1.5 py-0">TRN-{alert.train}</Badge>}
                      <Badge className={`text-[10px] font-mono ${s.badge}`}>{alert.type.toUpperCase()}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={async () => {
                        try {
                           toast.loading("Resolving...", { id: "resolve" });
                           await sendAlert({ id: alert.id, status: "resolved" });
                           toast.success("Resolved successfully.", { id: "resolve" });
                        } catch(e) {
                           toast.error("Error", { id: "resolve" });
                        }
                    }} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors whitespace-nowrap">
                      {alert.type === "critical" ? "Resolve" : "View"}
                    </button>
                    {alert.type === "critical" && (
                      <button onClick={() => toast.success("Alert escalated successfully.")} className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10 transition-colors">
                        Escalate
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────── AUDIT LOGS TAB ───────────────
function AuditTab() {
  const iconMap: Record<string, React.ReactNode> = {
    train: <Train className="w-4 h-4 text-emerald-400" />,
    map: <MapPin className="w-4 h-4 text-blue-400" />,
    user: <Users className="w-4 h-4 text-violet-400" />,
    alert: <Bell className="w-4 h-4 text-amber-400" />,
    file: <FileText className="w-4 h-4 text-teal-400" />,
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in">
      <div className="glass-panel rounded-xl overflow-hidden">
        <SectionHeader icon={FileText} title="Audit Logs — All Changes" iconColor="text-teal-400">
          <div className="flex gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition-colors">
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-300 text-sm hover:bg-white/10 transition-colors">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </SectionHeader>
        <div className="divide-y divide-white/5 bg-black/20">
          {auditLogs.map(log => (
            <div key={log.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/5 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-black/30 border border-white/10 flex items-center justify-center flex-shrink-0">
                {iconMap[log.icon]}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-slate-200 text-sm font-medium">{log.action}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-slate-400 text-xs">by <span className="text-white font-medium">{log.user}</span></span>
                  <span className="text-slate-600">·</span>
                  <Badge className="text-[10px] bg-black/30 text-slate-400 border-white/10 font-mono">{log.module}</Badge>
                </div>
              </div>
              <span className="text-slate-500 text-xs font-mono flex-shrink-0">{log.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────── SYSTEM HEALTH TAB ───────────────
function SystemTab() {
  const health = { uptime: "99.94%", apiLatency: "42ms", openIncidents: 1, serverStatus: "All Systems Go" };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in">
      {/* Health KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "System Uptime", value: health.uptime, icon: Activity, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
          { label: "Avg API Latency", value: health.apiLatency, icon: Zap, color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" },
          { label: "Open Incidents", value: health.openIncidents, icon: AlertCircle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
          { label: "Server Status", value: "Nominal", icon: Server, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
        ].map(c => {
          const Icon = c.icon;
          return (
            <div key={c.label} className="glass-panel rounded-xl p-5 border border-white/5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${c.bg} ${c.border} border shadow-inner flex-shrink-0`}>
                <Icon className={`w-5 h-5 ${c.color}`} />
              </div>
              <div>
                <div className="text-white text-xl font-bold font-mono tracking-tight">{c.value}</div>
                <div className="text-slate-400 text-xs">{c.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Subsystems */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <SectionHeader icon={Server} title="Subsystem Health Matrix" iconColor="text-blue-400">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm hover:bg-emerald-500/20 transition-colors">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </SectionHeader>
        <div className="divide-y divide-white/5 bg-black/20">
          {systemHealth.map(s => (
            <div key={s.name} className="flex items-center justify-between px-5 py-4 hover:bg-white/5 transition-colors group">
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${s.status === "Operational" ? "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" : "bg-amber-400"}`} />
                <span className="text-slate-200 font-medium text-sm">{s.name}</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-slate-500 text-xs font-mono">Latency: {s.latency}</span>
                <span className="text-slate-400 text-xs font-mono">Uptime: {s.uptime}</span>
                <Badge className={`w-28 justify-center text-xs font-mono shadow-inner ${s.status === "Operational" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border-amber-500/20"}`}>
                  {s.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Command tools */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <SectionHeader icon={Terminal} title="Ops Command Tools" iconColor="text-violet-400" />
        <div className="p-5 grid grid-cols-2 sm:grid-cols-3 gap-4 bg-black/20">
          {[
            { label: "Emergency Network Halt", color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", hover: "hover:bg-red-500/20" },
            { label: "Issue Global Advisory", color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", hover: "hover:bg-amber-500/20" },
            { label: "Generate Ops Report", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", hover: "hover:bg-blue-500/20" },
            { label: "Broadcast PA Message", color: "text-violet-400", bg: "bg-violet-500/10", border: "border-violet-500/20", hover: "hover:bg-violet-500/20" },
            { label: "Platform Re-allocation", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", hover: "hover:bg-emerald-500/20" },
            { label: "Export Telemetry Data", color: "text-slate-300", bg: "bg-white/5", border: "border-white/10", hover: "hover:bg-white/10" },
          ].map(a => (
            <button key={a.label} className={`h-14 px-4 rounded-xl border ${a.bg} ${a.border} ${a.color} ${a.hover} transition-all font-medium text-sm text-left shadow-inner flex flex-col justify-center leading-tight`}>
              <span className="opacity-60 text-xs font-mono mb-0.5">&gt; run_cmd</span>
              {a.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────── MAIN COMPONENT ───────────────
export function AdminPortal() {
  const [activeTab, setActiveTab] = useState("overview");

  const renderTab = () => {
    switch (activeTab) {
      case "overview":  return <OverviewTab />;
      case "trains":    return <TrainMgmtTab />;
      case "bookings":  return <BookingsTab />;
      case "platforms": return <PlatformsTab />;
      case "users":     return <UsersTab />;
      case "alerts":    return <AlertsTab />;
      case "audit":     return <AuditTab />;
      case "system":    return <SystemTab />;
      default:          return <OverviewTab />;
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Admin &amp; Operations Control</h2>
          <p className="text-emerald-400/70 text-sm mt-1">Railway operations command center — authorized personnel only</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge className="bg-violet-500/20 text-violet-300 border-violet-500/30 flex items-center gap-2 px-3 py-1.5 shadow-[0_0_15px_rgba(139,92,246,0.15)] font-mono text-xs">
            <Shield className="w-3.5 h-3.5" /> SECURE ADMIN ACCESS
          </Badge>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
            <span className="text-emerald-400 text-xs font-medium">Live</span>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="glass-panel p-1.5 rounded-xl flex items-center gap-1 overflow-x-auto custom-scrollbar border-white/5">
        {TABS.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                activeTab === tab.id
                  ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]"
                  : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"
              }`}>
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="min-h-[500px]">
        {renderTab()}
      </div>
    </div>
  );
}
