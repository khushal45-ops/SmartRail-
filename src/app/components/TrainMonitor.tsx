import { useState } from "react";
import axios from "axios";
import { Input } from "./ui/input";
import { Progress } from "./ui/progress";
import { trains } from "../data/mockData";
import {
  Train, Search, MapPin, Gauge, Clock, Users, AlertTriangle, CheckCircle,
  ChevronRight, Filter, Activity, BarChart2, ShieldAlert, Zap, Navigation,
  TrendingUp, TrendingDown, Brain, CloudRain, Wind, Layers, Info, Star,
  ArrowUpRight, CircleDot, CheckCircle2, Loader2
} from "lucide-react";
import { Badge } from "./ui/badge";
import { toast } from "sonner";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";

// ── Per-train extended mock data ────────────────────────────────────────────

const trainExtended: Record<string, {
  zone: string;
  totalDistance: number;
  coachCount: number;
  priority: string;
  route: { station: string; code: string; arrival: string; departure: string; platform: number; distance: number; status: "completed" | "current" | "upcoming" }[];
  passengerLoad: { sleeper: { total: number; booked: number }; threeAC: { total: number; booked: number }; twoAC: { total: number; booked: number }; oneAC: { total: number; booked: number }; waitlist: number };
  delayHistory: { day: string; delay: number }[];
  avgDelay: number;
  onTimePct: number;
  delayReason: string;
  aiPrediction: { predictedDelay: number; confidence: number; factors: { label: string; icon: string; impact: "high" | "medium" | "low"; detail: string }[]; recommendation: string };
}> = {
  "12301": {
    zone: "Northern",
    totalDistance: 1447,
    coachCount: 22,
    priority: "High",
    route: [
      { station: "New Delhi", code: "NDLS", arrival: "—", departure: "16:55", platform: 3, distance: 0, status: "completed" },
      { station: "Kanpur Central", code: "CNB", arrival: "21:30", departure: "21:35", platform: 1, distance: 447, status: "current" },
      { station: "Allahabad Jn", code: "ALD", arrival: "23:15", departure: "23:20", platform: 5, distance: 636, status: "upcoming" },
      { station: "Mughal Sarai Jn", code: "MGS", arrival: "01:05+1", departure: "01:10+1", platform: 2, distance: 782, status: "upcoming" },
      { station: "Patna Jn", code: "PNBE", arrival: "03:35+1", departure: "03:40+1", platform: 4, distance: 998, status: "upcoming" },
      { station: "Dhanbad Jn", code: "DHN", arrival: "06:20+1", departure: "06:25+1", platform: 3, distance: 1196, status: "upcoming" },
      { station: "Asansol Jn", code: "ASN", arrival: "07:30+1", departure: "07:35+1", platform: 1, distance: 1259, status: "upcoming" },
      { station: "Howrah Jn", code: "HWH", arrival: "10:05+1", departure: "—", platform: 6, distance: 1447, status: "upcoming" },
    ],
    passengerLoad: {
      sleeper: { total: 520, booked: 498 },
      threeAC: { total: 400, booked: 389 },
      twoAC: { total: 280, booked: 264 },
      oneAC: { total: 150, booked: 96 },
      waitlist: 34,
    },
    delayHistory: [
      { day: "Mon", delay: 0 },
      { day: "Tue", delay: 12 },
      { day: "Wed", delay: 5 },
      { day: "Thu", delay: 0 },
      { day: "Fri", delay: 8 },
      { day: "Sat", delay: 22 },
      { day: "Sun", delay: 0 },
    ],
    avgDelay: 6.7,
    onTimePct: 71,
    delayReason: "No active delay. Operating on schedule.",
    aiPrediction: {
      predictedDelay: 0,
      confidence: 94,
      factors: [
        { label: "Weather", icon: "cloud", impact: "low", detail: "Clear skies along entire corridor. No rain forecast." },
        { label: "Track Condition", icon: "layers", impact: "low", detail: "All sections rated Good. No maintenance windows active." },
        { label: "Network Congestion", icon: "activity", impact: "medium", detail: "Moderate freight traffic near Mughal Sarai. ETA impact <5 min." },
        { label: "Platform Availability", icon: "mappin", impact: "low", detail: "Howrah PF-6 reserved. No conflicts." },
      ],
      recommendation: "No action required. Passengers may board at scheduled time. Arrival at Howrah on time at 10:05.",
    },
  },
  "12951": {
    zone: "Western",
    totalDistance: 1384,
    coachCount: 20,
    priority: "High",
    route: [
      { station: "New Delhi", code: "NDLS", arrival: "—", departure: "17:00", platform: 6, distance: 0, status: "completed" },
      { station: "Mathura Jn", code: "MTJ", arrival: "18:32", departure: "18:34", platform: 2, distance: 141, status: "completed" },
      { station: "Kota Jn", code: "KOTA", arrival: "22:15", departure: "22:20", platform: 4, distance: 457, status: "current" },
      { station: "Ratlam Jn", code: "RTM", arrival: "01:40+1", departure: "01:45+1", platform: 1, distance: 694, status: "upcoming" },
      { station: "Vadodara Jn", code: "BRC", arrival: "04:20+1", departure: "04:25+1", platform: 3, distance: 931, status: "upcoming" },
      { station: "Surat", code: "ST", arrival: "05:50+1", departure: "05:52+1", platform: 2, distance: 1071, status: "upcoming" },
      { station: "Mumbai Central", code: "BCT", arrival: "08:35+1", departure: "—", platform: 5, distance: 1384, status: "upcoming" },
    ],
    passengerLoad: {
      sleeper: { total: 480, booked: 452 },
      threeAC: { total: 350, booked: 350 },
      twoAC: { total: 250, booked: 213 },
      oneAC: { total: 120, booked: 74 },
      waitlist: 58,
    },
    delayHistory: [
      { day: "Mon", delay: 20 },
      { day: "Tue", delay: 35 },
      { day: "Wed", delay: 15 },
      { day: "Thu", delay: 25 },
      { day: "Fri", delay: 42 },
      { day: "Sat", delay: 18 },
      { day: "Sun", delay: 25 },
    ],
    avgDelay: 25.7,
    onTimePct: 28,
    delayReason: "Signal failure between Kota Jn and Ratlam Jn. Engineering team on site.",
    aiPrediction: {
      predictedDelay: 30,
      confidence: 78,
      factors: [
        { label: "Signal Failure", icon: "alert", impact: "high", detail: "Active signal fault near Kota Jn causing 25-35 min delay." },
        { label: "Weather", icon: "cloud", impact: "medium", detail: "Heavy rain forecast near Vadodara after 04:00." },
        { label: "Track Condition", icon: "layers", impact: "low", detail: "Kota-Ratlam section under speed restriction (75 km/h)." },
        { label: "Platform Availability", icon: "mappin", impact: "low", detail: "BCT PF-5 clear. No conflicts expected." },
      ],
      recommendation: "Passengers traveling to Mumbai Central should expect a 25–35 min delay. Plan alternate surface transport if connecting to flights before 10:00.",
    },
  },
};

