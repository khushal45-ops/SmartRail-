export const trains = [
  { id: "12301", name: "Rajdhani Express", from: "NDLS", to: "HWH", departure: "16:55", arrival: "10:05+1", status: "On Time", delay: 0, platform: 3, speed: 120, passengers: 1247, capacity: 1350, progress: 68, currentStation: "Kanpur Central", nextStation: "Allahabad Jn", eta: "19:30", type: "Superfast" },
  { id: "12951", name: "Mumbai Rajdhani", from: "NDLS", to: "BCT", departure: "17:00", arrival: "08:35+1", status: "Delayed", delay: 25, platform: 6, speed: 95, passengers: 1089, capacity: 1250, progress: 42, currentStation: "Kota Jn", nextStation: "Ratlam Jn", eta: "20:45", type: "Rajdhani" },
  { id: "12259", name: "Duronto Express", from: "SDAH", to: "NDLS", departure: "20:05", arrival: "07:20+1", status: "On Time", delay: 0, platform: 1, speed: 110, passengers: 876, capacity: 980, progress: 15, currentStation: "Asansol Jn", nextStation: "Dhanbad Jn", eta: "21:45", type: "Duronto" },
  { id: "22439", name: "Vande Bharat Exp", from: "NDLS", to: "LKO", departure: "06:00", arrival: "12:25", status: "On Time", delay: 0, platform: 2, speed: 130, passengers: 754, capacity: 800, progress: 89, currentStation: "Lucknow", nextStation: "Lucknow NR", eta: "12:20", type: "Vande Bharat" },
  { id: "12627", name: "Karnataka Exp", from: "NDLS", to: "SBC", departure: "21:10", arrival: "04:15+2", status: "Delayed", delay: 45, platform: 5, speed: 80, passengers: 1532, capacity: 1700, progress: 55, currentStation: "Nagpur", nextStation: "Wardha Jn", eta: "15:30", type: "Express" },
  { id: "12002", name: "Shatabdi Express", from: "NDLS", to: "CDG", departure: "07:20", arrival: "10:40", status: "On Time", delay: 0, platform: 4, speed: 115, passengers: 412, capacity: 450, progress: 95, currentStation: "Chandigarh", nextStation: "Chandigarh", eta: "10:35", type: "Shatabdi" },
  { id: "12833", name: "Howrah Express", from: "ADI", to: "HWH", departure: "00:15", arrival: "13:30+1", status: "On Time", delay: 0, platform: 4, speed: 85, passengers: 950, capacity: 1100, progress: 65, currentStation: "Raipur", nextStation: "Bilaspur", eta: "14:20", type: "Superfast" },
  { id: "12616", name: "Grand Trunk Exp", from: "NDLS", to: "MAS", departure: "16:10", arrival: "04:30+2", status: "Delayed", delay: 15, platform: 2, speed: 90, passengers: 1320, capacity: 1400, progress: 50, currentStation: "Nagpur", nextStation: "Balharshah", eta: "08:15", type: "Superfast" },
  { id: "11020", name: "Konark Express", from: "BBS", to: "CSMT", departure: "15:20", arrival: "04:00+2", status: "On Time", delay: 0, platform: 1, speed: 75, passengers: 890, capacity: 1050, progress: 30, currentStation: "Visakhapatnam", nextStation: "Rajahmundry", eta: "22:10", type: "Express" },
  { id: "12009", name: "Shatabdi Exp", from: "BCT", to: "ADI", departure: "06:20", arrival: "12:55", status: "On Time", delay: 0, platform: 1, speed: 115, passengers: 650, capacity: 700, progress: 80, currentStation: "Surat", nextStation: "Vadodara", eta: "09:45", type: "Shatabdi" },
  { id: "12314", name: "Sealdah Rajdhani", from: "NDLS", to: "SDAH", departure: "16:30", arrival: "10:10+1", status: "Delayed", delay: 10, platform: 4, speed: 125, passengers: 1150, capacity: 1200, progress: 70, currentStation: "Kanpur", nextStation: "Gaya", eta: "22:15", type: "Rajdhani" },
  { id: "12621", name: "Tamil Nadu Exp", from: "MAS", to: "NDLS", departure: "22:00", arrival: "06:30+2", status: "On Time", delay: 0, platform: 5, speed: 95, passengers: 1450, capacity: 1500, progress: 40, currentStation: "Vijayawada", nextStation: "Warangal", eta: "05:00", type: "Superfast" },
  { id: "12810", name: "Howrah Mail", from: "CSMT", to: "HWH", departure: "21:10", arrival: "06:15+2", status: "Delayed", delay: 40, platform: 3, speed: 85, passengers: 1210, capacity: 1300, progress: 20, currentStation: "Kalyan", nextStation: "Igatpuri", eta: "23:05", type: "Passenger" },
  { id: "12424", name: "Rajdhani Exp", from: "NDLS", to: "DBRG", departure: "16:20", arrival: "07:00+2", status: "On Time", delay: 0, platform: 2, speed: 110, passengers: 1000, capacity: 1100, progress: 60, currentStation: "Barauni", nextStation: "Katihar", eta: "11:30", type: "Rajdhani" },
  { id: "15228", name: "Muzaffarpur Exp", from: "YPR", to: "MFP", departure: "23:55", arrival: "11:10+2", status: "Cancelled", delay: 0, platform: 4, speed: 0, passengers: 0, capacity: 1200, progress: 0, currentStation: "YPR", nextStation: "YPR", eta: "--:--", type: "Express" },
  { id: "12137", name: "Punjab Mail", from: "CSMT", to: "FZR", departure: "19:35", arrival: "05:10+2", status: "On Time", delay: 0, platform: 2, speed: 80, passengers: 1300, capacity: 1400, progress: 45, currentStation: "Bhopal", nextStation: "Jhansi", eta: "12:00", type: "Passenger" },
  { id: "12860", name: "Gitanjali Exp", from: "HWH", to: "CSMT", departure: "14:05", arrival: "21:20+1", status: "Delayed", delay: 15, platform: 6, speed: 85, passengers: 1100, capacity: 1250, progress: 55, currentStation: "Raipur", nextStation: "Nagpur", eta: "02:30", type: "Superfast" },
  { id: "22823", name: "BBS Rajdhani", from: "BBS", to: "NDLS", departure: "09:30", arrival: "09:55+1", status: "On Time", delay: 0, platform: 1, speed: 115, passengers: 950, capacity: 1050, progress: 75, currentStation: "Adra", nextStation: "Gaya", eta: "15:45", type: "Rajdhani" },
  { id: "12555", name: "Gorakhdham Exp", from: "GKP", to: "HSR", departure: "16:35", arrival: "10:00+1", status: "Delayed", delay: 20, platform: 2, speed: 80, passengers: 1400, capacity: 1500, progress: 35, currentStation: "Lucknow", nextStation: "Kanpur", eta: "22:10", type: "Superfast" },
  { id: "16315", name: "Kochuveli Exp", from: "SBC", to: "KCVL", departure: "16:50", arrival: "09:15+1", status: "On Time", delay: 0, platform: 3, speed: 70, passengers: 850, capacity: 950, progress: 25, currentStation: "Salem", nextStation: "Erode", eta: "21:30", type: "Express" },
  { id: "12727", name: "Godavari Exp", from: "VSKP", to: "HYB", departure: "17:20", arrival: "06:15+1", status: "On Time", delay: 0, platform: 4, speed: 85, passengers: 1050, capacity: 1150, progress: 40, currentStation: "Rajahmundry", nextStation: "Vijayawada", eta: "20:50", type: "Superfast" },
  { id: "12984", name: "Chandigarh Exp", from: "CDG", to: "AII", departure: "21:05", arrival: "08:40+1", status: "Delayed", delay: 10, platform: 1, speed: 75, passengers: 900, capacity: 1000, progress: 65, currentStation: "Jaipur", nextStation: "Ajmer", eta: "06:15", type: "Express" },
  { id: "12381", name: "Poorva Exp", from: "HWH", to: "NDLS", departure: "08:15", arrival: "06:00+1", status: "On Time", delay: 0, platform: 2, speed: 100, passengers: 1200, capacity: 1350, progress: 85, currentStation: "Aligarh", nextStation: "New Delhi", eta: "04:30", type: "Superfast" },
  { id: "12615", name: "Grand Trunk Exp", from: "MAS", to: "NDLS", departure: "18:50", arrival: "06:30+2", status: "Cancelled", delay: 0, platform: 5, speed: 0, passengers: 0, capacity: 1400, progress: 0, currentStation: "MAS", nextStation: "MAS", eta: "--:--", type: "Superfast" },
];

