import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { platformData, routeUtilization } from "../data/mockData";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import { LayoutGrid, Route, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

const hourlyData = [
  { hour: "06", load: 45 }, { hour: "07", load: 72 }, { hour: "08", load: 95 },
  { hour: "09", load: 88 }, { hour: "10", load: 63 }, { hour: "11", load: 55 },
  { hour: "12", load: 67 }, { hour: "13", load: 58 }, { hour: "14", load: 52 },
  { hour: "15", load: 60 }, { hour: "16", load: 75 }, { hour: "17", load: 91 },
  { hour: "18", load: 98 }, { hour: "19", load: 87 }, { hour: "20", load: 70 },
  { hour: "21", load: 58 }, { hour: "22", load: 42 }, { hour: "23", load: 28 },
];

const radarData = [
  { subject: "On-Time", A: 80 },
  { subject: "Capacity", A: 87 },
  { subject: "Safety", A: 95 },
  { subject: "Revenue", A: 78 },
  { subject: "Satisfaction", A: 82 },
  { subject: "Efficiency", A: 75 },
];

function StatusColor(pct: number) {
  if (pct >= 95) return { badge: "bg-red-500/20 text-red-400 border-red-500/30", bar: "bg-red-500", label: "Critical" };
  if (pct >= 85) return { badge: "bg-amber-500/20 text-amber-400 border-amber-500/30", bar: "bg-amber-500", label: "High Load" };
  if (pct >= 60) return { badge: "bg-blue-500/20 text-blue-400 border-blue-500/30", bar: "bg-blue-500", label: "Normal" };
  return { badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", bar: "bg-emerald-500", label: "Low" };
}

export function PlatformUtilization() {
  const ndlsPlatforms = platformData.filter((p) => p.station === "New Delhi");
  const hwPlatforms = platformData.filter((p) => p.station === "Howrah");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-white">Platform Utilization Optimization</h2>
        <p className="text-slate-400 text-sm">AI-driven platform scheduling and capacity management</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Avg Platform Load", value: "78%", icon: LayoutGrid, color: "bg-blue-500/20 text-blue-400" },
          { label: "Critical Platforms", value: "1", icon: AlertTriangle, color: "bg-red-500/20 text-red-400" },
          { label: "Optimal Routes", value: "4/6", icon: CheckCircle, color: "bg-emerald-500/20 text-emerald-400" },
          { label: "AI Recommendations", value: "7", icon: TrendingUp, color: "bg-violet-500/20 text-violet-400" },
        ].map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="bg-slate-900/50 border-white/10">
              <CardContent className="pt-5 pb-5">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${s.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-white text-xl font-medium">{s.value}</div>
                    <div className="text-slate-400 text-sm">{s.label}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="platforms">
        <TabsList className="bg-white/5 border border-white/10">
          <TabsTrigger value="platforms" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-400">Platform Status</TabsTrigger>
          <TabsTrigger value="routes" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-400">Route Optimization</TabsTrigger>
          <TabsTrigger value="hourly" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-400">Hourly Load</TabsTrigger>
          <TabsTrigger value="ai" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white text-slate-400">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[
              { name: "New Delhi Station", platforms: ndlsPlatforms },
              { name: "Howrah Junction", platforms: hwPlatforms },
            ].map((station) => (
              <Card key={station.name} className="bg-slate-900/50 border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-white text-base">{station.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {station.platforms.map((p) => {
                    const cfg = StatusColor(p.utilization);
                    return (
                      <div key={p.platform} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{p.platform}</span>
                            <span className="text-slate-500">·</span>
                            <span className="text-slate-400">{p.trains} trains today</span>
                            <span className="text-slate-500">·</span>
                            <span className="text-slate-400">Peak: {p.peakHour}</span>
                          </div>
                          <Badge className={`text-xs ${cfg.badge}`}>{p.utilization}%</Badge>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-2">
                          <div className={`h-2 rounded-full transition-all ${cfg.bar}`} style={{ width: `${p.utilization}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="routes" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base">Route Utilization (%)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={routeUtilization} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} stroke="#64748b" tick={{ fill: "#94a3b8" }} />
                    <YAxis type="category" dataKey="name" stroke="#64748b" tick={{ fill: "#94a3b8" }} width={65} />
                    <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} formatter={(v: number) => `${v}%`} />
                    <Bar dataKey="utilization" name="Utilization" fill="#3b82f6" radius={[0, 6, 6, 0]}
                      label={{ position: "right", fill: "#94a3b8", fontSize: 11, formatter: (v: number) => `${v}%` }} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader className="pb-3">
                <CardTitle className="text-white text-base">Route Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  {routeUtilization.map((r) => {
                    const cfg = StatusColor(r.utilization);
                    return (
                      <div key={r.route} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                        <div>
                          <div className="text-white text-sm">{r.route}</div>
                          <div className="text-slate-500 text-xs">{r.trains} trains/day</div>
                        </div>
                        <Badge className={`text-xs ${cfg.badge}`}>{cfg.label}</Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hourly" className="mt-4">
          <Card className="bg-slate-900/50 border-white/10">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-base">New Delhi Station — Hourly Platform Load Today</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="hour" stroke="#64748b" tick={{ fill: "#94a3b8" }} tickFormatter={(v) => `${v}:00`} />
                  <YAxis stroke="#64748b" tick={{ fill: "#94a3b8" }} tickFormatter={(v) => `${v}%`} />
                  <Tooltip contentStyle={{ backgroundColor: "#1e293b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }} formatter={(v: number) => `${v}% load`} labelFormatter={(l) => `${l}:00`} />
                  <Bar dataKey="load" name="Platform Load" radius={[4, 4, 0, 0]}
                    fill="url(#barGrad)"
                    background={{ fill: "rgba(255,255,255,0.03)", radius: [4, 4, 0, 0] }}
                  />
                  <defs>
                    <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3b82f6" />
                      <stop offset="100%" stopColor="#6366f1" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex items-center gap-4 mt-3 text-sm text-slate-400">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-500 inline-block" /> &gt;90% Critical</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" /> 75-90% High</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" /> &lt;75% Normal</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <div className="w-2 h-2 bg-violet-400 rounded-full animate-pulse" />
                  AI Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {[
                  { priority: "High", text: "Shift Train 12627 from Platform 5 to Platform 7 to reduce load from 97% to 71%.", saving: "↓26% load" },
                  { priority: "High", text: "Deploy additional crowd management at Platform 3 between 17:00–19:00 during weekdays.", saving: "Safety Risk" },
                  { priority: "Medium", text: "Reschedule 3 suburban trains during 08:00–09:00 peak to distribute load.", saving: "↓15% congestion" },
                  { priority: "Medium", text: "Increase coach count for NDLS-LKO route — consistently above 90% occupancy.", saving: "+200 seats" },
                  { priority: "Low", text: "Enable predictive maintenance alert for Platform 6 tracks — 8% deviation detected.", saving: "Preventive" },
                  { priority: "Low", text: "Optimize Platform 6 usage — currently at 45%, lowest in station.", saving: "+12 trains/day" },
                ].map((rec, i) => (
                  <div key={i} className={`p-3 rounded-xl border ${rec.priority === "High" ? "border-red-500/20 bg-red-500/5" : rec.priority === "Medium" ? "border-amber-500/20 bg-amber-500/5" : "border-blue-500/20 bg-blue-500/5"}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <Badge className={`text-xs mb-1.5 ${rec.priority === "High" ? "bg-red-500/20 text-red-400 border-red-500/30" : rec.priority === "Medium" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" : "bg-blue-500/20 text-blue-400 border-blue-500/30"}`}>{rec.priority}</Badge>
                        <p className="text-slate-300 text-sm">{rec.text}</p>
                      </div>
                      <span className="text-emerald-400 text-xs flex-shrink-0 font-medium">{rec.saving}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-slate-900/50 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-base">Network Performance Radar</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: "#94a3b8", fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#64748b", fontSize: 10 }} />
                    <Radar name="Score" dataKey="A" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
