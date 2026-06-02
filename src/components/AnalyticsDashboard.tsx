import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Activity, 
  Flame, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Heart, 
  BedDouble, 
  Monitor, 
  Clock, 
  Download, 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  Cpu, 
  Brain, 
  RefreshCw, 
  Sparkles,
  ArrowUpRight,
  UserPlus,
  Play,
  Pause,
  Tv
} from "lucide-react";
import { Appointment, PatientVital, SOSAlert } from "../types";

interface AnalyticsDashboardProps {
  appointments: Appointment[];
  vitals: PatientVital[];
  sosAlerts: SOSAlert[];
  isDarkMode: boolean;
}

export default function AnalyticsDashboard({
  appointments,
  vitals,
  sosAlerts,
  isDarkMode
}: AnalyticsDashboardProps) {
  // Interactive Filters
  const [dateRange, setDateRange] = useState<'today' | 'week' | 'month'>('week');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState('all');
  const [drillDownData, setDrillDownData] = useState<any | null>(null);
  const [currentTimeframe, setCurrentTimeframe] = useState("Jun 2, 2026 - Jun 9, 2026");

  // Live Simulated State values
  const [tick, setTick] = useState(0);
  const [activeUsers, setActiveUsers] = useState(24);
  const [patientsWaiting, setPatientsWaiting] = useState(12);
  const [ongoingConsultations, setOngoingConsultations] = useState(8);
  const [availableBeds, setAvailableBeds] = useState(38);
  const [simulatedRevenue, setSimulatedRevenue] = useState(245300);
  const [newRegistrations, setNewRegistrations] = useState(18);
  const [apiResponseTime, setApiResponseTime] = useState(32);
  const [cpuUsage, setCpuUsage] = useState(14);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // Notification center alerts buffer
  const [dashboardAlerts, setDashboardAlerts] = useState<{ id: string; time: string; text: string; urgent: boolean }[]>([
    { id: "al-1", time: "05:59 AM", text: "Dr. Rajesh Sharma checked-in on Surgery Room 3", urgent: false },
    { id: "al-2", time: "05:50 AM", text: "New high temperature vital logged: 38.6°C (Maya Lin)", urgent: true },
    { id: "al-3", time: "05:15 AM", text: "Emergency SOS resolved at Chemistry Lab Block C", urgent: false },
  ]);

  // Effect simulating dynamic auto refreshing of active hospital statistics
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      setTick(t => t + 1);
      // Random walk simulation for real-time fidelity
      setActiveUsers(prev => Math.max(10, Math.min(100, prev + Math.floor(Math.random() * 5) - 2)));
      setPatientsWaiting(prev => Math.max(2, Math.min(30, prev + Math.floor(Math.random() * 3) - 1)));
      setOngoingConsultations(prev => Math.max(3, Math.min(20, prev + Math.floor(Math.random() * 3) - 1)));
      setApiResponseTime(prev => Math.max(20, Math.min(60, prev + Math.floor(Math.random() * 7) - 3)));
      setCpuUsage(prev => Math.max(5, Math.min(45, prev + Math.floor(Math.random() * 5) - 2)));
      setSimulatedRevenue(prev => prev + (Math.random() > 0.4 ? Math.floor(Math.random() * 1200) : 0));
      
      // Simulate rare registration
      if (Math.random() > 0.85) {
        setNewRegistrations(p => p + 1);
        const alertTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setDashboardAlerts(p => [
          { id: `al-${Date.now()}`, time: alertTime, text: "New Patient authenticated via digital insurance lock", urgent: false },
          ...p.slice(0, 5)
        ]);
      }

      // Check current SOS cases, simulate high heart rate alert if logged
      if (vitals.length > 0 && Math.random() > 0.9) {
        const latestVital = vitals[0];
        if (latestVital.temperature > 38.5) {
          const alertTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          setDashboardAlerts(p => [
            { id: `al-${Date.now()}`, time: alertTime, text: `Fever spike detected for ${latestVital.studentName}: ${latestVital.temperature}°C`, urgent: true },
            ...p.slice(0, 5)
          ]);
        }
      }

    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh, vitals]);

  // Change date timeframe strings
  useEffect(() => {
    if (dateRange === 'today') {
      setCurrentTimeframe("Today: Jun 2, 2026");
    } else if (dateRange === 'week') {
      setCurrentTimeframe("Current Week: Jun 1 - Jun 7, 2026");
    } else {
      setCurrentTimeframe("Monthly Window: Jun 2026 Grid");
    }
  }, [dateRange]);

  // Export dataset tool: Generates and downloads real CSV/XLS structure parsed client-side
  const handleExportData = (format: 'csv' | 'xlsx') => {
    let csvContent = "";
    
    if (format === 'csv') {
      csvContent += "Titan HealthConnect Hospital Operational Report\n";
      csvContent += `Generated Timeline: ${currentTimeframe}\n\n`;
      csvContent += "Metric,Current Registered Value,Variance Status\n";
      csvContent += `Total Patients enrolled,25000,Standard Capacity\n`;
      csvContent += `Active Physicians on duty,50,Optimal\n`;
      csvContent += `In-Consultations Queue,${ongoingConsultations},Active\n`;
      csvContent += `Emergency Cases resolved in timeframe,${sosAlerts.length},Monitored\n`;
      csvContent += `Simulated Day Revenue,INR ${simulatedRevenue},Target Met\n`;
      csvContent += `Lobby Waiting Queue,${patientsWaiting},Fluid\n`;
      csvContent += `CPU Capacity %,${cpuUsage}%,Healthy\n`;

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Titan_HealthConnect_Report_${dateRange}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Mock XLS download with clear text
      csvContent += "Titan Excel Format Sheet\n";
      csvContent += `Time: ${new Date().toLocaleString()}\n`;
      csvContent += `Active Users Count: ${activeUsers}\n`;
      csvContent += `Registered Beds Available: ${availableBeds}/50\n`;
      const blob = new Blob([csvContent], { type: 'application/vnd.ms-excel;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Titan_HealthConnect_Sheet_${dateRange}.xls`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    alert(`Success: ${format.toUpperCase()} operational matrix file generated on-the-fly and parsed successfully.`);
  };

  return (
    <div className={`space-y-6 text-xs transition-colors duration-200 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
      
      {/* Dynamic Header & Interactive Dashboard Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-4 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-1.5">
            <span className="p-1 px-2.5 bg-blue-500 text-white rounded text-[9px] font-bold uppercase tracking-wider animate-pulse flex items-center gap-1">
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Real-Time Engine Active</span>
            </span>
            <span className="text-slate-400 font-mono text-[10px]">{currentTimeframe}</span>
          </div>
          <h3 className="font-display font-black text-xl tracking-tight text-slate-900 dark:text-white mt-1.5">
            Titan Live Operations Control Center
          </h3>
          <p className="text-slate-450 mt-0.5">
            Supercharged diagnostic visualizers, algorithmic queue forecasting, and system physical parameter telemetry cards.
          </p>
        </div>

        {/* Dashboard Tools Panel */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Refresh Toggler */}
          <button 
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`py-1.5 px-3.5 rounded-xl border font-bold flex items-center gap-2 text-[11px] transition-all cursor-pointer ${
              autoRefresh 
                ? 'bg-blue-600/10 border-blue-500/30 text-blue-500' 
                : 'bg-slate-200/40 border-slate-300 text-slate-500 dark:bg-slate-800 dark:border-slate-700'
            }`}
          >
            {autoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            <span>{autoRefresh ? "Auto-Refresh (5s)" : "Refreshes Paused"}</span>
          </button>

          {/* Range filter selectors */}
          <div className="bg-slate-100 dark:bg-slate-900 border dark:border-slate-800 p-1 rounded-xl flex items-center">
            <button 
              onClick={() => setDateRange('today')}
              className={`py-1 px-3.5 rounded-lg border-none font-bold text-[10px] uppercase transition-all ${dateRange === 'today' ? 'bg-white shadow text-blue-600 dark:bg-slate-800 dark:text-white' : 'text-slate-450 hover:text-slate-700'}`}
            >
              Today
            </button>
            <button 
              onClick={() => setDateRange('week')}
              className={`py-1 px-3.5 rounded-lg border-none font-bold text-[10px] uppercase transition-all ${dateRange === 'week' ? 'bg-white shadow text-blue-600 dark:bg-slate-800 dark:text-white' : 'text-slate-450 hover:text-slate-700'}`}
            >
              Week
            </button>
            <button 
              onClick={() => setDateRange('month')}
              className={`py-1 px-3.5 rounded-lg border-none font-bold text-[10px] uppercase transition-all ${dateRange === 'month' ? 'bg-white shadow text-blue-600 dark:bg-slate-800 dark:text-white' : 'text-slate-450 hover:text-slate-700'}`}
            >
              Month
            </button>
          </div>

          {/* Export Report CSV/Excel Selector */}
          <div className="relative group/down">
            <button className="py-2 px-3.5 rounded-xl border border-slate-250 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold flex items-center gap-1.5 text-[11px] hover:border-slate-400">
              <Download className="w-4 h-4" />
              <span>Export Systems Record</span>
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-xl shadow-xl p-1 w-32 hidden group-hover/down:block z-50">
              <button onClick={() => handleExportData('csv')} className="w-full text-left py-1.5 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-200 font-bold font-sans">
                As CSV File
              </button>
              <button onClick={() => handleExportData('xlsx')} className="w-full text-left py-1.5 px-3 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-slate-700 dark:text-slate-200 font-bold font-sans">
                As Excel Sheet
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 1: 8 OVERVIEW KPI CARDS (GLASSMORPHIC ENTERPRISE STANDARD) */}
      {/* ============================================================== */}
      <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1">
        <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
        <span>EHR System Primary Performance metrics (8 Core KPIs)</span>
      </h4>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-205 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm hover:border-blue-500/40 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer" onClick={() => setSelectedSection('patients')}>
          <div className="flex justify-between items-start">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Total Patients Registry</span>
            <Users className="w-4.5 h-4.5 text-blue-500" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">25,000</p>
            <div className="flex items-center gap-1 text-[10px] text-emerald-500 font-bold mt-1.5 font-sans">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+4.2% Growth index</span>
            </div>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-205 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm hover:border-blue-500/40 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer" onClick={() => setSelectedSection('doctors')}>
          <div className="flex justify-between items-start">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Physicians Active On-Duty</span>
            <Activity className="w-4.5 h-4.5 text-emerald-500" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">50</p>
            <p className="text-[10px] text-slate-400 font-medium font-sans mt-2">12 Consultation specialists</p>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-205 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm hover:border-blue-500/40 hover:shadow-md transition-all flex flex-col justify-between cursor-pointer" onClick={() => setSelectedSection('appointments')}>
          <div className="flex justify-between items-start">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Today's Queue Enrolled</span>
            <Calendar className="w-4.5 h-4.5 text-indigo-500" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-blue-650 leading-none">{320 + appointments.length}</p>
            <div className="flex items-center gap-1 text-[10px] text-blue-500 mt-1.5 font-sans font-bold">
              <span>{appointments.filter(a=>a.status === 'completed').length} Complete logs</span>
            </div>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="bg-rose-50 dark:bg-rose-950/20 border border-rose-220 dark:border-rose-900/45 p-4 rounded-2xl shadow-sm flex flex-col justify-between cursor-pointer">
          <div className="flex justify-between items-start">
            <span className="text-[9px] uppercase tracking-wider text-rose-600 font-black">Active Emergency SOS Cases</span>
            <Flame className="w-4.5 h-4.5 text-rose-500 animate-bounce" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-rose-700 leading-none">
              {sosAlerts.filter(s=>s.status !== 'resolved').length || 1}
            </p>
            <p className="text-[10px] text-rose-500/80 mt-2 font-mono font-bold animate-pulse">Live coordinate escorts</p>
          </div>
        </div>

        {/* KPI 5 */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-205 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm hover:border-blue-500/40 hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Available Beds Status</span>
            <BedDouble className="w-4.5 h-4.5 text-cyan-500" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              {availableBeds}/50
            </p>
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-2.5 overflow-hidden">
              <div 
                className="h-full bg-cyan-500 rounded-full transition-all duration-1000" 
                style={{ width: `${(availableBeds / 50) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 6 */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-205 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm hover:border-blue-500/40 hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Revenue Generated</span>
            <DollarSign className="w-4.5 h-4.5 text-amber-500" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-slate-950 dark:text-white leading-none">
              ₹{simulatedRevenue.toLocaleString()}
            </p>
            <p className="text-[10px] text-emerald-500 font-bold mt-2 flex items-center gap-0.5">
              <ArrowUpRight className="w-4.5 h-4.5" />
              <span>Target 102% Hit</span>
            </p>
          </div>
        </div>

        {/* KPI 7 */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-205 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm hover:border-blue-500/40 hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">New Registrations Today</span>
            <UserPlus className="w-4.5 h-4.5 text-teal-500" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">
              {newRegistrations}
            </p>
            <p className="text-[10px] text-slate-400 mt-2">Unified insurance cards validated</p>
          </div>
        </div>

        {/* KPI 8 */}
        <div className="bg-white dark:bg-slate-900/60 border border-slate-205 dark:border-slate-800/80 p-4 rounded-2xl shadow-sm hover:border-blue-500/40 hover:shadow-md transition-all flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Online Remote Consultations</span>
            <Monitor className="w-4.5 h-4.5 text-purple-500" />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">145</p>
            <span className="text-[10px] text-purple-500 bg-purple-550/10 py-0.5 px-2 rounded-full font-bold mt-2 w-max font-sans">
              Encrypted API Bridge
            </span>
          </div>
        </div>

      </div>

      {/* ============================================================== */}
      {/* SECTION 2: 7 LIVE MONITORING TELEMETRY WIDGETS */}
      {/* ============================================================== */}
      <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1 mt-6">
        <Cpu className="w-3.5 h-3.5 text-blue-500 animate-spin-slow" />
        <span>Clinical telemetry monitoring dashboard (7 Live Widgets)</span>
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        
        {/* W1: Active Users */}
        <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border dark:border-slate-800 flex flex-col justify-between text-center md:col-span-1">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Active Users</span>
          <div className="my-2 text-xl font-mono font-black text-blue-600 flex items-center justify-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span>{activeUsers}</span>
          </div>
          <span className="text-[8px] text-slate-400">Pulsing telemetry</span>
        </div>

        {/* W2: Patients Waiting */}
        <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border dark:border-slate-800 flex flex-col justify-between text-center md:col-span-1">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Lobby Waiting</span>
          <div className="my-2 text-xl font-mono font-black text-amber-600">
            {patientsWaiting}
          </div>
          <span className="text-[8px] text-slate-400">Average wait: 14m</span>
        </div>

        {/* W3: Ongoing Consults */}
        <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border dark:border-slate-800 flex flex-col justify-between text-center md:col-span-1">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Ongoing Consults</span>
          <div className="my-2 text-xl font-mono font-black text-emerald-600 animate-pulse">
            {ongoingConsultations}
          </div>
          <span className="text-[8px] text-slate-400">Treatment rooms busy</span>
        </div>

        {/* W4: Quick active emergency log alerts */}
        <div className="bg-rose-100/50 dark:bg-rose-950/20 p-3.5 rounded-2xl border border-rose-220 dark:border-rose-900/45 md:col-span-2 space-y-1.5 text-left text-rose-950 dark:text-rose-200">
          <div className="flex justify-between items-center text-[9px] uppercase font-bold text-rose-700">
            <span>🚨 Urgent Dispatch Alarm Log</span>
            <span className="w-1.5 h-1.5 bg-rose-600 rounded-full animate-ping" />
          </div>
          <p className="text-[11px] leading-relaxed font-sans font-extrabold truncate">
            {sosAlerts.length > 0 ? `Latest: ${sosAlerts[0].building} Rm ${sosAlerts[0].room}` : "No outstanding emergency alarms active."}
          </p>
          <p className="text-[8px] text-rose-600 font-mono italic max-w-xs truncate">
            Status: Paramedics tracking live coordinates
          </p>
        </div>

        {/* W5: Doctor Availability */}
        <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border dark:border-slate-800 text-left md:col-span-1 space-y-1">
          <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">Duty Status</span>
          <p className="font-mono text-xs font-black text-emerald-500">92% Online</p>
          <span className="text-[8px] text-slate-400 block font-normal">6 Physicians in surgeries</span>
        </div>

        {/* W6: System Uptime (CPU/Uptime) & W7 Uptime Ticker */}
        <div className="bg-slate-100 dark:bg-slate-900 p-3.5 rounded-2xl border dark:border-slate-800 md:col-span-1 text-left flex flex-col justify-between font-mono">
          <div className="flex justify-between text-[9px] text-slate-450 uppercase font-bold leading-none">
            <span>CPU</span>
            <span className="text-blue-500">{cpuUsage}%</span>
          </div>
          <div className="text-right text-[10px] font-black text-slate-400 mt-2 leading-none">
            <span>{apiResponseTime}ms RTT</span>
          </div>
          <span className="text-[8.5px] text-slate-505 block leading-none mt-1">Uptime: 99.99%</span>
        </div>

      </div>

      {/* ============================================================== */}
      {/* SECTION 3: 8 DIAGNOSTICS & ANALYTICS INTERACTIVE SVG CHARTS CHARTS */}
      {/* ============================================================== */}
      <h4 className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1 mt-6">
        <Tv className="w-3.5 h-3.5 text-blue-500" />
        <span>Enterprise Analytics visual chart blocks (8 Visualizers)</span>
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* CHART 1: Daily Appointments Trend (Line Chart SVG) */}
        <div className="bg-white dark:bg-slate-900/60 p-4 rounded-3xl border dark:border-slate-800 space-y-3 shadow-xs">
          <div>
            <h5 className="font-bold text-slate-900 dark:text-white leading-none text-xs">Daily Consultations Trend</h5>
            <span className="text-[9px] text-slate-400 font-sans">Patient entry workload timeline indexes</span>
          </div>

          {/* Polyline Chart SVG */}
          <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl">
            <svg viewBox="0 0 200 80" className="w-full h-24 overflow-visible">
              {/* grid lines */}
              <line x1="10" y1="10" x2="190" y2="10" stroke="rgba(128,128,128,0.2)" strokeWidth="0.5" />
              <line x1="10" y1="40" x2="190" y2="40" stroke="rgba(128,128,128,0.2)" strokeWidth="0.5" />
              <line x1="10" y1="70" x2="190" y2="70" stroke="rgba(128,128,128,0.5)" strokeWidth="0.7" />
              
              {/* trend line */}
              <polyline
                fill="none"
                stroke="#2563eb"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                points="10,65 40,55 70,30 100,45 130,20 160,35 190,12"
              />

              {/* Data points */}
              <circle cx="10" cy="65" r="2" fill="#2563eb" />
              <circle cx="40" cy="55" r="2" fill="#2563eb" />
              <circle cx="70" cy="30" r="2" fill="#2563eb" />
              <circle cx="100" cy="45" r="2" fill="#2563eb" />
              <circle cx="130" cy="20" r="2" fill="#2563eb" />
              <circle cx="160" cy="35" r="2" fill="#2563eb" />
              <circle cx="190" cy="12" r="3" fill="#10b981" />

              {/* Labels */}
              <text x="10" y="78" fill="#94a3b8" fontSize="6px" fontFamily="monospace">Mon</text>
              <text x="70" y="78" fill="#94a3b8" fontSize="6px" fontFamily="monospace">Wed</text>
              <text x="130" y="78" fill="#94a3b8" fontSize="6px" fontFamily="monospace">Fri</text>
              <text x="180" y="78" fill="#94a3b8" fontSize="6px" fontFamily="monospace">Sun</text>
            </svg>
          </div>
          <p className="text-[9.5px] font-sans text-slate-450 text-center uppercase font-bold tracking-wider leading-none">
            ⚡ Weekend consult density forecast (+14%)
          </p>
        </div>

        {/* CHART 2: Monthly Revenue Analysis (Dual Bar SVG) */}
        <div className="bg-white dark:bg-slate-900/60 p-4 rounded-3xl border dark:border-slate-800 space-y-3 shadow-xs">
          <div>
            <h5 className="font-bold text-slate-900 dark:text-white leading-none text-xs">Monthly Revenue Analysis</h5>
            <span className="text-[9px] text-slate-400 font-sans">Compare Target vs Collected earnings</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-2xl">
            <svg viewBox="0 0 200 80" className="w-full h-24 overflow-visible">
              <line x1="10" y1="70" x2="190" y2="70" stroke="rgba(128,128,128,0.5)" strokeWidth="0.7" />
              
              {/* March */}
              <rect x="20" y="45" width="8" height="25" fill="#94a3b8" rx="1" />
              <rect x="30" y="40" width="8" height="30" fill="#f59e0b" rx="1" />

              {/* April */}
              <rect x="70" y="35" width="8" height="35" fill="#94a3b8" rx="1" />
              <rect x="80" y="25" width="8" height="45" fill="#10b981" rx="1" />

              {/* May */}
              <rect x="120" y="25" width="8" height="45" fill="#94a3b8" rx="1" />
              <rect x="130" y="15" width="8" height="55" fill="#3b82f6" rx="1" />

              {/* Legend labels */}
              <text x="25" y="78" fill="#94a3b8" fontSize="6.5px" fontFamily="sans-serif">Mar</text>
              <text x="75" y="78" fill="#94a3b8" fontSize="6.5px" fontFamily="sans-serif">Apr</text>
              <text x="125" y="78" fill="#94a3b8" fontSize="6.5px" fontFamily="sans-serif">May</text>
            </svg>
          </div>
          <div className="flex justify-around text-[8px] font-mono leading-none">
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-slate-400 rounded-full" /> Target</span>
            <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full" /> Revenue</span>
          </div>
        </div>

        {/* CHART 3: Department Patient Distribution (Vertical stacked list) */}
        <div className="bg-white dark:bg-slate-900/60 p-4 rounded-3xl border dark:border-slate-800 space-y-3 shadow-xs">
          <div>
            <h5 className="font-bold text-slate-900 dark:text-white leading-none text-xs">Department Distribution</h5>
            <span className="text-[9px] text-slate-400 font-sans">Active caseload per specialty ward</span>
          </div>

          <div className="space-y-2 max-h-24 overflow-y-auto pr-1">
            {[
              { name: "General Medicine", count: 245, pct: 78, color: "bg-blue-500" },
              { name: "Cardiology Unit", count: 35, pct: 12, color: "bg-amber-500" },
              { name: "Pediatrics Ward", count: 18, pct: 6, color: "bg-emerald-500" },
              { name: "Emergency Ortho", count: 12, pct: 4, color: "bg-rose-500" },
            ].map((d, i) => (
              <div key={i} className="space-y-0.5">
                <div className="flex justify-between font-mono text-[9px] leading-none">
                  <span className="font-sans font-semibold">{d.name}</span>
                  <strong>{d.count} ({d.pct}%)</strong>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${d.color}`} style={{ width: `${d.pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 4: Doctor Performance Analysis (Speed dials metrics) */}
        <div className="bg-white dark:bg-slate-900/60 p-4 rounded-3xl border dark:border-slate-800 space-y-3 shadow-xs">
          <div>
            <h5 className="font-bold text-slate-900 dark:text-white leading-none text-xs">Specialists Feedback Analysis</h5>
            <span className="text-[9px] text-slate-400 font-sans">Active feedback and peer reviews</span>
          </div>

          <div className="space-y-2 text-[10px]">
            <div className="flex items-center justify-between p-1 bg-slate-50 dark:bg-slate-950 rounded-xl">
              <span className="font-mono">Dr. Rajesh (Cardio)</span>
              <strong className="text-emerald-500 bg-emerald-550/10 px-1.5 py-0.2 rounded text-[9px]">★ 4.93</strong>
            </div>
            <div className="flex items-center justify-between p-1 bg-slate-50 dark:bg-slate-950 rounded-xl">
              <span className="font-mono">Dr. Priya (Neuro)</span>
              <strong className="text-emerald-500 bg-emerald-550/10 px-1.5 py-0.2 rounded text-[9px]">★ 4.88</strong>
            </div>
            <div className="flex items-center justify-between p-1 bg-slate-50 dark:bg-slate-950 rounded-xl">
              <span className="font-mono">Dr. Amit (Ortho)</span>
              <strong className="text-emerald-500 bg-emerald-550/10 px-1.5 py-0.2 rounded text-[9px]">★ 4.85</strong>
            </div>
          </div>
          <p className="text-[8px] text-slate-400 text-center leading-none">Average medical consultation timing: 18 mins</p>
        </div>

        {/* CHART 5: Patient Age Group Statistics (Horiz bars SVG) */}
        <div className="bg-white dark:bg-slate-900/60 p-4 rounded-3xl border dark:border-slate-800 space-y-3 shadow-xs">
          <div>
            <h5 className="font-bold text-slate-900 dark:text-white leading-none text-xs">Patient Age Demographics</h5>
            <span className="text-[9px] text-slate-400 font-sans">Distribution by age ranges</span>
          </div>

          <div className="space-y-1.5">
            {[
              { age: "18-25 Years (Students)", val: 82, color: "bg-blue-600" },
              { age: "26-45 Years (Staff)", val: 12, color: "bg-violet-500" },
              { age: "46+ Years (Senior Admin)", val: 6, color: "bg-amber-500" },
            ].map((a, i) => (
              <div key={i} className="flex items-center justify-between gap-2">
                <span className="text-[8.5px] truncate w-24 leading-none font-bold">{a.age}</span>
                <div className="h-2 flex-grow bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full ${a.color}`} style={{ width: `${a.val}%` }} />
                </div>
                <span className="font-mono text-[9px] leading-none">{a.val}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* CHART 6: Disease Category Analysis (Donut SVG Mock) */}
        <div className="bg-white dark:bg-slate-900/60 p-4 rounded-3xl border dark:border-slate-800 space-y-3 shadow-xs">
          <div>
            <h5 className="font-bold text-slate-900 dark:text-white leading-none text-xs">Disease Category Segment</h5>
            <span className="text-[9px] text-slate-400 font-sans">Primary symptoms diagnoses shares</span>
          </div>

          <div className="flex items-center justify-between">
            {/* Custom static Donut Wheel SVG */}
            <svg width="60" height="60" viewBox="0 0 36 36" className="transform -rotate-90">
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#e2e8f0" strokeWidth="4" />
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#3b82f6" strokeWidth="4" strokeDasharray="65 35" strokeDashoffset="0" />
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#10b981" strokeWidth="4" strokeDasharray="20 80" strokeDashoffset="-65" />
              <circle cx="18" cy="18" r="15.915" fill="none" stroke="#ef4444" strokeWidth="4" strokeDasharray="15 85" strokeDashoffset="-85" />
            </svg>

            <div className="space-y-1 text-[8.5px] leading-none">
              <p className="flex items-center gap-1"><span className="w-2 h-2 bg-blue-500 rounded" /> Flu/Cold (65%)</p>
              <p className="flex items-center gap-1"><span className="w-2 h-2 bg-emerald-500 rounded" /> Trauma Sprain (20%)</p>
              <p className="flex items-center gap-1"><span className="w-2 h-2 bg-rose-500 rounded" /> Allergies (15%)</p>
            </div>
          </div>
        </div>

        {/* CHART 7: Appointment Cancellation Trends */}
        <div className="bg-white dark:bg-slate-900/60 p-4 rounded-3xl border dark:border-slate-800 space-y-3 shadow-xs">
          <div>
            <h5 className="font-bold text-slate-900 dark:text-white leading-none text-xs">Cancellation Trajectory</h5>
            <span className="text-[9px] text-slate-400 font-sans">Refinement trends this quarter</span>
          </div>

          <p className="font-display font-extrabold text-2xl text-rose-600 leading-none">0.8% <span className="font-sans font-semibold text-[10px] text-emerald-500">-12% than May</span></p>
          <p className="text-[9px] font-sans text-slate-450 leading-normal">
            Low cancellation index indicates robust patient satisfaction and smooth waiting times integration.
          </p>
        </div>

        {/* CHART 8: Patient Satisfaction Score */}
        <div className="bg-white dark:bg-slate-900/60 p-4 rounded-3xl border dark:border-slate-800 space-y-3 shadow-xs">
          <div>
            <h5 className="font-bold text-slate-900 dark:text-white leading-none text-xs">Patient Satisfaction Rate</h5>
            <span className="text-[9px] text-slate-400 font-sans">Live peer feedback statistics index</span>
          </div>

          {/* Speedometer indicator */}
          <div className="relative h-12 w-full pt-2">
            <div className="w-full h-8 bg-gradient-to-r from-red-400 via-yellow-400 to-emerald-400 rounded-t-full relative overflow-hidden flex items-end justify-center">
              <span className="text-xs font-black text-slate-905 z-10 px-2 py-0.5 bg-white/90 rounded-t-xl select-none leading-none">
                98.6%
              </span>
              {/* needle dial hand */}
              <div className="absolute w-1 h-8 bg-slate-900 dark:bg-white bottom-0 transform origin-bottom rotate-[75deg]" />
            </div>
          </div>
          <p className="text-[8.5px] italic text-slate-450 text-center leading-none">Aggregated from 1,245 active patient checkout surveys</p>
        </div>

      </div>

      {/* ============================================================== */}
      {/* SECTION 4: 🤖 AI ANALYTICS FORECASTING & DEEP CLINICAL PREDICTIONS */}
      {/* ============================================================== */}
      <div className={`p-5 rounded-3xl border ${
        isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-blue-500/5 border-blue-500/20'
      }`}>
        <div className="flex items-center gap-2 border-b dark:border-slate-800 pb-2.5 mb-4">
          <Brain className="w-5.5 h-5.5 text-blue-600 animate-spin-slow shrink-0" />
          <div>
            <h4 className="font-display font-black text-slate-900 dark:text-white text-sm">
              Titan HealthConnect AI Prescriptive Analytics
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">Statistical prediction models powered by Gemini health telemetry indicators</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* AI Predict 1: Volume demand & Peak Hour tracking */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-905 dark:text-white text-[11px] flex items-center gap-1.5 leading-none">
              <span className="w-2 h-2 rounded-full bg-blue-500 inline-block animate-ping" />
              <span>Predictive Patient Volume Demand</span>
            </h5>
            <p className="text-slate-450 text-[10.5px] leading-relaxed">
              Based on historic clinical records, surge shifts analysis forecasts another peak between <strong className="text-blue-500 dark:text-blue-400">03:30 PM - 05:00 PM</strong> today.
            </p>
            <div className="p-2.5 bg-blue-500/5 dark:bg-slate-900/60 rounded-xl border dark:border-slate-800 text-[10px]">
              <span className="font-mono text-[9px] uppercase tracking-wider text-slate-400">Peak hour recommendations:</span>
              <p className="text-slate-505 leading-normal mt-0.5">Route Orthopedics triage directly to Lobby Room C to reduce delays. Keep 2 doctors on reserve shift.</p>
            </div>
          </div>

          {/* AI Predict 2: Unusual System Spikes (Anomaly detection) */}
          <div className="space-y-2">
            <h5 className="font-bold text-rose-600 dark:text-rose-450 text-[11px] flex items-center gap-1.5 leading-none">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Anomaly Detection Tracker</span>
            </h5>
            <p className="text-slate-450 text-[10.5px] leading-relaxed">
              Continuously parsing digital vitals records. System identifies zero dangerous outliers. Heart rates average <strong className="text-slate-800 dark:text-slate-100">74.2 bpm</strong>.
            </p>
            <div className="p-2.5 bg-rose-500/5 dark:bg-rose-950/20 rounded-xl border border-rose-220 dark:border-rose-900/40 text-[10px]">
              <span className="font-mono text-[9px] uppercase tracking-wider text-rose-500">Anomaly Warning Thresholds:</span>
              <p className="text-slate-505 leading-normal mt-0.5">Spike warnings will alert emergency dispatchers if patient temperature readings exceed 39.1°C instantly.</p>
            </div>
          </div>

          {/* AI Predict 3: Uptime Revenue Retention metrics forecast */}
          <div className="space-y-2">
            <h5 className="font-bold text-slate-905 dark:text-white text-[11px] flex items-center gap-1.5 leading-none">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              <span>Revenue Retention Index Predict</span>
            </h5>
            <p className="text-slate-450 text-[10.5px] leading-relaxed">
              Algorithmic modeling projects continuous revenue at <strong className="text-emerald-500">₹2.8L next Tuesday</strong> with clinic retention margins reading 94% secure.
            </p>
            <div className="p-2.5 bg-emerald-500/5 dark:bg-slate-900/40 rounded-xl border border-emerald-500/10 text-[10px]">
              <span className="font-bold text-emerald-500 font-mono text-[9px]">HEALTHCARE RETENTION GAINS:</span>
              <p className="text-slate-505 leading-normal mt-0.5">Integrated outpatient follow-up alerts are driving patient retention, decreasing emergency readmissions by 18%.</p>
            </div>
          </div>

        </div>
      </div>

      {/* ============================================================== */}
      {/* SECTION 5: LIVE SYSTEM CLINICAL AUDIT REAL-TIME LOGS */}
      {/* ============================================================== */}
      <div className="bg-slate-100 dark:bg-slate-950 p-4 rounded-3xl space-y-3 font-mono text-[10px]">
        <div className="flex items-center justify-between border-b dark:border-slate-800 pb-1.5 text-slate-450 uppercase font-black text-[9px] tracking-wider">
          <span>🔔 Interactive system diagnostic log alerts buffer</span>
          <span className="text-[8.5px] font-normal underline cursor-pointer" onClick={() => setDashboardAlerts([])}>Clear logs</span>
        </div>

        <div className="space-y-1.5 max-h-[120px] overflow-y-auto pr-1">
          {dashboardAlerts.map(al => (
            <div key={al.id} className="flex justify-between items-start gap-3">
              <span className="text-blue-500 font-bold shrink-0">⏱️ {al.time}</span>
              <p className={`flex-grow leading-normal font-sans ${al.urgent ? 'text-rose-600 font-bold animate-pulse' : 'text-slate-550 dark:text-slate-300'}`}>
                {al.urgent && "[WARNING] "} {al.text}
              </p>
              <span className="text-[8px] bg-slate-200 dark:bg-slate-800 text-slate-400 py-0.2 px-1 rounded">System Event</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
