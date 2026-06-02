import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Users, 
  Activity, 
  Flame, 
  Calendar, 
  FileText, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Plus, 
  Stethoscope, 
  Clock8,
  Search,
  Printer,
  ChevronRight,
  Sparkles,
  Download
} from "lucide-react";
import { Appointment, PatientVital, SOSAlert, Prescription } from "../types";
import { doctorProfiles, medicalStaffList } from "../data/medicalData";
import AnalyticsDashboard from "./AnalyticsDashboard";
import PaymentSystem from "./PaymentSystem";
import HeartVisualizer3D from "./HeartVisualizer3D";

interface AdminPortalProps {
  appointments: Appointment[];
  vitals: PatientVital[];
  sosAlerts: SOSAlert[];
  prescriptions: Prescription[];
  onUpdateAppointmentStatus: (id: string, status: any, notes: string) => void;
  onIssuePrescription: (rxData: {
    studentId: string;
    studentName: string;
    medication: string;
    dosage: string;
    instructions: string;
  }) => void;
  onResolveSOS: (id: string) => void;
  isDarkMode?: boolean;
}

export default function AdminPortal({
  appointments,
  vitals,
  sosAlerts,
  prescriptions,
  onUpdateAppointmentStatus,
  onIssuePrescription,
  onResolveSOS,
  isDarkMode = false
}: AdminPortalProps) {
  // Tabs within Admin Panel
  const [activeTab, setActiveTab] = useState<'analytics' | 'appointments' | 'doctors' | 'patients' | 'staff' | 'billing' | 'records' | 'cardiac'>('analytics');

  // Voice switch navigation tab dynamically
  React.useEffect(() => {
    const handleVoiceSwitch = (e: any) => {
      const { tab } = e.detail;
      const t = tab.toLowerCase();
      if (t === 'analytics' || t === 'charts' || t === 'report') setActiveTab('analytics');
      else if (t === 'appointments' || t === 'schedule') setActiveTab('appointments');
      else if (t === 'doctors' || t === 'practitioners') setActiveTab('doctors');
      else if (t === 'patients' || t === 'registry') setActiveTab('patients');
      else if (t === 'staff' || t === 'roster' || t === 'shifts') setActiveTab('staff');
      else if (t === 'billing' || t === 'invoice' || t === 'billing & invoices module') setActiveTab('billing');
      else if (t === 'records' || t === 'medical records library') setActiveTab('records');
      else if (t === 'cardiac' || t === 'heart' || t === '3d heart' || t === 'pumping' || t === 'cardiac diagnostic' || t === 'visualizer') setActiveTab('cardiac');
    };
    window.addEventListener('voice-switch-tab', handleVoiceSwitch);
    return () => window.removeEventListener('voice-switch-tab', handleVoiceSwitch);
  }, []);

  // Voice query for searching records
  React.useEffect(() => {
    const handleVoiceSearch = (e: any) => {
      setSearchQuery(e.detail.query);
    };
    window.addEventListener('voice-search-patients', handleVoiceSearch);
    return () => window.removeEventListener('voice-search-patients', handleVoiceSearch);
  }, []);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Prescription Writer state
  const [rxId, setRxId] = useState("");
  const [rxName, setRxName] = useState("");
  const [rxMeds, setRxMeds] = useState("");
  const [rxDose, setRxDose] = useState("");
  const [rxInst, setRxInst] = useState("");

  // Billing Module States
  const [billingPatient, setBillingPatient] = useState("Maya Lin");
  const [billingService, setBillingService] = useState("General Clinical Checkup");
  const [billingCost, setBillingCost] = useState(500);
  const [billingDiscount, setBillingDiscount] = useState(10); // 10%
  const [billingTaxPercent] = useState(5); // 5%
  const [generatedInvoice, setGeneratedInvoice] = useState<any | null>(null);

  // Status edit Modal
  const [selectedApptForEdit, setSelectedApptForEdit] = useState<Appointment | null>(null);
  const [editStatus, setEditStatus] = useState<any>("pending");
  const [editNotes, setEditNotes] = useState("");

  // Doctors State Extension for Doctor Management (allocate extra slot)
  const [allocationDoctor, setAllocationDoctor] = useState("");
  const [allocationHours, setAllocationHours] = useState("09:00 AM - 05:00 PM");
  const [doctorsListState, setDoctorsListState] = useState(doctorProfiles);

  const handleAllocateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allocationDoctor) {
      alert("Please select a physician to allocate slots.");
      return;
    }
    setDoctorsListState(prev => prev.map(d => {
      if (d.name === allocationDoctor) {
        return { ...d, timings: `Mon-Sat ${allocationHours}` };
      }
      return d;
    }));
    alert(`Success: Allocated updated timings (${allocationHours}) to ${allocationDoctor} directly.`);
    setAllocationDoctor("");
  };

  // Issue prescription handler
  const handleRxSubmitLocal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rxName || !rxMeds || !rxDose) {
      alert("Fill Prescription details: Name, Medication, and Dosage instructions are required.");
      return;
    }
    onIssuePrescription({
      studentId: rxId || "S10000",
      studentName: rxName,
      medication: rxMeds,
      dosage: rxDose,
      instructions: rxInst || "Take after meals."
    });
    setRxId("");
    setRxName("");
    setRxMeds("");
    setRxDose("");
    setRxInst("");
    alert("Digital clinical prescription generated and saved directly to Patient Health records.");
  };

  // Billing Invoice handler
  const handleGenerateInvoice = () => {
    const subtotal = billingCost;
    const discountAmt = Math.round((subtotal * billingDiscount) / 100);
    const taxAmt = Math.round(((subtotal - discountAmt) * billingTaxPercent) / 100);
    const totalPayable = subtotal - discountAmt + taxAmt;
    const invoiceNum = `TITAN-INV-${Math.floor(100000 + Math.random() * 900000)}`;

    setGeneratedInvoice({
      invoiceNum,
      patientName: billingPatient,
      service: billingService,
      subtotal,
      discountAmt,
      discountPct: billingDiscount,
      taxAmt,
      taxPct: billingTaxPercent,
      totalPayable,
      date: new Date().toLocaleDateString(),
      timestring: new Date().toLocaleTimeString(),
      status: "Paid — Online Settlement"
    });
  };

  const calculateServiceCost = (service: string) => {
    switch (service) {
      case "Cardiology ECG Monitor Scan": return 1500;
      case "Neurology Consult Diagnostic": return 1200;
      case "Orthopedic Joint Rehabilitation": return 800;
      case "Advanced AI Triage Scan Analysis": return 600;
      case "Dental Scaling & cavity block": return 700;
      default: return 500;
    }
  };

  return (
    <div className="space-y-6 text-slate-800 font-sans text-xs">
      
      {/* 1. BRAND ON-DUTY CORE STATISTICS BANNER */}
      <h3 className="text-slate-500 uppercase tracking-widest text-[9px] font-extrabold flex items-center gap-1.5 leading-none">
        <Activity className="h-4 w-4 text-blue-600 animate-spin-slow" />
        <span>Titan HealthConnect Hospital Statistics Radar</span>
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        
        <div className="bg-white border border-slate-205 p-4.5 rounded-2xl shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Doctors</p>
          <div className="flex items-end justify-between mt-2.5">
            <span className="font-display font-bold text-2xl text-slate-900">50</span>
            <span className="text-[10px] bg-blue-50 text-blue-700 py-0.5 px-2 rounded font-bold">On Duty</span>
          </div>
        </div>

        <div className="bg-white border border-slate-205 p-4.5 rounded-2xl shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Staff</p>
          <div className="flex items-end justify-between mt-2.5">
            <span className="font-display font-bold text-2xl text-slate-900">120</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 py-0.5 px-2 rounded font-bold">Active shifts</span>
          </div>
        </div>

        <div className="bg-white border border-slate-205 p-4.5 rounded-2xl shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Registered Patients</p>
          <div className="flex items-end justify-between mt-2.5">
            <span className="font-display font-bold text-2xl text-slate-900">25,000</span>
            <span className="text-[10px] bg-blue-50 text-blue-700 py-0.5 px-2 rounded font-bold">Encrypted vaults</span>
          </div>
        </div>

        <div className="bg-white border border-slate-205 p-4.5 rounded-2xl shadow-sm hover:border-slate-300 transition-all flex flex-col justify-between">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Today's Appointments</p>
          <div className="flex items-end justify-between mt-2.5">
            <span className="font-display font-bold text-2xl text-blue-650">{320 + appointments.length}</span>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 py-0.5 px-2 rounded font-bold">Active Queue</span>
          </div>
        </div>

        <div className="bg-rose-50 border border-rose-205 p-4.5 rounded-2xl shadow-sm flex flex-col justify-between text-rose-950">
          <p className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">Emergency Cases</p>
          <div className="flex items-end justify-between mt-2.5">
            <span className="font-display font-bold text-2xl text-rose-700">{15 + sosAlerts.filter(s => s.status !== 'resolved').length}</span>
            <span className="text-[10px] bg-rose-600 text-white py-0.5 px-2 rounded font-bold animate-pulse">SOS Radar</span>
          </div>
        </div>

      </div>

      {/* EMERGENCY SOS DESPATCH COMPONENT ON ADMINISTRATIVE SIDE */}
      {sosAlerts.filter(s => s.status !== 'resolved').length > 0 && (
        <div className="bg-rose-100/50 border border-rose-200/80 p-5 rounded-3xl space-y-3 animate-pulse">
          <p className="font-extrabold text-xs text-rose-900 flex items-center gap-1.5 leading-none">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-ping" />
            <span>DISPATCH CENTER: CRITICAL ESCORT ALARM IN BOUND</span>
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sosAlerts.filter(s => s.status !== 'resolved').map(alert => (
              <div key={alert.id} className="bg-white p-3 rounded-xl border border-rose-200 shadow-sm flex justify-between items-center">
                <div className="space-y-1">
                  <p className="font-bold text-slate-900 text-xs">Patient: {alert.studentName} ({alert.studentId})</p>
                  <p className="text-[10px] text-slate-400">Location: <span className="underline font-bold text-rose-750">{alert.building} - Room {alert.room}</span></p>
                  <p className="text-[10px] text-slate-500 font-normal italic">Detail: "{alert.additionalDetails}"</p>
                </div>
                <button 
                  onClick={() => onResolveSOS(alert.id)}
                  className="bg-rose-600 hover:bg-rose-750 text-white text-[10px] font-bold py-1.5 px-3 rounded-lg"
                >
                  Resolve SOS Alert
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODULE ROUTE CHOOSER (Bento-tab design) */}
      <div className="bg-white border border-slate-200/50 rounded-2xl p-2 flex flex-wrap gap-1.5">
        <button 
          onClick={() => setActiveTab('analytics')}
          className={`py-2 px-3 rounded-xl font-bold transition-all ${activeTab === 'analytics' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          EHR Analytics Trend
        </button>
        <button 
          onClick={() => setActiveTab('appointments')}
          className={`py-2 px-3 rounded-xl font-bold transition-all ${activeTab === 'appointments' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Appointment Management
        </button>
        <button 
          onClick={() => setActiveTab('doctors')}
          className={`py-2 px-3 rounded-xl font-bold transition-all ${activeTab === 'doctors' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Doctor Management
        </button>
        <button 
          onClick={() => setActiveTab('patients')}
          className={`py-2 px-3 rounded-xl font-bold transition-all ${activeTab === 'patients' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Patient Registry
        </button>
        <button 
          onClick={() => setActiveTab('staff')}
          className={`py-2 px-3 rounded-xl font-bold transition-all ${activeTab === 'staff' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Staff & Shift Roster
        </button>
        <button 
          onClick={() => setActiveTab('billing')}
          className={`py-2 px-3 rounded-xl font-bold transition-all ${activeTab === 'billing' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Billing & Invoices Module
        </button>
        <button 
          onClick={() => { setActiveTab('records'); setSelectedApptForEdit(null); }}
          className={`py-2 px-3 rounded-xl font-bold transition-all ${activeTab === 'records' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
        >
          Medical Records Library
        </button>
        <button 
          onClick={() => setActiveTab('cardiac')}
          className={`py-2 px-3 rounded-xl font-bold transition-all text-rose-600 dark:text-rose-450 flex items-center gap-1.5 ${activeTab === 'cardiac' ? 'bg-rose-500 !text-white animate-pulse' : 'hover:bg-rose-50'}`}
        >
          <span>3D Cardiac Engine</span>
        </button>
      </div>

      {/* TAB CONTAINER VIEW */}
      <div className="bg-white border border-slate-200/50 rounded-3xl p-6 shadow-sm">
        
        {/* TAB 1: ANALYTICS CLINICAL TRENDS (Beautiful interactive CSS/SVG Chart) */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard 
            appointments={appointments}
            vitals={vitals}
            sosAlerts={sosAlerts}
            isDarkMode={isDarkMode}
          />
        )}

        {/* TAB 2: APPOINTMENT MANAGEMENT */}
        {activeTab === 'appointments' && (
          <div className="space-y-6 animate-fade-in text-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-display font-semibold text-base sm:text-lg text-slate-900Unified">Active Appointment consultations list</h3>
                <p className="text-xs text-slate-450">Filter upcoming, update treatment progress logs, click status values or cancelations</p>
              </div>
              <input 
                type="text" 
                placeholder="Search patient or reason..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 text-xs py-2 px-3 rounded-xl focus:outline-none focus:bg-white w-52"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-sans text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 uppercase text-[9px] font-bold tracking-widest text-slate-400">
                    <th className="py-2.5">Patient Info</th>
                    <th className="py-2.5">Date / Slot</th>
                    <th className="py-2.5">Reason / Concern</th>
                    <th className="py-2.5">Clinical Status</th>
                    <th className="py-2.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {appointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-slate-400 bg-slate-50 border border-slate-200 rounded-2xl">
                        No patient appointment entries booked yet.
                      </td>
                    </tr>
                  ) : (
                    appointments.filter(appt => 
                      appt.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      appt.reason.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((appt, idx) => (
                      <tr key={appt.id} className="border-b border-slate-100/60 hover:bg-slate-50/50">
                        <td className="py-3">
                          <p className="font-bold text-slate-900">{appt.studentName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">ID: {appt.studentId}</p>
                        </td>
                        <td className="py-3">
                          <p className="font-bold text-slate-800">{appt.date}</p>
                          <p className="text-[10px] text-slate-400">{appt.time}</p>
                        </td>
                        <td className="py-3 font-medium text-slate-600">
                          {appt.reason}
                          {appt.notes && (
                            <p className="text-[10px] text-blue-600 bg-blue-50/50 p-1 rounded border border-blue-100 mt-1">📝 Notes: "{appt.notes}"</p>
                          )}
                        </td>
                        <td className="py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                            appt.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' :
                            appt.status === 'checked-in' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                            appt.status === 'in-consultation' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                            appt.status === 'cancelled' ? 'bg-slate-50 text-slate-400 border-slate-200' :
                            'bg-amber-50 text-amber-700 border-amber-100 animate-pulse'
                          }`}>
                            {appt.status}
                          </span>
                        </td>
                        <td className="py-3 text-right">
                          <button 
                            onClick={() => {
                              setSelectedApptForEdit(appt);
                              setEditStatus(appt.status);
                              setEditNotes(appt.notes || "");
                            }}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1 px-3 rounded text-[10px]"
                          >
                            Edit Status
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DOCTOR MANAGEMENT (Allocate extra consulting hours) */}
        {activeTab === 'doctors' && (
          <div className="space-y-6 animate-fade-in text-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Roster of specialists */}
              <div className="md:col-span-2 space-y-3">
                <h3 className="font-display font-semibold text-slate-900 text-base">Practitioner Timings & Session Matrix</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {doctorsListState.map(doc => (
                    <div key={doc.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-start gap-3">
                      <img src={doc.avatarUrl} alt={doc.name} className="w-11 h-11 object-cover rounded-xl border border-slate-200" referrerPolicy="no-referrer" />
                      <div className="space-y-1">
                        <h4 className="font-bold text-slate-900">{doc.name}</h4>
                        <p className="text-[10px] text-blue-700 uppercase font-bold">{doc.specialty}</p>
                        <p className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Clock8 className="h-3 w-3" />
                          <span>{doc.timings}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Allocator Form */}
              <div className="bg-slate-50 border border-slate-250 p-5 rounded-2xl space-y-4">
                <h4 className="font-display font-bold text-slate-900 border-b border-slate-200 pb-2 flex items-center gap-1.5 text-xs sm:text-sm">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span>Allocate Consulting Hours</span>
                </h4>
                <p className="text-[10px] text-slate-400 leading-normal font-sans">Modify doctor active timing grids dynamically to support clinic surge or shifts schedule edits.</p>

                <form onSubmit={handleAllocateSlot} className="space-y-4 font-semibold text-slate-500">
                  <div>
                    <label className="block mb-1">Select Specialist Practitioner</label>
                    <select 
                      required
                      value={allocationDoctor}
                      onChange={(e) => setAllocationDoctor(e.target.value)}
                      className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl py-2 px-3"
                    >
                      <option value="">-- Choose Doctor --</option>
                      {doctorProfiles.map(d => (
                        <option key={d.id} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1">New Timing Slot Frame</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g., Mon-Sat 10:00 AM - 6:00 PM" 
                      value={allocationHours}
                      onChange={(e) => setAllocationHours(e.target.value)}
                      className="w-full text-xs sm:text-sm bg-white border border-slate-200 rounded-xl py-2 px-3"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-blue-600 text-white font-bold py-2 rounded-xl uppercase hover:bg-blue-700 shadow"
                  >
                    Update Doctor Roster Hours
                  </button>
                </form>
              </div>

            </div>
          </div>
        )}

        {/* TAB 4: PATIENT REGISTRY */}
        {activeTab === 'patients' && (
          <div className="space-y-6 animate-fade-in text-slate-800">
            <h3 className="font-display font-semibold text-base sm:text-lg text-slate-900">Registered Patient Directory Index</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vitals.map((v, i) => (
                <div key={v.id || i} className="p-4 bg-slate-50 border border-slate-205 rounded-2xl flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-900 text-sm">{v.studentName}</h4>
                      <span className="text-[10px] bg-slate-150 py-0.5 px-2 rounded font-mono">ID: {v.studentId}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-sans mt-1">Logged Complaint Symptoms: <strong className="text-slate-800">"{v.symptoms}"</strong></p>
                    <p className="text-[10px] text-slate-400 font-mono">Allergies Declared: <span className="text-rose-600 font-bold font-sans">{v.allergies}</span></p>
                  </div>
                  <div className="border-t border-slate-200 pt-2 mt-3 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                    <span>Temp Index: <strong>{v.temperature}°C</strong></span>
                    <button 
                      onClick={() => {
                        setRxId(v.studentId);
                        setRxName(v.studentName);
                        setActiveTab('records');
                      }}
                      className="text-blue-600 font-bold hover:underline"
                    >
                      Issue Digital Medication Rx ➔
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: STAFF & SHIFT ROSTER */}
        {activeTab === 'staff' && (
          <div className="space-y-4 animate-fade-in text-slate-800">
            <h3 className="font-display font-semibold text-base sm:text-lg text-slate-900">Clinical Nursing & Shift Staff Roster</h3>
            <p className="text-slate-450 leading-relaxed max-w-xl">Five primary university administrative and nursery operations staff on shift. Schedules auto synchronize daily.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {medicalStaffList.map(st => (
                <div key={st.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 hover:border-slate-350 transition-all">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{st.name}</p>
                      <p className="text-[10px] text-blue-700 font-bold">{st.role}</p>
                    </div>
                    <span className="text-[9px] bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded uppercase">Shift: {st.shift}</span>
                  </div>

                  <div className="space-y-1.5 text-[11px] text-slate-500 font-medium">
                    <p>Skill Area: <span className="font-bold text-slate-800">{st.department}</span></p>
                    <p>Experience: <span className="font-bold text-slate-800">{st.experience} Years</span></p>
                    <p className="text-[10px] text-slate-400 font-mono">{st.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 6: BILLING & INVOICES INSTANT REPORT MAKER */}
        {activeTab === 'billing' && (
          <div className="animate-fade-in">
            <PaymentSystem
              studentId="S10943"
              studentName="Maya Lin"
              patientEmail="maya.lin@titanhealthconnect.com"
              patientMobile="+91 99887 76655"
              appointments={appointments}
              prescriptions={prescriptions}
              isAdminView={true}
            />
          </div>
        )}

        {/* TAB 7: HISTORIC MEDICAL RECORDS LIBRARY */}
        {activeTab === 'records' && (
          <div className="space-y-6 animate-fade-in text-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Dynamic Digital Prescription Formulation */}
              <div className="bg-slate-50 border border-slate-210 p-5 rounded-3xl space-y-4">
                <h3 className="font-display font-semibold text-slate-900 border-b border-slate-200 pb-2 text-sm sm:text-base">デジタル処方箋: Issue Medical Prescription</h3>
                
                <form onSubmit={handleRxSubmitLocal} className="space-y-3 font-semibold text-slate-500">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block mb-1">Patient Name</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g., Maya Lin" 
                        value={rxName}
                        onChange={(e) => setRxName(e.target.value)}
                        className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl py-2 px-3"
                      />
                    </div>

                    <div>
                      <label className="block mb-1">Patient ID Code</label>
                      <input 
                        type="text" 
                        required
                        placeholder="e.g., S10943" 
                        value={rxId}
                        onChange={(e) => setRxId(e.target.value)}
                        className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl py-2 px-3"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1">Prescribed Medication Name</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g., Amoxicillin 500mg capsules" 
                      value={rxMeds}
                      onChange={(e) => setRxMeds(e.target.value)}
                      className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl py-2 px-3"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">Dosage Frequency</label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g., Twice daily after meals for 5 days" 
                      value={rxDose}
                      onChange={(e) => setRxDose(e.target.value)}
                      className="w-full text-xs font-medium bg-white border border-slate-200 rounded-xl py-2 px-3"
                    />
                  </div>

                  <div>
                    <label className="block mb-1">General Directives / Care Notes</label>
                    <textarea 
                      rows={2}
                      placeholder="e.g., Refrain from active workout routines during medication hours..." 
                      value={rxInst}
                      onChange={(e) => setRxInst(e.target.value)}
                      className="w-full text-xs bg-white border border-slate-200 p-2 rounded-xl focus:outline-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl uppercase text-center"
                  >
                    Commit Digital Prescription SKU
                  </button>
                </form>
              </div>

              {/* List of Registered Clinical history logs */}
              <div className="space-y-4">
                <h3 className="font-display font-semibold text-slate-900 text-sm tracking-wide">Sync Historical Clinical Logs</h3>
                
                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                  {vitals.map(v => (
                    <div key={v.id} className="p-3.5 bg-white border border-slate-205 rounded-xl space-y-1.5 hover:shadow-sm">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="font-bold text-slate-905">{v.studentName} ({v.studentId})</span>
                        <span className="font-mono text-slate-400">{new Date(v.timestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[11px] text-slate-505 font-medium leading-normal italic text-slate-650">Committed symptoms: "{v.symptoms}"</p>
                      <div className="flex justify-between text-[9px] font-mono text-slate-405 italic">
                        <span>Temperature logged: <strong>{v.temperature}°C</strong></span>
                        <span>Severity indicators: <strong className="text-rose-600 uppercase">{v.severity}</strong></span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 8: 3D ANATOMICAL CARDIAC ENGINE GRAPHICS */}
        {activeTab === 'cardiac' && (
          <div className="animate-fade-in bg-slate-950 rounded-3xl p-1 shadow-inner border border-slate-900">
            <HeartVisualizer3D />
          </div>
        )}

      </div>

      {/* APPOINTMENT STATUS EDIT DYNAMIC MODAL */}
      {selectedApptForEdit && (
        <div className="fixed inset-0 bg-slate-900/60 p-4 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in text-xs font-semibold text-slate-500">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-display font-bold text-slate-900 text-sm">Update Consultation Status</h4>
                <p className="text-[10px] text-slate-400 font-mono">Patient: {selectedApptForEdit.studentName} ({selectedApptForEdit.studentId})</p>
              </div>
              <button 
                onClick={() => setSelectedApptForEdit(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block mb-1.5 uppercase font-bold tracking-wider">Queue Roster Status</label>
                <select 
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value)}
                  className="w-full text-xs font-medium bg-slate-100 border border-slate-200 rounded-xl py-2 px-3 focus:outline-none"
                >
                  <option value="pending">pending (Waiting in lobby)</option>
                  <option value="checked-in">checked-in (Workload triage ready)</option>
                  <option value="in-consultation">in-consultation (With doctor)</option>
                  <option value="completed">completed (Consultation complete)</option>
                  <option value="cancelled">cancelled (Patient cancelled)</option>
                </select>
              </div>

              <div>
                <label className="block mb-1.5 uppercase font-bold tracking-wider">Clinical physician notes</label>
                <textarea 
                  rows={3}
                  placeholder="e.g., Migraine severity resolved with local comfort pills. Instructed 48h active bed rest check..." 
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full text-xs bg-slate-100 border border-slate-200 p-2.5 rounded-xl focus:outline-none focus:bg-white focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <button 
                type="button"
                onClick={() => {
                  onUpdateAppointmentStatus(selectedApptForEdit.id, editStatus, editNotes);
                  setSelectedApptForEdit(null);
                  alert("Successfully synchronized consultant parameters directly in campus database.");
                }}
                className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl uppercase hover:bg-blue-700 shadow"
              >
                Commit Clinic Parameters
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
