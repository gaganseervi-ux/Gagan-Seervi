import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Activity, 
  Sparkles, 
  Calendar, 
  Clock, 
  FileText, 
  Brain, 
  AlertTriangle, 
  Flame, 
  ShieldAlert, 
  CheckCircle2, 
  RefreshCw, 
  User, 
  Info, 
  Shield, 
  FileSpreadsheet,
  Download,
  Bell,
  MapPin,
  Compass,
  Settings,
  Heart,
  DollarSign,
  Presentation
} from "lucide-react";
import { Appointment, PatientVital, Prescription, TriageResult } from "../types";
import LabTestBooking from "./LabTestBooking";
import PaymentSystem from "./PaymentSystem";
import HeartVisualizer3D from "./HeartVisualizer3D";
import HackathonSlides from "./HackathonSlides";

interface PatientPortalProps {
  studentName: string;
  studentId: string;
  studentAllergies: string;
  patientDob: string;
  patientGender: string;
  patientEmail: string;
  patientMobile: string;
  patientCity: string;
  
  onUpdateProfile: (updates: {
    studentName?: string;
    studentAllergies?: string;
    dob?: string;
    gender?: string;
    email?: string;
    mobile?: string;
    city?: string;
  }) => void;

  appointments: Appointment[];
  vitals: PatientVital[];
  prescriptions: Prescription[];
  
  triageLoading: boolean;
  triageResponse: TriageResult | null;
  onRunAiTriage: (symptoms: string, temp: string, heart: string, allergies: string) => void;
  onLogVitalsOnly: (symptoms: string, temp: string, heart: string, allergies: string) => void;
  
  onTriggerSOS: (building: string, room: string, details: string) => void;
  localActiveSos: any;
  onCancelSOS: (id: string) => void;
  campusBuildings: string[];
}

