import React, { useState, useEffect } from "react";
import { 
  HeartPulse, 
  Flame, 
  Clock, 
  Info, 
  Shield, 
  ArrowRight, 
  User,
  Heart,
  RefreshCw,
  Sparkles,
  Users,
  Sun,
  Moon,
  Bell
} from "lucide-react";
import { AnimatePresence } from "motion/react";
import { Appointment, PatientVital, SOSAlert, Prescription, TriageResult } from "./types";
import LandingPage from "./components/LandingPage";
import PatientPortal from "./components/PatientPortal";
import AdminPortal from "./components/AdminPortal";
import VoiceAssistant from "./components/VoiceAssistant";
import NotificationCenter from "./components/NotificationCenter";
import PatientAuth from "./components/PatientAuth";
import TitanLogo from "./components/TitanLogo";

export default function App() {
  // Global States
  const [currentUser, setCurrentUser] = useState<any | null>(() => {
    const saved = localStorage.getItem("titan_auth_user");
    return saved ? JSON.parse(saved) : null;
  });
  const [currentRole, setCurrentRole] = useState<'student' | 'staff'>('student');
  const [studentId, setStudentId] = useState<string>('S10943');
  const [studentName, setStudentName] = useState<string>('Maya Lin');
  const [studentAllergies, setStudentAllergies] = useState<string>('Penicillin');
  
  // Custom states matching prompt requirements
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [showNotifications, setShowNotifications] = useState<boolean>(false);

  // Synchronise logged in patient profile
  useEffect(() => {
    if (currentUser) {
      setStudentId(currentUser.id);
      setStudentName(currentUser.fullName);
      setStudentAllergies(currentUser.allergies || "None");
      setPatientDob(currentUser.dob || "2004-05-14");
      setPatientGender(currentUser.gender || "Female");
      setPatientEmail(currentUser.email || "guest@titan.com");
      setPatientMobile(currentUser.mobile || "+91 99000 00000");
      setPatientCity(currentUser.city || "Bengaluru");
    } else {
      // Sandbox default guests parameters
      setStudentId('S10943');
      setStudentName('Maya Lin');
      setStudentAllergies('Penicillin');
      setPatientDob('2004-05-14');
      setPatientGender('Female');
      setPatientEmail('maya.lin@titanhealthconnect.com');
      setPatientMobile('+91 99887 76655');
      setPatientCity('Bengaluru');
    }
  }, [currentUser]);

  // Apply dark mode theme class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);
  
  // Demographics Profile settings
  const [patientDob, setPatientDob] = useState<string>('2004-05-14');
  const [patientGender, setPatientGender] = useState<string>('Female');
  const [patientEmail, setPatientEmail] = useState<string>('maya.lin@titanhealthconnect.com');
  const [patientMobile, setPatientMobile] = useState<string>('+91 99887 76655');
  const [patientCity, setPatientCity] = useState<string>('Bengaluru');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [vitals, setVitals] = useState<PatientVital[]>([]);
  const [sosAlerts, setSosAlerts] = useState<SOSAlert[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  
  const [loading, setLoading] = useState<boolean>(true);
  const [isPolling, setIsPolling] = useState<boolean>(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // AI Triage Response states
  const [triageLoading, setTriageLoading] = useState(false);
  const [triageResponse, setTriageResponse] = useState<TriageResult | null>(null);

  // Global UI Overrides
  const [studentViewMode, setStudentViewMode] = useState<'thrine-landing' | 'portal-dashboard'>('thrine-landing');
  const [showSosGlobalModal, setShowSosGlobalModal] = useState(false);
  const [localActiveSos, setLocalActiveSos] = useState<SOSAlert | null>(null);
  const [sosSuccessMessage, setSosSuccessMessage] = useState<string | null>(null);

  // Emergency block choices
  const campusBuildings = [
    "Whitefield Research Block C",
    "Outer Ring Road Campus F",
    "Titan Residential Quarters Alpha",
    "Healthcare Annex Complex",
    "Central Diagnostic Laboratory",
    "Nursery Quad Corridor",
    "Titan Medical Lounge Wing"
  ];

  // Load database dynamically from full-stack API endpoints
  const fetchAllData = async (showSilently = false) => {
    if (!showSilently) setLoading(true);
    try {
      const res = await fetch("/api/db");
      if (!res.ok) throw new Error("Synchronization delay with campus server.");
      const data = await res.json();
      
      setAppointments(data.appointments || []);
      setVitals(data.vitals || []);
      setSosAlerts(data.sosAlerts || []);
      setPrescriptions(data.prescriptions || []);
      
      // Auto-detect if this client has an active SOS dispatch trigger
      const activeSos = (data.sosAlerts || []).find(
        (s: SOSAlert) => s.studentId === studentId && s.status !== 'resolved'
      );
      if (activeSos) {
        setLocalActiveSos(activeSos);
      } else {
        setLocalActiveSos(null);
      }
      setErrorStatus(null);
    } catch (err: any) {
      console.error(err);
      setErrorStatus("Synchronisation Offline: Operating with local virtual models.");
    } finally {
      if (!showSilently) setLoading(false);
    }
  };

  // Synchronise databases every 5 seconds for live simulation feedback
  useEffect(() => {
    fetchAllData();
    let interval: any;
    if (isPolling) {
      interval = setInterval(() => {
        fetchAllData(true);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isPolling, studentId]);

  // Handler for booking custom consultation
  const handleBookingSubmit = async (apptData: {
    reason: string;
    date: string;
    time: string;
    doctorName: string;
    dept: string;
    dob: string;
    gender: string;
    email: string;
    mobile: string;
    city: string;
    historyNotes: string;
  }) => {
    try {
      // Pre-fill profile updates from the form input
      setStudentName(studentName || apptData.email.split("@")[0]);
      if (apptData.dob) setPatientDob(apptData.dob);
      if (apptData.gender) setPatientGender(apptData.gender);
      if (apptData.email) setPatientEmail(apptData.email);
      if (apptData.mobile) setPatientMobile(apptData.mobile);
      if (apptData.city) setPatientCity(apptData.city);
      if (apptData.historyNotes) setStudentAllergies(apptData.historyNotes);

      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: studentName,
          studentId: studentId,
          reason: `${apptData.doctorName} (${apptData.dept}) - ${apptData.reason}`,
          date: apptData.date,
          time: apptData.time
        })
      });

      if (!res.ok) throw new Error("Network booking failure.");
      await res.json();
      
      alert(`Success! Consultation reserved. Dr. ${apptData.doctorName} is registered. View live status on your patient portal dashboard.`);
      setStudentViewMode('portal-dashboard');
      await fetchAllData(true);
    } catch (err: any) {
      alert("Registration error: " + err.message);
    }
  };

  // Log vitals only
  const handleLogVitalsOnly = async (symptoms: string, temp: string, heart: string, allergies: string) => {
    try {
      const vRes = await fetch("/api/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          studentId,
          symptoms: symptoms,
          temperature: parseFloat(temp) || 37.0,
          heartRate: parseInt(heart) || 75,
          allergies: allergies || "None declared",
          severity: parseFloat(temp) > 38.3 ? "moderate" : "normal"
        })
      });

      if (!vRes.ok) throw new Error("Could not log vitals state.");
      await vRes.json();
      
      alert("Vitals metrics registered! Synchronized health status logs on index.");
      await fetchAllData(true);
    } catch (err: any) {
      alert("Action failed: " + err.message);
    }
  };

  // Run server Gemini AI symptoms triage
  const handleRunAiTriage = async (symptoms: string, temp: string, heart: string, allergies: string) => {
    setTriageLoading(true);
    setTriageResponse(null);

    try {
      // Log vitals first
      const vRes = await fetch("/api/vitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          studentId,
          symptoms: symptoms,
          temperature: parseFloat(temp) || 37.0,
          heartRate: parseInt(heart) || 75,
          allergies: allergies || "None",
          severity: parseFloat(temp) > 38.3 ? "moderate" : "normal"
        })
      });
      const savedVital = await vRes.json();

      // Trigger Gemini Clinical assessment
      const tRes = await fetch("/api/gemini/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          symptoms: symptoms,
          temperature: temp,
          allergies: allergies
        })
      });

      if (tRes.ok) {
        const triageData: TriageResult = await tRes.json();
        setTriageResponse(triageData);

        // Update logged vital severity based on AI determination
        if (triageData.urgency !== 'normal') {
          await fetch(`/api/appointments/update-severity`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ vitalId: savedVital.id, severity: triageData.urgency })
          }).catch(() => {});
        }
      } else {
        // Fallback
        setTriageResponse({
          disclaimer: "Operational triage fallback summary. Check real practitioners coordinates always.",
          urgency: "moderate",
          summary: "A general clinical triage check flags potential temperature fluctuations.",
          homeCare: "1. Stay hydrated.\n2. Apply cooling wet compressions.\n3. Log vitals trend charts again tomorrow.",
          shouldTriggerSOS: parseFloat(temp) > 38.5
        });
      }
      await fetchAllData(true);
    } catch (err: any) {
      alert("Triage error: " + err.message);
    } finally {
      setTriageLoading(false);
    }
  };

  // Trigger ambulance SOS
  const handleTriggerSOS = async (building: string, room: string, details: string) => {
    try {
      const res = await fetch("/api/sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          studentId,
          building: building,
          room: room,
          additionalDetails: details || "Distress alert generated by patient console."
        })
      });

      if (!res.ok) throw new Error("SOS protocol transmission failed.");
      const triageSos = await res.json();
      setLocalActiveSos(triageSos);
      
      setSosSuccessMessage("🚨 RED ALERT LOGGED: Medical escort teams & campus dispatchers are heading to your location!");
      setTimeout(() => setSosSuccessMessage(null), 7000);
      await fetchAllData(true);
    } catch (err: any) {
      alert("SOS Dispatch failed: " + err.message);
    }
  };

  // Cancel / Resolve SOS
  const handleCancelSOS = async (id: string) => {
    try {
      const res = await fetch(`/api/sos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "resolved",
          resolvedBy: "Campus Dispatch Desk"
        })
      });
      if (!res.ok) throw new Error("Resolve command rejected by server.");
      setLocalActiveSos(null);
      alert("Emergency SOS resolved. First responders notified of safety status.");
      await fetchAllData(true);
    } catch (err: any) {
      alert("Cancellation error: " + err.message);
    }
  };

  // Admin: Update Appointment Status
  const handleUpdateAppointmentStatus = async (id: string, status: any, notes: string) => {
    try {
      const res = await fetch(`/api/appointments/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: status,
          notes: notes
        })
      });
      if (!res.ok) throw new Error("Treatment status update rejected.");
      await fetchAllData(true);
    } catch (err: any) {
      alert("Database error: " + err.message);
    }
  };

  // Admin: Issue prescription
  const handleIssuePrescription = async (rxData: {
    studentId: string;
    studentName: string;
    medication: string;
    dosage: string;
    instructions: string;
  }) => {
    try {
      const res = await fetch("/api/prescriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: rxData.studentName,
          studentId: rxData.studentId,
          doctorName: "Dr. Elena Mercer",
          medication: rxData.medication,
          dosage: rxData.dosage,
          instructions: rxData.instructions || "Take as directed."
        })
      });
      if (!res.ok) throw new Error("Prescription database failure.");
      await fetchAllData(true);
    } catch (err: any) {
      alert("Database error: " + err.message);
    }
  };

  // Profile update handler
  const handleUpdateProfile = async (updates: {
    studentName?: string;
    studentAllergies?: string;
    dob?: string;
    gender?: string;
    email?: string;
    mobile?: string;
    city?: string;
    bloodGroup?: string;
    conditions?: string;
    emergencyName?: string;
    emergencyPhone?: string;
    country?: string;
    state?: string;
    pincode?: string;
    address?: string;
  }) => {
    if (updates.studentName !== undefined) setStudentName(updates.studentName);
    if (updates.studentAllergies !== undefined) setStudentAllergies(updates.studentAllergies);
    if (updates.dob !== undefined) setPatientDob(updates.dob);
    if (updates.gender !== undefined) setPatientGender(updates.gender);
    if (updates.email !== undefined) setPatientEmail(updates.email);
    if (updates.mobile !== undefined) setPatientMobile(updates.mobile);
    if (updates.city !== undefined) setPatientCity(updates.city);

    if (currentUser) {
      try {
        const payload = {
          id: currentUser.id,
          fullName: updates.studentName !== undefined ? updates.studentName : currentUser.fullName,
          dob: updates.dob !== undefined ? updates.dob : currentUser.dob,
          gender: updates.gender !== undefined ? updates.gender : currentUser.gender,
          mobile: updates.mobile !== undefined ? updates.mobile : currentUser.mobile,
          email: updates.email !== undefined ? updates.email : currentUser.email,
          city: updates.city !== undefined ? updates.city : currentUser.city,
          allergies: updates.studentAllergies !== undefined ? updates.studentAllergies : currentUser.allergies,
          bloodGroup: updates.bloodGroup !== undefined ? updates.bloodGroup : currentUser.bloodGroup,
          conditions: updates.conditions !== undefined ? updates.conditions : currentUser.conditions,
          emergencyName: updates.emergencyName !== undefined ? updates.emergencyName : currentUser.emergencyName,
          emergencyPhone: updates.emergencyPhone !== undefined ? updates.emergencyPhone : currentUser.emergencyPhone,
          country: updates.country !== undefined ? updates.country : currentUser.country,
          state: updates.state !== undefined ? updates.state : currentUser.state,
          pincode: updates.pincode !== undefined ? updates.pincode : currentUser.pincode,
          address: updates.address !== undefined ? updates.address : currentUser.address,
        };

        const res = await fetch("/api/auth/profile/update", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user);
          localStorage.setItem("titan_auth_user", JSON.stringify(data.user));
        }
      } catch (err) {
        console.error("Clinical sync delay on profile update:", err);
      }
    }
  };

  // Voice command navigation integrations
  const handleVoiceNavigate = (view: 'thrine-landing' | 'portal-dashboard' | 'admin-dashboard', tab?: string) => {
    if (view === 'thrine-landing') {
      setCurrentRole('student');
      setStudentViewMode('thrine-landing');
    } else if (view === 'portal-dashboard') {
      setCurrentRole('student');
      setStudentViewMode('portal-dashboard');
      if (tab) {
        setTimeout(() => {
          const event = new CustomEvent('voice-switch-tab', { detail: { tab } });
          window.dispatchEvent(event);
        }, 150);
      }
    } else if (view === 'admin-dashboard') {
      setCurrentRole('staff');
      if (tab) {
        setTimeout(() => {
          const event = new CustomEvent('voice-switch-tab', { detail: { tab } });
          window.dispatchEvent(event);
        }, 150);
      }
    }
  };

  const handleVoiceSearchDoctors = (query: string) => {
    setTimeout(() => {
      const event = new CustomEvent('voice-search-doctors', { detail: { query } });
      window.dispatchEvent(event);
    }, 150);
  };

  const handleVoiceSearchPatients = (query: string) => {
    setTimeout(() => {
      const event = new CustomEvent('voice-search-patients', { detail: { query } });
      window.dispatchEvent(event);
    }, 150);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 dark:text-slate-200 text-slate-800 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col justify-between transition-colors duration-200" id="titan-healthconnect-root">
      
      {/* Decorative top identity strip */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-650 w-full" />

      {/* Synchronisation Status Bar / Offline warning indicators */}
      {errorStatus && (
        <div className="bg-amber-500 text-white py-2 px-4 text-center text-xs font-bold font-mono tracking-wider flex items-center justify-center gap-2 relative z-50 shadow-inner" id="synchronize-offline-strip">
          <Info className="h-4 w-4 animate-pulse shrink-0" />
          <span>{errorStatus} Testing simulation database limits locally.</span>
        </div>
      )}

      {/* Real-time RED SOS dispatcher notification banner (global) */}
      {sosSuccessMessage && (
        <div className="bg-rose-600 text-white py-3.5 px-6 text-center text-xs sm:text-sm font-extrabold tracking-wider shadow-xl flex flex-col sm:flex-row items-center justify-center gap-3 animate-pulse border-b border-rose-700 relative z-50">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          <span>{sosSuccessMessage}</span>
          <button 
            onClick={() => setSosSuccessMessage(null)} 
            className="bg-rose-800 text-white px-2 py-0.5 rounded text-[10px] uppercase font-bold"
          >
            Acknowledge Dispatch
          </button>
        </div>
      )}

      {/* Live SOS tracking banner in case student has active dispatches */}
      {localActiveSos && studentViewMode === 'portal-dashboard' && (
        <div className="bg-rose-50 border-b border-rose-200 text-rose-950 py-3 px-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Flame className="h-4.5 w-4.5 text-rose-600 animate-pulse" />
            <p className="font-bold">
              Ambulance En Route: Dispatched to <span className="underline font-mono">{localActiveSos.building} Room {localActiveSos.room}</span>. Response coordinates tracked.
            </p>
          </div>
          <button 
            onClick={() => handleCancelSOS(localActiveSos.id)}
            className="bg-white hover:bg-rose-100 text-rose-800 py-1 px-3.5 border border-rose-300 rounded-lg font-bold"
          >
            Cancel Dispatch / All Clear
          </button>
        </div>
      )}

      {/* MAIN PREMIUM HEADER */}
      <header className="sticky top-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-205/65 dark:border-slate-800 z-40 transition-all shadow-sm" id="main-hospital-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Hospital Logo */}
          <div 
            onClick={() => setStudentViewMode('thrine-landing')}
            className="flex items-center gap-3 cursor-pointer select-none group"
            id="header-hospital-logo"
          >
            <TitanLogo className="w-12 h-12 shadow-lg shadow-black/20 group-hover:scale-105 transition-all duration-200" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-display font-extrabold text-slate-950 dark:text-white text-lg tracking-tight">Titan HealthConnect</span>
                <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800 text-[9px] font-bold px-2 py-0.2 rounded-full uppercase tracking-wider">Center</span>
              </div>
              <p className="text-[10px] text-slate-400 font-sans font-semibold leading-none">Connecting Patients with Quality Healthcare</p>
            </div>
          </div>

          {/* Controller Modes & Active SOS trigger */}
          <div className="flex items-center gap-3">
            
            {/* Rapid SOS Trigger shortcut */}
            {currentRole === 'student' && !localActiveSos && (
              <button 
                onClick={() => setShowSosGlobalModal(true)}
                className="bg-rose-600 hover:bg-rose-700 text-white text-[11px] sm:text-xs font-bold py-2 px-3.5 rounded-xl flex items-center gap-2 shadow-lg shadow-rose-600/15 cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Flame className="w-4 h-4 animate-bounce shrink-0" />
                <span className="hidden sm:inline">Rapid Emergency SOS</span>
              </button>
            )}

            {/* Theme Toggler Button */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-605 dark:text-slate-300 transition-colors cursor-pointer"
              title={isDarkMode ? "Switch to Light Mode" : "Switch to Eyesafe Dark Mode"}
            >
              {isDarkMode ? <Sun className="w-4.5 h-4.5 text-amber-500 animate-spin-slow" /> : <Moon className="w-4.5 h-4.5 text-slate-600" />}
            </button>

            {/* Live Alerts Bell Icon */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                  showNotifications 
                    ? 'bg-blue-500/10 border-blue-505/30 text-blue-500' 
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300'
                }`}
                title="Toggle Notifications Center"
              >
                <Bell className="w-4.5 h-4.5 animate-pulse" />
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
              </button>

              {/* Float panel notifications */}
              <AnimatePresence>
                {showNotifications && (
                  <div className="absolute right-0 mt-3 z-50">
                    <NotificationCenter 
                      isDarkMode={isDarkMode} 
                      onClose={() => setShowNotifications(false)} 
                    />
                  </div>
                )}
              </AnimatePresence>
            </div>

            {/* Active Signed-In Patient Capsule */}
            {currentUser && currentRole === 'student' && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 rounded-xl text-xs font-semibold border border-blue-105">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                <span>{currentUser.fullName}</span>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 px-1 py-0.2 rounded font-mono font-bold">{currentUser.id}</span>
                <button 
                  onClick={() => {
                    setCurrentUser(null);
                    localStorage.removeItem("titan_auth_user");
                    setStudentViewMode('thrine-landing');
                  }}
                  className="ml-1.5 py-0.5 px-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[9px] uppercase font-bold transition-all cursor-pointer"
                  title="Sign Out of Titan HealthConnect Session"
                >
                  Sign Out
                </button>
              </div>
            )}

            {/* Quick-Shift client selection tabs */}
            <div className="bg-slate-105 dark:bg-slate-900/60 p-1 rounded-xl flex items-center gap-1 border border-slate-200 dark:border-slate-800" id="role-selector">
              <button 
                onClick={() => {
                  setCurrentRole('student');
                  setStudentViewMode('thrine-landing');
                }}
                className={`py-1.5 px-3 rounded-lg font-bold text-[10px] uppercase tracking-wide transition-all cursor-pointer ${currentRole === 'student' && studentViewMode === 'thrine-landing' ? 'bg-white dark:bg-slate-800 text-blue-750 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-700 dark:hover:text-amber-500'}`}
              >
                Guest Landing
              </button>
              <button 
                onClick={() => {
                  setCurrentRole('student');
                  setStudentViewMode('portal-dashboard');
                }}
                className={`py-1.5 px-3 rounded-lg font-bold text-[10px] uppercase tracking-wide transition-all cursor-pointer ${currentRole === 'student' && studentViewMode === 'portal-dashboard' ? 'bg-white dark:bg-slate-800 text-blue-750 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-700 dark:hover:text-amber-500'}`}
              >
                Patient Portal
              </button>
              <button 
                onClick={() => {
                  setCurrentRole('staff');
                }}
                className={`py-1.5 px-3 rounded-lg font-bold text-[10px] uppercase tracking-wide transition-all cursor-pointer ${currentRole === 'staff' ? 'bg-white dark:bg-slate-800 text-blue-750 dark:text-white shadow-sm' : 'text-slate-400 hover:text-slate-700 dark:hover:text-amber-500'}`}
              >
                Staff Admin
              </button>
            </div>

          </div>

        </div>
      </header>

      {/* MAIN CONTAINER CONTENT */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow">
        
        {currentRole === 'student' ? (
          <>
            {studentViewMode === 'thrine-landing' ? (
              <LandingPage 
                onBookAppointment={handleBookingSubmit}
                onLaunchPortal={(tab) => {
                  setStudentViewMode('portal-dashboard');
                }}
                onSwitchRole={(role) => setCurrentRole(role)}
                currentRole={currentRole}
              />
            ) : (
              currentUser ? (
                <PatientPortal 
                  studentName={studentName}
                  studentId={studentId}
                  studentAllergies={studentAllergies}
                  patientDob={patientDob}
                  patientGender={patientGender}
                  patientEmail={patientEmail}
                  patientMobile={patientMobile}
                  patientCity={patientCity}
                  onUpdateProfile={handleUpdateProfile}
                  appointments={appointments}
                  vitals={vitals}
                  prescriptions={prescriptions}
                  triageLoading={triageLoading}
                  triageResponse={triageResponse}
                  onRunAiTriage={handleRunAiTriage}
                  onLogVitalsOnly={handleLogVitalsOnly}
                  onTriggerSOS={handleTriggerSOS}
                  localActiveSos={localActiveSos}
                  onCancelSOS={handleCancelSOS}
                  campusBuildings={campusBuildings}
                />
              ) : (
                <PatientAuth 
                  onAuthSuccess={(user) => {
                    setCurrentUser(user);
                    localStorage.setItem("titan_auth_user", JSON.stringify(user));
                    setStudentViewMode('portal-dashboard');
                  }}
                  onBackToGuest={() => {
                    setStudentViewMode('thrine-landing');
                  }}
                  isDarkMode={isDarkMode}
                />
              )
            )}
          </>
        ) : (
          <AdminPortal 
            appointments={appointments}
            vitals={vitals}
            sosAlerts={sosAlerts}
            prescriptions={prescriptions}
            onUpdateAppointmentStatus={handleUpdateAppointmentStatus}
            onIssuePrescription={handleIssuePrescription}
            onResolveSOS={handleCancelSOS}
            isDarkMode={isDarkMode}
          />
        )}

      </main>

      {/* FOOTER SECTION */}
      <footer className="bg-slate-900 text-white py-12 border-t border-slate-800" id="global-hospital-footer">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <TitanLogo className="w-10 h-10 shadow shadow-black/60" />
              <span className="font-display font-extrabold text-base tracking-tight text-white">Titan HealthConnect</span>
            </div>
            <p className="text-xs text-slate-400 leading-normal font-sans">
              Connecting Patients with Quality Healthcare. Certified university medicine solutions, diagnostic logs, and physical coordinate-tracked paramedic escorts.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-bold text-white text-xs uppercase tracking-wider">Quick Links</h4>
            <ul className="space-y-1.5 text-xs text-slate-400 font-sans">
              <li><button onClick={() => { setCurrentRole('student'); setStudentViewMode('thrine-landing'); }} className="hover:text-blue-400">Home Landing</button></li>
              <li><a href="#about-us" className="hover:text-blue-400">About Clinical Center</a></li>
              <li><a href="#services-grid" className="hover:text-blue-400">Services Pillars</a></li>
              <li><a href="#doctors-crew" className="hover:text-blue-400">Practitioners Roster</a></li>
              <li><button onClick={() => { setCurrentRole('student'); setStudentViewMode('portal-dashboard'); }} className="hover:text-blue-400">Patient Dashboard</button></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="font-display font-bold text-white text-xs uppercase tracking-wider">Direct Coordinates</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Titan HealthConnect Medical Center, Whitefield, Bengaluru, Karnataka, India
            </p>
            <p className="text-xs text-slate-400 font-mono">support@titanhealthconnect.com</p>
          </div>

          <div className="space-y-4">
            <h4 className="font-display font-bold text-white text-xs uppercase tracking-wider">Continuous Helpline</h4>
            <div className="text-xs text-rose-450 bg-rose-950/40 p-3.5 border border-rose-900/40 rounded-xl font-mono">
              <p className="font-bold font-sans text-rose-300">24/7 Red Alert Hotline</p>
              <p className="font-extrabold tracking-widest text-[13px] mt-1 text-white underline">+91 1800-555-911</p>
            </div>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-slate-800 pt-6 mt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-450 font-sans">
          <p>© {new Date().getFullYear()} Titan HealthConnect Medical Center. All Rights Reserved.</p>
          <p className="mt-2 sm:mt-0 italic text-slate-500">Connecting Patients with Quality Healthcare | Secure Patient Vault</p>
        </div>
      </footer>

      {/* RED ALERT SOS GLOBAL MODAL TRIGGER */}
      {showSosGlobalModal && (
        <div className="fixed inset-0 bg-slate-900/60 p-4 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in text-xs font-semibold text-slate-500">
          <div className="bg-white border border-rose-200 rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-4">
            
            <div className="flex justify-between items-center bg-rose-600 text-white rounded-2xl p-4">
              <div>
                <h4 className="font-display font-extrabold text-white text-sm sm:text-base">1-Click Emergency SOS</h4>
                <p className="text-[10px] text-rose-205">Triggers immediate paramedic coordinates dispatch</p>
              </div>
              <button 
                onClick={() => setShowSosGlobalModal(false)}
                className="text-white hover:text-slate-205 font-bold"
              >
                ✕ Close
              </button>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const b = (e.currentTarget.elements.namedItem("building") as HTMLSelectElement).value;
              const r = (e.currentTarget.elements.namedItem("room") as HTMLInputElement).value;
              const d = (e.currentTarget.elements.namedItem("details") as HTMLInputElement).value;
              
              if (!b || !r) {
                alert("Please select your current Building and specify your Room.");
                return;
              }
              await handleTriggerSOS(b, r, d);
              setShowSosGlobalModal(false);
            }} className="space-y-4 font-semibold text-slate-500">
              <div>
                <label className="block mb-1.5 uppercase font-bold tracking-wider">Select Present Campus Block</label>
                <select 
                  required
                  name="building"
                  className="w-full text-xs font-medium bg-slate-100 border border-slate-200 rounded-xl py-2.5 px-3 focus:outline-none"
                >
                  <option value="">-- Choose Coordinates --</option>
                  {campusBuildings.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1.5 uppercase font-bold tracking-wider">Room / Area details</label>
                <input 
                  type="text" 
                  name="room"
                  required
                  placeholder="e.g., Block B Room 402, Gym lounge backdesk" 
                  className="w-full text-xs sm:text-sm bg-slate-100 border border-slate-200 rounded-xl py-2.5 px-3"
                />
              </div>

              <div>
                <label className="block mb-1.5 uppercase font-bold tracking-wider">Physical complaint / notes</label>
                <input 
                  type="text" 
                  name="details"
                  placeholder="e.g., Fainting limits, heavy breathing difficulty, clinical cut" 
                  className="w-full text-xs sm:text-sm bg-slate-100 border border-slate-200 rounded-xl py-2.5 px-3"
                />
              </div>

              <button 
                type="submit"
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3.5 rounded-2xl uppercase tracking-wider text-center"
              >
                Launch Coordinate-tracked SOS Ambulance
              </button>
            </form>

          </div>
        </div>
      )}

      {/* GLOBAL WAKE WORD ACTIVE VOICE ASSISTANT */}
      <VoiceAssistant 
        currentRole={currentRole}
        onNavigate={handleVoiceNavigate}
        onSearchDoctors={handleVoiceSearchDoctors}
        onSearchPatients={handleVoiceSearchPatients}
        onToggleDarkMode={() => setIsDarkMode(prev => !prev)}
        onTriggerSOSFast={() => handleTriggerSOS("Campus Annex Lounge", "Diagnostic Room B", "Voice command automated SOS dispatch")}
        isDarkMode={isDarkMode}
      />

    </div>
  );
}
