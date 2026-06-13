import { useState } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { alerts } from "../data/mockData";
import {
  Bell, AlertTriangle, Info, CheckCircle, XCircle, Filter, BellOff, Smartphone, Mail, MessageSquare, Globe, ShieldAlert, Settings, Activity
} from "lucide-react";
import { toast } from "sonner";

const typeConfig = {
  critical: { icon: ShieldAlert, color: "text-red-400", bg: "bg-red-500/10", border: "border-red-500/20", badge: "bg-red-500/20 text-red-400 border-red-500/30", label: "Critical" },
  warning: { icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", badge: "bg-amber-500/20 text-amber-400 border-amber-500/30", label: "Warning" },
  info: { icon: Info, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", badge: "bg-blue-500/20 text-blue-400 border-blue-500/30", label: "Advisory" },
  success: { icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", label: "Resolved" },
};

const channels = [
  { id: "mobile", label: "Mobile App Push", icon: Smartphone, enabled: true },
  { id: "website", label: "Dashboard Alerts", icon: Globe, enabled: true },
  { id: "sms", label: "SMS Gateway", icon: MessageSquare, enabled: false },
  { id: "email", label: "Email Dispatch", icon: Mail, enabled: true },
];

export function AlertSystem() {
  const [alertList, setAlertList] = useState(alerts);
  const [filter, setFilter] = useState<"all" | "critical" | "warning" | "info" | "success">("all");
  const [channelSettings, setChannelSettings] = useState(channels);

  const unread = alertList.filter((a) => !a.read).length;

  const markAllRead = () => setAlertList((prev) => prev.map((a) => ({ ...a, read: true })));
  const markRead = (id: number) => setAlertList((prev) => prev.map((a) => a.id === id ? { ...a, read: true } : a));

  const filtered = alertList.filter((a) => filter === "all" || a.type === filter);

  const toggleChannel = (id: string) => {
    setChannelSettings((prev) => prev.map((c) => c.id === id ? { ...c, enabled: !c.enabled } : c));
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Alerts & Incidents</h2>
          <p className="text-emerald-400/70 text-sm mt-1">Real-time system health and critical operational alerts</p>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium">
            <BellOff className="w-4 h-4" /> Acknowledge All
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Alert Feed */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          {/* Summary Tabs */}
          <div className="glass-panel p-2 rounded-xl flex items-center gap-2 overflow-x-auto">
             <button
                onClick={() => setFilter("all")}
                className={`flex-1 px-4 py-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${filter === "all" ? "bg-white/10 border-white/20 shadow-inner" : "hover:bg-white/5 border-transparent text-slate-400"} border`}
             >
                <Bell className={`w-5 h-5 ${filter === "all" ? "text-white" : ""}`} />
                <span className="text-sm font-medium">All Alerts</span>
                <span className="text-xs font-mono">{alertList.length} total</span>
             </button>
             {(["critical", "warning", "info", "success"] as const).map((type) => {
              const cfg = typeConfig[type];
              const Icon = cfg.icon;
              const count = alertList.filter((a) => a.type === type).length;
              return (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`flex-1 px-4 py-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-all ${filter === type ? cfg.bg + " " + cfg.border + " shadow-[0_0_15px_rgba(0,0,0,0.2)]" : "hover:bg-white/5 border-transparent text-slate-400"} border`}
                >
                  <Icon className={`w-5 h-5 ${filter === type ? cfg.color : ""}`} />
                  <span className={`text-sm font-medium ${filter === type ? "text-white" : ""}`}>{cfg.label}</span>
                  <span className="text-xs font-mono">{count} incidents</span>
                </button>
              );
            })}
          </div>

          {/* Alert List */}
          <div className="glass-panel rounded-xl flex flex-col min-h-[500px]">
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/20 rounded-t-xl">
               <div className="flex items-center gap-2">
                 <Activity className="w-4 h-4 text-emerald-400" />
                 <span className="text-slate-300 text-sm font-medium">Live Incident Feed</span>
               </div>
               <div className="flex items-center gap-3">
                 <Badge className="bg-white/5 text-slate-300 border-white/10">{unread} Actionable</Badge>
               </div>
            </div>
            
            <div className="flex flex-col p-2 gap-2 overflow-y-auto custom-scrollbar flex-1">
              {filtered.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12">
                   <CheckCircle className="w-12 h-12 mb-3 text-emerald-500/20" />
                   <p>No alerts found in this category.</p>
                </div>
              ) : filtered.map((alert) => {
                const cfg = typeConfig[alert.type as keyof typeof typeConfig];
                const Icon = cfg.icon;
                return (
                  <div
                    key={alert.id}
                    onClick={() => markRead(alert.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${alert.read ? "border-white/5 bg-black/20 hover:bg-white/5" : cfg.border + " " + cfg.bg + " shadow-[0_4px_20px_rgba(0,0,0,0.1)]"}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${alert.read ? "bg-white/5" : cfg.bg.replace('/10', '/20')}`}>
                       <Icon className={`w-5 h-5 ${alert.read ? "text-slate-500" : cfg.color}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0 py-0.5">
                      <div className="flex items-start justify-between gap-4 mb-1">
                        <div className="flex flex-wrap items-center gap-2">
                           <span className={`font-semibold text-base tracking-tight ${alert.read ? "text-slate-300" : "text-white"}`}>{alert.title}</span>
                           {alert.train && <Badge className="text-[10px] font-mono bg-white/10 text-slate-300 border-white/20 px-1.5 py-0">TRN-{alert.train}</Badge>}
                           {!alert.read && <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-400 border border-blue-500/30">New</span>}
                        </div>
                        <div className="text-slate-500 text-xs font-mono whitespace-nowrap">{alert.time}</div>
                      </div>
                      <p className={`text-sm leading-relaxed ${alert.read ? "text-slate-500" : "text-slate-300"}`}>{alert.message}</p>
                      
                      {!alert.read && alert.type === 'critical' && (
                         <div className="mt-3 flex gap-2" onClick={e => e.stopPropagation()}>
                            <button onClick={() => { markRead(alert.id); toast.success(`Emergency team dispatched for: ${alert.title}`); }} className="px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-medium hover:bg-red-600 transition-colors shadow-[0_0_10px_rgba(239,68,68,0.3)]">Dispatch Team</button>
                            <button onClick={() => { markRead(alert.id); toast.success(`Alert acknowledged: ${alert.title}`); }} className="px-3 py-1.5 rounded-lg bg-white/10 text-white text-xs font-medium hover:bg-white/20 transition-colors">Acknowledge</button>
                         </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Panel: Settings & Stats */}
        <div className="flex flex-col gap-6">
          <div className="glass-panel rounded-xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-white/5 bg-[#0B1D3A]/50">
              <h3 className="text-white font-medium flex items-center gap-2"><Settings className="w-4 h-4 text-emerald-400" /> Dispatch Channels</h3>
            </div>
            <div className="p-5 flex flex-col gap-5 bg-black/20">
              {channelSettings.map((ch) => {
                const Icon = ch.icon;
                return (
                  <div key={ch.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${ch.enabled ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-white/5 border border-white/5"}`}>
                        <Icon className={`w-5 h-5 ${ch.enabled ? "text-emerald-400" : "text-slate-600"}`} />
                      </div>
                      <Label className="text-sm font-medium text-slate-300 cursor-pointer group-hover:text-white transition-colors">{ch.label}</Label>
                    </div>
                    <Switch checked={ch.enabled} onCheckedChange={() => toggleChannel(ch.id)} className={ch.enabled ? "data-[state=checked]:bg-emerald-500" : ""} />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="glass-panel rounded-xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-white/5 bg-[#0B1D3A]/50">
              <h3 className="text-white font-medium flex items-center gap-2"><Filter className="w-4 h-4 text-teal-400" /> Auto-Trigger Thresholds</h3>
            </div>
            <div className="p-5 flex flex-col gap-4 bg-black/20">
              {[
                { label: "Critical Delay (min)", value: "15", color: "text-red-400", bg: "bg-red-500/10" },
                { label: "Occupancy Warning (%)", value: "85", color: "text-amber-400", bg: "bg-amber-500/10" },
                { label: "Platform Cap. Exceeded (%)", value: "95", color: "text-orange-400", bg: "bg-orange-500/10" },
                { label: "Speed Dev. Tolerance (%)", value: "10", color: "text-emerald-400", bg: "bg-emerald-500/10" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">{item.label}</span>
                  <span className={`px-2 py-1 rounded text-xs font-mono font-bold ${item.color} ${item.bg}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-xl flex flex-col overflow-hidden">
            <div className="p-5 border-b border-white/5 bg-[#0B1D3A]/50">
              <h3 className="text-white font-medium flex items-center gap-2"><Activity className="w-4 h-4 text-blue-400" /> Operational Metrics</h3>
            </div>
            <div className="p-5 flex flex-col gap-3 bg-black/20">
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 text-sm">Incidents Today</span>
                <span className="text-white font-medium">24</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 text-sm">Resolved</span>
                <span className="text-emerald-400 font-medium">18</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-400 text-sm">Avg Time to Acknowledge</span>
                <span className="text-teal-400 font-medium">1.2 min</span>
              </div>
              <div className="flex justify-between items-center py-1 border-t border-white/10 pt-3 mt-1">
                <span className="text-slate-400 text-sm">Automated SMS Sent</span>
                <span className="text-white font-medium">1,247</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