export const pnrRecords: Record<string, { pnr: string; trainName: string; trainNo: string; from: string; to: string; date: string; class: string; passengers: { name: string; age: number; gender: string; status: string; coach: string; seat: string }[]; chartStatus: string; departure: string; arrival: string }> = {
  "2451369874": { pnr: "2451369874", trainName: "Rajdhani Express", trainNo: "12301", from: "New Delhi (NDLS)", to: "Howrah Jn (HWH)", date: "02 Jun 2026", class: "3A", passengers: [{ name: "Rahul Sharma", age: 32, gender: "M", status: "CNF", coach: "B2", seat: "34" }, { name: "Priya Sharma", age: 29, gender: "F", status: "CNF", coach: "B2", seat: "35" }], chartStatus: "Chart Prepared", departure: "16:55", arrival: "10:05" },
  "4867293015": { pnr: "4867293015", trainName: "Mumbai Rajdhani", trainNo: "12951", from: "New Delhi (NDLS)", to: "Mumbai Central (BCT)", date: "02 Jun 2026", class: "2A", passengers: [{ name: "Amit Patel", age: 45, gender: "M", status: "WL/3", coach: "—", seat: "—" }], chartStatus: "Chart Not Prepared", departure: "17:00", arrival: "08:35" },
  "7234891056": { pnr: "7234891056", trainName: "Vande Bharat Express", trainNo: "22439", from: "New Delhi (NDLS)", to: "Lucknow (LKO)", date: "03 Jun 2026", class: "CC", passengers: [{ name: "Sneha Gupta", age: 28, gender: "F", status: "CNF", coach: "C3", seat: "12" }, { name: "Rohit Gupta", age: 31, gender: "M", status: "CNF", coach: "C3", seat: "13" }, { name: "Aisha Gupta", age: 5, gender: "F", status: "CNF", coach: "C3", seat: "14" }], chartStatus: "Chart Not Prepared", departure: "06:00", arrival: "12:25" },
};

