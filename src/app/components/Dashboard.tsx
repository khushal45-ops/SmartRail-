import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { trains, alerts, weeklyPerformance } from "../data/mockData";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import {
  Train, Users, AlertTriangle, CheckCircle, Clock, Activity, TrendingUp, Bell, ArrowRight, Zap, Map as MapIcon, BarChart2
} from "lucide-react";
import { RailwayOperationsMap } from "./RailwayOperationsMap";
import { toast } from "sonner";

export function Dashboard({ onNavigate, role = "admin" }: { onNavigate: (view: string) => void, role?: "passenger" | "admin" }) {
  const onTimeCount = trains.filter((t) => t.status === "On Time").length;
  const delayedCount = trains.filter((t) => t.status === "Delayed").length;
  const unreadAlerts = alerts.filter((a) => !a.read).length;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            {role === "passenger" ? "Passenger Dashboard" : "Operations Command Center"}
          </h1>
          <p className="text-emerald-400/70 text-sm mt-1">
            {role === "passenger" ? "Personalized Travel Assistant & Updates" : "Live Railway Operations Overview"}
          </p>
        </div>
        <div className="flex items-center gap-3">
           <button onClick={() => { toast.success("Exporting Dashboard to PDF...", { id: "export" }); setTimeout(() => toast.success("PDF exported successfully.", { id: "export" }), 1500); }} className="px-4 py-2 glass-panel rounded-lg text-sm text-slate-300 hover:text-white transition-colors">
              Export PDF
           </button>
           <button onClick={() => toast.success("Dashboard refreshed manually.")} className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:bg-emerald-500/20 transition-all cursor-pointer">
             <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
             <span className="text-emerald-400 text-sm font-medium tracking-wide">Sync: Real-time</span>
           </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Active Trains", value: trains.length, sub: `${onTimeCount} on time`, trend: "+12%", icon: Train, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
          { label: "Passengers Today", value: "4.82M", sub: "Platform Occupancy: 82%", trend: "+4.2%", icon: Users, color: "text-teal-400", bg: "bg-teal-500/10", border: "border-teal-500/20" },
          { label: "Delayed Trains", value: delayedCount, sub: "Avg 22 min delay", trend: "-2.1%", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
          { label: "Alerts Generated", value: 12, sub: "2 critical requiring action", trend: "-5.4%", icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20" },
        ].map((stat) => {
          const Icon = stat.icon;
          const isNegativeTrend = stat.trend.startsWith("-") && stat.label !== "Delayed Trains" && stat.label !== "Alerts Generated";
          const isPositiveTrend = stat.trend.startsWith("-") && (stat.label === "Delayed Trains" || stat.label === "Alerts Generated") || stat.trend.startsWith("+") && stat.label !== "Delayed Trains" && stat.label !== "Alerts Generated";
          
          return (
            <div key={stat.label} className="glass-panel glass-panel-hover rounded-xl p-5 relative overflow-hidden group cursor-pointer">
              <div className={`absolute -right-6 -top-6 w-24 h-24 ${stat.bg} rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500`} />
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className={`p-2 rounded-lg ${stat.bg} ${stat.border} border shadow-inner`}>
                   <Icon className={`w-5 h-5 ${stat.color}`} />
                </div>
                <Badge className={`${isPositiveTrend ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'} text-xs font-mono`}>
                  {isPositiveTrend ? '↑' : '↓'} {stat.trend.replace(/[+-]/, '')}
                </Badge>
              </div>
              <div className="text-3xl font-semibold text-white mb-1 tracking-tight relative z-10">{stat.value}</div>
              <div className="text-slate-400 text-sm font-medium relative z-10">{stat.label}</div>
              <div className="text-slate-500 text-xs mt-1 relative z-10">{stat.sub}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Railway Network Map */}
        <div className="glass-panel rounded-xl lg:col-span-2 overflow-hidden flex flex-col relative">
          <div className="p-5 border-b border-white/5 flex items-center justify-between z-10 bg-[#0B1D3A]/80 backdrop-blur-md">
            <h3 className="text-white font-medium flex items-center gap-2">
              <MapIcon className="w-4 h-4 text-emerald-400" />
              Live Railway Network Map
            </h3>
          </div>
          <div className="flex-1 bg-[#040A15] relative min-h-[450px]">
            <RailwayOperationsMap isDashboard={true} />
          </div>
        </div>

        {/* Zone Performance Metrics */}
        <div className="glass-panel rounded-xl flex flex-col">
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <h3 className="text-white font-medium flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-teal-400" />
              Zone Performance
            </h3>
          </div>
          <div className="p-5 flex-1 flex flex-col gap-5">
            {[
              { zone: "Northern Zone", eff: 94, trains: 142 },
              { zone: "Western Zone", eff: 88, trains: 98 },
              { zone: "Southern Zone", eff: 96, trains: 115 },
              { zone: "Eastern Zone", eff: 82, trains: 76 },
              { zone: "Central Zone", eff: 91, trains: 104 }
            ].map((z) => (
              <div key={z.zone} className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                   <span className="text-sm font-medium text-slate-200">{z.zone}</span>
                   <span className="text-xs text-slate-400">{z.eff}% Efficiency</span>
                </div>
                <Progress value={z.eff} className="h-2 bg-black/40" indicatorColor={z.eff > 90 ? "bg-emerald-500" : z.eff > 85 ? "bg-teal-500" : "bg-amber-500"} />
                <div className="text-xs text-slate-500 text-right">{z.trains} active trains</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Passenger Traffic Chart */}
        <div className="glass-panel rounded-xl lg:col-span-2 p-5 flex flex-col gap-4">
          <h3 className="text-white font-medium flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            Passenger Traffic — Last 7 Days
          </h3>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyPerformance}>
                <defs>
                  <linearGradient id="pgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="day" stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis stroke="#64748b" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
                <Tooltip contentStyle={{ backgroundColor: "#0B1D3A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff", boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)" }} itemStyle={{ color: "#10b981" }} formatter={(v: number) => v.toLocaleString()} />
                <Area type="monotone" dataKey="passengers" name="Passengers" stroke="#10b981" fill="url(#pgGrad)" strokeWidth={3} activeDot={{ r: 6, fill: "#10b981", stroke: "#0B1D3A", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="glass-panel rounded-xl p-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                Critical Alerts
              </h3>
              <button onClick={() => onNavigate("alerts")} className="text-emerald-400 text-sm flex items-center gap-1 hover:text-emerald-300 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <div className="flex flex-col gap-3 flex-1 overflow-y-auto custom-scrollbar">
            {alerts.slice(0, 5).map((alert) => (
              <div key={alert.id} className={`flex items-start gap-3 p-3 rounded-lg bg-black/20 border border-white/5 hover:border-white/10 transition-colors cursor-pointer`}>
                <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 shadow-[0_0_8px_currentColor] ${alert.type === "critical" ? "bg-red-500 text-red-500" : alert.type === "warning" ? "bg-amber-500 text-amber-500" : alert.type === "success" ? "bg-emerald-500 text-emerald-500" : "bg-teal-500 text-teal-500"}`} />
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-medium truncate ${alert.read ? "text-slate-400" : "text-slate-200"}`}>{alert.title}</div>
                  <div className="text-slate-500 text-xs mt-1 font-mono">{alert.time} · {alert.type.toUpperCase()}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live Trains Command Table */}
      <div className="glass-panel rounded-xl overflow-hidden">
        <div className="p-5 border-b border-white/5 flex items-center justify-between bg-[#0B1D3A]/50">
            <h3 className="text-white font-medium flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-400" />
              Live Train Operations
            </h3>
            <button onClick={() => onNavigate("trains")} className="text-emerald-400 text-sm flex items-center gap-1 hover:text-emerald-300 transition-colors bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              Operations Center <ArrowRight className="w-3 h-3" />
            </button>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-black/20">
                  <th className="py-4 px-5 text-slate-400 text-xs font-semibold uppercase tracking-wider">Train Identity</th>
                  <th className="py-4 px-5 text-slate-400 text-xs font-semibold uppercase tracking-wider">Route Assignment</th>
                  <th className="py-4 px-5 text-slate-400 text-xs font-semibold uppercase tracking-wider">Current Sector</th>
                  <th className="py-4 px-5 text-slate-400 text-xs font-semibold uppercase tracking-wider">Route Progress</th>
                  <th className="py-4 px-5 text-slate-400 text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="py-4 px-5 text-slate-400 text-xs font-semibold uppercase tracking-wider">Velocity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {trains.map((t) => (
                  <tr key={t.id} className="hover:bg-white/5 transition-colors group cursor-pointer">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                         <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-colors">
                            <Train className="w-4 h-4 text-emerald-400" />
                         </div>
                         <div>
                            <div className="text-slate-200 text-sm font-semibold font-mono tracking-wide">{t.id}</div>
                            <div className="text-slate-500 text-xs mt-0.5">{t.name}</div>
                         </div>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                       <div className="flex items-center gap-2 text-slate-300 text-sm">
                          {t.from} <ArrowRight className="w-3 h-3 text-slate-500" /> {t.to}
                       </div>
                    </td>
                    <td className="py-4 px-5">
                       <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-black/20 border border-white/5 text-slate-300 text-xs font-medium">
                          <MapIcon className="w-3 h-3 text-teal-400" />
                          {t.currentStation}
                       </div>
                    </td>
                    <td className="py-4 px-5" style={{ minWidth: 160 }}>
                      <div className="flex items-center gap-3">
                         <Progress value={t.progress} className="h-1.5 flex-1 bg-black/40" indicatorColor="bg-gradient-to-r from-emerald-500 to-teal-400" />
                         <span className="text-slate-400 text-xs font-mono w-8">{t.progress}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <Badge className={t.status === "On Time" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs font-medium shadow-[0_0_10px_rgba(16,185,129,0.1)]" : "bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs font-medium shadow-[0_0_10px_rgba(245,158,11,0.1)]"}>
                        {t.status}{t.delay > 0 ? ` +${t.delay}m` : ""}
                      </Badge>
                    </td>
                    <td className="py-4 px-5 text-slate-300 text-sm font-mono">
                      {t.speed} <span className="text-slate-500 text-xs">km/h</span>
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
