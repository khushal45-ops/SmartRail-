import { useState, useEffect, useMemo } from "react";
import { MapContainer, TileLayer, CircleMarker, Polyline, Tooltip, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import {
  Train, MapPin, AlertTriangle, Users, Activity, Layers, ChevronDown, X, Clock,
  Gauge, Navigation, Wifi, Eye, EyeOff, Zap, BarChart2, Shield, Radio
} from "lucide-react";

// ─── ZONE DATA ──────────────────────────────────────────────────────────────────
interface RailwayZone {
  id: string;
  name: string;
  abbr: string;
  hq: string;
  center: [number, number];
  color: string;
  activeTrains: number;
  delayedTrains: number;
  cancelledTrains: number;
  occupancy: number;
  onTimePerc: number;
  stations: number;
  status: "Operational" | "Partial" | "Alert";
}

const railwayZones: RailwayZone[] = [
  { id: "nr", name: "Northern Railway", abbr: "NR", hq: "New Delhi", center: [28.6139, 77.2090], color: "#10b981", activeTrains: 142, delayedTrains: 18, cancelledTrains: 3, occupancy: 87, onTimePerc: 89, stations: 764, status: "Operational" },
  { id: "ncr", name: "North Central Railway", abbr: "NCR", hq: "Prayagraj", center: [25.4358, 81.8463], color: "#14b8a6", activeTrains: 98, delayedTrains: 12, cancelledTrains: 1, occupancy: 82, onTimePerc: 91, stations: 458, status: "Operational" },
  { id: "ner", name: "North Eastern Railway", abbr: "NER", hq: "Gorakhpur", center: [26.7606, 83.3732], color: "#06b6d4", activeTrains: 67, delayedTrains: 8, cancelledTrains: 2, occupancy: 71, onTimePerc: 86, stations: 392, status: "Operational" },
  { id: "nfr", name: "Northeast Frontier Railway", abbr: "NFR", hq: "Guwahati", center: [26.1445, 91.7362], color: "#8b5cf6", activeTrains: 45, delayedTrains: 11, cancelledTrains: 4, occupancy: 62, onTimePerc: 78, stations: 502, status: "Operational" },
  { id: "wr", name: "Western Railway", abbr: "WR", hq: "Mumbai", center: [19.0760, 72.8777], color: "#f59e0b", activeTrains: 156, delayedTrains: 22, cancelledTrains: 5, occupancy: 91, onTimePerc: 85, stations: 638, status: "Operational" },
  { id: "cr", name: "Central Railway", abbr: "CR", hq: "Mumbai CST", center: [18.9402, 72.8356], color: "#ef4444", activeTrains: 168, delayedTrains: 28, cancelledTrains: 6, occupancy: 93, onTimePerc: 82, stations: 712, status: "Operational" },
  { id: "er", name: "Eastern Railway", abbr: "ER", hq: "Kolkata", center: [22.5726, 88.3639], color: "#3b82f6", activeTrains: 124, delayedTrains: 16, cancelledTrains: 3, occupancy: 84, onTimePerc: 88, stations: 584, status: "Operational" },
  { id: "sr", name: "Southern Railway", abbr: "SR", hq: "Chennai", center: [13.0827, 80.2707], color: "#ec4899", activeTrains: 138, delayedTrains: 14, cancelledTrains: 2, occupancy: 79, onTimePerc: 92, stations: 678, status: "Operational" },
  { id: "scr", name: "South Central Railway", abbr: "SCR", hq: "Secunderabad", center: [17.4399, 78.4983], color: "#a855f7", activeTrains: 112, delayedTrains: 15, cancelledTrains: 3, occupancy: 81, onTimePerc: 87, stations: 596, status: "Operational" },
  { id: "ser", name: "South Eastern Railway", abbr: "SER", hq: "Kolkata", center: [22.3321, 87.3232], color: "#0ea5e9", activeTrains: 89, delayedTrains: 10, cancelledTrains: 2, occupancy: 76, onTimePerc: 90, stations: 468, status: "Operational" },
  { id: "ecr", name: "East Central Railway", abbr: "ECR", hq: "Hajipur", center: [25.6880, 85.2040], color: "#22d3ee", activeTrains: 94, delayedTrains: 19, cancelledTrains: 4, occupancy: 88, onTimePerc: 81, stations: 432, status: "Operational" },
  { id: "eco", name: "East Coast Railway", abbr: "ECoR", hq: "Bhubaneswar", center: [20.2961, 85.8245], color: "#34d399", activeTrains: 76, delayedTrains: 9, cancelledTrains: 1, occupancy: 73, onTimePerc: 93, stations: 388, status: "Operational" },
  { id: "wcr", name: "West Central Railway", abbr: "WCR", hq: "Jabalpur", center: [23.1815, 79.9864], color: "#fbbf24", activeTrains: 82, delayedTrains: 13, cancelledTrains: 2, occupancy: 78, onTimePerc: 86, stations: 412, status: "Operational" },
  { id: "swr", name: "South Western Railway", abbr: "SWR", hq: "Hubli", center: [15.3647, 75.1240], color: "#fb923c", activeTrains: 71, delayedTrains: 7, cancelledTrains: 1, occupancy: 69, onTimePerc: 94, stations: 356, status: "Operational" },
  { id: "secr", name: "South East Central Railway", abbr: "SECR", hq: "Bilaspur", center: [22.0796, 82.1391], color: "#4ade80", activeTrains: 64, delayedTrains: 8, cancelledTrains: 2, occupancy: 72, onTimePerc: 89, stations: 328, status: "Operational" },
  { id: "kr", name: "Konkan Railway", abbr: "KR", hq: "Navi Mumbai", center: [15.8497, 73.7370], color: "#2dd4bf", activeTrains: 32, delayedTrains: 4, cancelledTrains: 1, occupancy: 65, onTimePerc: 91, stations: 68, status: "Operational" },
];

// ─── MAJOR STATIONS ─────────────────────────────────────────────────────────────
interface MajorStation {
  name: string;
  code: string;
  lat: number;
  lng: number;
  zone: string;
  platforms: number;
  dailyTrains: number;
  dailyPassengers: string;
  utilization: number;
  congested: boolean;
}

const majorStations: MajorStation[] = [
  { name: "New Delhi", code: "NDLS", lat: 28.6139, lng: 77.2090, zone: "nr", platforms: 16, dailyTrains: 342, dailyPassengers: "450K", utilization: 94, congested: true },
  { name: "Mumbai Central", code: "BCT", lat: 19.0760, lng: 72.8777, zone: "wr", platforms: 14, dailyTrains: 298, dailyPassengers: "380K", utilization: 91, congested: true },
  { name: "Chennai Central", code: "MAS", lat: 13.0827, lng: 80.2707, zone: "sr", platforms: 17, dailyTrains: 256, dailyPassengers: "310K", utilization: 82, congested: false },
  { name: "Howrah", code: "HWH", lat: 22.5726, lng: 88.3639, zone: "er", platforms: 23, dailyTrains: 274, dailyPassengers: "420K", utilization: 89, congested: false },
  { name: "Bengaluru", code: "SBC", lat: 12.9716, lng: 77.5946, zone: "swr", platforms: 10, dailyTrains: 186, dailyPassengers: "260K", utilization: 85, congested: false },
  { name: "Secunderabad", code: "SC", lat: 17.3850, lng: 78.4867, zone: "scr", platforms: 10, dailyTrains: 198, dailyPassengers: "270K", utilization: 78, congested: false },
  { name: "Ahmedabad", code: "ADI", lat: 23.0225, lng: 72.5714, zone: "wr", platforms: 12, dailyTrains: 178, dailyPassengers: "220K", utilization: 76, congested: false },
  { name: "Jaipur", code: "JP", lat: 26.9124, lng: 75.7873, zone: "nr", platforms: 8, dailyTrains: 124, dailyPassengers: "150K", utilization: 72, congested: false },
  { name: "Lucknow", code: "LKO", lat: 26.8467, lng: 80.9462, zone: "nr", platforms: 9, dailyTrains: 156, dailyPassengers: "180K", utilization: 81, congested: false },
  { name: "Patna", code: "PNBE", lat: 25.5941, lng: 85.1376, zone: "ecr", platforms: 10, dailyTrains: 142, dailyPassengers: "190K", utilization: 88, congested: true },
  { name: "Bhopal", code: "BPL", lat: 23.2599, lng: 77.4126, zone: "wcr", platforms: 6, dailyTrains: 112, dailyPassengers: "130K", utilization: 74, congested: false },
  { name: "Pune", code: "PUNE", lat: 18.5204, lng: 73.8567, zone: "cr", platforms: 6, dailyTrains: 110, dailyPassengers: "120K", utilization: 80, congested: false },
];

// ─── TRAIN DATA ─────────────────────────────────────────────────────────────────
interface MapTrain {
  id: string;
  name: string;
  lat: number;
  lng: number;
  from: string;
  to: string;
  currentStation: string;
  nextStation: string;
  speed: number;
  eta: string;
  delay: number;
  occupancy: number;
  platform: number;
  status: "ontime" | "delayed" | "critical" | "special";
  zone: string;
  aiPrediction: string;
}

const mapTrains: MapTrain[] = [
  { id: "10000", name: "Patna-Bangalore Exp", lat: 25.0452, lng: 84.7088, from: "PAT", to: "BAN", currentStation: "Patna", nextStation: "Bangalore", speed: 66, eta: "12:00", delay: 24, occupancy: 70, platform: 1, status: "delayed", zone: "nr", aiPrediction: "System Note" },
  { id: "10001", name: "Ahmedabad-Mumbai Exp", lat: 23.8649, lng: 72.8258, from: "AHM", to: "MUM", currentStation: "Ahmedabad", nextStation: "Mumbai", speed: 66, eta: "12:00", delay: 23, occupancy: 93, platform: 1, status: "delayed", zone: "nr", aiPrediction: "System Note" },
  { id: "10002", name: "Mumbai-Kolkata Exp", lat: 18.5413, lng: 73.0817, from: "MUM", to: "KOL", currentStation: "Mumbai", nextStation: "Kolkata", speed: 95, eta: "12:00", delay: 27, occupancy: 94, platform: 1, status: "delayed", zone: "nr", aiPrediction: "System Note" },
  { id: "10003", name: "Ahmedabad-Kolkata Exp", lat: 22.9209, lng: 72.1278, from: "AHM", to: "KOL", currentStation: "Ahmedabad", nextStation: "Kolkata", speed: 115, eta: "12:00", delay: 15, occupancy: 70, platform: 1, status: "delayed", zone: "nr", aiPrediction: "System Note" },
  { id: "10004", name: "Pune-Ahmedabad Exp", lat: 18.2009, lng: 73.1677, from: "PUN", to: "AHM", currentStation: "Pune", nextStation: "Ahmedabad", speed: 108, eta: "12:00", delay: 36, occupancy: 66, platform: 1, status: "delayed", zone: "nr", aiPrediction: "System Note" },
  { id: "10005", name: "Mumbai-Ahmedabad Exp", lat: 18.2694, lng: 73.5727, from: "MUM", to: "AHM", currentStation: "Mumbai", nextStation: "Ahmedabad", speed: 98, eta: "12:00", delay: 31, occupancy: 62, platform: 1, status: "delayed", zone: "nr", aiPrediction: "System Note" },
  { id: "10006", name: "Pune-Jaipur Exp", lat: 18.5929, lng: 74.8029, from: "PUN", to: "JAI", currentStation: "Pune", nextStation: "Jaipur", speed: 84, eta: "12:00", delay: 20, occupancy: 95, platform: 1, status: "delayed", zone: "nr", aiPrediction: "System Note" },
  { id: "10007", name: "Bangalore-Bhopal Exp", lat: 13.2086, lng: 78.3180, from: "BAN", to: "BHO", currentStation: "Bangalore", nextStation: "Bhopal", speed: 96, eta: "12:00", delay: 27, occupancy: 64, platform: 1, status: "delayed", zone: "nr", aiPrediction: "System Note" },
  { id: "10008", name: "New Delhi-Bhopal Exp", lat: 28.0697, lng: 76.7878, from: "NEW", to: "BHO", currentStation: "New Delhi", nextStation: "Bhopal", speed: 65, eta: "12:00", delay: 29, occupancy: 66, platform: 1, status: "critical", zone: "nr", aiPrediction: "System Note" },
  { id: "10009", name: "Ahmedabad-Bangalore Exp", lat: 22.9293, lng: 73.2396, from: "AHM", to: "BAN", currentStation: "Ahmedabad", nextStation: "Bangalore", speed: 70, eta: "12:00", delay: 38, occupancy: 82, platform: 1, status: "critical", zone: "nr", aiPrediction: "System Note" },
  { id: "10010", name: "Kolkata-Bhopal Exp", lat: 22.1066, lng: 89.2372, from: "KOL", to: "BHO", currentStation: "Kolkata", nextStation: "Bhopal", speed: 101, eta: "12:00", delay: 19, occupancy: 70, platform: 1, status: "critical", zone: "nr", aiPrediction: "System Note" },
  { id: "10011", name: "Lucknow-Pune Exp", lat: 26.3363, lng: 80.8707, from: "LUC", to: "PUN", currentStation: "Lucknow", nextStation: "Pune", speed: 77, eta: "12:00", delay: 0, occupancy: 95, platform: 1, status: "ontime", zone: "nr", aiPrediction: "System Note" },
  { id: "10012", name: "Kolkata-Bhopal Exp", lat: 22.2212, lng: 88.9005, from: "KOL", to: "BHO", currentStation: "Kolkata", nextStation: "Bhopal", speed: 63, eta: "12:00", delay: 0, occupancy: 74, platform: 1, status: "ontime", zone: "nr", aiPrediction: "System Note" },
  { id: "10013", name: "New Delhi-Hyderabad Exp", lat: 28.4162, lng: 76.3414, from: "NEW", to: "HYD", currentStation: "New Delhi", nextStation: "Hyderabad", speed: 118, eta: "12:00", delay: 0, occupancy: 80, platform: 1, status: "ontime", zone: "nr", aiPrediction: "System Note" },
  { id: "10014", name: "Kolkata-Bhopal Exp", lat: 22.5711, lng: 89.1333, from: "KOL", to: "BHO", currentStation: "Kolkata", nextStation: "Bhopal", speed: 101, eta: "12:00", delay: 0, occupancy: 89, platform: 1, status: "ontime", zone: "nr", aiPrediction: "System Note" },
  { id: "10015", name: "Chennai-Bangalore Exp", lat: 12.3620, lng: 80.7607, from: "CHE", to: "BAN", currentStation: "Chennai", nextStation: "Bangalore", speed: 94, eta: "12:00", delay: 0, occupancy: 76, platform: 1, status: "ontime", zone: "nr", aiPrediction: "System Note" },
  { id: "10016", name: "Pune-Patna Exp", lat: 18.3773, lng: 74.0238, from: "PUN", to: "PAT", currentStation: "Pune", nextStation: "Patna", speed: 83, eta: "12:00", delay: 0, occupancy: 74, platform: 1, status: "ontime", zone: "nr", aiPrediction: "System Note" },
  { id: "10017", name: "Chennai-Lucknow Exp", lat: 13.0697, lng: 80.7823, from: "CHE", to: "LUC", currentStation: "Chennai", nextStation: "Lucknow", speed: 115, eta: "12:00", delay: 0, occupancy: 67, platform: 1, status: "ontime", zone: "nr", aiPrediction: "System Note" },
  { id: "10018", name: "Chennai-Bhopal Exp", lat: 12.4027, lng: 80.6317, from: "CHE", to: "BHO", currentStation: "Chennai", nextStation: "Bhopal", speed: 98, eta: "12:00", delay: 0, occupancy: 64, platform: 1, status: "ontime", zone: "nr", aiPrediction: "System Note" },
  { id: "10019", name: "Ahmedabad-Patna Exp", lat: 24.0147, lng: 72.6296, from: "AHM", to: "PAT", currentStation: "Ahmedabad", nextStation: "Patna", speed: 95, eta: "12:00", delay: 0, occupancy: 60, platform: 1, status: "ontime", zone: "nr", aiPrediction: "System Note" },
  { id: "10020", name: "Bhopal-Pune Exp", lat: 22.4890, lng: 78.1822, from: "BHO", to: "PUN", currentStation: "Bhopal", nextStation: "Pune", speed: 108, eta: "12:00", delay: 0, occupancy: 77, platform: 1, status: "ontime", zone: "nr", aiPrediction: "System Note" },
  { id: "10021", name: "Bhopal-Hyderabad Exp", lat: 22.4830, lng: 77.2821, from: "BHO", to: "HYD", currentStation: "Bhopal", nextStation: "Hyderabad", speed: 89, eta: "12:00", delay: 0, occupancy: 60, platform: 1, status: "ontime", zone: "nr", aiPrediction: "System Note" },
  { id: "10022", name: "Pune-Bangalore Exp", lat: 19.4642, lng: 74.3806, from: "PUN", to: "BAN", currentStation: "Pune", nextStation: "Bangalore", speed: 92, eta: "12:00", delay: 0, occupancy: 66, platform: 1, status: "ontime", zone: "nr", aiPrediction: "System Note" },
  { id: "10023", name: "Bhopal-Bangalore Exp", lat: 23.9432, lng: 77.4279, from: "BHO", to: "BAN", currentStation: "Bhopal", nextStation: "Bangalore", speed: 72, eta: "12:00", delay: 0, occupancy: 69, platform: 1, status: "ontime", zone: "nr", aiPrediction: "System Note" },
  { id: "10024", name: "Hyderabad-Chennai Exp", lat: 17.4638, lng: 79.0440, from: "HYD", to: "CHE", currentStation: "Hyderabad", nextStation: "Chennai", speed: 93, eta: "12:00", delay: 0, occupancy: 60, platform: 1, status: "ontime", zone: "nr", aiPrediction: "System Note" },
  { id: "10025", name: "Patna-Hyderabad Exp", lat: 25.5713, lng: 84.3613, from: "PAT", to: "HYD", currentStation: "Patna", nextStation: "Hyderabad", speed: 83, eta: "12:00", delay: 0, occupancy: 79, platform: 1, status: "ontime", zone: "nr", aiPrediction: "System Note" },
  { id: "10026", name: "Kolkata-New Delhi Exp", lat: 22.0543, lng: 88.4986, from: "KOL", to: "NEW", currentStation: "Kolkata", nextStation: "New Delhi", speed: 65, eta: "12:00", delay: 0, occupancy: 65, platform: 1, status: "ontime", zone: "nr", aiPrediction: "System Note" },
  { id: "10027", name: "Pune-Jaipur Exp", lat: 19.1524, lng: 74.8127, from: "PUN", to: "JAI", currentStation: "Pune", nextStation: "Jaipur", speed: 94, eta: "12:00", delay: 0, occupancy: 68, platform: 1, status: "ontime", zone: "nr", aiPrediction: "System Note" },
  { id: "10028", name: "Chennai-Bhopal Exp", lat: 13.0333, lng: 80.3703, from: "CHE", to: "BHO", currentStation: "Chennai", nextStation: "Bhopal", speed: 76, eta: "12:00", delay: 0, occupancy: 93, platform: 1, status: "ontime", zone: "nr", aiPrediction: "System Note" },
  { id: "10029", name: "Patna-Ahmedabad Exp", lat: 26.5228, lng: 85.9954, from: "PAT", to: "AHM", currentStation: "Patna", nextStation: "Ahmedabad", speed: 108, eta: "12:00", delay: 0, occupancy: 72, platform: 1, status: "ontime", zone: "nr", aiPrediction: "System Note" },
  { id: "10030", name: "Pune-Bangalore Exp", lat: 18.3184, lng: 74.2001, from: "PUN", to: "BAN", currentStation: "Pune", nextStation: "Bangalore", speed: 83, eta: "12:00", delay: 0, occupancy: 88, platform: 1, status: "ontime", zone: "nr", aiPrediction: "System Note" },
];

// ─── ROUTE DATA ─────────────────────────────────────────────────────────────────
interface RouteSegment {
  name: string;
  points: [number, number][];
  type: "active" | "maintenance" | "highspeed";
  zone: string;
}

const routeSegments: RouteSegment[] = [
  { name: "Delhi-Mumbai", points: [[28.6139, 77.2090], [26.9124, 75.7873], [23.0225, 72.5714], [19.0760, 72.8777]], type: "active", zone: "multi" },
  { name: "Mumbai-Chennai", points: [[19.0760, 72.8777], [18.5204, 73.8567], [12.9716, 77.5946], [13.0827, 80.2707]], type: "active", zone: "multi" },
  { name: "Chennai-Kolkata", points: [[13.0827, 80.2707], [17.3850, 78.4867], [22.5726, 88.3639]], type: "active", zone: "multi" },
  { name: "Kolkata-Delhi", points: [[22.5726, 88.3639], [25.5941, 85.1376], [26.8467, 80.9462], [28.6139, 77.2090]], type: "active", zone: "multi" },
  { name: "Delhi-Hyderabad", points: [[28.6139, 77.2090], [23.2599, 77.4126], [17.3850, 78.4867]], type: "highspeed", zone: "multi" },
];

// ─── DATA LAYERS ────────────────────────────────────────────────────────────────
interface DataLayer {
  id: string;
  label: string;
  icon: any;
  color: string;
  enabled: boolean;
}

const defaultLayers: DataLayer[] = [
  { id: "trains_ontime", label: "Active Trains", icon: Train, color: "#10b981", enabled: true },
  { id: "trains_delayed", label: "Delayed Trains", icon: AlertTriangle, color: "#f59e0b", enabled: true },
  { id: "trains_critical", label: "Critical Delays", icon: AlertTriangle, color: "#ef4444", enabled: true },
  { id: "trains_special", label: "Special Trains", icon: Zap, color: "#3b82f6", enabled: true },
  { id: "stations", label: "Major Stations", icon: MapPin, color: "#14b8a6", enabled: true },
  { id: "routes", label: "Route Lines", icon: Navigation, color: "#8b5cf6", enabled: true },
  { id: "congestion", label: "Congested Stations", icon: Users, color: "#ef4444", enabled: true },
  { id: "maintenance", label: "Maintenance Areas", icon: Activity, color: "#f97316", enabled: false },
];

// ─── HELPERS ────────────────────────────────────────────────────────────────────
const trainStatusColor: Record<string, string> = {
  ontime: "#10b981",
  delayed: "#f59e0b",
  critical: "#ef4444",
  special: "#3b82f6",
};

const trainStatusLabel: Record<string, string> = {
  ontime: "On Time",
  delayed: "Delayed",
  critical: "Critical",
  special: "Special",
};

// ─── MAP RESIZER ────────────────────────────────────────────────────────────────
function MapResizer() {
  const map = useMap();
  useEffect(() => {
    const timeout = setTimeout(() => map.invalidateSize(), 200);
    return () => clearTimeout(timeout);
  }, [map]);
  return null;
}

// ─── FLY TO ZONE ────────────────────────────────────────────────────────────────
function FlyToZone({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, zoom, { duration: 1.2 });
  }, [center, zoom, map]);
  return null;
}