export const alerts = [
  { id: 1, type: "critical", title: "Train 12951 Signal Failure", message: "Signal failure reported between Kota Jn and Ratlam Jn. Train delayed by 25 minutes.", time: "2 min ago", train: "12951", read: false },
  { id: 2, type: "warning", title: "Platform 5 Overcrowding", message: "Platform 5 at New Delhi station approaching capacity. Crowd management team deployed.", time: "8 min ago", train: null, read: false },
  { id: 3, type: "info", title: "12627 Track Maintenance", message: "Scheduled track maintenance on Nagpur-Wardha section causing 45 min delay for 12627.", time: "15 min ago", train: "12627", read: true },
  { id: 4, type: "success", title: "12301 Departed On Time", message: "Rajdhani Express 12301 departed New Delhi on schedule at 16:55.", time: "32 min ago", train: "12301", read: true },
  { id: 5, type: "warning", title: "Weather Alert - Mumbai Region", message: "Heavy rainfall forecast for Mumbai region. Coastal routes may experience delays.", time: "1 hr ago", train: null, read: true },
  { id: 6, type: "critical", title: "Emergency Stop - 14853", message: "Train 14853 made emergency stop near Agra. Medical team dispatched.", time: "1.5 hr ago", train: "14853", read: true },
  { id: 7, type: "info", title: "Ticket Reallocation Complete", message: "Auto-reallocation completed for 23 waitlisted passengers on Train 12301.", time: "2 hr ago", train: "12301", read: true },
];

export const weeklyPerformance = [
  { day: "Mon", onTime: 82, delayed: 15, cancelled: 3, passengers: 248000 },
  { day: "Tue", onTime: 78, delayed: 19, cancelled: 3, passengers: 231000 },
  { day: "Wed", onTime: 85, delayed: 13, cancelled: 2, passengers: 267000 },
  { day: "Thu", onTime: 88, delayed: 10, cancelled: 2, passengers: 289000 },
  { day: "Fri", onTime: 71, delayed: 24, cancelled: 5, passengers: 312000 },
  { day: "Sat", onTime: 76, delayed: 18, cancelled: 6, passengers: 345000 },
  { day: "Sun", onTime: 80, delayed: 16, cancelled: 4, passengers: 298000 },
];

