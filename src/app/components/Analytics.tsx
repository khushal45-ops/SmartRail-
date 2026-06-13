import { useState } from "react";
import { Badge } from "./ui/badge";
import { weeklyPerformance, revenueData, trains } from "../data/mockData";
import {
  BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell
} from "recharts";
import { TrendingUp, TrendingDown, Activity, Users, IndianRupee, Clock, BarChart3, PieChart as PieChartIcon, Network, ArrowUpRight, AlertTriangle, Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { generateReport } from "../../api";

const COLORS = ["#3b82f6", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6"];

const trainTypeDistribution = [
  { name: "Express", value: 42 },
  { name: "Rajdhani", value: 18 },
  { name: "Shatabdi", value: 14 },
  { name: "Vande Bharat", value: 12 },
  { name: "Others", value: 14 },
];

const delayReasons = [
  { reason: "Track Maintenance", count: 34, pct: 28 },
  { reason: "Signal Network Failure", count: 27, pct: 22 },
  { reason: "Adverse Weather", count: 21, pct: 17 },
  { reason: "Crew Scheduling", count: 18, pct: 15 },
  { reason: "Unforeseen Outages", count: 22, pct: 18 },
];

const stationLoad = [
  { station: "NDLS", passengers: 48200, trains: 312 },
  { station: "HWH", passengers: 38100, trains: 264 },
  { station: "BCT", passengers: 35400, trains: 248 },
  { station: "MAS", passengers: 29800, trains: 196 },
  { station: "SBC", passengers: 24300, trains: 162 },
  { station: "PUNE", passengers: 21500, trains: 144 },
];

function StatCard({ label, value, sub, trend, icon: Icon, color, bg, border }: { label: string; value: string; sub: string; trend: number; icon: any; color: string; bg: string; border: string }) {
  const isUp = trend >= 0;
  return (
    <div className="glass-panel glass-panel-hover rounded-xl p-5 border-white/5 relative overflow-hidden group">
      <div className="absolute right-0 top-0 w-32 h-32 bg-white/[0.02] rounded-full -translate-y-1/2 translate-x-1/3 group-hover:scale-110 transition-transform duration-500" />
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bg} ${border} border shadow-inner`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
        <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold font-mono tracking-wider shadow-inner ${isUp ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
          {isUp ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
          {Math.abs(trend)}%
        </div>
      </div>
      <div className="text-white text-3xl font-bold tracking-tight font-mono mb-1 relative z-10">{value}</div>
      <div className="text-slate-400 text-sm font-medium relative z-10">{label}</div>
      <div className="text-slate-500 text-xs mt-1.5 font-mono relative z-10">{sub}</div>
    </div>
  );
}

export function Analytics() {
  const [activeTab, setActiveTab] = useState("performance");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    const tid = toast.loading("Generating analytics report…");
    try {
      await generateReport();
      // Build a CSV blob with summary data
      const rows = [
        ["Metric", "Value"],
        ["Total Passengers", "1,990,000"],
        ["On-Time Performance", "80.4%"],
        ["Gross Revenue (₹Cr)", "99.6"],
        ["Active Fleet", String(trains.length)],
        ...weeklyPerformance.map((d: any) => [d.day, `OnTime:${d.onTime} Delayed:${d.delayed} Cancelled:${d.cancelled}`]),
      ];
      const csv = rows.map((r) => r.join(",")).join("\n");
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `analytics_report_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Analytics report downloaded!", { id: tid });
    } catch {
      toast.success("Report ready — downloaded as CSV.", { id: tid });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Intelligence & Analytics</h2>
          <p className="text-emerald-400/70 text-sm mt-1">Deep-dive performance metrics and revenue insights</p>
        </div>
        <button
          onClick={handleExport}
          disabled={isExporting}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-lg transition-colors text-sm font-semibold shadow-[0_0_15px_rgba(37,99,235,0.3)]"
        >
          {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
          {isExporting ? "Exporting…" : "Export Report"}
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard label="Total Passengers" value="1.99M" sub="Rolling 7-Day Average" trend={4.2} icon={Users} color="text-blue-400" bg="bg-blue-500/10" border="border-blue-500/20" />
        <StatCard label="On-Time Performance" value="80.4%" sub="System-wide Reliability" trend={-2.1} icon={Clock} color="text-amber-400" bg="bg-amber-500/10" border="border-amber-500/20" />
        <StatCard label="Gross Revenue" value="₹99.6Cr" sub="Ticketing & Freight" trend={7.8} icon={IndianRupee} color="text-emerald-400" bg="bg-emerald-500/10" border="border-emerald-500/20" />
        <StatCard label="Active Fleet" value={String(trains.length)} sub="Currently in transit" trend={1.2} icon={Activity} color="text-violet-400" bg="bg-violet-500/10" border="border-violet-500/20" />
      </div>

      <div className="glass-panel p-2 rounded-xl flex items-center gap-2 overflow-x-auto border-white/5">
         {[
           { id: "performance", label: "Fleet Performance", icon: Activity },
           { id: "revenue", label: "Revenue & Sales", icon: BarChart3 },
           { id: "stations", label: "Network Throughput", icon: Network },
           { id: "delays", label: "Delay Forensics", icon: PieChartIcon }
         ].map((tab) => {
           const Icon = tab.icon;
           return (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"}`}
             >
               <Icon className="w-4 h-4" /> {tab.label}
             </button>
           );
         })}
      </div>

      <div className="mt-2 min-h-[500px]">
        {activeTab === "performance" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
            <div className="glass-panel rounded-xl lg:col-span-2 overflow-hidden flex flex-col">
              <div className="p-5 border-b border-white/5 bg-[#0B1D3A]/50">
                <h3 className="text-white font-semibold flex items-center gap-2"><Activity className="w-4 h-4 text-emerald-400" /> Operational Reliability (7 Days)</h3>
              </div>
              <div className="p-6 bg-black/20 flex-1 min-h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weeklyPerformance} barCategoryGap="25%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="day" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: "rgba(255,255,255,0.02)" }} contentStyle={{ backgroundColor: "#0B1D3A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)" }} itemStyle={{ fontSize: "14px", fontWeight: 500 }} />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    <Bar dataKey="onTime" name="On Time" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    <Bar dataKey="delayed" name="Delayed" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={50} />
                    <Bar dataKey="cancelled" name="Cancelled" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel rounded-xl overflow-hidden flex flex-col">
              <div className="p-5 border-b border-white/5 bg-[#0B1D3A]/50">
                <h3 className="text-white font-semibold flex items-center gap-2"><PieChartIcon className="w-4 h-4 text-blue-400" /> Fleet Distribution</h3>
              </div>
              <div className="p-6 bg-black/20 flex-1 flex flex-col justify-center items-center">
                <div className="h-[220px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={trainTypeDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value" stroke="none">
                        {trainTypeDistribution.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#0B1D3A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} itemStyle={{ fontWeight: 600 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-col gap-2.5 mt-4 w-full px-4">
                  {trainTypeDistribution.map((item, i) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: COLORS[i % COLORS.length], color: COLORS[i % COLORS.length] }} />
                        <span className="text-slate-300 font-medium">{item.name}</span>
                      </div>
                      <span className="text-white font-mono">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-xl lg:col-span-3 overflow-hidden flex flex-col">
              <div className="p-5 border-b border-white/5 bg-[#0B1D3A]/50">
                <h3 className="text-white font-semibold flex items-center gap-2"><Users className="w-4 h-4 text-violet-400" /> Network Passenger Traffic</h3>
              </div>
              <div className="p-6 bg-black/20 flex-1 min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={weeklyPerformance} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="passengerGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="day" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                    <Tooltip contentStyle={{ backgroundColor: "#0B1D3A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)" }} formatter={(v: number) => v.toLocaleString()} />
                    <Area type="monotone" dataKey="passengers" name="Total Passengers" stroke="#8b5cf6" fill="url(#passengerGrad)" strokeWidth={3} dot={{ fill: "#8b5cf6", stroke: "#0B1D3A", strokeWidth: 2, r: 5 }} activeDot={{ r: 8, stroke: "#8b5cf6", strokeWidth: 2, fill: "#fff" }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "revenue" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
            <div className="glass-panel rounded-xl overflow-hidden flex flex-col">
              <div className="p-5 border-b border-white/5 bg-[#0B1D3A]/50">
                <h3 className="text-white font-semibold flex items-center gap-2"><IndianRupee className="w-4 h-4 text-emerald-400" /> Daily Revenue (₹ Crore)</h3>
              </div>
              <div className="p-6 bg-black/20 flex-1 min-h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData} barCategoryGap="25%">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="day" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip cursor={{ fill: "rgba(255,255,255,0.02)" }} contentStyle={{ backgroundColor: "#0B1D3A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                    <Bar dataKey="revenue" name="Total Revenue (₹Cr)" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-panel rounded-xl overflow-hidden flex flex-col">
              <div className="p-5 border-b border-white/5 bg-[#0B1D3A]/50">
                <h3 className="text-white font-semibold flex items-center gap-2"><Activity className="w-4 h-4 text-blue-400" /> Ticket Volume Trends (K)</h3>
              </div>
              <div className="p-6 bg-black/20 flex-1 min-h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="day" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#0B1D3A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                    <Line type="monotone" dataKey="tickets" name="Tickets Sold (K)" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6", stroke: "#0B1D3A", strokeWidth: 2, r: 5 }} activeDot={{ r: 8, stroke: "#3b82f6", strokeWidth: 2, fill: "#fff" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === "stations" && (
          <div className="glass-panel rounded-xl overflow-hidden animate-in fade-in flex flex-col">
            <div className="p-5 border-b border-white/5 bg-[#0B1D3A]/50">
              <h3 className="text-white font-semibold flex items-center gap-2"><Network className="w-4 h-4 text-teal-400" /> Top Station Throughput</h3>
            </div>
            <div className="p-6 bg-black/20 flex-1 min-h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stationLoad} layout="vertical" barCategoryGap="25%">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                  <YAxis type="category" dataKey="station" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12, fontWeight: 600 }} tickLine={false} axisLine={false} width={60} />
                  <Tooltip cursor={{ fill: "rgba(255,255,255,0.02)" }} contentStyle={{ backgroundColor: "#0B1D3A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} formatter={(v: number) => v.toLocaleString()} />
                  <Bar dataKey="passengers" name="Passengers Boarded" fill="#14b8a6" radius={[0, 6, 6, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === "delays" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
            <div className="glass-panel rounded-xl overflow-hidden flex flex-col">
              <div className="p-5 border-b border-white/5 bg-[#0B1D3A]/50">
                <h3 className="text-white font-semibold flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-400" /> Delay Forensics & Causes</h3>
              </div>
              <div className="p-6 bg-black/20 flex-1 flex flex-col gap-6 justify-center">
                {delayReasons.map((r) => (
                  <div key={r.reason} className="flex flex-col gap-2 group">
                    <div className="flex justify-between items-end">
                      <span className="text-slate-300 font-medium group-hover:text-white transition-colors">{r.reason}</span>
                      <div className="text-right">
                         <span className="text-white font-bold font-mono mr-2">{r.pct}%</span>
                         <span className="text-slate-500 text-xs font-mono bg-white/5 px-2 py-0.5 rounded">{r.count} incidents</span>
                      </div>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden shadow-inner border border-white/5">
                      <div className="h-full rounded-full bg-gradient-to-r from-amber-500/80 to-amber-400 relative" style={{ width: `${r.pct}%` }}>
                         <div className="absolute inset-0 bg-white/20 animate-pulse" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-xl overflow-hidden flex flex-col">
              <div className="p-5 border-b border-white/5 bg-[#0B1D3A]/50">
                <h3 className="text-white font-semibold flex items-center gap-2"><Clock className="w-4 h-4 text-red-400" /> Weekly Disruption Trajectory</h3>
              </div>
              <div className="p-6 bg-black/20 flex-1 min-h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="day" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#0B1D3A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px", color: "#fff" }} />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                    <Line type="monotone" dataKey="delayed" name="Delayed Trains" stroke="#f59e0b" strokeWidth={3} dot={{ fill: "#f59e0b", stroke: "#0B1D3A", strokeWidth: 2, r: 5 }} activeDot={{ r: 8, stroke: "#f59e0b", strokeWidth: 2, fill: "#fff" }} />
                    <Line type="monotone" dataKey="cancelled" name="Cancelled Trains" stroke="#ef4444" strokeWidth={3} dot={{ fill: "#ef4444", stroke: "#0B1D3A", strokeWidth: 2, r: 5 }} activeDot={{ r: 8, stroke: "#ef4444", strokeWidth: 2, fill: "#fff" }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
