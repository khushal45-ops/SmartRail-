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

function PNRResult({ record, onRelocate }: { record: typeof pnrRecords[string]; onRelocate: (newTrainNo: string, newTrainName: string, departure: string, arrival: string) => void }) {
  const allConfirmed = record.passengers.every((p) => p.status === "CNF");
  const hasWaiting = record.passengers.some((p) => p.status.startsWith("WL"));
  
  // Find if current train is delayed in mockData
  const trainDetail = trains.find(t => t.id === record.trainNo);
  const isDelayed = trainDetail ? (trainDetail.status === "Delayed" || trainDetail.delay > 0) : record.trainNo === "12951";
  const delayMinutes = trainDetail ? trainDetail.delay : (record.trainNo === "12951" ? 25 : 0);

  const { direct, connecting } = getRelocationOptions(record.from, record.to, record.trainNo);
  const [showRelocator, setShowRelocator] = useState(false);

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
               <div className="text-xl font-bold text-white tracking-tight">{record.trainName}</div>
               <div className="text-slate-400 text-sm font-mono mt-0.5">Train No. {record.trainNo} • {record.class} Class</div>
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
              onClick={() => setShowRelocator(!showRelocator)}
              className="px-3.5 py-1.5 bg-red-500/20 hover:bg-red-500/35 border border-red-400/40 text-red-300 rounded-lg text-xs font-semibold transition-all whitespace-nowrap"
            >
              {showRelocator ? "Hide Alternatives" : "Relocate Ticket"}
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

      {/* Dynamic Ticket Relocator Panel */}
      {showRelocator && (
        <div className="glass-panel border-emerald-500/20 rounded-xl p-6 flex flex-col gap-5 bg-emerald-950/10 shadow-[0_0_30px_rgba(16,185,129,0.05)] animate-in slide-in-from-top duration-300">
          <div>
            <h4 className="text-white font-bold text-base flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" /> Smart Ticket Relocation & Alternate Routing
            </h4>
            <p className="text-slate-400 text-xs mt-1">Available alternative routes for journey from {record.from} to {record.to}. Seats are guaranteed on selection.</p>
          </div>

          {/* Direct Alternate Trains */}
          <div className="flex flex-col gap-3">
            <div className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Option A: Direct Trains (Same Route)</div>
            {direct.length === 0 ? (
              <div className="text-slate-500 text-xs bg-black/20 p-3 rounded-lg border border-white/5">No direct alternative trains with available seats found on this track.</div>
            ) : (
              <div className="flex flex-col gap-2">
                {direct.map((t) => (
                  <div key={t.id} className="bg-black/30 border border-white/5 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-emerald-500/30 transition-all">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-bold text-sm">{t.name}</span>
                        <span className="text-xs text-slate-400 font-mono">({t.id})</span>
                        <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">{t.type}</Badge>
                      </div>
                      <div className="text-slate-400 text-xs mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>Departs: <strong className="text-slate-200">{t.departure}</strong></span>
                        <span>Arrives: <strong className="text-slate-200">{t.arrival}</strong></span>
                        <span>Platform: <strong className="text-slate-200">{t.platform}</strong></span>
                        <span className="text-emerald-400 font-medium">{t.availableSeats} Seats Available</span>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        onRelocate(t.id, t.name, t.departure, t.arrival);
                        setShowRelocator(false);
                      }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-[#040A15] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap"
                    >
                      Relocate Directly
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Connecting Alternate Trains */}
          <div className="flex flex-col gap-3">
            <div className="text-teal-400 text-xs font-semibold uppercase tracking-wider">Option B: Connecting Trains (2-Train Journey)</div>
            {connecting.length === 0 ? (
              <div className="text-slate-500 text-xs bg-black/20 p-3 rounded-lg border border-white/5">No connecting alternative routes available.</div>
            ) : (
              <div className="flex flex-col gap-3">
                {connecting.map((route, idx) => (
                  <div key={idx} className="bg-black/30 border border-white/5 rounded-xl p-4 flex flex-col gap-4 hover:border-teal-500/30 transition-all">
                    {/* Visual Connector Flow */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-3">
                        {/* Train 1 */}
                        <div className="flex-1 bg-black/20 p-2.5 rounded-lg border border-white/5">
                          <div className="flex items-center justify-between">
                            <span className="text-white font-semibold text-xs">{route.train1.name}</span>
                            <span className="text-[10px] text-emerald-400">{route.train1.availableSeats} Seats</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                            <span>{record.from.split(" (")[0]} ({route.train1.departure})</span>
                            <span>→</span>
                            <span className="text-slate-300 font-medium">{route.intermediate.split(" (")[0]} ({route.train1.arrival})</span>
                          </div>
                        </div>

                        {/* Connection Badge */}
                        <div className="self-center flex flex-col items-center">
                          <span className="px-2 py-0.5 bg-teal-500/10 text-teal-400 border border-teal-500/20 text-[9px] font-bold rounded">Change Train</span>
                          <span className="text-[9px] text-slate-500 mt-0.5">{route.intermediate.split(" (")[0]}</span>
                        </div>

                        {/* Train 2 */}
                        <div className="flex-1 bg-black/20 p-2.5 rounded-lg border border-white/5">
                          <div className="flex items-center justify-between">
                            <span className="text-white font-semibold text-xs">{route.train2.name}</span>
                            <span className="text-[10px] text-emerald-400">{route.train2.availableSeats} Seats</span>
                          </div>
                          <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                            <span className="text-slate-300 font-medium">{route.intermediate.split(" (")[0]} ({route.train2.departure})</span>
                            <span>→</span>
                            <span>{record.to.split(" (")[0]} ({route.train2.arrival})</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          onRelocate(
                            `${route.train1.id} & ${route.train2.id}`, 
                            `${route.train1.name} + ${route.train2.name} (via ${route.intermediate.split(" (")[0]})`, 
                            route.train1.departure, 
                            route.train2.arrival
                          );
                          setShowRelocator(false);
                        }}
                        className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-[#040A15] text-xs font-semibold rounded-lg transition-colors whitespace-nowrap self-end md:self-center"
                      >
                        Relocate Connect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

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
           { id: "reallocation", label: "AI Auto-Reallocation" }
         ].map((tab) => (
           <button
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.id ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]" : "text-slate-400 hover:text-white hover:bg-white/5 border border-transparent"}`}
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

              {result && <PNRResult record={result} onRelocate={(newTrainNo, newTrainName, dep, arr) => handleRelocate(result.pnr, newTrainNo, newTrainName, dep, arr)} />}
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
            {["2451369874", "7234891056"].map((key) => {
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
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in">
            <div className="glass-panel rounded-xl flex flex-col overflow-hidden">
              <div className="p-6 border-b border-white/5 bg-[#0B1D3A]/50">
                <h3 className="text-xl font-bold text-white flex items-center gap-3 tracking-tight"><RefreshCw className="w-5 h-5 text-emerald-400" /> Auto-Reallocation Engine</h3>
              </div>
              <div className="p-6 flex flex-col gap-6 bg-black/20 flex-1">
                <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-5 shadow-[0_0_20px_rgba(16,185,129,0.05)]">
                  <div className="flex items-center gap-2 mb-3"><div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]" /><span className="text-emerald-300 font-semibold tracking-wide">System Active & Monitoring</span></div>
                  <p className="text-slate-300 text-sm leading-relaxed">Our predictive AI continuously monitors real-time cancellations across the network. Waitlisted passengers are automatically mapped to newly available confirmed seats based on booking priority and passenger profile matching.</p>
                </div>
                <div className="flex flex-col gap-4 text-sm mt-2">
                  <div className="flex justify-between items-center py-2 border-b border-white/5"><span className="text-slate-400 font-medium">Reallocations Today (System-wide)</span><span className="text-white font-mono text-base font-medium">24,892</span></div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5"><span className="text-slate-400 font-medium">Algorithm Match Rate</span><span className="text-emerald-400 font-mono text-base font-medium">97.4%</span></div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5"><span className="text-slate-400 font-medium">Avg Processing Latency</span><span className="text-teal-400 font-mono text-base font-medium">1.2s</span></div>
                  <div className="flex justify-between items-center py-2"><span className="text-slate-400 font-medium">Your Waitlist Upgrades (YTD)</span><span className="text-white font-mono text-base font-medium">4</span></div>
                </div>
              </div>
            </div>

            <div className="glass-panel rounded-xl flex flex-col overflow-hidden">
              <div className="p-6 border-b border-white/5 bg-[#0B1D3A]/50">
                <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2"><Activity className="w-5 h-5 text-blue-400" /> Operational Flow</h3>
              </div>
              <div className="p-6 bg-black/20 flex-1 flex flex-col justify-center">
                <div className="flex flex-col gap-6 relative">
                  <div className="absolute left-5 top-5 bottom-5 w-0.5 bg-gradient-to-b from-emerald-500/50 via-teal-500/50 to-blue-500/50 rounded-full" />
                  {[
                    { step: "1", title: "Cancellation Detected", desc: "A confirmed seat is surrendered in real-time.", color: "text-emerald-400", bg: "bg-emerald-500/20" },
                    { step: "2", title: "Priority Resolution", desc: "Waitlist queue is instantly analyzed and ranked.", color: "text-teal-400", bg: "bg-teal-500/20" },
                    { step: "3", title: "Smart Assignment", desc: "Seat is automatically allocated to the optimal passenger.", color: "text-blue-400", bg: "bg-blue-500/20" },
                    { step: "4", title: "Instant Notification", desc: "Digital ticket is updated and passenger is alerted via SMS/Email.", color: "text-purple-400", bg: "bg-purple-500/20" },
                  ].map((item) => (
                    <div key={item.step} className="flex items-start gap-4 relative z-10">
                      <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.color} flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-inner border border-white/5 backdrop-blur-md`}>{item.step}</div>
                      <div className="pt-2">
                        <div className="text-white text-base font-semibold tracking-tight mb-1">{item.title}</div>
                        <div className="text-slate-400 text-sm leading-relaxed">{item.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