export const revenueData = [
  { day: "Mon", revenue: 12.4, tickets: 248 },
  { day: "Tue", revenue: 11.6, tickets: 231 },
  { day: "Wed", revenue: 13.4, tickets: 267 },
  { day: "Thu", revenue: 14.5, tickets: 289 },
  { day: "Fri", revenue: 15.6, tickets: 312 },
  { day: "Sat", revenue: 17.2, tickets: 345 },
  { day: "Sun", revenue: 14.9, tickets: 298 },
];

export const platformData = [
  { platform: "P1", station: "New Delhi", utilization: 94, trains: 18, peakHour: "08:00-09:00", status: "High Load" },
  { platform: "P2", station: "New Delhi", utilization: 76, trains: 14, peakHour: "07:00-08:00", status: "Normal" },
  { platform: "P3", station: "New Delhi", utilization: 88, trains: 16, peakHour: "17:00-18:00", status: "High Load" },
  { platform: "P4", station: "New Delhi", utilization: 62, trains: 11, peakHour: "12:00-13:00", status: "Normal" },
  { platform: "P5", station: "New Delhi", utilization: 97, trains: 19, peakHour: "18:00-19:00", status: "Critical" },
  { platform: "P6", station: "New Delhi", utilization: 45, trains: 8, peakHour: "10:00-11:00", status: "Low" },
  { platform: "P1", station: "Howrah", utilization: 91, trains: 17, peakHour: "07:30-08:30", status: "High Load" },
  { platform: "P2", station: "Howrah", utilization: 83, trains: 15, peakHour: "16:00-17:00", status: "High Load" },
];

export const routeUtilization = [
  { route: "Delhi-Mumbai", utilization: 92, trains: 28, name: "NDLS-BCT" },
  { route: "Delhi-Kolkata", utilization: 87, trains: 22, name: "NDLS-HWH" },
  { route: "Delhi-Chennai", utilization: 78, trains: 18, name: "NDLS-MAS" },
  { route: "Delhi-Lucknow", utilization: 95, trains: 31, name: "NDLS-LKO" },
  { route: "Mumbai-Pune", utilization: 88, trains: 24, name: "BCT-PUNE" },
  { route: "Bangalore-Hyderabad", utilization: 71, trains: 14, name: "SBC-SC" },
];

export const staffMembers = [
  { id: 1, name: "Rajesh Kumar", role: "Station Master", station: "New Delhi", shift: "Morning", status: "Active" },
  { id: 2, name: "Meena Patel", role: "Ticket Controller", station: "Mumbai Central", shift: "Evening", status: "Active" },
  { id: 3, name: "Suresh Nair", role: "Train Controller", station: "Chennai Central", shift: "Night", status: "On Leave" },
  { id: 4, name: "Kavita Singh", role: "Safety Officer", station: "Howrah Jn", shift: "Morning", status: "Active" },
  { id: 5, name: "Arun Sharma", role: "Maintenance Head", station: "Secunderabad", shift: "Afternoon", status: "Active" },
];

export const chatResponses: Record<string, string> = {
  "pnr": "You can check your PNR status by going to the **Passenger Portal** section and entering your 10-digit PNR number. I can also look it up for you — just share the PNR number!",
  "train status": "To check live train status, visit the **Train Monitor** section. You can search by train number or name to see real-time location, speed, and expected arrival times.",
  "delay": "Train delays are shown in real-time on the **Train Monitor** dashboard. Currently, trains 12951 (Mumbai Rajdhani) and 12627 (Karnataka Express) are running delayed. Would you like more details?",
  "ticket": "For ticket booking assistance, waitlist status, or ticket reallocation, please visit the **Passenger Portal**. Waitlisted passengers are automatically considered for reallocation when confirmed seats become available.",
  "cancel": "To cancel a ticket, go to **Passenger Portal → My Bookings** and select the ticket you wish to cancel. Refunds are processed within 3-7 business days depending on the ticket type.",
  "refund": "Refund timelines depend on the cancellation timing: \n• Before 48 hours: 90% refund \n• 12-48 hours: 75% refund \n• Less than 12 hours: 50% refund \n• After departure: No refund",
  "platform": "Platform information is available under **Platform Utilization**. You can see current platform assignments, occupancy levels, and scheduling information for all major stations.",
  "help": "I can help you with: \n• PNR status check \n• Live train tracking \n• Ticket cancellation & refunds \n• Platform information \n• Alert notifications \n• Analytics & reports \n\nWhat would you like to know?",
};
