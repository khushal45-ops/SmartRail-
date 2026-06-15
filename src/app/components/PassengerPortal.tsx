import { useState, useEffect } from "react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { pnrRecords, trains } from "../data/mockData";
import {
  Search, Train, MapPin, Clock, Users, RefreshCw, CheckCircle, AlertCircle, TicketIcon, ArrowRight, ShieldCheck, Activity, Loader2
} from "lucide-react";
import { fetchPNR, requestReallocation } from "../../api";
import { toast } from "sonner";

// Helper to simulate/search relocation options
function getRelocationOptions(from: string, to: string, currentTrainNo: string) {
  // Normalize station codes
  const getCode = (name: string) => {
    if (name.includes("NDLS") || name.toLowerCase().includes("delhi")) return "NDLS";
    if (name.includes("HWH") || name.toLowerCase().includes("howrah")) return "HWH";
    if (name.includes("BCT") || name.toLowerCase().includes("mumbai")) return "BCT";
    if (name.includes("LKO") || name.toLowerCase().includes("lucknow")) return "LKO";
    if (name.includes("SBC") || name.toLowerCase().includes("bangalore")) return "SBC";
    if (name.includes("CDG") || name.toLowerCase().includes("chandigarh")) return "CDG";
    return name;
  };

  const start = getCode(from);
  const end = getCode(to);

  // Available database of other trains for matching
  const pool = [
    { id: "12381", name: "Poorva Express", from: "NDLS", to: "HWH", departure: "17:40", arrival: "11:05+1", capacity: 1200, passengers: 1120, type: "Superfast", platform: 2, delay: 0 },
    { id: "12274", name: "Howrah Duronto", from: "NDLS", to: "HWH", departure: "12:40", arrival: "06:10+1", capacity: 900, passengers: 850, type: "Duronto", platform: 4, delay: 0 },
    { id: "12953", name: "August Kranti Raj", from: "NDLS", to: "BCT", departure: "16:50", arrival: "09:45+1", capacity: 1100, passengers: 1040, type: "Rajdhani", platform: 1, delay: 0 },
    { id: "22418", name: "Mahamana Express", from: "NDLS", to: "LKO", departure: "18:40", arrival: "03:10+1", capacity: 950, passengers: 910, type: "Superfast", platform: 5, delay: 0 },
    { id: "12420", name: "Gomti Express", from: "NDLS", to: "LKO", departure: "12:20", arrival: "21:30", capacity: 1300, passengers: 1290, type: "Express", platform: 7, delay: 0 },
    // Connecting trains database
    { id: "CONNECTOR-A1", name: "Kanpur Shatabdi", from: "NDLS", to: "CNB", departure: "06:00", arrival: "11:20", capacity: 800, passengers: 720, type: "Shatabdi", platform: 3, delay: 0 },
    { id: "CONNECTOR-A2", name: "Kanpur HWH SF", from: "CNB", to: "HWH", departure: "12:30", arrival: "21:05", capacity: 1400, passengers: 1300, type: "Superfast", platform: 1, delay: 0 },
    { id: "CONNECTOR-B1", name: "NDLS Jhansi SF", from: "NDLS", to: "JHS", departure: "08:00", arrival: "12:45", capacity: 1000, passengers: 950, type: "Superfast", platform: 2, delay: 0 },
    { id: "CONNECTOR-B2", name: "Jhansi Mumbai Exp", from: "JHS", to: "BCT", departure: "13:30", arrival: "05:15+1", capacity: 1200, passengers: 1100, type: "Express", platform: 4, delay: 0 },
    { id: "CONNECTOR-C1", name: "Lucknow Shatabdi", from: "NDLS", to: "LKO", departure: "06:10", arrival: "12:40", capacity: 900, passengers: 880, type: "Shatabdi", platform: 9, delay: 0 },
    { id: "CONNECTOR-C2", name: "Lucknow HWH Express", from: "LKO", to: "HWH", departure: "13:45", arrival: "06:30+1", capacity: 1100, passengers: 980, type: "Express", platform: 2, delay: 0 },
  ];

  // 1. Find Direct Trains (same start/end, seats available, different train)
  const direct = pool.filter(t => 
    getCode(t.from) === start && 
    getCode(t.to) === end && 
    t.id !== currentTrainNo && 
    t.passengers < t.capacity
  ).map(t => ({
    ...t,
    availableSeats: t.capacity - t.passengers
  }));

  // 2. Find Connecting Trains (two trains: A -> intermediate, B -> B)
  const connecting: {
    train1: typeof pool[0] & { availableSeats: number };
    train2: typeof pool[0] & { availableSeats: number };
    intermediate: string;
  }[] = [];

  // Intermediate junction mapping for connecting
  const junctions = ["CNB", "JHS", "LKO"];

  junctions.forEach(junc => {
    // Find Train 1: start -> junction
    const t1 = pool.find(t => getCode(t.from) === start && getCode(t.to) === junc && t.passengers < t.capacity);
    // Find Train 2: junction -> end
    const t2 = pool.find(t => getCode(t.from) === junc && getCode(t.to) === end && t.passengers < t.capacity);

    if (t1 && t2) {
      connecting.push({
        train1: { ...t1, availableSeats: t1.capacity - t1.passengers },
        train2: { ...t2, availableSeats: t2.capacity - t2.passengers },
        intermediate: junc === "CNB" ? "Kanpur Central (CNB)" : junc === "JHS" ? "Jhansi Jn (JHS)" : "Lucknow Jn (LKO)"
      });
    }
  });

  return { direct, connecting };
}