// fallback for trains without extended data
function getExtended(id: string) {
  return trainExtended[id] ?? {
    zone: "Central",
    totalDistance: 850,
    coachCount: 18,
    priority: "Medium",
    route: [
      { station: trains.find(t => t.id === id)?.from ?? "Origin", code: "ORG", arrival: "—", departure: trains.find(t => t.id === id)?.departure ?? "10:00", platform: 1, distance: 0, status: "completed" as const },
      { station: trains.find(t => t.id === id)?.currentStation ?? "Mid Station", code: "MID", arrival: "14:00", departure: "14:05", platform: 2, distance: 425, status: "current" as const },
      { station: trains.find(t => t.id === id)?.to ?? "Destination", code: "DST", arrival: trains.find(t => t.id === id)?.arrival ?? "18:00", departure: "—", platform: 3, distance: 850, status: "upcoming" as const },
    ],
    passengerLoad: {
      sleeper: { total: 400, booked: 360 },
      threeAC: { total: 300, booked: 275 },
      twoAC: { total: 200, booked: 162 },
      oneAC: { total: 100, booked: 60 },
      waitlist: 20,
    },
    delayHistory: [
      { day: "Mon", delay: 5 },
      { day: "Tue", delay: 0 },
      { day: "Wed", delay: 10 },
      { day: "Thu", delay: 0 },
      { day: "Fri", delay: 15 },
      { day: "Sat", delay: 8 },
      { day: "Sun", delay: 0 },
    ],
    avgDelay: 5.4,
    onTimePct: 71,
    delayReason: "No active delay.",
    aiPrediction: {
      predictedDelay: 0,
      confidence: 88,
      factors: [
        { label: "Weather", icon: "cloud", impact: "low" as const, detail: "Clear skies along corridor." },
        { label: "Track Condition", icon: "layers", impact: "low" as const, detail: "All sections rated Good." },
        { label: "Network Congestion", icon: "activity", impact: "low" as const, detail: "No congestion reported." },
        { label: "Platform Availability", icon: "mappin", impact: "low" as const, detail: "Platform reserved." },
      ],
      recommendation: "No action required. Train is operating normally.",
    },
  };
}

// ── Components ───────────────────────────────────────────────────────────────

function StatusBadge({ status, delay }: { status: string; delay: number }) {
  if (status === "On Time") return <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">On Time</Badge>;
  if (delay > 30) return <Badge className="bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]">Delayed {delay}m</Badge>;
  return <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]">Delayed {delay}m</Badge>;
}