export default function PatientPortal({
  studentName,
  studentId,
  studentAllergies,
  patientDob,
  patientGender,
  patientEmail,
  patientMobile,
  patientCity,
  onUpdateProfile,
  appointments,
  vitals,
  prescriptions,
  triageLoading,
  triageResponse,
  onRunAiTriage,
  onLogVitalsOnly,
  onTriggerSOS,
  localActiveSos,
  onCancelSOS,
  campusBuildings
}: PatientPortalProps) {
  // Tabs within Patient Portal
  const [activeTab, setActiveTab] = useState<'dashboard' | 'triage' | 'records' | 'profile' | 'notifications' | 'lab' | 'billing' | 'cardiac' | 'slides'>('dashboard');

  // Voice switch navigation tab dynamically within Patient Portal
  React.useEffect(() => {
    const handleVoiceSwitch = (e: any) => {
      const { tab } = e.detail;
      const t = tab.toLowerCase();
      if (t === 'dashboard' || t === 'overview' || t === 'home' || t === 'appointments') setActiveTab('dashboard');
      else if (t === 'triage' || t === 'vitals' || t === 'symptoms' || t === 'assess' || t === 'log vitals') setActiveTab('triage');
      else if (t === 'records' || t === 'history' || t === 'health records' || t === 'medical records') setActiveTab('records');
      else if (t === 'profile' || t === 'settings') setActiveTab('profile');
      else if (t === 'notifications' || t === 'alerts') setActiveTab('notifications');
      else if (t === 'lab' || t === 'lab tests' || t === 'book lab' || t === 'lab test' || t === 'blood test' || t === 'pathology') setActiveTab('lab');
      else if (t === 'billing' || t === 'payments' || t === 'pay' || t === 'invoices' || t === 'receipts' || t === 'billing & invoices') setActiveTab('billing');
      else if (t === 'cardiac' || t === 'heart' || t === '3d heart' || t === 'pumping' || t === 'cardiac diagnostic') setActiveTab('cardiac');
      else if (t === 'slides' || t === 'google slides' || t === 'deck' || t === 'presentation' || t === 'pitch') setActiveTab('slides');
    };
    window.addEventListener('voice-switch-tab', handleVoiceSwitch);
    return () => window.removeEventListener('voice-switch-tab', handleVoiceSwitch);
  }, []);

  // Local Form state for Triage/Vitals
  const [localSymptoms, setLocalSymptoms] = useState("");
  const [localTemp, setLocalTemp] = useState("37.0");
  const [localHeart, setLocalHeart] = useState("75");
  const [localAllergies, setLocalAllergies] = useState(studentAllergies);

  // Local state for SOS Trigger inside portal
  const [sosBuilding, setSosBuilding] = useState("");
  const [sosRoom, setSosRoom] = useState("");
  const [sosDetails, setSosDetails] = useState("");
  const [showLocalSos, setShowLocalSos] = useState(false);

  // Filter lists for current student
  const myAppointments = appointments.filter(a => a.studentId === studentId);
  const myVitals = vitals.filter(v => v.studentId === studentId);
  const myPrescriptions = prescriptions.filter(p => p.studentId === studentId);

  // Generate real Downloadable Clinical Profile Report
  const triggerHealthReportDownload = () => {
    try {
      const reportContent = `
========================================
TITAN HEALTHCONNECT CLINICAL STATEMENT
========================================
GENERATED DATE: ${new Date().toLocaleString()}
PATIENT ACCOUNT REPORT SUMMARY
----------------------------------------
Patient Full Name  : ${studentName}
Patient ID         : ${studentId}
Date of Birth      : ${patientDob}
Gender             : ${patientGender}
Mobile Contact     : ${patientMobile}
Email Address      : ${patientEmail}
City Coordinates   : ${patientCity}
Declared Allergies : ${studentAllergies}
----------------------------------------
LOGGED VITALS RECORDS SUMMARY (${myVitals.length} entries)
${myVitals.length === 0 ? "No vitals logs checked on file." : 
  myVitals.map((v, idx) => `
[Log #${idx + 1}] Date: ${new Date(v.timestamp).toLocaleDateString()}
- Symptoms    : ${v.symptoms}
- Body Temp   : ${v.temperature} °C
- Pulse Rate  : ${v.heartRate} BPM
- Severity    : ${v.severity.toUpperCase()}
  `).join("")}
----------------------------------------
ACTIVE MEDICINE PRESCRIPTIONS (${myPrescriptions.length} entries)
${myPrescriptions.length === 0 ? "No active prescriptions files." :
  myPrescriptions.map((p, idx) => `
[Rx #${idx + 1}] Medication : ${p.medication}
- Dosage/Freq : ${p.dosage}
- Directives  : ${p.instructions}
- Doctor name : ${p.doctorName}
- Date Issued : ${p.datePrescribed}
  `).join("")}
----------------------------------------
End of file statement. Titan HealthConnect
All mock metrics remain local student configurations.
========================================
      `;

      const blob = new Blob([reportContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Clinical_Summary_Report_${studentId}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Fail compiler downloading: " + err.message);
    }
  };

  const localSubmitVitals = (runAi: boolean) => {
    if (!localSymptoms.trim()) {
      alert("Provide symptoms details for diagnostics tracking.");
      return;
    }
    if (runAi) {
      onRunAiTriage(localSymptoms, localTemp, localHeart, localAllergies);
    } else {
      onLogVitalsOnly(localSymptoms, localTemp, localHeart, localAllergies);
      setLocalSymptoms("");
    }
  };

  const localTriggerSosSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sosBuilding || !sosRoom) {
      alert("Select Building Coordinates and Room details first.");
      return;
    }
    onTriggerSOS(sosBuilding, sosRoom, sosDetails || "Critical state help signal.");
    setSosBuilding("");
    setSosRoom("");
    setSosDetails("");
    setShowLocalSos(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-xs font-semibold text-slate-500">
      
      {/* Left Navigation bar inside Portal */}
      <div className="lg:col-span-3 space-y-4">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-850 text-white p-6 rounded-3xl space-y-4 shadow-md relative overflow-hidden">
          <div className="relative z-10 space-y-3">
            <span className="text-[10px] uppercase font-bold tracking-widest text-blue-200 bg-white/10 px-2.5 py-1 rounded-full">
              Authenticated Patient Account
            </span>
            <div className="space-y-0.5">
              <h4 className="font-display font-bold text-lg text-white">{studentName}</h4>
              <p className="text-[10px] text-blue-200 font-mono">Patient ID: {studentId}</p>
            </div>
            <div className="text-[11px] text-blue-100 border-t border-white/10 pt-3 space-y-1">
              <p>📍 {patientCity}</p>
              <p>🧬 Allergies: {studentAllergies}</p>
            </div>
          </div>
          <div className="absolute top-1/2 right-[-5px] w-32 h-32 bg-white/5 rounded-full blur-2xl font-mono" />
        </div>

        {/* Vertical Drawer Tabs */}
        <div className="bg-white border border-slate-200/50 rounded-2xl p-2.5 space-y-1 shadow-sm">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-left flex items-center gap-2.5 transition-all outline-none ${activeTab === 'dashboard' ? 'bg-blue-55 text-blue-700 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Compass className="h-4 w-4" />
            <span>Dashboard Overview</span>
          </button>

          <button 
            onClick={() => setActiveTab('triage')}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-left flex items-center gap-2.5 transition-all outline-none ${activeTab === 'triage' ? 'bg-blue-55 text-blue-700 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Brain className="h-4 w-4" />
            <span>Log Vitals & AI Triage</span>
          </button>

          <button 
            onClick={() => setActiveTab('records')}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-left flex items-center gap-2.5 transition-all outline-none ${activeTab === 'records' ? 'bg-blue-55 text-blue-700 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Campus Health Records</span>
          </button>

          <button 
            onClick={() => setActiveTab('lab')}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-left flex items-center gap-2.5 transition-all outline-none ${activeTab === 'lab' ? 'bg-blue-55 text-blue-700 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Activity className="h-4 w-4" />
            <span>Book Lab Test</span>
          </button>

          <button 
            onClick={() => setActiveTab('profile')}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-left flex items-center gap-2.5 transition-all outline-none ${activeTab === 'profile' ? 'bg-blue-55 text-blue-700 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Settings className="h-4 w-4" />
            <span>Profile Settings</span>
          </button>

          <button 
            onClick={() => setActiveTab('billing')}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-left flex items-center gap-2.5 transition-all outline-none ${activeTab === 'billing' ? 'bg-blue-55 text-blue-700 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <DollarSign className="h-4 w-4" />
            <span>Billing & Payments</span>
          </button>

          <button 
            onClick={() => setActiveTab('slides')}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-left flex items-center gap-2.5 transition-all outline-none ${activeTab === 'slides' ? 'bg-blue-55 text-blue-700 bg-blue-50 animate-pulse' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Presentation className="h-4 w-4 text-blue-600" />
            <span className="flex items-center gap-1.5">
              <span>Google Slides Build</span>
              <span className="bg-blue-600 text-white font-mono text-[8.5px] py-0.2 px-1 rounded uppercase font-extrabold shadow-sm">NEW</span>
            </span>
          </button>

          <button 
            onClick={() => setActiveTab('cardiac')}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-left flex items-center gap-2.5 transition-all outline-none ${activeTab === 'cardiac' ? 'bg-blue-55 text-blue-700 bg-blue-50 animate-pulse' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Heart className="h-4 w-4 text-rose-500 animate-pulse" />
            <span className="flex items-center gap-1.5">
              <span>3D Cardiac Engine</span>
              <span className="bg-rose-500 text-white font-mono text-[8px] py-0.2 px-1 rounded uppercase">Live</span>
            </span>
          </button>

          <button 
            onClick={() => setActiveTab('notifications')}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-left flex items-center gap-2.5 transition-all outline-none ${activeTab === 'notifications' ? 'bg-blue-55 text-blue-700 bg-blue-50' : 'text-slate-500 hover:bg-slate-50'}`}
          >
            <Bell className="h-4 w-4" />
            <span>Clinic Notifications ({myAppointments.length})</span>
          </button>
        </div>

        {/* Download Records Prompt button */}
        <button 
          onClick={triggerHealthReportDownload}
          className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          <Download className="h-4 w-4" />
          <span>Download Health Record</span>
        </button>

        {/* Portal SOS trigger alarm button */}
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 space-y-2.5 text-rose-950">
          <p className="font-bold flex items-center gap-1">
            <Flame className="h-4 w-4 text-rose-600 animate-bounce" />
            <span>Trigger Emergency SOS</span>
          </p>
          <p className="text-[10px] text-rose-650 leading-relaxed font-sans font-medium">Bypass scheduling queues to notify on-duty dispatchers with block coordinates tracking.</p>
          
          {localActiveSos ? (
            <div className="bg-white p-2.5 border border-rose-200 rounded-xl space-y-2">
              <span className="text-[10px] bg-rose-600 text-white py-0.5 px-2 rounded font-bold animate-pulse">DISPATCH ACTIVE</span>
              <p className="font-mono text-[9px] text-slate-505">Block: {localActiveSos.building}</p>
              <button 
                onClick={() => onCancelSOS(localActiveSos.id)}
                className="w-full bg-rose-600 text-white font-bold text-[10px] py-1 rounded"
              >
                Resolve Dispatch
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setShowLocalSos(true)}
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 rounded transition-all"
            >
              Request Escort Ambulance
            </button>
          )}
        </div>
      </div>

      {/* Right Content Panels */}
      <div className="lg:col-span-9 space-y-6">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in text-slate-800">
            <div className="bg-white border border-slate-200/50 p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-display font-extrabold text-xl sm:text-2xl text-blue-600">Welcome to Titan HealthConnect</h3>
                  <p className="text-xs text-slate-500 font-sans mt-0.5">Logged in as <strong className="text-slate-800">{studentName || "Maya Lin"}</strong></p>
                </div>
                <div className="px-3.5 py-1.5 bg-blue-50 text-blue-750 font-mono font-bold text-xs rounded-xl border border-blue-100 w-fit">
                  Patient ID: <span className="text-blue-800">{studentId || "S10943"}</span>
                </div>
              </div>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Welcome to Titan HealthConnect dashboard panel. Here you can search active prescription documents, monitor daily body temperature trends logged at the university infirmaries, audit diagnostics history, and communicate clinical pain symptoms with our general practitioners.
              </p>

              {/* Statistics Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-bold font-display text-blue-700">{myAppointments.length}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">My Bookings</p>
                </div>
                <div className="bg-cyan-50/50 border border-cyan-100 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-bold font-display text-cyan-600">{myVitals.length}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Vitals Logs</p>
                </div>
                <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 text-center">
                  <p className="text-2xl font-bold font-display text-indigo-600">{myPrescriptions.length}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Active Prescriptions</p>
                </div>
              </div>
            </div>

            {/* Quick Action blocks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              
              {/* Upcoming Appointment */}
              <div className="bg-white border border-slate-200/60 p-5 rounded-3xl shadow-sm space-y-3">
                <h4 className="font-display font-bold text-slate-900 flex items-center gap-1.5">
                  <Calendar className="h-4.5 w-4.5 text-blue-600" />
                  <span>Next Upcoming Bookings</span>
                </h4>
                {myAppointments.filter(a => a.status === 'pending' || a.status === 'checked-in').length === 0 ? (
                  <p className="text-xs text-slate-450 leading-relaxed font-sans py-4">No pending upcoming consultations scheduling booked. Use the landing page to request one.</p>
                ) : (
                  myAppointments.filter(a => a.status === 'pending' || a.status === 'checked-in').slice(0, 1).map(appt => (
                    <div key={appt.id} className="p-3 bg-slate-50 border border-slate-200/40 rounded-xl space-y-2 font-semibold">
                      <p className="font-bold text-slate-800 text-xs">Consultation: {appt.reason}</p>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-[10px] text-slate-400 flex items-center gap-3">
                          <span className="flex items-center gap-0.5"><Clock className="w-3.5 h-3.5" /> {appt.time}</span>
                          <span>Stage: <span className="text-blue-600 font-bold capitalize">{appt.status}</span></span>
                        </p>
                        {appt.status === 'pending' && (
                          <button 
                            onClick={() => setActiveTab('billing')}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[9px] px-2 py-1 rounded-md uppercase tracking-wider transition-all"
                          >
                            Pay Online (₹500)
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Latest Prescriptions */}
              <div className="bg-white border border-slate-200/60 p-5 rounded-3xl shadow-sm space-y-3">
                <h4 className="font-display font-bold text-slate-900 flex items-center gap-1.5">
                  <FileText className="h-4.5 w-4.5 text-indigo-600" />
                  <span>Latest Dispensed Meds Index</span>
                </h4>
                {myPrescriptions.length === 0 ? (
                  <p className="text-xs text-slate-450 leading-relaxed font-sans py-4">No active medical prescriptions on file. Outpatient medication is updated after clinical consultations.</p>
                ) : (
                  myPrescriptions.slice(0, 1).map(rx => (
                    <div key={rx.id} className="p-3 bg-indigo-50/40 border border-indigo-100 rounded-xl space-y-1">
                      <p className="font-bold text-indigo-950 text-xs">{rx.medication}</p>
                      <p className="text-[10px] text-slate-450">Dosage: {rx.dosage}</p>
                      <p className="text-[10px] text-slate-450 font-sans italic">Dr. Elena Mercer — {rx.datePrescribed}</p>
                    </div>
                  ))
                )}
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: VITALS LOG & AI TRIAGE */}
        {activeTab === 'triage' && (
          <div className="bg-white border border-slate-200/60 p-6 sm:p-8 rounded-[35px] shadow-sm space-y-6 animate-fade-in text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-2">
              <h3 className="font-display font-semibold text-lg text-slate-900">Log Daily Vitals & Smart Triage Assessment</h3>
              <span className="text-[9px] bg-blue-50 text-blue-700 font-bold border border-blue-100 rounded-full px-2 py-0.5 uppercase tracking-wide flex items-center gap-0.5">
                <Sparkles className="h-3 w-3" />
                Gemini Proxy
              </span>
            </div>

            <div className="space-y-4 text-xs font-semibold text-slate-500">
              <div>
                <label className="block mb-1.5 uppercase font-bold tracking-wider">Symptoms / Pain Description</label>
                <textarea 
                  rows={3}
                  placeholder="e.g., Extreme pulsing headache behind my eyes since morning, experiencing sensitivity to overhead fluoresecent lights and mild stomach nausea..."
                  value={localSymptoms}
                  onChange={(e) => setLocalSymptoms(e.target.value)}
                  className="w-full text-xs font-medium placeholder:text-slate-400 bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1.5 uppercase font-bold tracking-wider">Body Temperature (°C)</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={localTemp}
                    onChange={(e) => setLocalTemp(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:bg-white focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 font-mono font-medium">Normal: 36.5°C – 37.5°C</p>
                </div>

                <div>
                  <label className="block mb-1.5 uppercase font-bold tracking-wider">Pulse Rate (BPM)</label>
                  <input 
                    type="number" 
                    value={localHeart}
                    onChange={(e) => setLocalHeart(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:bg-white focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 font-mono font-medium">Normal rest: 60 – 100 BPM</p>
                </div>

                <div>
                  <label className="block mb-1.5 uppercase font-bold tracking-wider">Known Allergen limits</label>
                  <input 
                    type="text" 
                    value={localAllergies}
                    onChange={(e) => setLocalAllergies(e.target.value)}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 focus:bg-white focus:outline-none"
                  />
                  <p className="text-[10px] text-slate-400 mt-1 font-mono font-medium text-blue-600">Synced from profile</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => localSubmitVitals(false)}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-3 px-4 rounded-xl text-center cursor-pointer transition-all"
                >
                  Save Standard Vitals Logs
                </button>

                <button 
                  type="button"
                  disabled={triageLoading}
                  onClick={() => localSubmitVitals(true)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/10"
                >
                  {triageLoading ? (
                    <>
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      <span>Diagnosing symptoms logs...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="h-3.5 w-3.5" />
                      <span>Run AI Symptoms Triage</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* AI Response Display Panel */}
            {triageResponse && (
              <div className="border border-blue-100 rounded-2xl bg-gradient-to-br from-blue-50/20 via-white to-indigo-50/10 p-5 mt-4 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <span className="font-display font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                    <Brain className="h-4 w-4 text-blue-600" />
                    Clinical Sympotms Assessment Report
                  </span>
                  <span className={`py-0.5 px-2.5 rounded-full text-[9px] uppercase font-bold border ${
                    triageResponse.urgency === 'critical' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                    triageResponse.urgency === 'moderate' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                    'bg-emerald-50 text-emerald-700 border-emerald-100'
                  }`}>
                    Urgency Flag: {triageResponse.urgency}
                  </span>
                </div>

                <div className="space-y-3 text-xs leading-relaxed">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-sans">Symptom Summary Assessment:</span>
                    <p className="bg-white border border-slate-150 p-3 rounded-xl mt-1 text-slate-700">{triageResponse.summary}</p>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 font-sans">Comfort & Nursing Guidance Advice:</span>
                    <p className="bg-slate-50 border border-slate-150 p-3 rounded-xl mt-1 font-mono text-[11px] text-slate-600 leading-normal whitespace-pre-line">{triageResponse.homeCare}</p>
                  </div>

                  {triageResponse.shouldTriggerSOS && (
                    <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-pulse">
                      <div>
                        <p className="font-bold text-rose-900 flex items-center gap-1">
                          <AlertTriangle className="h-4.5 w-4.5 text-rose-600" />
                          High Distress Threshold Reached
                        </p>
                        <p className="text-[10px] text-rose-750">The AI model flags this log as high distress. Do you need a coordinate-dispatch ambulance?</p>
                      </div>
                      <button 
                        onClick={() => {
                          setSosBuilding("Central Library Block L");
                          setSosRoom("Corridor wing Room 402");
                          setSosDetails(`AI Triage triggered critical SOS alarm: ${localSymptoms}`);
                          setShowLocalSos(true);
                        }}
                        className="bg-rose-600 hover:bg-rose-700 text-white font-bold py-1.5 px-3.5 rounded-lg text-[10px]"
                      >
                        Launch Portal SOS
                      </button>
                    </div>
                  )}

                  <p className="text-[10px] text-slate-400 font-sans italic bg-slate-50 p-2.5 rounded-lg border border-slate-100/50 leading-normal">
                    <strong className="text-slate-500 font-bold font-sans">Disclaimer:</strong> {triageResponse.disclaimer}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: RECORDS TRACKER */}
        {activeTab === 'records' && (
          <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm space-y-6 animate-fade-in text-slate-800">
            <h3 className="font-display font-semibold text-lg text-slate-900 border-b border-slate-100 pb-3">
              Campus Health Records Database
            </h3>

            {/* Sub Tabs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Logged Vitals index */}
              <div className="space-y-3">
                <h4 className="font-display font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <Activity className="h-4.5 w-4.5 text-cyan-600" />
                  <span>Historic Physical Logs ({myVitals.length})</span>
                </h4>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {myVitals.length === 0 ? (
                    <p className="text-xs text-slate-450 py-4 text-center bg-slate-50 p-4 border border-slate-200/45 rounded-2xl leading-normal font-sans">No physical data logged. Enter metrics in Vitals Log console.</p>
                  ) : (
                    myVitals.map(v => (
                      <div key={v.id} className="p-3 bg-slate-50 border border-slate-200/40 rounded-xl space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-800 line-clamp-1 truncate">{v.symptoms}</span>
                          <span className="text-[9px] font-mono text-slate-450">{new Date(v.timestamp).toLocaleDateString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 font-mono mt-0.5">
                          <span>Temp: <strong>{v.temperature}°C</strong> | Pulse: <strong>{v.heartRate} BPM</strong></span>
                          <span className={`px-2 py-0.2 rounded font-bold capitalize text-[8px] border ${v.severity === 'critical' ? 'bg-rose-50 text-rose-700' : 'bg-slate-50'}`}>{v.severity}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Prescriptions List */}
              <div className="space-y-3">
                <h4 className="font-display font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                  <FileText className="h-4.5 w-4.5 text-indigo-600" />
                  <span>Clinical Prescriptions Records ({myPrescriptions.length})</span>
                </h4>

                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {myPrescriptions.length === 0 ? (
                    <p className="text-xs text-slate-450 py-4 text-center bg-slate-50 p-4 border border-slate-200/45 rounded-2xl leading-normal font-sans">No dispensed outpatient drugs logs on file.</p>
                  ) : (
                    myPrescriptions.map(rx => (
                      <div key={rx.id} className="p-4.5 bg-indigo-50/20 border border-indigo-150 border-dashed rounded-xl space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-slate-900 text-xs">{rx.medication}</p>
                            <p className="text-[10px] text-slate-400">Dr. Elena Mercer — MD General Medicine</p>
                          </div>
                          <span className="text-[8px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded uppercase">Active SKU Rx</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-[10px] pt-1.5 border-t border-slate-100 font-sans leading-normal">
                          <div>
                            <span className="text-slate-400 uppercase font-bold text-[9px] block">Dosage:</span>
                            <span className="font-bold text-slate-750">{rx.dosage}</span>
                          </div>
                          <div>
                            <span className="text-slate-400 uppercase font-bold text-[9px] block">Timing Instructions:</span>
                            <span className="text-slate-650">{rx.instructions}</span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: PROFILE SETTINGS */}
        {activeTab === 'profile' && (
          <div className="bg-white border border-slate-200/60 p-6 sm:p-8 rounded-[35px] shadow-sm space-y-6 animate-fade-in text-slate-800">
            <div>
              <h3 className="font-display font-semibold text-lg text-slate-900 pb-1">Manage Clinical Profile Metrics</h3>
              <p className="text-xs text-slate-400 font-sans leading-relaxed">
                Update your authenticated student identity, allergen parameters, home contact address coordinates, and age timelines.
              </p>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); alert("Profile fields locally updated! All booked consultations synchronize settings."); }} className="space-y-4 text-xs font-semibold text-slate-500">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 uppercase font-bold tracking-wider">Patient Full Name</label>
                  <input 
                    type="text" 
                    value={studentName}
                    onChange={(e) => onUpdateProfile({ studentName: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 uppercase font-bold tracking-wider">Allergies</label>
                  <input 
                    type="text" 
                    value={studentAllergies}
                    onChange={(e) => onUpdateProfile({ studentAllergies: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block mb-1.5 uppercase font-bold tracking-wider">Date of Birth</label>
                  <input 
                    type="date" 
                    value={patientDob}
                    onChange={(e) => onUpdateProfile({ dob: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 uppercase font-bold tracking-wider">Gender</label>
                  <select 
                    value={patientGender}
                    onChange={(e) => onUpdateProfile({ gender: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:bg-white focus:outline-none"
                  >
                    <option value="Female">Female</option>
                    <option value="Male">Male</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1.5 uppercase font-bold tracking-wider">City Location</label>
                  <input 
                    type="text" 
                    value={patientCity}
                    onChange={(e) => onUpdateProfile({ city: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-1.5 uppercase font-bold tracking-wider">Mobile Number Contact</label>
                  <input 
                    type="tel" 
                    value={patientMobile}
                    onChange={(e) => onUpdateProfile({ mobile: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block mb-1.5 uppercase font-bold tracking-wider">Email Address</label>
                  <input 
                    type="email" 
                    value={patientEmail}
                    onChange={(e) => onUpdateProfile({ email: e.target.value })}
                    className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-center cursor-pointer transition-all uppercase tracking-wider"
                >
                  Apply Demographics updates
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 5: NOTIFICATIONS */}
        {activeTab === 'notifications' && (
          <div className="bg-white border border-slate-200/60 p-6 rounded-3xl shadow-sm space-y-6 animate-fade-in text-slate-800">
            <h3 className="font-display font-semibold text-lg text-slate-900 border-b border-slate-100 pb-3">
              On-Duty Clinic Notifications
            </h3>

            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3">
                <Bell className="h-5 w-5 text-blue-600 shrink-0 mt-0.5 animate-bounce" />
                <div className="space-y-1">
                  <p className="font-bold text-blue-900 text-xs">High Pollen Notice & Local Flu Safeguards</p>
                  <p className="text-[11px] text-slate-505 leading-relaxed font-sans font-medium">Elevated atmospheric counts reported over Bengaluru center. Outpatients scheduled with respiratory condition are prioritised for active triage. Please carry on-campus mask escorts.</p>
                </div>
              </div>

              {myAppointments.map((a, idx) => (
                <div key={a.id} className="p-4 bg-slate-55 border border-slate-200 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="h-4.5 w-4.5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs">
                    <p className="font-bold text-slate-800">Appointment Requested confirmed (#APT-{idx + 1})</p>
                    <p className="text-slate-450 text-[10px] font-sans">Your appointment on {a.date} at {a.time} is registered. Status: <span className="font-bold uppercase text-blue-600">{a.status}</span></p>
                    {a.notes && (
                      <p className="bg-white p-2 border border-slate-150 rounded mt-1 font-sans text-slate-600"><strong>Physician directive:</strong> "{a.notes}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: LABORATORY TEST BOOKPING PORTAL */}
        {activeTab === 'lab' && (
          <div className="animate-fade-in">
            <LabTestBooking
              studentName={studentName}
              studentId={studentId}
              patientEmail={patientEmail}
              patientMobile={patientMobile}
              patientCity={patientCity}
              patientDob={patientDob}
              patientGender={patientGender}
              isDarkMode={false}
            />
          </div>
        )}

        {/* TAB 7: SECURE BILLING & INVOICES SYSTEM */}
        {activeTab === 'billing' && (
          <div className="animate-fade-in">
            <PaymentSystem
              studentId={studentId}
              studentName={studentName}
              patientEmail={patientEmail}
              patientMobile={patientMobile}
              appointments={appointments}
              prescriptions={prescriptions}
              isAdminView={false}
            />
          </div>
        )}

        {/* TAB 8: 3D ANATOMICAL CARDIAC ENGINE GRAPHICS */}
        {activeTab === 'cardiac' && (
          <div className="animate-fade-in">
            <HeartVisualizer3D />
          </div>
        )}

        {/* TAB 9: HACKATHON PITCH GOOGLE SLIDES WORKSPACE */}
        {activeTab === 'slides' && (
          <div className="animate-fade-in">
            <HackathonSlides />
          </div>
        )}

      </div>

      {/* PORTAL INNER SOS TRIGGER DIALOG */}
      {showLocalSos && (
        <div className="fixed inset-0 bg-slate-900/60 p-4 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-white border border-rose-200 rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-4">
            <div className="flex justify-between items-center bg-rose-600 text-white rounded-2xl p-4">
              <h4 className="font-display font-extrabold text-white text-base">Titan Ambulance Dispatch</h4>
              <button 
                onClick={() => setShowLocalSos(false)}
                className="text-white hover:text-slate-200 font-bold"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={localTriggerSosSubmit} className="space-y-4 text-xs font-semibold text-slate-500">
              <div>
                <label className="block mb-1.5 uppercase font-bold tracking-wider">Select Present Block</label>
                <select 
                  required
                  value={sosBuilding}
                  onChange={(e) => setSosBuilding(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-100 border border-slate-200 rounded-xl py-2 px-3"
                >
                  <option value="">-- Choose Coordinates location --</option>
                  {campusBuildings.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1.5 uppercase font-bold tracking-wider">Room / Lab Corridor Details</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Room 204, Corididor Wing B" 
                  value={sosRoom}
                  onChange={(e) => setSosRoom(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-100 border border-slate-200 rounded-xl py-2 px-3"
                />
              </div>

              <div>
                <label className="block mb-1.5 uppercase font-bold tracking-wider">Additional details</label>
                <input 
                  type="text" 
                  placeholder="e.g., Fainting symptoms, heavy cuts, breath limits" 
                  value={sosDetails}
                  onChange={(e) => setSosDetails(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-100 border border-slate-200 rounded-xl py-2 px-3"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-rose-600 text-white font-extrabold py-3 rounded-xl uppercase hover:bg-rose-700 shadow-lg text-center"
              >
                Transmit Distress Command
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