// ─── ANIMATED TRAIN MARKER ──────────────────────────────────────────────────────
function TrainMarker({ train, onClick, isSelected }: { train: MapTrain; onClick: () => void; isSelected: boolean }) {
  const color = trainStatusColor[train.status];
  return (
    <CircleMarker
      center={[train.lat, train.lng]}
      radius={isSelected ? 10 : 7}
      pathOptions={{
        fillColor: color,
        color: isSelected ? "#ffffff" : color,
        weight: isSelected ? 3 : 2,
        fillOpacity: 0.9,
        opacity: 1,
      }}
      eventHandlers={{ click: onClick }}
    >
      <Tooltip
        direction="top"
        offset={[0, -10]}
        className="train-tooltip"
        permanent={false}
      >
        <div style={{ background: "#0a192f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "8px 12px", color: "#fff", fontSize: "12px", minWidth: "140px" }}>
          <div style={{ fontWeight: 700, marginBottom: 2 }}>{train.name}</div>
          <div style={{ color: "#94a3b8", fontSize: 11 }}>Train {train.id} · {train.speed} km/h</div>
          <div style={{ color, fontSize: 11, marginTop: 2, fontWeight: 600 }}>
            {trainStatusLabel[train.status]}{train.delay > 0 ? ` (+${train.delay}m)` : ""}
          </div>
        </div>
      </Tooltip>
    </CircleMarker>
  );
}

// ─── STATION MARKER ─────────────────────────────────────────────────────────────
function StationMarker({ station, selectedZone }: { station: MajorStation; selectedZone: string | null }) {
  const isZoneMatch = !selectedZone || station.zone === selectedZone;
  const opacity = isZoneMatch ? 1 : 0.25;

  return (
    <CircleMarker
      center={[station.lat, station.lng]}
      radius={station.congested ? 9 : 7}
      pathOptions={{
        fillColor: station.congested ? "#ef4444" : "#14b8a6",
        color: station.congested ? "#fca5a5" : "#5eead4",
        weight: 2,
        fillOpacity: 0.85 * opacity,
        opacity: opacity,
      }}
    >
      <Tooltip direction="right" offset={[12, 0]} className="station-tooltip" permanent={false}>
        <div style={{ background: "#0a192f", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px 14px", color: "#fff", fontSize: "12px", minWidth: "180px" }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>{station.name}</div>
          <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 6 }}>Code: {station.code} · {station.platforms} Platforms</div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}>
            <span style={{ color: "#94a3b8" }}>Daily Trains</span>
            <span style={{ color: "#fff", fontWeight: 600 }}>{station.dailyTrains}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, marginBottom: 2 }}>
            <span style={{ color: "#94a3b8" }}>Passengers</span>
            <span style={{ color: "#fff", fontWeight: 600 }}>{station.dailyPassengers}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11 }}>
            <span style={{ color: "#94a3b8" }}>Utilization</span>
            <span style={{ color: station.utilization > 85 ? "#f59e0b" : "#10b981", fontWeight: 600 }}>{station.utilization}%</span>
          </div>
          {station.congested && (
            <div style={{ marginTop: 6, padding: "4px 8px", background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 6, color: "#fca5a5", fontSize: 10, textAlign: "center", fontWeight: 600 }}>
              ⚠ HIGH CONGESTION
            </div>
          )}
        </div>
      </Tooltip>
    </CircleMarker>
  );
}