function TrainCard({ train, onClick, selected }: { train: typeof trains[0]; onClick: () => void; selected: boolean }) {
  return (
    <div
      onClick={onClick}
      className={`p-4 rounded-xl border cursor-pointer transition-all ${selected ? "border-emerald-500/50 bg-emerald-500/10 shadow-[0_4px_20px_rgba(16,185,129,0.15)]" : "border-white/5 hover:border-white/20 hover:bg-white/5 bg-black/20"}`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selected ? 'bg-emerald-500/20' : 'bg-white/10'}`}>
            <Train className={`w-4 h-4 ${selected ? 'text-emerald-400' : 'text-slate-400'}`} />
          </div>
          <div>
            <div className="text-white font-medium text-sm">{train.name}</div>
            <div className="text-slate-400 text-xs font-mono">#{train.id}</div>
          </div>
        </div>
        <StatusBadge status={train.status} delay={train.delay} />
      </div>
      <div className="flex items-center gap-2 text-xs text-slate-400 mb-3 font-medium">
        <span className="text-slate-300">{train.from}</span>
        <ChevronRight className="w-3 h-3 text-slate-600" />
        <span className="text-slate-300">{train.to}</span>
      </div>
      <Progress value={train.progress} className="h-1 bg-black/40" indicatorColor={selected ? "bg-emerald-500" : "bg-emerald-500/50"} />
      <div className="flex justify-between text-[10px] uppercase tracking-wider text-slate-500 mt-2 font-semibold">
        <span>{train.departure}</span>
        <span>{train.progress}% Route</span>
        <span>{train.arrival}</span>
      </div>
    </div>
  );
}

// ── Tab: Overview ────────────────────────────────────────────────────────────
function OverviewTab({ train, ext }: { train: typeof trains[0]; ext: ReturnType<typeof getExtended> }) {
  const infoItems = [
    { label: "Train Name", value: train.name, color: "text-white" },
    { label: "Train ID", value: `#${train.id}`, color: "text-emerald-400 font-mono" },
    { label: "Zone", value: ext.zone + " Zone", color: "text-teal-400" },
    { label: "Type", value: train.type, color: "text-blue-400" },
    { label: "Priority", value: ext.priority, color: ext.priority === "High" ? "text-red-400" : "text-amber-400" },
    { label: "Current Status", value: train.status + (train.delay > 0 ? ` (+${train.delay}m)` : ""), color: train.status === "On Time" ? "text-emerald-400" : "text-amber-400" },
    { label: "Departure", value: train.departure, color: "text-slate-200" },
    { label: "Arrival", value: train.arrival, color: "text-slate-200" },
    { label: "Platform", value: `PF ${train.platform}`, color: "text-violet-400" },
    { label: "Total Distance", value: `${ext.totalDistance.toLocaleString()} km`, color: "text-slate-200" },
    { label: "Coach Count", value: `${ext.coachCount} coaches`, color: "text-slate-200" },
    { label: "Current Station", value: train.currentStation, color: "text-emerald-300" },
  ];

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Route progress bar */}
      <div className="bg-black/20 border border-white/5 rounded-xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-transparent pointer-events-none" />
        <div className="flex justify-between items-center relative z-10">
          <div className="text-center w-1/4">
            <div className="text-2xl font-bold text-white mb-1">{train.from}</div>
            <div className="text-emerald-400/80 text-sm font-mono">{train.departure}</div>
          </div>
          <div className="flex-1 flex flex-col items-center px-4 relative">
            <div className="w-full flex items-center justify-between text-xs text-slate-500 mb-2 font-medium uppercase tracking-wider">
              <span>Origin</span>
              <span className="text-emerald-400">Current: {train.currentStation}</span>
              <span>Destination</span>
            </div>
            <div className="w-full relative h-2">
              <div className="absolute inset-0 bg-white/10 rounded-full" />
              <div className="absolute left-0 top-0 h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" style={{ width: `${train.progress}%` }} />
              <div className="absolute top-1/2 -translate-y-1/2 -ml-2.5 w-5 h-5 bg-emerald-500 border-2 border-[#0B1D3A] rounded-full shadow-[0_0_10px_rgba(16,185,129,0.8)]" style={{ left: `${train.progress}%` }} />
            </div>
            <div className="text-xs text-slate-500 mt-2">{train.progress}% of route completed</div>
          </div>
          <div className="text-center w-1/4">
            <div className="text-2xl font-bold text-white mb-1">{train.to}</div>
            <div className="text-slate-400 text-sm font-mono">{train.arrival}</div>
          </div>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {infoItems.map(item => (
          <div key={item.label} className="bg-white/5 border border-white/5 hover:border-white/10 rounded-xl p-4 flex flex-col gap-1 transition-colors">
            <div className="text-slate-500 text-xs uppercase tracking-wider font-medium">{item.label}</div>
            <div className={`text-base font-semibold ${item.color}`}>{item.value}</div>
          </div>
        ))}
      </div>

      {/* Telemetry */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium"><Gauge className="w-4 h-4 text-emerald-400" /> Velocity</div>
          <div className="text-2xl font-semibold text-white">{train.speed} <span className="text-sm text-slate-500">km/h</span></div>
        </div>
        <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium"><Users className="w-4 h-4 text-blue-400" /> Passengers</div>
          <div className="text-2xl font-semibold text-white">{train.passengers.toLocaleString()} <span className="text-sm text-slate-500">/ {train.capacity.toLocaleString()}</span></div>
          <Progress value={(train.passengers / train.capacity) * 100} className="h-1 bg-black/40" indicatorColor="bg-blue-500" />
        </div>
        <div className="bg-teal-500/5 border border-teal-500/20 rounded-xl p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium"><Clock className="w-4 h-4 text-teal-400" /> ETA Next Station</div>
          <div className="text-2xl font-semibold text-white">{train.eta}</div>
          <div className="text-xs text-slate-500">{train.nextStation}</div>
        </div>
        <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-5 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium"><MapPin className="w-4 h-4 text-violet-400" /> Platform</div>
          <div className="text-2xl font-semibold text-white">PF {train.platform}</div>
          <div className="text-xs text-slate-500">{train.to}</div>
        </div>
      </div>

      {/* Advisories */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className={`border rounded-xl p-5 ${train.delay > 0 ? "bg-amber-500/5 border-amber-500/20" : "bg-emerald-500/5 border-emerald-500/20"}`}>
          <h4 className={`font-medium mb-3 flex items-center gap-2 ${train.delay > 0 ? "text-amber-400" : "text-emerald-400"}`}>
            <AlertTriangle className="w-4 h-4" /> Active Advisories
          </h4>
          <p className="text-slate-300 text-sm leading-relaxed">
            {train.delay > 0 ? `Train is currently operating ${train.delay} minutes behind schedule due to network congestion near ${train.currentStation}. Resolution ETA is 15 mins.` : "No active advisories. Operating nominally."}
          </p>
        </div>
        <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-5">
          <h4 className="text-violet-400 font-medium mb-3 flex items-center gap-2"><Activity className="w-4 h-4" /> AI Delay Prediction</h4>
          <p className="text-slate-300 text-sm leading-relaxed">
            Neural analysis indicates a {train.delay > 0 ? "moderate" : "94%"} probability of{" "}
            {train.delay > 0 ? `remaining delayed for ${Math.max(0, train.delay - 10)}–${train.delay + 10} more minutes.` : "making up any potential delays before reaching destination."}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Tab: Live Tracking ───────────────────────────────────────────────────────
function LiveTrackingTab({ train, ext }: { train: typeof trains[0]; ext: ReturnType<typeof getExtended> }) {
  const completedStations = ext.route.filter(s => s.status === "completed").length;
  const totalStations = ext.route.length;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Live status header */}
      <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-5 py-4">
        <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
        <span className="text-emerald-400 font-semibold">Live Tracking Active</span>
        <span className="text-slate-400 text-sm ml-auto">Last updated: just now</span>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Current Station", value: train.currentStation, icon: CircleDot, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Next Station", value: train.nextStation, icon: Navigation, color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/20" },
          { label: "Current Speed", value: `${train.speed} km/h`, icon: Gauge, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
          { label: "ETA at Next", value: train.eta, icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={`${item.bg} border rounded-xl p-5 flex flex-col gap-2`}>
              <div className="flex items-center gap-2 text-slate-400 text-sm"><Icon className={`w-4 h-4 ${item.color}`} />{item.label}</div>
              <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
            </div>
          );
        })}
      </div>

      {/* Route Progress */}
      <div className="bg-black/20 border border-white/5 rounded-xl p-6">
        <h4 className="text-white font-semibold mb-5 flex items-center gap-2"><Zap className="w-4 h-4 text-emerald-400" /> Station-by-Station Progress</h4>

        <div className="flex items-center gap-3 mb-5 text-sm">
          <span className="text-slate-400">{completedStations} of {totalStations} stations completed</span>
          <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500" style={{ width: `${train.progress}%` }} />
          </div>
          <span className="text-emerald-400 font-mono font-medium">{train.progress}%</span>
        </div>

        <div className="space-y-0">
          {ext.route.map((stop, idx) => (
            <div key={stop.code} className="flex items-start gap-4">
              {/* Timeline dot & line */}
              <div className="flex flex-col items-center flex-shrink-0 w-6">
                <div className={`w-3 h-3 rounded-full border-2 mt-0.5 flex-shrink-0 ${
                  stop.status === "completed" ? "bg-emerald-500 border-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" :
                  stop.status === "current" ? "bg-amber-400 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse" :
                  "bg-transparent border-slate-600"
                }`} />
                {idx < ext.route.length - 1 && (
                  <div className={`w-0.5 h-12 ${stop.status === "completed" ? "bg-emerald-500/40" : "bg-white/10"}`} />
                )}
              </div>
              {/* Station info */}
              <div className={`flex-1 pb-4 ${stop.status === "current" ? "bg-amber-500/5 border border-amber-500/20 rounded-lg p-3 -mt-0.5" : ""}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`font-semibold text-sm ${stop.status === "completed" ? "text-slate-400" : stop.status === "current" ? "text-amber-300" : "text-slate-300"}`}>
                      {stop.station}
                    </span>
                    <span className="text-slate-500 text-xs ml-2 font-mono">{stop.code}</span>
                    {stop.status === "current" && <span className="ml-2 text-xs bg-amber-400/20 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-full">● Current</span>}
                  </div>
                  <div className="text-right text-xs text-slate-500">
                    <div>{stop.arrival !== "—" ? `Arr: ${stop.arrival}` : ""}</div>
                    <div>{stop.departure !== "—" ? `Dep: ${stop.departure}` : ""}</div>
                  </div>
                </div>
                <div className="text-xs text-slate-600 mt-0.5">{stop.distance > 0 ? `${stop.distance} km from origin` : "Origin station"}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Estimated arrival */}
      <div className="bg-teal-500/5 border border-teal-500/20 rounded-xl p-5 flex items-center justify-between">
        <div>
          <div className="text-teal-400 font-semibold text-sm mb-1">Estimated Final Arrival</div>
          <div className="text-white text-2xl font-bold">{train.arrival}</div>
          <div className="text-slate-400 text-sm mt-1">{train.to}</div>
        </div>
        <div className={`px-4 py-2 rounded-lg font-semibold text-sm ${train.delay > 0 ? "bg-amber-500/10 text-amber-400 border border-amber-500/30" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"}`}>
          {train.delay > 0 ? `+${train.delay} min delay` : "On Time"}
        </div>
      </div>
    </div>
  );
}

// ── Tab: Route Details ───────────────────────────────────────────────────────
function RouteDetailsTab({ ext }: { ext: ReturnType<typeof getExtended> }) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      <div className="flex items-center justify-between">
        <h4 className="text-white font-semibold flex items-center gap-2"><MapPin className="w-4 h-4 text-emerald-400" /> Full Route Schedule</h4>
        <span className="text-slate-500 text-sm">{ext.route.length} stops · {ext.totalDistance.toLocaleString()} km total</span>
      </div>

      <div className="bg-black/20 border border-white/5 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="text-left py-3 px-4 text-slate-400 text-xs uppercase tracking-wider font-semibold">#</th>
              <th className="text-left py-3 px-4 text-slate-400 text-xs uppercase tracking-wider font-semibold">Station</th>
              <th className="text-left py-3 px-4 text-slate-400 text-xs uppercase tracking-wider font-semibold">Arrival</th>
              <th className="text-left py-3 px-4 text-slate-400 text-xs uppercase tracking-wider font-semibold">Departure</th>
              <th className="text-left py-3 px-4 text-slate-400 text-xs uppercase tracking-wider font-semibold">Platform</th>
              <th className="text-right py-3 px-4 text-slate-400 text-xs uppercase tracking-wider font-semibold">Distance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {ext.route.map((stop, idx) => (
              <tr key={stop.code} className={`transition-colors ${
                stop.status === "current" ? "bg-amber-500/8 border-l-2 border-l-amber-400" :
                stop.status === "completed" ? "opacity-60" :
                "hover:bg-white/5"
              }`}>
                <td className="py-4 px-4">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    stop.status === "completed" ? "bg-emerald-500/20 text-emerald-400" :
                    stop.status === "current" ? "bg-amber-500/20 text-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.3)]" :
                    "bg-white/10 text-slate-400"
                  }`}>{idx + 1}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <div>
                      <div className={`font-semibold text-sm ${stop.status === "current" ? "text-amber-300" : stop.status === "completed" ? "text-slate-400" : "text-slate-200"}`}>
                        {stop.station}
                      </div>
                      <div className="text-slate-500 text-xs font-mono">{stop.code}</div>
                    </div>
                    {stop.status === "current" && <span className="text-xs bg-amber-400/20 text-amber-400 border border-amber-400/30 px-2 py-0.5 rounded-full whitespace-nowrap">Current</span>}
                    {stop.status === "completed" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500/70" />}
                  </div>
                </td>
                <td className="py-4 px-4 text-slate-300 text-sm font-mono">{stop.arrival}</td>
                <td className="py-4 px-4 text-slate-300 text-sm font-mono">{stop.departure}</td>
                <td className="py-4 px-4">
                  <span className="px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs font-medium">PF {stop.platform}</span>
                </td>
                <td className="py-4 px-4 text-right text-slate-400 text-sm font-mono">{stop.distance === 0 ? "Origin" : `${stop.distance} km`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Tab: Passenger Load ──────────────────────────────────────────────────────
function PassengerLoadTab({ train, ext }: { train: typeof trains[0]; ext: ReturnType<typeof getExtended> }) {
  const { sleeper, threeAC, twoAC, oneAC, waitlist } = ext.passengerLoad;
  const classes = [
    { label: "Sleeper (SL)", total: sleeper.total, booked: sleeper.booked, color: "bg-blue-500", bg: "bg-blue-500/10 border-blue-500/20", text: "text-blue-400" },
    { label: "3-Tier AC (3A)", total: threeAC.total, booked: threeAC.booked, color: "bg-teal-500", bg: "bg-teal-500/10 border-teal-500/20", text: "text-teal-400" },
    { label: "2-Tier AC (2A)", total: twoAC.total, booked: twoAC.booked, color: "bg-violet-500", bg: "bg-violet-500/10 border-violet-500/20", text: "text-violet-400" },
    { label: "1-Tier AC (1A)", total: oneAC.total, booked: oneAC.booked, color: "bg-amber-500", bg: "bg-amber-500/10 border-amber-500/20", text: "text-amber-400" },
  ];
  const totalSeats = sleeper.total + threeAC.total + twoAC.total + oneAC.total;
  const totalBooked = sleeper.booked + threeAC.booked + twoAC.booked + oneAC.booked;
  const occupancyPct = Math.round((totalBooked / totalSeats) * 100);

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Seats", value: totalSeats.toLocaleString(), icon: Users, color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" },
          { label: "Booked Seats", value: totalBooked.toLocaleString(), icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
          { label: "Available Seats", value: (totalSeats - totalBooked).toLocaleString(), icon: Star, color: "text-teal-400", bg: "bg-teal-500/10 border-teal-500/20" },
          { label: "Waitlist Count", value: waitlist, icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20" },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={`${item.bg} border rounded-xl p-5 flex flex-col gap-2`}>
              <div className="flex items-center gap-2 text-slate-400 text-sm"><Icon className={`w-4 h-4 ${item.color}`} />{item.label}</div>
              <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
            </div>
          );
        })}
      </div>

      {/* Overall Occupancy */}
      <div className="bg-black/20 border border-white/5 rounded-xl p-6">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-white font-semibold">Overall Occupancy</h4>
          <span className={`text-2xl font-bold ${occupancyPct > 90 ? "text-red-400" : occupancyPct > 75 ? "text-amber-400" : "text-emerald-400"}`}>{occupancyPct}%</span>
        </div>
        <Progress value={occupancyPct} className="h-3 bg-black/40" indicatorColor={occupancyPct > 90 ? "bg-red-500" : occupancyPct > 75 ? "bg-amber-500" : "bg-emerald-500"} />
        <div className="flex justify-between text-xs text-slate-500 mt-2">
          <span>0%</span>
          <span className={`font-medium ${occupancyPct > 90 ? "text-red-400" : "text-emerald-400"}`}>{occupancyPct > 90 ? "Nearly Full" : occupancyPct > 75 ? "High Demand" : "Available"}</span>
          <span>100%</span>
        </div>
      </div>

      {/* Class-wise Breakdown */}
      <div className="bg-black/20 border border-white/5 rounded-xl p-6">
        <h4 className="text-white font-semibold mb-5 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-teal-400" /> Class-wise Breakdown</h4>
        <div className="flex flex-col gap-5">
          {classes.map(cls => {
            const pct = Math.round((cls.booked / cls.total) * 100);
            const avail = cls.total - cls.booked;
            return (
              <div key={cls.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${cls.text}`}>{cls.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${cls.bg} ${cls.text}`}>{pct}% full</span>
                  </div>
                  <div className="text-xs text-slate-400 text-right">
                    <span className="text-slate-300 font-medium">{cls.booked}</span> booked · <span className="text-emerald-400">{avail} avail</span>
                  </div>
                </div>
                <Progress value={pct} className="h-2.5 bg-black/40" indicatorColor={cls.color} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Waitlist info */}
      {waitlist > 0 && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <div className="text-amber-400 font-semibold mb-1">Waitlist Active — {waitlist} Passengers</div>
            <p className="text-slate-300 text-sm leading-relaxed">
              {waitlist} passengers are on the waitlist. The AI reallocation engine is actively monitoring cancellations and will confirm seats as they become available. Notifications will be sent via SMS and email.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Tab: Delay Analysis ──────────────────────────────────────────────────────
function DelayAnalysisTab({ train, ext }: { train: typeof trains[0]; ext: ReturnType<typeof getExtended> }) {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<{ delay: number; confidence: number } | null>(null);

  const currentStop = ext.route.find(s => s.status === "current") || ext.route[0];

  const handlePredict = async () => {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8000/api/trains/predict-delay", {
        train_number: train.id,
        station_code: currentStop.code
      });
      setPrediction({ delay: res.data.predicted_delay_minutes, confidence: res.data.confidence });
      toast.success("Prediction successful!");
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Failed to predict delay");
    } finally {
      setLoading(false);
    }
  };

  const barColors = ext.delayHistory.map(d => d.delay === 0 ? "#10b981" : d.delay < 20 ? "#f59e0b" : "#ef4444");

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* Headline metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {[
          {
            label: "Current Delay",
            value: train.delay === 0 ? "On Time" : `+${train.delay} min`,
            sub: train.delay === 0 ? "No delay" : "Behind schedule",
            color: train.delay === 0 ? "text-emerald-400" : train.delay > 30 ? "text-red-400" : "text-amber-400",
            bg: train.delay === 0 ? "bg-emerald-500/10 border-emerald-500/20" : train.delay > 30 ? "bg-red-500/10 border-red-500/20" : "bg-amber-500/10 border-amber-500/20",
            icon: Clock,
          },
          {
            label: "Avg Delay (7d)",
            value: `${ext.avgDelay} min`,
            sub: "Rolling average",
            color: "text-teal-400",
            bg: "bg-teal-500/10 border-teal-500/20",
            icon: TrendingUp,
          },
          {
            label: "On-Time Rate",
            value: `${ext.onTimePct}%`,
            sub: "Last 7 days",
            color: ext.onTimePct > 70 ? "text-emerald-400" : "text-amber-400",
            bg: ext.onTimePct > 70 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-amber-500/10 border-amber-500/20",
            icon: CheckCircle,
          },
        ].map(item => {
          const Icon = item.icon;
          return (
            <div key={item.label} className={`${item.bg} border rounded-xl p-5`}>
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-2"><Icon className={`w-4 h-4 ${item.color}`} />{item.label}</div>
              <div className={`text-2xl font-bold ${item.color}`}>{item.value}</div>
              <div className="text-xs text-slate-500 mt-1">{item.sub}</div>
            </div>
          );
        })}
      </div>

      {/* Delay Reason */}
      <div className={`border rounded-xl p-5 ${train.delay > 0 ? "bg-red-500/5 border-red-500/20" : "bg-emerald-500/5 border-emerald-500/20"}`}>
        <h4 className={`font-semibold mb-2 flex items-center gap-2 ${train.delay > 0 ? "text-red-400" : "text-emerald-400"}`}>
          <Info className="w-4 h-4" /> Delay Reason
        </h4>
        <p className="text-slate-300 text-sm leading-relaxed">{ext.delayReason}</p>
      </div>

      {/* Real-time ML Prediction */}
      <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h4 className="font-semibold flex items-center gap-2 text-violet-400">
            <Brain className="w-4 h-4" /> Live ML Delay Prediction
          </h4>
          <button
            onClick={handlePredict}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-violet-500/20 hover:bg-violet-500/30 text-violet-300 text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {loading ? "Predicting..." : "Predict Delay"}
          </button>
        </div>
        
        {prediction ? (
          <div className="flex items-center gap-8 mt-2">
            <div>
              <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Predicted Delay</div>
              <div className="text-2xl font-bold text-violet-400">{prediction.delay} <span className="text-sm font-normal text-slate-400">min</span></div>
            </div>
            <div>
              <div className="text-slate-400 text-xs uppercase tracking-wider mb-1">Confidence</div>
              <div className="text-2xl font-bold text-emerald-400">{(prediction.confidence * 100).toFixed(0)}%</div>
            </div>
          </div>
        ) : (
          <p className="text-slate-400 text-sm leading-relaxed">Click the button above to run the live Machine Learning model using current telemetry data ({train.id} at {currentStop.code}).</p>
        )}
      </div>

      {/* 7-day bar chart */}
      <div className="bg-black/20 border border-white/5 rounded-xl p-6">
        <h4 className="text-white font-semibold mb-5 flex items-center gap-2"><BarChart2 className="w-4 h-4 text-teal-400" /> Last 7 Days Delay History (minutes)</h4>
        <div className="h-52">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={ext.delayHistory} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="day" stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis stroke="#475569" tick={{ fill: "#94a3b8", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `${v}m`} />
              <Tooltip
                contentStyle={{ backgroundColor: "#0B1D3A", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", color: "#fff" }}
                formatter={(v: number) => [`${v} min`, "Delay"]}
              />
              <Bar dataKey="delay" radius={[4, 4, 0, 0]}>
                {ext.delayHistory.map((_, idx) => (
                  <Cell key={idx} fill={barColors[idx]} opacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex gap-6 mt-4 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-emerald-500 inline-block" /> On Time</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-amber-500 inline-block" /> Minor Delay (&lt;20m)</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500 inline-block" /> Major Delay (&gt;20m)</span>
        </div>
      </div>
    </div>
  );
}

// ── Tab: AI Prediction ───────────────────────────────────────────────────────
function AIPredictionTab({ train, ext }: { train: typeof trains[0]; ext: ReturnType<typeof getExtended> }) {
  const { aiPrediction } = ext;
  const impactColors: Record<string, string> = { high: "text-red-400 bg-red-500/10 border-red-500/30", medium: "text-amber-400 bg-amber-500/10 border-amber-500/30", low: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" };
  const impactIcon = (impact: string) => impact === "high" ? TrendingUp : impact === "medium" ? Wind : CheckCircle;

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-300">
      {/* AI Header */}
      <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-6 flex items-start gap-4">
        <div className="w-12 h-12 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
          <Brain className="w-6 h-6 text-violet-400" />
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <div className="text-violet-300 font-bold text-lg">AI Neural Prediction Engine</div>
              <div className="text-slate-400 text-sm">Based on real-time sensor data, weather APIs, and historical patterns</div>
            </div>
            <div className="text-right">
              <div className="text-slate-400 text-xs mb-1">Confidence</div>
              <div className="text-3xl font-bold text-violet-400">{aiPrediction.confidence}%</div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={aiPrediction.confidence} className="h-2 bg-black/40" indicatorColor="bg-violet-500" />
          </div>
        </div>
      </div>

      {/* Predicted Delay */}
      <div className={`border rounded-xl p-6 text-center ${aiPrediction.predictedDelay === 0 ? "bg-emerald-500/5 border-emerald-500/20" : "bg-amber-500/5 border-amber-500/20"}`}>
        <div className="text-slate-400 text-sm mb-2">Predicted Delay for Today</div>
        <div className={`text-5xl font-bold mb-2 ${aiPrediction.predictedDelay === 0 ? "text-emerald-400" : "text-amber-400"}`}>
          {aiPrediction.predictedDelay === 0 ? "On Time" : `+${aiPrediction.predictedDelay} min`}
        </div>
        <div className="text-slate-400 text-sm">{aiPrediction.predictedDelay === 0 ? "Train is expected to run on schedule" : `Expected ${aiPrediction.predictedDelay} minute delay at destination`}</div>
      </div>

      {/* Factors */}
      <div className="bg-black/20 border border-white/5 rounded-xl p-6">
        <h4 className="text-white font-semibold mb-4 flex items-center gap-2"><Layers className="w-4 h-4 text-teal-400" /> Factors Affecting Delay</h4>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {aiPrediction.factors.map(factor => {
            const ImpactIcon = impactIcon(factor.impact);
            return (
              <div key={factor.label} className="bg-white/5 border border-white/5 hover:border-white/10 rounded-xl p-4 flex gap-3 transition-colors">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${impactColors[factor.impact].split(" ").slice(1).join(" ")}`}>
                  <ImpactIcon className={`w-4 h-4 ${impactColors[factor.impact].split(" ")[0]}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-slate-200 font-semibold text-sm">{factor.label}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${impactColors[factor.impact]}`}>{factor.impact} impact</span>
                  </div>
                  <p className="text-slate-400 text-xs leading-relaxed">{factor.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-teal-500/5 border border-teal-500/20 rounded-xl p-5 flex items-start gap-3">
        <ArrowUpRight className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
        <div>
          <div className="text-teal-400 font-semibold mb-1">AI Recommendation for Passengers</div>
          <p className="text-slate-300 text-sm leading-relaxed">{aiPrediction.recommendation}</p>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

const TABS = ["Overview", "Live Tracking", "Route Details", "Passenger Load", "Delay Analysis", "AI Prediction"] as const;

export function TrainMonitor() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState(trains[0]);
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [showAllZones, setShowAllZones] = useState(false);

  const filtered = trains.filter((t) => {
    const ext = getExtended(t.id);
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.id.includes(search);
    if (!matchesSearch) return false;
    if (statusFilter === "All") return true;
    if (statusFilter === "Express") return t.type === "Express" || t.type === "Superfast";
    if (statusFilter === "Delayed") return t.status === "Delayed" || t.delay > 0;
    if (statusFilter === "On Time") return t.status === "On Time" && t.delay === 0;
    if (statusFilter === "Cancelled") return t.status === "Cancelled";
    if (statusFilter === "All Zones") return true;
    // Zone filters
    if (statusFilter === "Northern") return ext.zone === "Northern";
    if (statusFilter === "Southern") return ext.zone === "Southern";
    if (statusFilter === "Eastern") return ext.zone === "Eastern";
    if (statusFilter === "Western") return ext.zone === "Western";
    if (statusFilter === "Central") return ext.zone === "Central";
    if (statusFilter === "North Eastern") return ext.zone === "North Eastern";
    if (statusFilter === "Northeast Frontier") return ext.zone === "Northeast Frontier";
    if (statusFilter === "South Central") return ext.zone === "South Central";
    if (statusFilter === "South Eastern") return ext.zone === "South Eastern";
    if (statusFilter === "South Western") return ext.zone === "South Western";
    if (statusFilter === "North Western") return ext.zone === "North Western";
    if (statusFilter === "North Central") return ext.zone === "North Central";
    if (statusFilter === "West Central") return ext.zone === "West Central";
    if (statusFilter === "East Central") return ext.zone === "East Central";
    if (statusFilter === "East Coast") return ext.zone === "East Coast";
    if (statusFilter === "South Coast") return ext.zone === "South Coast";
    if (statusFilter === "Konkan") return ext.zone === "Konkan";
    if (statusFilter === "Metro") return ext.zone === "Metro";
    return true;
  });

  const ext = getExtended(selected.id);

  const renderTab = () => {
    switch (activeTab) {
      case "overview":      return <OverviewTab train={selected} ext={ext} />;
      case "live-tracking": return <LiveTrackingTab train={selected} ext={ext} />;
      case "route-details": return <RouteDetailsTab ext={ext} />;
      case "passenger-load": return <PassengerLoadTab train={selected} ext={ext} />;
      case "delay-analysis": return <DelayAnalysisTab train={selected} ext={ext} />;
      case "ai-prediction":  return <AIPredictionTab train={selected} ext={ext} />;
      default: return <OverviewTab train={selected} ext={ext} />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6 flex-shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Operations Center</h2>
          <p className="text-emerald-400/70 text-sm mt-1">Live Train Monitoring &amp; Telemetry</p>
        </div>
        <div className="flex gap-4 text-sm font-medium">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)]">
            <CheckCircle className="w-4 h-4" />
            <span>{trains.filter(t => t.status === "On Time").length} Nominal</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.1)]">
            <AlertTriangle className="w-4 h-4" />
            <span>{trains.filter(t => t.status === "Delayed").length} Delayed</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 overflow-hidden">
        {/* Left Panel: Train List */}
        <div className="w-full lg:w-96 flex flex-col gap-4 flex-shrink-0">
          <div className="glass-panel p-4 rounded-xl flex flex-col gap-4 flex-shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by ID or Name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500/50"
              />
            </div>
            {/* Filters */}
            {/* Status Filters */}
            <div className="flex flex-wrap gap-1.5">
              {([
                { label: "All Status",  id: "All",       icon: "⚡" },
                { label: "Express",     id: "Express",   icon: "🚄" },
                { label: "On Time",     id: "On Time",   icon: "✅" },
                { label: "Delayed",     id: "Delayed",   icon: "⚠️" },
                { label: "Cancelled",   id: "Cancelled", icon: "❌" },
              ] as const).map(f => (
                <button
                  key={f.id}
                  onClick={() => { setStatusFilter(f.id); toast.info(`Filter: ${f.label}`); }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-xs font-medium cursor-pointer transition-colors ${statusFilter === f.id ? "bg-emerald-500/20 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/10 text-slate-300 hover:bg-white/10"}`}
                >
                  <span>{f.icon}</span> {f.label}
                </button>
              ))}
            </div>

            {/* Zone Filters */}
            {(() => {
              const allZones = [
                { label: "All Zones",    id: "All Zones",          icon: "🌐" },
                { label: "Northern",     id: "Northern",           icon: "🔵" },
                { label: "Southern",     id: "Southern",           icon: "🟢" },
                { label: "Eastern",      id: "Eastern",            icon: "🟡" },
                { label: "Western",      id: "Western",            icon: "🟠" },
                { label: "Central",      id: "Central",            icon: "🔴" },
                { label: "N. Eastern",   id: "North Eastern",      icon: "🟣" },
                { label: "NE Frontier",  id: "Northeast Frontier", icon: "⚪" },
                { label: "S. Central",   id: "South Central",      icon: "🟤" },
                { label: "S. Eastern",   id: "South Eastern",      icon: "🔵" },
                { label: "S. Western",   id: "South Western",      icon: "🟢" },
                { label: "N. Western",   id: "North Western",      icon: "🟡" },
                { label: "N. Central",   id: "North Central",      icon: "🟠" },
                { label: "W. Central",   id: "West Central",       icon: "🔴" },
                { label: "E. Central",   id: "East Central",       icon: "🟣" },
                { label: "East Coast",   id: "East Coast",         icon: "⚪" },
                { label: "South Coast",  id: "South Coast",        icon: "🟤" },
                { label: "Konkan",       id: "Konkan",             icon: "🔵" },
                { label: "Metro",        id: "Metro",              icon: "🚇" },
              ] as const;
              const VISIBLE = 5;
              const visible = showAllZones ? allZones : allZones.slice(0, VISIBLE);
              const remaining = allZones.length - VISIBLE;
              return (
                <div className="flex flex-wrap gap-1.5 items-center">
                  {visible.map(z => (
                    <button
                      key={z.id}
                      onClick={() => { setStatusFilter(z.id); toast.info(`Zone: ${z.label}`); }}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-xs font-medium cursor-pointer transition-colors ${
                        statusFilter === z.id
                          ? "bg-blue-500/20 border-blue-500/30 text-blue-300"
                          : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10 hover:text-slate-300"
                      }`}
                    >
                      <span className="text-[10px]">{z.icon}</span> {z.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowAllZones(v => !v)}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-md border text-xs font-medium cursor-pointer transition-colors bg-white/5 border-white/10 text-emerald-400 hover:bg-white/10"
                  >
                    {showAllZones ? "← Less" : `+${remaining} more`}
                  </button>
                </div>
              );
            })()}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar glass-panel rounded-xl p-2 flex flex-col gap-2">
            {filtered.map((t) => (
              <TrainCard
                key={t.id}
                train={t}
                onClick={() => { setSelected(t); setActiveTab("overview"); }}
                selected={selected.id === t.id}
              />
            ))}
          </div>
        </div>

        {/* Main Panel: Train Detail */}
        <div className="flex-1 glass-panel rounded-xl flex flex-col min-h-0 overflow-hidden">
          {/* Header — unchanged as per requirement */}
          <div className="p-6 border-b border-white/5 bg-[#0B1D3A]/80 backdrop-blur-md flex-shrink-0">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-2xl font-bold text-white tracking-tight">{selected.name}</h3>
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-medium bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">ID: {selected.id}</span>
                </div>
                <p className="text-slate-400 text-sm">Zone: {ext.zone} • Type: {selected.type} • Priority: {ext.priority}</p>
              </div>
              <StatusBadge status={selected.status} delay={selected.delay} />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 mt-6 overflow-x-auto custom-scrollbar pb-1">
              {TABS.map((tab) => {
                const id = tab.toLowerCase().replace(/ /g, "-");
                const isActive = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => setActiveTab(id)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${isActive ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"}`}
                  >
                    {tab}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
            {renderTab()}
          </div>
        </div>
      </div>
    </div>
  );
}
