import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  HeartPulse, 
  Activity, 
  Calendar, 
  Clock, 
  UserCheck, 
  Sparkles, 
  MapPin, 
  Phone, 
  Mail, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Heart, 
  Users, 
  Building, 
  Flame, 
  ArrowRight,
  Stethoscope,
  Info
} from "lucide-react";
import { 
  doctorProfiles, 
  medicalDepartments, 
  mockTestimonials, 
  faqItems 
} from "../data/medicalData";
import TitanLogo from "./TitanLogo";
import DoctorPatientIllustration from "./DoctorPatientIllustration";

interface LandingPageProps {
  onBookAppointment: (apptData: {
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
  }) => void;
  onLaunchPortal: (tab?: string) => void;
  onSwitchRole: (role: 'student' | 'staff') => void;
  currentRole: 'student' | 'staff';
}

export default function LandingPage({
  onBookAppointment,
  onLaunchPortal,
  onSwitchRole,
  currentRole
}: LandingPageProps) {
  // Search & Filter state for Doctors
  const [docSearch, setDocSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedLang, setSelectedLang] = useState("all");

  // Voice command synchronization for doctor search and appointment booking triggers
  React.useEffect(() => {
    const handleVoiceSearch = (e: any) => {
      const q = e.detail.query || "";
      setDocSearch(q);
      
      const lower = q.toLowerCase();
      if (lower.includes("cardiolog") || lower.includes("cardiac") || lower.includes("heart") || lower.includes("cardio")) {
        setSelectedDept("Cardiology");
        setBookingDept("Cardiology");
        const doc = doctorProfiles.find(d => d.department === "Cardiology");
        if (doc) setBookingDoctor(doc.name);
      } else if (lower.includes("dermatolog") || lower.includes("skin") || lower.includes("derma")) {
        setSelectedDept("Dermatology");
        setBookingDept("Dermatology");
        const doc = doctorProfiles.find(d => d.department === "Dermatology");
        if (doc) setBookingDoctor(doc.name);
      } else if (lower.includes("neurolog") || lower.includes("brain") || lower.includes("neuro")) {
        setSelectedDept("Neurology");
        setBookingDept("Neurology");
        const doc = doctorProfiles.find(d => d.department === "Neurology");
        if (doc) setBookingDoctor(doc.name);
      } else if (lower.includes("pediatric") || lower.includes("child") || lower.includes("pedi")) {
        setSelectedDept("Pediatrics");
        setBookingDept("Pediatrics");
        const doc = doctorProfiles.find(d => d.department === "Pediatrics");
        if (doc) setBookingDoctor(doc.name);
      } else if (lower.includes("dentist") || lower.includes("dental") || lower.includes("tooth") || lower.includes("dentistry")) {
        setSelectedDept("Dentistry");
        setBookingDept("Dentistry");
        const doc = doctorProfiles.find(d => d.department === "Dentistry");
        if (doc) setBookingDoctor(doc.name);
      } else if (lower.includes("orthopedic") || lower.includes("bone") || lower.includes("ortho")) {
        setSelectedDept("Orthopedics");
        setBookingDept("Orthopedics");
        const doc = doctorProfiles.find(d => d.department === "Orthopedics");
        if (doc) setBookingDoctor(doc.name);
      } else if (lower === "") {
        setSelectedDept("all");
      }
    };
    window.addEventListener('voice-search-doctors', handleVoiceSearch);
    return () => window.removeEventListener('voice-search-doctors', handleVoiceSearch);
  }, []);

  // Accordion state for FAQs
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  // Form Booking State
  const [patientName, setPatientName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Female");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [city, setCity] = useState("Bengaluru");
  const [bookingDept, setBookingDept] = useState("General Medicine");
  const [bookingDoctor, setBookingDoctor] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [bookingTime, setBookingTime] = useState("09:00 AM");
  const [visitReason, setVisitReason] = useState("");
  const [medicalHistory, setMedicalHistory] = useState("");

  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Filtered Doctors
  const filteredDoctors = doctorProfiles.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(docSearch.toLowerCase()) || 
                          doc.specialty.toLowerCase().includes(docSearch.toLowerCase());
    const matchesDept = selectedDept === "all" || doc.department === selectedDept;
    const matchesLang = selectedLang === "all" || doc.languages.includes(selectedLang);
    return matchesSearch && matchesDept && matchesLang;
  });

  const handleLocalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName.trim() || !bookingDate || !bookingDoctor) {
      alert("Please perform standard booking validation: Name, Doctor, and Appointment Date are required.");
      return;
    }
    
    onBookAppointment({
      reason: visitReason || `Consultation request for ${bookingDept}`,
      date: bookingDate,
      time: bookingTime,
      doctorName: bookingDoctor,
      dept: bookingDept,
      dob: dob,
      gender: gender,
      email: email,
      mobile: mobile,
      city: city,
      historyNotes: medicalHistory
    });

    // Reset local
    setPatientName("");
    setDob("");
    setVisitReason("");
    setMedicalHistory("");
  };

  return (
    <div className="space-y-20 pb-16 animate-fade-in text-slate-800 font-sans">
      
      {/* BRAND NAVIGATION MENU / SUB-HEADER (Glassmorphic) */}
      <div className="w-full bg-white/75 backdrop-blur-md border border-slate-200/40 rounded-3xl p-4 flex items-center justify-between flex-wrap gap-4 shadow-sm relative z-20">
        <div className="flex items-center gap-2.5">
          <TitanLogo className="h-9 w-9 shadow shadow-black/20" />
          <span className="font-display font-bold text-lg tracking-tight text-slate-900">
            Titan HealthConnect
          </span>
        </div>
        <nav className="hidden lg:flex items-center gap-6 text-xs font-bold text-slate-600 tracking-wider">
          <a href="#home-hero" className="hover:text-blue-600 transition-colors">HOME</a>
          <a href="#about-us" className="hover:text-blue-600 transition-colors">ABOUT</a>
          <a href="#services-grid" className="hover:text-blue-600 transition-colors">SERVICES</a>
          <a href="#doctors-crew" className="hover:text-blue-600 transition-colors">DOCTORS</a>
          <a href="#departments-deck" className="hover:text-blue-600 transition-colors">DEPARTMENTS</a>
          <a href="#appointment-booking" className="hover:text-blue-600 transition-colors">BOOK APPOINTMENT</a>
          <button 
            onClick={() => onLaunchPortal('vitals')}
            className="hover:text-blue-600 transition-colors font-bold uppercase transition-all"
          >
            PATIENT PORTAL
          </button>
          <a href="#contact-us" className="hover:text-blue-600 transition-colors">CONTACT</a>
        </nav>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onLaunchPortal('profile')}
            className="text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 py-2 px-4 rounded-xl transition-all"
          >
            Switch Profile ID
          </button>
          <button 
            onClick={() => onLaunchPortal('vitals')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-600/10 transition-all text-center"
          >
            Launch Patient Portal
          </button>
        </div>
      </div>

      {/* HERO SECTION */}
      <section id="home-hero" className="bg-gradient-to-br from-blue-50/40 via-white to-sky-50/20 border border-slate-200/50 rounded-[40px] p-8 lg:p-16 shadow-inner relative overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        {/* Soft floating diagnostic gradients */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-cyan-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="lg:col-span-7 space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-800 border border-blue-100/60 rounded-full px-4 py-1.5 text-xs font-semibold">
            <Sparkles className="h-4 w-4 text-blue-600 animate-spin-slow" />
            <span>Connecting Patients with Quality Healthcare</span>
          </div>

          <h1 className="font-display font-bold text-4xl lg:text-5xl text-slate-900 tracking-tight leading-[1.1] max-w-2xl">
            Advanced Healthcare Solutions for a <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">Healthier Tomorrow</span>
          </h1>

          <p className="text-slate-500 font-normal leading-relaxed text-sm max-w-xl">
            Book appointments instantly, connect with experienced specialists, and manage your healthcare journey from one secure and seamless platform. Our certified clinical ecosystem offers direct access to diagnosis, medical reports, and emergency first-aid dispatches.
          </p>

          <div className="flex flex-wrap gap-4 items-center">
            <a
              href="#appointment-booking"
              className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold px-8 py-3.5 rounded-2xl text-xs sm:text-sm shadow-lg shadow-blue-600/20 transition-all tracking-wider uppercase text-center"
            >
              Book Appointment ➔
            </a>
            <a
              href="#doctors-crew"
              className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-850 font-bold px-7 py-3.5 rounded-2xl text-xs sm:text-sm shadow-sm transition-all text-center"
            >
              Find a Doctor
            </a>
          </div>

          {/* Core Interactive Statistics Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200/60">
            <div className="p-3 bg-white/70 backdrop-blur-sm border border-slate-200/30 rounded-2xl">
              <p className="text-2xl font-bold font-display text-blue-650">50+</p>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wide mt-0.5">Experienced Doctors</p>
            </div>
            <div className="p-3 bg-white/70 backdrop-blur-sm border border-slate-200/30 rounded-2xl">
              <p className="text-2xl font-bold font-display text-blue-650">25k+</p>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wide mt-0.5">Happy Patients</p>
            </div>
            <div className="p-3 bg-white/70 backdrop-blur-sm border border-slate-200/30 rounded-2xl">
              <p className="text-2xl font-bold font-display text-blue-650">20</p>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wide mt-0.5">Departments</p>
            </div>
            <div className="p-3 bg-white/70 backdrop-blur-sm border border-slate-200/30 rounded-2xl">
              <p className="text-2xl font-bold font-display text-blue-650">24/7</p>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wide mt-0.5">Emergency Help</p>
            </div>
          </div>
        </div>

        {/* Hero Illustration (Doctor and Pregnant Patient Consultation Scene) */}
        <div className="lg:col-span-5 flex justify-center relative z-10 w-full">
          <div className="w-full max-w-[480px] lg:max-w-none xl:max-w-[520px] aspect-[4/3] relative flex items-center justify-center">
            <DoctorPatientIllustration className="w-full h-full drop-shadow-xl hover:scale-[1.02] transition-transform duration-300" />
          </div>
        </div>
      </section>

      {/* ABOUT US SECTION */}
      <section id="about-us" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        <div className="lg:col-span-5 flex justify-center">
          <div className="p-6 bg-blue-50/40 rounded-3xl border border-dashed border-blue-200/60 w-full max-w-[360px] text-center space-y-4 shadow-sm">
            <div className="relative inline-block w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white mx-auto shadow-md shadow-blue-600/10">
              <Stethoscope className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-800">Titan HealthConnect Center</p>
              <p className="text-xs text-slate-400">Whitefield, Bengaluru, India</p>
            </div>
            <div className="text-slate-500 text-xs text-left font-sans bg-white border border-slate-200/40 p-3 rounded-2xl">
              <p className="font-bold text-blue-700 text-xs mb-1">Our Core Commitment:</p>
              To make quality healthcare accessible, affordable, and highly efficient for every digital citizen.
            </div>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>About Us</span>
          </div>

          <h2 className="font-display font-bold text-3xl text-slate-900 tracking-tight leading-tight">
            Comprehensive Patient-Centered Medical Care & Modern Technology
          </h2>

          <p className="text-slate-550 text-sm leading-relaxed text-slate-650">
            Titan HealthConnect is a leading healthcare management platform dedicated to providing high-quality medical services through modern technology and experienced healthcare professionals. We focus on patient-centered care, fast appointment scheduling, secure medical records, and seamless doctor-patient communication.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
            <div className="bg-slate-50 border border-slate-200/30 rounded-2xl p-4">
              <p className="font-display font-bold text-blue-850 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                Our Mission
              </p>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                To make quality healthcare accessible, affordable, and efficient for everyone through trusted technology and medical excellence.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/30 rounded-2xl p-4">
              <p className="font-display font-bold text-blue-850 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                Our Vision
              </p>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                To become India's most trusted digital healthcare platform, nurturing healthy communities with immediate medical security.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CORE CLINICAL SERVICES HEXAGON/BENTO CARDS */}
      <section id="services-grid" className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs uppercase font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Explore Specialties</span>
          <h2 className="font-display font-bold text-3xl text-slate-900 tracking-tight leading-snug">
            Comprehensive Medical Services
          </h2>
          <p className="text-slate-400 text-xs">
            Guaranteed clinical expertise spanning all primary medical departments. Our team ensures safety and professional care.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200/60 p-5 rounded-3xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Activity className="h-6 w-6" />
            </div>
            <h4 className="font-display font-bold text-slate-900 text-sm">Dynamic Booking</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">Choose specific doctors, view timing, budget fees, and reserve your consultation spot instantly.</p>
          </div>

          <div className="bg-white border border-slate-200/60 p-5 rounded-3xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-cyan-50 text-cyan-600 flex items-center justify-center mb-4">
              <Sparkles className="h-6 w-6" />
            </div>
            <h4 className="font-display font-bold text-slate-900 text-sm">Smart AI Triage</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">Submit physical symptoms and instantly fetch triage assessments, urgency indicators, and comfort care protocols.</p>
          </div>

          <div className="bg-white border border-slate-200/60 p-5 rounded-3xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Calendar className="h-6 w-6" />
            </div>
            <h4 className="font-display font-bold text-slate-900 text-sm">Medical Vault</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">Track complete clinical history, retrieve custom prescriptions, review body vital logs, and download records.</p>
          </div>

          <div className="bg-white border border-slate-200/60 p-5 rounded-3xl hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <Flame className="h-6 w-6" />
            </div>
            <h4 className="font-display font-bold text-slate-900 text-sm">Emergency SOS Dispatch</h4>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">Continuous coordinate-tracked dispatch triggers physical ambulance deploy teams to your block instantly.</p>
          </div>
        </div>
      </section>

      {/* SPECIALIST DOCTORS SECTION */}
      <section id="doctors-crew" className="space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs uppercase font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Consult Specialists</span>
            <h2 className="font-display font-bold text-3xl text-slate-900 tracking-tight leading-none">Meet Our Certified Medical Doctors</h2>
            <p className="text-slate-400 text-xs">Search profiles, timings, consult fees, languages, and direct email contacts.</p>
          </div>

          {/* Search Inputs */}
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search name or specialty..." 
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                className="bg-white border border-slate-200 text-xs py-2 px-3 pl-8 rounded-xl focus:outline-none focus:border-blue-500 w-44"
              />
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            </div>

            <select 
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-white border border-slate-200 text-xs py-2 px-3 rounded-xl focus:outline-none"
            >
              <option value="all">All Departments</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Pediatrics">Pediatrics</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Dentistry">Dentistry</option>
            </select>

            <select 
              value={selectedLang}
              onChange={(e) => setSelectedLang(e.target.value)}
              className="bg-white border border-slate-200 text-xs py-2 px-3 rounded-xl focus:outline-none"
            >
              <option value="all">All Languages</option>
              <option value="English">English</option>
              <option value="Hindi">Hindi</option>
              <option value="Kannada">Kannada</option>
              <option value="Telugu">Telugu</option>
            </select>
          </div>
        </div>

        {/* Doctor profiles grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredDoctors.length === 0 ? (
              <div className="col-span-full text-center py-12 text-slate-450 bg-slate-50 border border-slate-200 rounded-3xl text-sm">
                No specialists correspond to your chosen search filters. Try resetting criteria.
              </div>
            ) : (
              filteredDoctors.map(doc => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={doc.id} 
                  className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all h-auto cursor-pointer"
                >
                  <div className="space-y-4">
                    <div className="flex items-start gap-4">
                      <img 
                        src={doc.avatarUrl} 
                        alt={doc.name} 
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-200"
                        referrerPolicy="no-referrer"
                      />
                      <div className="space-y-0.5">
                        <h4 className="font-display font-bold text-slate-900 text-base">{doc.name}</h4>
                        <span className="inline-block text-[10px] bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded-full uppercase">
                          {doc.specialty}
                        </span>
                        <p className="text-[11px] text-slate-400 font-mono mt-1">{doc.credentials}</p>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs border-y border-slate-100 py-3 font-medium text-slate-500">
                      <p className="flex justify-between">
                        <span>Min Experience:</span> 
                        <strong className="text-slate-850">{doc.experience} Years</strong>
                      </p>
                      <p className="flex justify-between">
                        <span>Consult Fee:</span> 
                        <strong className="text-blue-700 font-bold">₹{doc.consultationFee}</strong>
                      </p>
                      <p className="flex justify-between">
                        <span>Operational Shift:</span> 
                        <strong className="text-slate-850 font-semibold">{doc.timings}</strong>
                      </p>
                      <p className="flex justify-between">
                        <span>Languages:</span> 
                        <span className="text-slate-800 font-mono text-[10px]">{doc.languages.join(", ")}</span>
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between text-xs gap-2">
                    <p className="text-[10px] text-slate-400 font-mono line-clamp-1 truncate">{doc.email}</p>
                    <a 
                      href="#appointment-booking" 
                      onClick={() => {
                        setBookingDept(doc.department);
                        setBookingDoctor(doc.name);
                        setVisitReason(`Consulting ${doc.specialty} Specialist directly`);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] shrink-0 text-center transition-all shadow-sm"
                    >
                      Book Consult
                    </a>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* MEDICAL DEPARTMENTS DECK */}
      <section id="departments-deck" className="space-y-8 bg-slate-50 border border-slate-200/40 rounded-[40px] p-8 lg:p-12 shadow-sm">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs uppercase font-extrabold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">Clinical Architecture</span>
          <h2 className="font-display font-bold text-3xl text-slate-900 tracking-tight">Our Core Departments</h2>
          <p className="text-slate-450 text-xs">Explore deep health divisions staffed continuously to guarantee wellness and safety.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {medicalDepartments.map(dept => (
            <div key={dept.id} className="bg-white border border-slate-200/40 p-5 rounded-2xl shadow-sm space-y-3 hover:border-slate-350 transition-colors">
              <h4 className="font-display font-bold text-slate-900 text-base">{dept.name}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">{dept.description}</p>
              <button 
                onClick={() => {
                  setBookingDept(dept.name);
                  const filterDoc = doctorProfiles.find(d => d.department === dept.name);
                  if (filterDoc) setBookingDoctor(filterDoc.name);
                  const view = document.getElementById("appointment-booking");
                  if (view) view.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-[11px] font-bold text-blue-600 hover:underline block"
              >
                Inquire Department ➔
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* APPOINTMENT BOOKING FORM */}
      <section id="appointment-booking" className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
        
        {/* Left Informational text */}
        <div className="lg:col-span-5 space-y-4">
          <div className="inline-flex items-center gap-1.5 text-blue-600 font-bold text-xs uppercase tracking-widest">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>Consultation scheduling</span>
          </div>
          <h2 className="font-display font-bold text-3xl text-slate-900 tracking-tight leading-tight">
            Reserve Your Digital Medical Consultation Slot
          </h2>
          <p className="text-slate-500 text-sm leading-relaxed text-slate-650">
            Select surgery center timings, choose specific on-duty doctors, provide your physical symptoms, and secure an instant spot in the general active roster lists. Your details are securely transmitted to our administrative officer to triage queue workloads.
          </p>
          <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-3 text-xs leading-relaxed max-w-sm">
            <Clock className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-850">Hospital Operational Timings</p>
              <p className="text-slate-400 mt-1">Monday – Saturday: 08:00 AM – 06:00 PM</p>
              <p className="text-slate-450 mt-0.5">Please arrive 10 minutes prior to your preferred slot.</p>
            </div>
          </div>
        </div>

        {/* Right Appointment Box */}
        <div className="lg:col-span-7 bg-white border border-slate-200/60 p-6 sm:p-8 rounded-[35px] shadow-sm relative">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-100/20 rounded-full blur-xl pointer-events-none" />
          <h3 className="font-display font-semibold text-slate-900 border-b border-slate-100 pb-3 mb-5 text-base sm:text-lg">
            Complete Appointment Form
          </h3>

          <form onSubmit={handleLocalSubmit} className="space-y-4 text-xs font-semibold text-slate-500">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 uppercase font-bold tracking-wider">Patient Full Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g., Maya Lin" 
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1.5 uppercase font-bold tracking-wider">Date of Birth</label>
                <input 
                  type="date" 
                  required
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1.5 uppercase font-bold tracking-wider">Gender</label>
                <select 
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block mb-1.5 uppercase font-bold tracking-wider">Email Address</label>
                <input 
                  type="email" 
                  required
                  placeholder="name@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1.5 uppercase font-bold tracking-wider">Mobile Number</label>
                <input 
                  type="tel" 
                  required
                  placeholder="+91 XXXXX XXXXX" 
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1.5 uppercase font-bold tracking-wider">City</label>
                <input 
                  type="text" 
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1.5 uppercase font-bold tracking-wider">Select Department</label>
                <select 
                  value={bookingDept}
                  onChange={(e) => {
                    setBookingDept(e.target.value);
                    const doc = doctorProfiles.find(d => d.department === e.target.value);
                    if (doc) setBookingDoctor(doc.name);
                  }}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="General Medicine">General Medicine</option>
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Dentistry">Dentistry</option>
                </select>
              </div>

              <div>
                <label className="block mb-1.5 uppercase font-bold tracking-wider">Preferred Specialist</label>
                <select 
                  required
                  value={bookingDoctor}
                  onChange={(e) => setBookingDoctor(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Choose Doctor --</option>
                  {doctorProfiles.filter(d => bookingDept === "General Medicine" || d.department === bookingDept).map(d => (
                    <option key={d.id} value={d.name}>{d.name} ({d.specialty})</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block mb-1.5 uppercase font-bold tracking-wider">Appointment Date</label>
                <input 
                  type="date" 
                  required
                  value={bookingDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setBookingDate(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block mb-1.5 uppercase font-bold tracking-wider">Time Slot</label>
                <select 
                  value={bookingTime}
                  onChange={(e) => setBookingTime(e.target.value)}
                  className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 focus:bg-white focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:00 AM">11:00 AM</option>
                  <option value="12:00 PM">12:00 PM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:00 PM">03:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                  <option value="05:00 PM">05:00 PM</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block mb-1.5 uppercase font-bold tracking-wider">Reason for Visit</label>
              <textarea 
                rows={2}
                required
                placeholder="Briefly describe what symptoms or consultancy feedback you need..."
                value={visitReason}
                onChange={(e) => setVisitReason(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block mb-1.5 uppercase font-bold tracking-wider">Medical History Notes (Allergies, chronic conditions)</label>
              <textarea 
                rows={2}
                placeholder="e.g., Penicillin allergy, currently taking hypertension medicine..."
                value={medicalHistory}
                onChange={(e) => setMedicalHistory(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 p-2.5 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <button 
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold tracking-widest uppercase py-3.5 rounded-2xl cursor-pointer transition-all duration-300 text-center text-xs"
            >
              Verify & Process Reservation Slot
            </button>
          </form>

        </div>
      </section>

      {/* PATIENT TESTIMONIALS */}
      <section className="bg-gradient-to-tr from-blue-500/10 to-sky-400/5 border border-slate-200/40 rounded-[35px] p-8 max-w-4xl mx-auto shadow-sm space-y-4 text-center relative overflow-hidden" id="testimonials">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl" />
        <span className="text-4xl text-blue-500 font-serif block">“</span>
        
        <div className="min-h-[100px] flex items-center justify-center">
          <p className="text-slate-650 font-medium italic text-xs sm:text-base max-w-2xl mx-auto leading-relaxed text-slate-705">
            {mockTestimonials[activeTestimonial].quote}
          </p>
        </div>

        <div className="space-y-1">
          <h4 className="font-bold text-slate-800 text-sm">{mockTestimonials[activeTestimonial].patientName}</h4>
          <p className="text-[10px] text-slate-400 font-medium">{mockTestimonials[activeTestimonial].role}</p>
        </div>

        {/* Testimonials Toggles */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {mockTestimonials.map((t, idx) => (
            <button 
              key={t.id}
              onClick={() => setActiveTestimonial(idx)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${activeTestimonial === idx ? 'bg-blue-600 w-6' : 'bg-slate-300'}`}
              title={`Testimonial ${idx + 1}`}
            />
          ))}
        </div>
      </section>

      {/* FAQ SECTION */}
      <section className="space-y-8 max-w-4xl mx-auto">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <span className="text-xs uppercase font-extrabold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Common Queries</span>
          <h2 className="font-display font-bold text-3xl text-slate-900 tracking-tight text-center">Frequently Asked Questions</h2>
          <p className="text-slate-450 text-xs text-center">Locate quick clarifications about bookings, cancellations, and physical support coordinates.</p>
        </div>

        <div className="space-y-3" id="faq">
          {faqItems.map(faq => {
            const isOpen = openFaq === faq.id;
            return (
              <div key={faq.id} className="bg-white border border-slate-200 rounded-2xl select-none overflow-hidden transition-all duration-300">
                <button 
                  onClick={() => setOpenFaq(isOpen ? null : faq.id)}
                  className="w-full text-left p-5 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-800 focus:outline-none"
                >
                  <span>{faq.question}</span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-blue-600" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100 bg-slate-50/50"
                    >
                      <p className="p-5 text-xs text-slate-500 leading-relaxed font-sans">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </section>

      {/* CONTACT US SECTION */}
      <section id="contact-us" className="bg-slate-900 text-white rounded-[40px] p-8 lg:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 relative overflow-hidden">
        
        {/* Abstract glowing accents */}
        <div className="absolute bottom-[-100px] right-[-100px] w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="lg:col-span-5 space-y-6 relative z-10">
          <div className="space-y-2">
            <span className="text-[10px] bg-blue-600 text-white font-bold tracking-widest uppercase px-3 py-1 rounded">Titan Contact Center</span>
            <h3 className="font-display font-extrabold text-2xl tracking-tight text-white pt-2">Our Physical Location & Rapid Lines</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Have inquiries about your diagnostic reports, outpatient surgery times, or credential verification? Write to our dispatch desk or ring our emergency helpline immediately.
            </p>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-bold font-sans">Medical Center Address</p>
                <p className="text-slate-400 mt-1 font-sans">Titan HealthConnect Medical Center, Whitefield, Bengaluru, Karnataka, India</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-rose-400 shrink-0 mt-0.5 animate-pulse" />
              <div>
                <p className="text-white font-bold font-sans">Emergency Helpline (24/7)</p>
                <p className="text-rose-350 mt-1 font-bold text-sm tracking-widest">+91 1800-555-911</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-blue-300 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-bold font-sans">Customer Support</p>
                <p className="text-slate-300 mt-1 font-bold">+91 98765 43210</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="h-5 w-5 text-blue-300 shrink-0 mt-0.5" />
              <div>
                <p className="text-white font-bold font-sans">Support Email</p>
                <p className="text-blue-350 mt-1 underline">support@titanhealthconnect.com</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form mock */}
        <div className="lg:col-span-7 bg-white/5 border border-white/10 backdrop-blur-sm p-6 sm:p-8 rounded-3xl space-y-4 relative z-10 text-xs">
          <h4 className="font-bold text-white text-sm">Send Instant Message Note</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <span className="text-slate-350 font-bold uppercase tracking-wide">Full Name</span>
              <input type="text" placeholder="John Doe" className="w-full bg-white/10 border border-white/20 rounded-xl py-2 px-3 text-white focus:outline-none focus:bg-white/15" />
            </div>
            <div className="space-y-1.5">
              <span className="text-slate-350 font-bold uppercase tracking-wide">Email</span>
              <input type="email" placeholder="johndoe@email.com" className="w-full bg-white/10 border border-white/20 rounded-xl py-2 px-3 text-white focus:outline-none focus:bg-white/15" />
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-slate-350 font-bold uppercase tracking-wide">Message details</span>
            <textarea rows={3} placeholder="Describe your question or message..." className="w-full bg-white/10 border border-white/20 p-2.5 rounded-xl text-white focus:outline-none focus:bg-white/15 focus:ring-1 focus:ring-blue-500" />
          </div>

          <button 
            type="button"
            onClick={() => alert("Message Received! Our Titan HealthConnect support deck will contact you back via deep email within 2 hours.")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold uppercase py-3.5 rounded-xl tracking-wider cursor-pointer text-center"
          >
            Transmit Message Box
          </button>
        </div>
      </section>

    </div>
  );
}