// ═════════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════════
export function RailwayOperationsMap({ isDashboard = false }: { isDashboard?: boolean } = {}) {
  const [selectedZone, setSelectedZone] = useState<string | null>(null);
  const [selectedTrain, setSelectedTrain] = useState<MapTrain | null>(null);
  const [layers, setLayers] = useState(defaultLayers);
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [showZonePanel, setShowZonePanel] = useState(!isDashboard);
  const [mobileSheet, setMobileSheet] = useState<"layers" | "zone" | null>(null);
  const [trainPositions, setTrainPositions] = useState(mapTrains);

  // Animate train positions subtly
  useEffect(() => {
    const interval = setInterval(() => {
      setTrainPositions((prev) =>
        prev.map((t) => ({
          ...t,
          lat: t.lat + (Math.random() - 0.5) * 0.015,
          lng: t.lng + (Math.random() - 0.5) * 0.015,
          speed: Math.max(0, t.speed + Math.floor((Math.random() - 0.5) * 6)),
        }))
      );
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const toggleLayer = (id: string) => {
    setLayers((prev) => prev.map((l) => l.id === id ? { ...l, enabled: !l.enabled } : l));
  };

  const isLayerOn = (id: string) => layers.find((l) => l.id === id)?.enabled ?? false;

  const selectedZoneData = useMemo(
    () => railwayZones.find((z) => z.id === selectedZone) || null,
    [selectedZone]
  );

  const mapCenter: [number, number] = selectedZoneData ? selectedZoneData.center : [22.5, 82.0];
  const mapZoom = selectedZoneData ? 7 : 5;

  const visibleTrains = useMemo(() => {
    return trainPositions.filter((t) => {
      if (selectedZone && t.zone !== selectedZone) return false;
      if (t.status === "ontime" && !isLayerOn("trains_ontime")) return false;
      if (t.status === "delayed" && !isLayerOn("trains_delayed")) return false;
      if (t.status === "critical" && !isLayerOn("trains_critical")) return false;
      if (t.status === "special" && !isLayerOn("trains_special")) return false;
      return true;
    });
  }, [trainPositions, selectedZone, layers]);

  const visibleStations = useMemo(() => {
    if (!isLayerOn("stations")) return [];
    return majorStations;
  }, [layers]);

  const visibleRoutes = useMemo(() => {
    if (!isLayerOn("routes")) return [];
    return routeSegments.filter((r) => {
      if (r.type === "maintenance" && !isLayerOn("maintenance")) return false;
      if (selectedZone && r.zone !== "multi" && r.zone !== selectedZone) return false;
      return true;
    });
  }, [selectedZone, layers]);

  // Summary stats
  const totalActive = 1668;
  const totalDelayed = 214;
  const avgOccupancy = 87;

  // Compact sizes for dashboard mode
  const zoneSelectorClass = isDashboard 
    ? "absolute top-3 left-3 z-[1000] hidden lg:block" 
    : "absolute top-4 left-4 z-[1000] hidden lg:block";
  const zoneSelectorWidth = isDashboard ? "w-52" : "w-64";
  const zoneSelectorPadding = isDashboard ? "px-3 py-2 text-xs" : "px-4 py-3 text-sm";
  const zoneSelectorItemPadding = isDashboard ? "px-3 py-2 text-[11px]" : "px-4 py-2.5 text-xs";

  const dataLayersClass = isDashboard
    ? "absolute top-3 left-[228px] z-[1000] hidden lg:block"
    : "absolute top-4 left-[280px] z-[1000] hidden lg:block";
  const dataLayersPadding = isDashboard ? "px-3 py-2 text-xs" : "px-4 py-2.5 text-sm";
  const dataLayersDropdownWidth = isDashboard ? "w-48" : "w-56";
  const dataLayersItemPadding = isDashboard ? "px-3 py-2 text-[11px]" : "px-4 py-2.5 text-xs";

  const networkStatusClass = isDashboard
    ? "absolute top-3 right-3 z-[1000] hidden lg:block"
    : "absolute top-4 right-4 z-[1000] hidden lg:block";
  const networkStatusWidth = isDashboard ? "w-44" : "w-56";
  const networkStatusPadding = isDashboard ? "px-3.5 py-3" : "px-5 py-4";
  const networkStatusSpacing = isDashboard ? "gap-1.5" : "gap-2.5";
  const networkStatusTitleClass = isDashboard ? "text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5" : "text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2";
  const networkStatusItemTextClass = isDashboard ? "text-slate-400 text-[11px]" : "text-slate-400 text-xs";
  const networkStatusValueTextClass = isDashboard ? "font-bold font-mono text-xs" : "font-bold font-mono text-sm";

  const liveOperationsClass = isDashboard
    ? "absolute bottom-3 left-3 z-[1000] hidden lg:block"
    : "absolute bottom-4 left-4 z-[1000] hidden lg:block";
  const liveOperationsWidth = isDashboard ? "w-60" : "w-72";
  const liveOperationsPadding = isDashboard ? "px-3.5 py-3" : "px-5 py-4";
  const liveOperationsTitleClass = isDashboard ? "text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5" : "text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2";
  const liveOperationsGridPadding = isDashboard ? "p-1.5" : "p-2.5";
  const liveOperationsGridTextVal = isDashboard ? "text-base" : "text-xl";
  const liveOperationsGridTextValLg = isDashboard ? "text-sm" : "text-lg";

  const legendClass = isDashboard
    ? "absolute bottom-3 right-3 z-[1000] hidden lg:block"
    : "absolute bottom-4 right-4 z-[1000] hidden lg:block";
  const legendPadding = isDashboard ? "px-2.5 py-2" : "px-4 py-3";
  const legendSpacing = isDashboard ? "gap-1" : "gap-1.5";
  const legendTitleClass = isDashboard ? "text-[9px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5" : "text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2";
  const legendItemClass = isDashboard ? "flex items-center gap-2 text-[10px]" : "flex items-center gap-2 text-[11px]";
  const legendDotClass = isDashboard ? "w-2 h-2 rounded-full" : "w-2.5 h-2.5 rounded-full";
  const legendLineClass = isDashboard ? "w-4 h-[2px]" : "w-6 h-[2px]";

  const trainDetailClass = isDashboard
    ? "absolute top-3 right-[196px] z-[1000] hidden lg:block animate-in slide-in-from-right-4 fade-in duration-300"
    : "absolute top-4 right-[240px] z-[1000] hidden lg:block animate-in slide-in-from-right-4 fade-in duration-300";
  const trainDetailWidth = isDashboard ? "w-72" : "w-80";
  const trainDetailPadding = isDashboard ? "p-4" : "p-5";

  return (
    <div className={`relative w-full h-full flex flex-col ${isDashboard ? "min-h-[450px]" : "min-h-[600px]"}`}>
      {/* ── MAP ─────────────────────────────────────────────────────────────── */}
      <div className={`flex-1 relative overflow-hidden ${isDashboard ? "rounded-none border-0 shadow-none" : "rounded-2xl border border-white/5 shadow-[0_0_60px_rgba(0,0,0,0.5)]"}`}>
        <MapContainer
          center={[22.5, 82.0]}
          zoom={5}
          className="w-full h-full"
          style={{ minHeight: isDashboard ? "450px" : "600px", background: "#050b14" }}
          zoomControl={false}
          attributionControl={false}
        >
          <MapResizer />
          <FlyToZone center={mapCenter} zoom={mapZoom} />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png"
          />
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_only_labels/{z}/{x}/{y}{r}.png"
            opacity={0.5}
          />

          {/* Routes */}
          {visibleRoutes.map((route, i) => (
            <Polyline
              key={i}
              positions={route.points}
              pathOptions={{
                color: route.type === "maintenance" ? "#f97316" : route.type === "highspeed" ? "#3b82f6" : "#10b981",
                weight: route.type === "highspeed" ? 3 : 2,
                opacity: selectedZone && route.zone !== "multi" && route.zone !== selectedZone ? 0.15 : 0.5,
                dashArray: route.type === "maintenance" ? "8 6" : undefined,
              }}
            >
              <Tooltip className="route-tooltip">
                <span style={{ color: "#fff", fontSize: 11, background: "#0a192f", padding: "4px 8px", borderRadius: 6 }}>{route.name}</span>
              </Tooltip>
            </Polyline>
          ))}

          {/* Zone boundary circles */}
          {railwayZones.map((zone) => (
            <CircleMarker
              key={zone.id}
              center={zone.center}
              radius={selectedZone === zone.id ? 45 : 25}
              pathOptions={{
                fillColor: zone.color,
                color: zone.color,
                weight: selectedZone === zone.id ? 2 : 1,
                fillOpacity: selectedZone === zone.id ? 0.12 : selectedZone ? 0.03 : 0.06,
                opacity: selectedZone === zone.id ? 0.6 : selectedZone ? 0.1 : 0.25,
              }}
              eventHandlers={{
                click: () => setSelectedZone(selectedZone === zone.id ? null : zone.id),
              }}
            >
              <Tooltip direction="center" permanent className="zone-label-tooltip">
                <span style={{
                  color: selectedZone && selectedZone !== zone.id ? "rgba(255,255,255,0.2)" : zone.color,
                  fontWeight: 700,
                  fontSize: selectedZone === zone.id ? 14 : 11,
                  textShadow: `0 0 10px ${zone.color}40`,
                  letterSpacing: "0.05em",
                }}>
                  {zone.abbr}
                </span>
              </Tooltip>
            </CircleMarker>
          ))}

          {/* Stations */}
          {visibleStations.map((station) => (
            <StationMarker key={station.code} station={station} selectedZone={selectedZone} />
          ))}

          {/* Trains */}
          {visibleTrains.map((train) => (
            <TrainMarker
              key={train.id}
              train={train}
              isSelected={selectedTrain?.id === train.id}
              onClick={() => setSelectedTrain(selectedTrain?.id === train.id ? null : train)}
            />
          ))}
        </MapContainer>

        {/* ── OVERLAY: Zone Selector (Top Left) ──────────────────────────── */}
        <div className={zoneSelectorClass}>
          <div className={`glass-panel rounded-xl ${zoneSelectorWidth} overflow-hidden`}>
            <button
              onClick={() => setShowZonePanel(!showZonePanel)}
              className={`w-full flex items-center justify-between ${zoneSelectorPadding} font-medium text-white border-b border-white/5 hover:bg-white/5 transition-colors`}
            >
              <span className="flex items-center gap-2"><Radio className="w-4 h-4 text-emerald-400" /> Zone Selector</span>
              <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${showZonePanel ? "rotate-180" : ""}`} />
            </button>
            {showZonePanel && (
              <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                <button
                  onClick={() => setSelectedZone(null)}
                  className={`w-full text-left ${zoneSelectorItemPadding} font-medium transition-colors flex items-center gap-2 ${!selectedZone ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20" /> All Zones
                </button>
                {railwayZones.map((zone) => (
                  <button
                    key={zone.id}
                    onClick={() => setSelectedZone(selectedZone === zone.id ? null : zone.id)}
                    className={`w-full text-left ${zoneSelectorItemPadding} font-medium transition-colors flex items-center justify-between group ${selectedZone === zone.id ? "bg-white/5 text-white" : "text-slate-400 hover:text-white hover:bg-white/5"}`}
                  >
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: zone.color, boxShadow: selectedZone === zone.id ? `0 0 8px ${zone.color}` : "none" }} />
                      {zone.abbr} — {zone.name.replace(" Railway", "")}
                    </span>
                    <span className={`text-[10px] font-mono ${zone.status === "Operational" ? "text-emerald-400" : zone.status === "Alert" ? "text-red-400" : "text-amber-400"}`}>
                      {zone.status === "Operational" ? "●" : zone.status === "Alert" ? "▲" : "◆"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── OVERLAY: Status Summary (Top Right) ────────────────────────── */}
        <div className={networkStatusClass}>
          <div className={`glass-panel rounded-xl ${networkStatusPadding} ${networkStatusWidth}`}>
            <div className={networkStatusTitleClass}>
              <Activity className="w-3.5 h-3.5 text-emerald-400" /> Network Status
            </div>
            <div className={`flex flex-col ${networkStatusSpacing}`}>
              <div className="flex items-center justify-between">
                <span className={networkStatusItemTextClass}>Active Trains</span>
                <span className={`text-white ${networkStatusValueTextClass}`}>{totalActive}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={networkStatusItemTextClass}>Delayed</span>
                <span className={`text-amber-400 ${networkStatusValueTextClass}`}>{totalDelayed}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={networkStatusItemTextClass}>Avg Occupancy</span>
                <span className={`text-emerald-400 ${networkStatusValueTextClass}`}>{avgOccupancy}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={networkStatusItemTextClass}>Zones Online</span>
                <span className={`text-white ${networkStatusValueTextClass}`}>{railwayZones.filter(z => z.status === "Operational").length}/{railwayZones.length}</span>
              </div>
              <div className="mt-1 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]" />
                  <span className="text-emerald-400 text-[11px] font-medium">All Systems Operational</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── OVERLAY: Live Metrics (Bottom Left) ────────────────────────── */}
        <div className={liveOperationsClass}>
          <div className={`glass-panel rounded-xl ${liveOperationsPadding} ${liveOperationsWidth}`}>
            <div className={liveOperationsTitleClass}>
              <BarChart2 className="w-3.5 h-3.5 text-teal-400" /> Live Operations
            </div>
            {selectedZoneData ? (
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedZoneData.color, boxShadow: `0 0 10px ${selectedZoneData.color}` }} />
                  <span className="text-white font-semibold text-sm">{selectedZoneData.name}</span>
                </div>
                <div className="text-slate-500 text-[10px] font-mono mb-2">HQ: {selectedZoneData.hq} · {selectedZoneData.stations} Stations</div>
                <div className="grid grid-cols-2 gap-2">
                  <div className={`bg-white/5 rounded-lg ${liveOperationsGridPadding}`}>
                    <div className={`text-emerald-400 font-bold font-mono ${liveOperationsGridTextValLg}`}>{selectedZoneData.activeTrains}</div>
                    <div className="text-slate-500 text-[10px]">Active Trains</div>
                  </div>
                  <div className={`bg-white/5 rounded-lg ${liveOperationsGridPadding}`}>
                    <div className={`text-amber-400 font-bold font-mono ${liveOperationsGridTextValLg}`}>{selectedZoneData.delayedTrains}</div>
                    <div className="text-slate-500 text-[10px]">Delayed</div>
                  </div>
                  <div className={`bg-white/5 rounded-lg ${liveOperationsGridPadding}`}>
                    <div className={`text-white font-bold font-mono ${liveOperationsGridTextValLg}`}>{selectedZoneData.occupancy}%</div>
                    <div className="text-slate-500 text-[10px]">Occupancy</div>
                  </div>
                  <div className={`bg-white/5 rounded-lg ${liveOperationsGridPadding}`}>
                    <div className={`text-teal-400 font-bold font-mono ${liveOperationsGridTextValLg}`}>{selectedZoneData.onTimePerc}%</div>
                    <div className="text-slate-500 text-[10px]">On-Time</div>
                  </div>
                </div>
                <div className={`mt-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium ${selectedZoneData.status === "Operational" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : selectedZoneData.status === "Alert" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                  <Shield className="w-3 h-3" /> Status: {selectedZoneData.status}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <div className={`bg-white/5 rounded-lg ${liveOperationsGridPadding}`}>
                  <div className={`text-white font-bold font-mono ${liveOperationsGridTextVal}`}>1,668</div>
                  <div className="text-slate-500 text-[10px]">Total Active</div>
                </div>
                <div className={`bg-white/5 rounded-lg ${liveOperationsGridPadding}`}>
                  <div className={`text-amber-400 font-bold font-mono ${liveOperationsGridTextVal}`}>214</div>
                  <div className="text-slate-500 text-[10px]">Delayed</div>
                </div>
                <div className={`bg-white/5 rounded-lg ${liveOperationsGridPadding}`}>
                  <div className={`text-emerald-400 font-bold font-mono ${liveOperationsGridTextVal}`}>87%</div>
                  <div className="text-slate-500 text-[10px]">On-Time Rate</div>
                </div>
                <div className={`bg-white/5 rounded-lg ${liveOperationsGridPadding}`}>
                  <div className={`text-teal-400 font-bold font-mono ${liveOperationsGridTextVal}`}>8.2M</div>
                  <div className="text-slate-500 text-[10px]">Daily Pax</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── OVERLAY: Map Legend (Bottom Right) ─────────────────────────── */}
        <div className={legendClass}>
          <div className={`glass-panel rounded-xl ${legendPadding}`}>
            <div className={legendTitleClass}>Legend</div>
            <div className={`flex flex-col ${legendSpacing}`}>
              <div className={legendItemClass}><span className={`${legendDotClass} bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.6)]`} /><span className="text-slate-300">On Time</span></div>
              <div className={legendItemClass}><span className={`${legendDotClass} bg-amber-500 shadow-[0_0_4px_rgba(245,158,11,0.6)]`} /><span className="text-slate-300">Delayed</span></div>
              <div className={legendItemClass}><span className={`${legendDotClass} bg-red-500 shadow-[0_0_4px_rgba(239,68,68,0.6)]`} /><span className="text-slate-300">Critical Delay</span></div>
              <div className={legendItemClass}><span className={`${legendDotClass} bg-blue-500 shadow-[0_0_4px_rgba(59,130,246,0.6)]`} /><span className="text-slate-300">Special / VB</span></div>
              <div className={legendItemClass}><span className={`${legendDotClass} bg-teal-400 shadow-[0_0_4px_rgba(20,184,166,0.6)]`} /><span className="text-slate-300">Station Hub</span></div>
              <div className={legendItemClass}><span className={`${legendLineClass} bg-emerald-500/60`} /><span className="text-slate-300">Active Route</span></div>
              <div className={legendItemClass}><span className={`${legendLineClass} bg-blue-500/60`} /><span className="text-slate-300">High-Speed</span></div>
              <div className={legendItemClass}><span className={`${legendLineClass} bg-orange-500/60 border-t border-dashed border-orange-500/60`} /><span className="text-slate-300">Maintenance</span></div>
            </div>
          </div>
        </div>

        {/* ── LAYER TOGGLE (Floating Button) ─────────────────────────────── */}
        <div className={dataLayersClass}>
          <button
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            className={`glass-panel rounded-xl ${dataLayersPadding} flex items-center gap-2 font-medium text-slate-300 hover:text-white hover:bg-white/10 transition-colors`}
          >
            <Layers className="w-4 h-4 text-emerald-400" /> Data Layers
            <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${showLayerPanel ? "rotate-180" : ""}`} />
          </button>
          {showLayerPanel && (
            <div className={`mt-2 glass-panel rounded-xl ${dataLayersDropdownWidth} overflow-hidden`}>
              {layers.map((layer) => {
                const Icon = layer.icon;
                return (
                  <button
                    key={layer.id}
                    onClick={() => toggleLayer(layer.id)}
                    className={`w-full flex items-center justify-between ${dataLayersItemPadding} font-medium transition-colors hover:bg-white/5`}
                  >
                    <span className="flex items-center gap-2" style={{ color: layer.enabled ? layer.color : "#475569" }}>
                      <Icon className="w-3.5 h-3.5" /> {layer.label}
                    </span>
                    {layer.enabled ? (
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-slate-600" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* ── TRAIN DETAIL PANEL ─────────────────────────────────────────── */}
        {selectedTrain && (
          <div className={trainDetailClass}>
            <div className={`glass-panel rounded-xl ${trainDetailWidth} overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.5)]`}>
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/5 bg-[#0B1D3A]/60">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full animate-pulse" style={{ backgroundColor: trainStatusColor[selectedTrain.status], boxShadow: `0 0 8px ${trainStatusColor[selectedTrain.status]}` }} />
                  <span className="text-white font-semibold text-sm">Train Details</span>
                </div>
                <button onClick={() => setSelectedTrain(null)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className={`${trainDetailPadding} flex flex-col gap-3`}>
                <div>
                  <div className="text-white font-bold text-lg tracking-tight">{selectedTrain.name}</div>
                  <div className="text-slate-400 text-xs font-mono">Train #{selectedTrain.id} · {selectedTrain.from} → {selectedTrain.to}</div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: "Current Station", value: selectedTrain.currentStation, icon: MapPin },
                    { label: "Next Station", value: selectedTrain.nextStation, icon: Navigation },
                    { label: "Speed", value: `${selectedTrain.speed} km/h`, icon: Gauge },
                    { label: "ETA", value: selectedTrain.eta, icon: Clock },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <div key={item.label} className="bg-white/5 rounded-lg p-2.5">
                        <div className="flex items-center gap-1 mb-1">
                          <Icon className="w-3 h-3 text-slate-500" />
                          <span className="text-slate-500 text-[10px]">{item.label}</span>
                        </div>
                        <div className="text-white text-xs font-medium truncate">{item.value}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <div className="text-[10px] text-slate-500 mb-0.5">Delay</div>
                    <div className={`text-sm font-bold font-mono ${selectedTrain.delay === 0 ? "text-emerald-400" : selectedTrain.delay > 30 ? "text-red-400" : "text-amber-400"}`}>
                      {selectedTrain.delay === 0 ? "None" : `+${selectedTrain.delay}m`}
                    </div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <div className="text-[10px] text-slate-500 mb-0.5">Occupancy</div>
                    <div className="text-sm font-bold font-mono text-white">{selectedTrain.occupancy}%</div>
                  </div>
                  <div className="bg-white/5 rounded-lg p-2 text-center">
                    <div className="text-[10px] text-slate-500 mb-0.5">Platform</div>
                    <div className="text-sm font-bold font-mono text-teal-400">P{selectedTrain.platform}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <div className="text-[10px] text-emerald-400/70 font-medium uppercase tracking-wider">AI Prediction</div>
                    <div className="text-emerald-300 text-xs font-medium">{selectedTrain.aiPrediction}</div>
                  </div>
                </div>
                <div className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold ${selectedTrain.status === "ontime" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : selectedTrain.status === "delayed" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : selectedTrain.status === "critical" ? "bg-red-500/10 text-red-400 border border-red-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"}`}>
                  <Train className="w-3.5 h-3.5" /> Status: {trainStatusLabel[selectedTrain.status]}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── MOBILE CONTROLS ────────────────────────────────────────────── */}
        <div className="absolute bottom-4 left-4 right-4 z-[1000] lg:hidden flex gap-2 justify-center">
          <button
            onClick={() => setMobileSheet(mobileSheet === "zone" ? null : "zone")}
            className="glass-panel rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-medium text-slate-300"
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400" /> Zones
          </button>
          <button
            onClick={() => setMobileSheet(mobileSheet === "layers" ? null : "layers")}
            className="glass-panel rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-medium text-slate-300"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-400" /> Layers
          </button>
          {selectedTrain && (
            <button
              onClick={() => setSelectedTrain(null)}
              className="glass-panel rounded-xl px-4 py-2.5 flex items-center gap-2 text-xs font-medium text-emerald-400"
            >
              <Train className="w-3.5 h-3.5" /> {selectedTrain.id}
              <X className="w-3 h-3 text-slate-400" />
            </button>
          )}
        </div>

        {/* Mobile Bottom Sheet */}
        {mobileSheet && (
          <div className="absolute bottom-16 left-2 right-2 z-[1000] lg:hidden glass-panel rounded-xl max-h-[50vh] overflow-y-auto">
            <div className="flex items-center justify-between p-3 border-b border-white/5 sticky top-0 bg-[#0a192f]/90 backdrop-blur-md z-10">
              <span className="text-white text-sm font-medium">{mobileSheet === "zone" ? "Railway Zones" : "Data Layers"}</span>
              <button onClick={() => setMobileSheet(null)} className="text-slate-400"><X className="w-4 h-4" /></button>
            </div>
            {mobileSheet === "zone" && (
              <div className="p-2">
                <button onClick={() => { setSelectedZone(null); setMobileSheet(null); }} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium ${!selectedZone ? "bg-emerald-500/10 text-emerald-400" : "text-slate-400"}`}>
                  All Zones
                </button>
                {railwayZones.map((zone) => (
                  <button key={zone.id} onClick={() => { setSelectedZone(zone.id); setMobileSheet(null); }} className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-2 ${selectedZone === zone.id ? "bg-white/5 text-white" : "text-slate-400"}`}>
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: zone.color }} /> {zone.abbr} — {zone.name.replace(" Railway", "")}
                  </button>
                ))}
              </div>
            )}
            {mobileSheet === "layers" && (
              <div className="p-2">
                {layers.map((layer) => {
                  const Icon = layer.icon;
                  return (
                    <button key={layer.id} onClick={() => toggleLayer(layer.id)} className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium transition-colors rounded-lg hover:bg-white/5">
                      <span className="flex items-center gap-2" style={{ color: layer.enabled ? layer.color : "#475569" }}>
                        <Icon className="w-3.5 h-3.5" /> {layer.label}
                      </span>
                      {layer.enabled ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-600" />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Mobile Train Detail */}
        {selectedTrain && (
          <div className="absolute bottom-16 left-2 right-2 z-[1001] lg:hidden glass-panel rounded-xl p-4 shadow-[0_0_40px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between mb-2">
              <div className="text-white font-bold text-sm">{selectedTrain.name} ({selectedTrain.id})</div>
              <button onClick={() => setSelectedTrain(null)} className="text-slate-500"><X className="w-4 h-4" /></button>
            </div>
            <div className="text-slate-400 text-xs mb-2">{selectedTrain.from} → {selectedTrain.to} · {selectedTrain.currentStation}</div>
            <div className="grid grid-cols-4 gap-2 mb-2">
              <div className="bg-white/5 rounded-lg p-1.5 text-center"><div className="text-[9px] text-slate-500">Speed</div><div className="text-xs font-mono text-white">{selectedTrain.speed}</div></div>
              <div className="bg-white/5 rounded-lg p-1.5 text-center"><div className="text-[9px] text-slate-500">ETA</div><div className="text-xs font-mono text-white">{selectedTrain.eta}</div></div>
              <div className="bg-white/5 rounded-lg p-1.5 text-center"><div className="text-[9px] text-slate-500">Delay</div><div className={`text-xs font-mono ${selectedTrain.delay > 0 ? "text-amber-400" : "text-emerald-400"}`}>{selectedTrain.delay === 0 ? "0" : `+${selectedTrain.delay}m`}</div></div>
              <div className="bg-white/5 rounded-lg p-1.5 text-center"><div className="text-[9px] text-slate-500">Occ</div><div className="text-xs font-mono text-white">{selectedTrain.occupancy}%</div></div>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-lg px-3 py-1.5 text-[10px] text-emerald-400 flex items-center gap-1.5">
              <Wifi className="w-3 h-3" /> {selectedTrain.aiPrediction}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