function PNRResult({ record, onRelocate, onNavigateToRelocation }: { record: typeof pnrRecords[string]; onRelocate: (newTrainNo: string, newTrainName: string, departure: string, arrival: string) => void; onNavigateToRelocation?: () => void; }) {
  const allConfirmed = record.passengers.every((p) => p.status === "CNF");
  const hasWaiting = record.passengers.some((p) => p.status.startsWith("WL"));
  
  // Find if current train is delayed in mockData
  const trainDetail = trains.find(t => t.id === record.trainNo);
  const isDelayed = trainDetail ? (trainDetail.status === "Delayed" || trainDetail.delay > 0) : record.trainNo === "12951";
  const delayMinutes = trainDetail ? trainDetail.delay : (record.trainNo === "12951" ? 25 : 0);

  const { direct, connecting } = getRelocationOptions(record.from, record.to, record.trainNo);

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300">
      <div className="glass-panel rounded-xl p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
        <div className="flex items-center justify-between mb-6 relative z-10">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                <TicketIcon className="w-6 h-6 text-emerald-400" />
             </div>
             <div>
               <div className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                 {record.trainName}
                 {isDelayed && <Badge className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] px-2 py-0.5 shadow-[0_0_10px_rgba(239,68,68,0.2)]">DELAYED</Badge>}
               </div>
               <div className="text-[#e2e8f0] text-sm font-mono mt-0.5">Train No. {record.trainNo} • {record.class} Class</div>
             </div>
          </div>
          <Badge className={`px-3 py-1 text-sm font-medium ${allConfirmed ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : hasWaiting ? "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.1)]" : "bg-teal-500/10 text-teal-400 border-teal-500/30"}`}>
            {record.chartStatus}
          </Badge>
        </div>

        {isDelayed && (
          <div className="mb-6 bg-red-500/15 border border-red-500/30 rounded-xl p-4 flex items-center justify-between gap-4 animate-pulse">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-400" />
              <div>
                <div className="text-red-400 font-semibold text-sm">Train Running Delayed by {delayMinutes} Mins!</div>
                <div className="text-slate-300 text-xs mt-0.5">AI alternative routing options are available for immediate transfer.</div>
              </div>
            </div>
            <button 
              onClick={() => onNavigateToRelocation?.()}
              className="px-3.5 py-1.5 bg-red-500/20 hover:bg-red-500/35 border border-red-400/40 text-red-300 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
            >
              Relocate Ticket
            </button>
          </div>
        )}

        <div className="flex items-center gap-4 mb-6 relative z-10 bg-black/20 rounded-xl p-4 border border-white/5">
          <div className="text-center w-1/4">
            <div className="text-2xl font-bold text-white mb-1">{record.from.split(" (")[0]}</div>
            <div className="text-emerald-400/80 text-sm font-mono">{record.departure}</div>
          </div>
          <div className="flex-1 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
            <div className="flex-1 border-t-2 border-dashed border-white/10 relative">
               <Train className="w-5 h-5 text-emerald-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#0B1D3A] px-1" />
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
          </div>
          <div className="text-center w-1/4">
            <div className="text-2xl font-bold text-white mb-1">{record.to.split(" (")[0]}</div>
            <div className="text-slate-400 text-sm font-mono">{record.arrival}</div>
          </div>
        </div>

        <div className="flex items-center gap-6 text-sm text-slate-300 mb-6 relative z-10 font-medium">
          <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"><Clock className="w-4 h-4 text-emerald-400" /> {record.date}</span>
          <span className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10"><MapPin className="w-4 h-4 text-teal-400" /> PNR: {record.pnr}</span>
        </div>

        <div className="flex flex-col gap-2 relative z-10">
          <div className="grid grid-cols-5 text-xs font-semibold uppercase tracking-wider text-slate-500 px-4 mb-1">
            <span>Passenger</span><span>Age</span><span>Gender</span><span>Status</span><span>Seat</span>
          </div>
          {record.passengers.map((p, i) => (
            <div key={i} className="grid grid-cols-5 text-sm bg-black/40 rounded-lg px-4 py-3 border border-white/5 hover:border-white/10 transition-colors items-center">
              <span className="text-slate-200 font-medium">{p.name}</span>
              <span className="text-slate-400 font-mono">{p.age}</span>
              <span className="text-slate-400">{p.gender === "M" ? "Male" : "Female"}</span>
              <span>
                <Badge className={p.status === "CNF" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs font-mono" : "bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs font-mono"}>
                  {p.status}
                </Badge>
              </span>
              <span className="text-slate-300 font-mono font-medium">{p.coach !== "—" ? `${p.coach} / ${p.seat}` : "—"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Dynamic Ticket Relocator Panel has been moved to its own tab */}

      {hasWaiting && (
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-5 flex items-start gap-4 shadow-[0_0_20px_rgba(245,158,11,0.05)]">
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center flex-shrink-0">
             <AlertCircle className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-amber-400 font-semibold mb-1">Waitlist Notice & Auto-Reallocation</div>
            <div className="text-slate-300 text-sm leading-relaxed mb-3">Some passengers are currently on the waitlist. Our AI-driven reallocation engine is actively monitoring cancellations. You will be notified instantly via SMS and email if your status is upgraded.</div>
            <button onClick={() => { toast.success("Manual priority review requested. Our team will look into it shortly."); }} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20 transition-colors text-sm font-medium">
              <RefreshCw className="w-4 h-4" /> Request Manual Priority Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const recentSearches = ["2451369874", "4867293015", "7234891056"];

const upcomingJourneys = [
  { pnr: "2451369874", train: "Rajdhani Express", from: "NDLS", to: "HWH", date: "02 Jun", class: "3A", status: "CNF" },
  { pnr: "7234891056", train: "Vande Bharat", from: "NDLS", to: "LKO", date: "03 Jun", class: "CC", status: "CNF" },
];

export function PassengerPortal() {
  const [localPnrRecords, setLocalPnrRecords] = useState<typeof pnrRecords>(pnrRecords);
  const [pnr, setPnr] = useState("");
  const [result, setResult] = useState<typeof pnrRecords[string] | null>(null);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [activeTab, setActiveTab] = useState("pnr");
  const [isSearching, setIsSearching] = useState(false);
  const [isRelocating, setIsRelocating] = useState(false);

  const delayedJourneys = ["2451369874", "4867293015", "7234891056"].filter(key => {
    const rec = localPnrRecords[key];
    if (!rec) return false;
    if (rec.chartStatus === "Relocated & Confirmed") return false;
    const trainDetail = trains.find(t => t.id === rec.trainNo);
    return trainDetail ? (trainDetail.status === "Delayed" || trainDetail.delay > 0) : rec.trainNo === "12951";
  });

  const handleSearch = async (searchPnrStr?: string) => {
    const pnrToSearch = typeof searchPnrStr === "string" ? searchPnrStr.trim() : pnr.trim();
    if (!pnrToSearch) {
      setError("Please enter a valid PNR number.");
      return;
    }
    
    // Auto update input if called from chip
    if (typeof searchPnrStr === "string") {
      setPnr(pnrToSearch);
    }

    try {
      setIsSearching(true);
      setError("");
      
      // Call the API (swallow errors to ensure fallback logic runs)
      try {
        await fetchPNR(pnrToSearch);
      } catch (apiErr) {
        console.warn("API fetch failed, falling back to mock data...");
      }
      
      // Fallback to local mock data for rendering
      const record = localPnrRecords[pnrToSearch];
      if (record) { 
        setResult(record); 
        toast.success("PNR details fetched successfully.");
      } else { 
        setResult(null); 
        setError("PNR not found in records. Please check the number and try again."); 
        toast.error("PNR not found.");
      }
    } catch (err) {
      setError("Failed to fetch PNR status.");
      toast.error("Failed to fetch PNR status.");
    } finally {
      setIsSearching(false);
    }
  };

  // Sync result if localPnrRecords updates
  useEffect(() => {
    if (result && localPnrRecords[result.pnr]) {
      setResult(localPnrRecords[result.pnr]);
    }
  }, [localPnrRecords, result]);

  const handleRelocate = async (pnrNum: string, newTrainNo: string, newTrainName: string, departure: string, arrival: string) => {
    try {
      setIsRelocating(true);
      await requestReallocation(pnrNum, { newTrainNo, newTrainName, departure, arrival });
      
      setLocalPnrRecords(prev => ({
        ...prev,
        [pnrNum]: {
          ...prev[pnrNum],
          trainNo: newTrainNo,
          trainName: newTrainName,
          departure,
          arrival,
          chartStatus: "Relocated & Confirmed",
          passengers: prev[pnrNum].passengers.map((p, idx) => ({
            ...p,
            status: "CNF",
            coach: "A1",
            seat: String(12 + idx)
          }))
        }
      }));
      setSuccessMsg(`Your booking has been successfully relocated to ${newTrainName} (Train No: ${newTrainNo}). Seat confirmed in Coach A1.`);
      toast.success("Relocation successful!");
      setActiveTab("journeys");
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error("Relocation request failed.");
    } finally {
      setIsRelocating(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Passenger Services</h2>
        <p className="text-emerald-400/70 text-sm mt-1">Manage bookings, track PNR status, and journey details</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 rounded-xl p-4 flex items-center gap-3 animate-bounce shadow-[0_0_20px_rgba(16,185,129,0.15)]">
          <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span className="text-sm font-semibold">{successMsg}</span>
          <button onClick={() => setSuccessMsg("")} className="ml-auto text-emerald-400 hover:text-white text-xs">Dismiss</button>
        </div>
      )}

      <div className="glass-panel p-2 rounded-xl flex items-center gap-2 overflow-x-auto border-white/5">
         {[
           { id: "pnr", label: "PNR Status & Enquiry" },
           { id: "journeys", label: "My Upcoming Journeys" },
           { id: "reallocation", label: "Smart Ticket Reallocation" }
         ].map((tab) => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-[#00ff87]/15 text-[#00ff87] border border-[#00ff87]/20 shadow-[0_0_15px_rgba(0,255,135,0.15)]" : "text-[#e2e8f0] hover:text-white hover:bg-white/5 border border-transparent"}`}
           >
             {tab.label}
           </button>
         ))}
      </div>

      <div className="mt-2">
        {activeTab === "pnr" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
            <div className="lg:col-span-2 flex flex-col gap-6">
              <div className="glass-panel rounded-xl p-6">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2"><Search className="w-4 h-4 text-emerald-400" /> Track PNR Status</h3>
                <div className="flex gap-3">
                  <Input
                    placeholder="Enter 10-digit PNR number"
                    value={pnr}
                    onChange={(e) => setPnr(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500/50 h-12 text-lg font-mono tracking-wider"
                    maxLength={10}
                  />
                  <button onClick={handleSearch} disabled={isSearching} className="px-6 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-[#040A15] font-semibold transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-50">
                    {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />} Check Status
                  </button>
                </div>
                {error && (
                  <div className="mt-4 flex items-center gap-2 text-red-400 text-sm p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                    <AlertCircle className="w-4 h-4" /> {error}
                  </div>
                )}
                <div className="mt-5 flex flex-wrap items-center gap-3">
                  <span className="text-slate-500 text-sm font-medium">Recent Searches:</span>
                  {recentSearches.map((s) => (
                    <button key={s} onClick={() => handleSearch(s)} className="px-3 py-1 rounded-md bg-white/5 border border-white/10 text-emerald-400/80 text-sm hover:bg-white/10 hover:text-emerald-400 transition-colors font-mono">{s}</button>
                  ))}
                </div>
              </div>

              {result && <PNRResult record={result} onNavigateToRelocation={() => setActiveTab("reallocation")} onRelocate={(newTrainNo, newTrainName, dep, arr) => handleRelocate(result.pnr, newTrainNo, newTrainName, dep, arr)} />}
            </div>

            <div className="flex flex-col gap-6">
              <div className="glass-panel rounded-xl flex flex-col overflow-hidden">
                <div className="p-5 border-b border-white/5 bg-[#0B1D3A]/50">
                  <h3 className="text-white font-medium flex items-center gap-2"><TicketIcon className="w-4 h-4 text-teal-400" /> Booking Overview</h3>
                </div>
                <div className="p-5 flex flex-col gap-3 bg-black/20">
                  <div className="flex justify-between py-1"><span className="text-slate-400 text-sm">Total Bookings (YTD)</span><span className="text-white font-medium font-mono">14</span></div>
                  <div className="flex justify-between py-1"><span className="text-slate-400 text-sm">Confirmed</span><span className="text-emerald-400 font-medium font-mono">12</span></div>
                  <div className="flex justify-between py-1"><span className="text-slate-400 text-sm">Waitlisted</span><span className="text-amber-400 font-medium font-mono">2</span></div>
                  <div className="flex justify-between py-1 border-t border-white/10 pt-3 mt-1"><span className="text-slate-400 text-sm">Cancellations</span><span className="text-slate-500 font-medium font-mono">0</span></div>
                </div>
              </div>

              <div className="glass-panel rounded-xl flex flex-col overflow-hidden">
                <div className="p-5 border-b border-white/5 bg-[#0B1D3A]/50">
                  <h3 className="text-white font-medium flex items-center gap-2"><ShieldCheck className="w-4 h-4 text-blue-400" /> Accommodation Classes</h3>
                </div>
                <div className="p-5 flex flex-col gap-3 bg-black/20">
                  {[["1A", "AC First Class", "text-purple-400", "bg-purple-500/10", "border-purple-500/20"], 
                    ["2A", "AC 2 Tier", "text-blue-400", "bg-blue-500/10", "border-blue-500/20"], 
                    ["3A", "AC 3 Tier", "text-emerald-400", "bg-emerald-500/10", "border-emerald-500/20"], 
                    ["SL", "Sleeper Class", "text-amber-400", "bg-amber-500/10", "border-amber-500/20"], 
                    ["CC", "AC Chair Car", "text-teal-400", "bg-teal-500/10", "border-teal-500/20"]].map(([code, name, color, bg, border]) => (
                    <div key={code} className="flex justify-between items-center group">
                      <Badge className={`${bg} ${color} ${border} text-xs font-mono w-10 justify-center shadow-inner`}>{code}</Badge>
                      <span className="text-slate-400 text-sm group-hover:text-slate-300 transition-colors">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "journeys" && (
          <div className="flex flex-col gap-4 animate-in fade-in">
            {["2451369874", "4867293015", "7234891056"].map((key) => {
              const rec = localPnrRecords[key];
              if (!rec) return null;
              const allConfirmed = rec.passengers.every((p) => p.status === "CNF");
              return (
                <div key={rec.pnr} className="glass-panel glass-panel-hover rounded-xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Train className="w-6 h-6 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-white font-semibold text-lg tracking-tight mb-1">{rec.trainName}</div>
                      <div className="text-slate-400 text-sm flex items-center gap-2 font-medium">
                         <span className="text-slate-300">{rec.from.split(" (")[0]}</span> <ArrowRight className="w-3 h-3 text-slate-600" /> <span className="text-slate-300">{rec.to.split(" (")[0]}</span> 
                         <span className="text-slate-600 px-1">•</span> 
                         <span className="text-emerald-400/80">{rec.date}</span>
                         <span className="text-slate-600 px-1">•</span>
                         <span className="font-mono bg-white/5 px-1.5 py-0.5 rounded text-xs border border-white/10">{rec.class}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 w-full md:w-auto mt-2 md:mt-0">
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)] font-mono">{allConfirmed ? "CNF" : "WL"}</Badge>
                    <button className="flex-1 md:flex-none px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors text-sm font-medium" onClick={() => { setActiveTab("pnr"); setPnr(rec.pnr); const matchRec = localPnrRecords[rec.pnr]; if (matchRec) setResult(matchRec); }}>
                      View Ticket
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === "reallocation" && (
          <div className="flex flex-col gap-10 animate-in fade-in">
            {delayedJourneys.length === 0 ? (
               <div className="glass-panel rounded-xl p-10 flex flex-col items-center justify-center text-center">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mb-4" />
                  <h3 className="text-xl font-bold text-white tracking-tight">All Trains on Schedule</h3>
                  <p className="text-slate-400 mt-2 max-w-md">None of your upcoming journeys are delayed. You do not need ticket reallocation at this time.</p>
               </div>
            ) : (
            delayedJourneys.map(key => {
              const rec = localPnrRecords[key];
              return (
                <div key={key} className="flex flex-col gap-4">
                  {/* Original Booking Overview Card */}
                  <div className="bg-[#0a0f1e] border border-white/10 rounded-xl overflow-hidden relative shadow-lg">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-red-500"></div>
                    <div className="p-6 pl-8">
                       <div className="text-slate-400 text-xs font-bold tracking-wider uppercase mb-6">Original Booking Overview</div>
                       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                          {/* Train details */}
                          <div className="flex items-center gap-4">
                             <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
                                <Train className="w-7 h-7 text-slate-300" />
                             </div>
                             <div>
                                <div className="text-blue-400 text-2xl font-bold tracking-tight">Train {rec.trainNo}</div>
                                <div className="text-slate-400 text-sm mt-0.5">{rec.trainName}</div>
                             </div>
                          </div>
                          
                          {/* Times */}
                          <div className="flex items-center justify-between flex-1 max-w-md mx-auto md:mx-0 w-full gap-4">
                             <div className="text-center min-w-[80px]">
                                <div className="text-2xl font-bold text-white">{rec.departure}</div>
                                <div className="text-slate-400 text-sm">{rec.from.split(' (')[0]}</div>
                             </div>
                             
                             <div className="flex flex-col items-center gap-2 flex-1">
                                <div className="text-slate-400 text-xs">15h 40m</div>
                                <div className="flex items-center w-full">
                                   <div className="h-0.5 w-full bg-white/10"></div>
                                   <Clock className="w-5 h-5 text-red-400 mx-3 flex-shrink-0" />
                                   <div className="h-0.5 w-full bg-white/10"></div>
                                </div>
                             </div>
                             
                             <div className="text-center min-w-[80px]">
                                <div className="text-2xl font-bold text-slate-500 line-through decoration-red-500 decoration-2">{rec.arrival}</div>
                                <div className="text-slate-400 text-sm">{rec.to.split(' (')[0]}</div>
                             </div>
                          </div>
                          
                          {/* Delayed badge */}
                          <div className="flex-shrink-0">
                             <Badge className="bg-red-500 hover:bg-red-600 text-white rounded-md px-3 py-1.5 text-sm font-semibold shadow-[0_0_15px_rgba(239,68,68,0.3)]">DELAYED 2h 15m</Badge>
                          </div>
                       </div>
                    </div>
                  </div>
                  
                  {/* AI Recommendation Banner */}
                  <div className="bg-[#00ff87]/10 border border-[#00ff87]/20 rounded-xl p-4 flex items-center gap-3">
                     <div className="w-8 h-8 bg-[#00ff87]/20 rounded-full flex-shrink-0 flex items-center justify-center">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-[#00ff87]">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                     </div>
                     <span className="text-[#e2e8f0] text-sm md:text-base">
                        <strong className="text-[#00ff87] mr-1">AI Recommendation:</strong> 
                        Option A offers the fastest arrival (1h earlier) with a direct route.
                     </span>
                  </div>
                  
                  {/* Options Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                     {/* Option A */}
                     <div className="bg-[#0d1526] border border-[#00ff87] rounded-xl relative flex flex-col shadow-[0_0_20px_rgba(0,255,135,0.15)] hover:-translate-y-1 transition-transform duration-300">
                        <div className="absolute top-0 right-0 bg-[#00ff87] text-[#0a0f1e] text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-xl shadow-md">BEST MATCH</div>
                        <div className="p-6 border-b border-[#00ff87]/20 bg-[#00ff87]/5 rounded-t-xl">
                           <div className="flex items-center gap-3">
                              <span className="text-[#00ff87] font-bold text-xl bg-[#00ff87]/10 w-9 h-9 flex items-center justify-center rounded-lg border border-[#00ff87]/30">A</span>
                              <div>
                                 <div className="text-lg font-bold text-white tracking-tight">Train 12908</div>
                                 <div className="text-emerald-400/80 text-xs mt-0.5 font-medium">Maharashtra Sampark Kranti</div>
                              </div>
                           </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col gap-5">
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-400">Departure</span>
                              <span className="text-white font-bold text-base">15:45</span>
                           </div>
                           <div className="w-full h-px bg-white/5"></div>
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-400">Impact</span>
                              <span className="text-[#00ff87] font-semibold text-base">Arrives 1h earlier</span>
                           </div>
                           <div className="w-full h-px bg-white/5"></div>
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-400">Fare Difference</span>
                              <span className="text-amber-400 font-bold text-base">+ 15% Surcharge</span>
                           </div>
                        </div>
                        <div className="p-6 pt-0 mt-auto">
                           <button onClick={() => handleRelocate(rec.pnr, "12908", "Maharashtra Sampark Kranti", "15:45", "05:00")} className="w-full py-3.5 bg-[#00ff87] hover:bg-[#00ff87]/80 text-[#0a0f1e] font-bold rounded-lg transition-colors shadow-lg">Select & Rebook</button>
                        </div>
                     </div>
                     
                     {/* Option B */}
                     <div className="bg-[#0d1526] border border-white/10 rounded-xl relative flex flex-col hover:-translate-y-1 transition-transform duration-300 hover:border-white/30">
                        <div className="p-6 border-b border-white/10 bg-white/5 rounded-t-xl">
                           <div className="flex items-center gap-3">
                              <span className="text-slate-300 font-bold text-xl bg-white/10 w-9 h-9 flex items-center justify-center rounded-lg border border-white/10">B</span>
                              <div>
                                 <div className="text-lg font-bold text-white tracking-tight">Train 22210</div>
                                 <div className="text-slate-400 text-xs mt-0.5 font-medium">Mumbai Duronto Express</div>
                              </div>
                           </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col gap-5">
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-400">Departure</span>
                              <span className="text-white font-bold text-base">16:20</span>
                           </div>
                           <div className="w-full h-px bg-white/5"></div>
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-400">Impact</span>
                              <span className="text-teal-400 font-semibold text-base">Premium Upgrade</span>
                           </div>
                           <div className="w-full h-px bg-white/5"></div>
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-400">Fare Difference</span>
                              <span className="text-amber-400 font-bold text-base">+ 15% Surcharge</span>
                           </div>
                        </div>
                        <div className="p-6 pt-0 mt-auto">
                           <button onClick={() => handleRelocate(rec.pnr, "22210", "Mumbai Duronto Express", "16:20", "05:30")} className="w-full py-3.5 bg-transparent border border-white/20 hover:bg-white/5 text-white font-bold rounded-lg transition-colors">Select Option</button>
                        </div>
                     </div>

                     {/* Option C */}
                     <div className="bg-[#0d1526] border border-white/10 rounded-xl relative flex flex-col hover:-translate-y-1 transition-transform duration-300 hover:border-white/30">
                        <div className="p-6 border-b border-white/10 bg-white/5 rounded-t-xl">
                           <div className="flex items-center gap-3">
                              <span className="text-slate-300 font-bold text-xl bg-white/10 w-9 h-9 flex items-center justify-center rounded-lg border border-white/10">C</span>
                              <div>
                                 <div className="text-lg font-bold text-white tracking-tight">Split Journey</div>
                                 <div className="text-slate-400 text-xs mt-0.5 font-medium">Via Surat (ST)</div>
                              </div>
                           </div>
                        </div>
                        <div className="p-6 flex-1 flex flex-col gap-5">
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-400">Departure</span>
                              <span className="text-white font-bold text-base">15:00</span>
                           </div>
                           <div className="w-full h-px bg-white/5"></div>
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-400">Impact</span>
                              <span className="text-emerald-400 font-semibold text-xs text-right max-w-[140px]">Leg 1 Free, Leg 2 at 50%</span>
                           </div>
                           <div className="w-full h-px bg-white/5"></div>
                           <div className="flex justify-between items-center text-sm">
                              <span className="text-slate-400">Fare Difference</span>
                              <span className="text-emerald-400 font-bold text-base">+ 50% Fare</span>
                           </div>
                        </div>
                        <div className="p-6 pt-0 mt-auto">
                           <button onClick={() => handleRelocate(rec.pnr, "SPLIT", "Split Journey (via ST)", "15:00", "07:00")} className="w-full py-3.5 bg-transparent border border-white/20 hover:bg-white/5 text-white font-bold rounded-lg transition-colors">Select Option</button>
                        </div>
                     </div>
                  </div>
                </div>
              );
            }))}
          </div>
        )}
      </div>
    </div>
  );
}
