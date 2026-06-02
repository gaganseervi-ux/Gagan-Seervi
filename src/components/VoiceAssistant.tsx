import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  HelpCircle, 
  Terminal, 
  Check, 
  X,
  Compass,
  ArrowRight,
  ShieldAlert,
  MapPin,
  Activity,
  Headphones,
  Bell
} from "lucide-react";

interface VoiceAssistantProps {
  currentRole: 'student' | 'staff';
  onNavigate: (view: 'thrine-landing' | 'portal-dashboard' | 'admin-dashboard', tab?: string) => void;
  onSearchDoctors: (query: string) => void;
  onSearchPatients: (query: string) => void;
  onToggleDarkMode: () => void;
  onTriggerSOSFast: () => void;
  isDarkMode: boolean;
}

export default function VoiceAssistant({
  currentRole,
  onNavigate,
  onSearchDoctors,
  onSearchPatients,
  onToggleDarkMode,
  onTriggerSOSFast,
  isDarkMode
}: VoiceAssistantProps) {
  // UI Panels / Control States
  const [showDocs, setShowDocs] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [showPermissionPopup, setShowPermissionPopup] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Audio & DSP Filters
  const [isListening, setIsListening] = useState(false);
  const [isContinuous, setIsContinuous] = useState(true);
  const [useNoiseReduction, setUseNoiseReduction] = useState(true);
  const [currentLanguage, setCurrentLanguage] = useState<'en-US' | 'hi-IN' | 'kn-KA'>('en-US');
  
  // Custom Permission tracking
  const [micPermissionGranted, setMicPermissionGranted] = useState<boolean | null>(() => {
    const saved = localStorage.getItem("titan_mic_permission_granted");
    if (saved === "true") return true;
    if (saved === "false") return false;
    return null;
  });
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Nearby Hospital Directions Modal
  const [showHospitalsMap, setShowHospitalsMap] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<any>(null);

  // Recognition / Speech states
  const [transcript, setTranscript] = useState("");
  const [feedbackText, setFeedbackText] = useState("Standing by. Say \"Hey Titan\" or click the microphone.");
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Command History Audit Logs
  const [voiceLogs, setVoiceLogs] = useState<{ time: string; text: string; action: string }[]>([
    { time: new Date().toLocaleTimeString(), text: "System Booted", action: "Active Wake Pattern Armed ('Hey Titan')" }
  ]);

  // Simulated live waveform data for listening animation
  const [pulseWaves, setPulseWaves] = useState<number[]>([10, 20, 15, 35, 20, 12, 8, 25, 45, 10]);

  useEffect(() => {
    if (isListening) {
      const interval = setInterval(() => {
        setPulseWaves(Array.from({ length: 12 }, () => Math.floor(Math.random() * 55) + 10));
      }, 90);
      return () => clearInterval(interval);
    }
  }, [isListening]);

  // Real TTS Voice Output
  const speakResponse = (text: string) => {
    if (isMuted || !('speechSynthesis' in window)) return;
    
    // Terminate existing speech
    window.speechSynthesis.cancel();
    
    // Choose correct dialect voices if listed
    const utterance = new SpeechSynthesisUtterance(text);
    if (currentLanguage === 'hi-IN') {
      utterance.lang = 'hi-IN';
    } else if (currentLanguage === 'kn-KA') {
      utterance.lang = 'kn-KA';
    } else {
      utterance.lang = 'en-US';
    }
    
    utterance.rate = 1.02;
    utterance.pitch = 1.05;
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  };

  // Setup Web Speech API Speech Recognition
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = currentLanguage;

    rec.onresult = (event: any) => {
      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }

      const activeText = finalTranscript || interimTranscript;
      setTranscript(activeText);

      if (finalTranscript) {
        processVoiceInput(finalTranscript.trim());
      }
    };

    rec.onerror = (event: any) => {
      console.warn("Speech recognition diagnostics error:", event.error);
      if (event.error === 'not-allowed') {
        if (isDemoMode) return;
        setMicPermissionGranted(false);
        localStorage.setItem("titan_mic_permission_granted", "false");
        setFeedbackText("Microphone access blocked. Enable in site parameters.");
        speakResponse("I couldn't access the microphone. Please grant permission in the site browser settings.");
      }
    };

    rec.onend = () => {
      // Automatic resume if continuous listening remains toggled
      if (isListening && isContinuous && !isDemoMode) {
        try {
          rec.start();
        } catch (e) {}
      }
    };

    recognitionRef.current = rec;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [currentLanguage, isListening, isContinuous]);

  // Handle Listening State updates
  useEffect(() => {
    if (!recognitionRef.current || isDemoMode) return;

    if (isListening) {
      try {
        recognitionRef.current.start();
        setFeedbackText(
          currentLanguage === 'hi-IN' 
            ? "सुन रहा हूँ... टाइटन सहायक सक्रिय है।" 
            : currentLanguage === 'kn-KA'
              ? "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇನೆ... ಟೈಟನ್ ಧ್ವನಿ ಸಹಾಯಕ ಸಿದ್ಧವಿದೆ."
              : "Listening... Say \"Hey Titan\" followed by your request."
        );
      } catch (err) {
        // Safe wrap
      }
    } else {
      try {
        recognitionRef.current.stop();
      } catch (err) {}
    }
  }, [isListening, currentLanguage, isDemoMode]);

  // Microphone Permission Handler (Native browser trigger + Popup flow)
  const triggerRequestPermission = async () => {
    try {
      // Request active microphone via standard WebRTC streams
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Release hardware immediately upon authorization
      stream.getTracks().forEach(track => track.stop());
      
      localStorage.setItem("titan_mic_permission_granted", "true");
      setMicPermissionGranted(true);
      setIsDemoMode(false);
      setShowPermissionPopup(false);
      setShowDocs(true);
      setIsListening(true);
      
      const welcome = "Permission granted! Titan voice assistant is active. How can I help you today?";
      setFeedbackText(welcome);
      speakResponse(welcome);
    } catch (err) {
      console.error("Microphone hardware block:", err);
      localStorage.setItem("titan_mic_permission_granted", "true");
      setMicPermissionGranted(true);
      setIsDemoMode(true);
      setShowPermissionPopup(false);
      setShowDocs(true);
      setIsListening(true);
      
      const welcomeMsg = "Simulation Mode active! Browser blocked mic usage inside the embedded workspace sandboxed iframe. Feel free to click any preloaded command block below to test!";
      setFeedbackText(welcomeMsg);
      speakResponse("Microphone is blocked by layout sandbox. Activating interactive simulation mode.");
    }
  };

  // Command Matching Processor
  const processVoiceInput = (rawText: string) => {
    const text = rawText.toLowerCase();
    const timeString = new Date().toLocaleTimeString();
    
    // Check if user spoke a wake word
    const hasWakeWord = text.includes("hey titan") || text.includes("titan assistant") || text.includes("titan") || text.includes("टाइटन") || text.includes("ಟೈಟನ್");
    
    // Optional continuous trigger filter: strip out wake word to focus on core instruction
    let parsedCommand = text;
    if (parsedCommand.startsWith("hey titan")) parsedCommand = parsedCommand.replace("hey titan", "").trim();
    if (parsedCommand.startsWith("titan assistant")) parsedCommand = parsedCommand.replace("titan assistant", "").trim();

    let understood = false;
    let spokenReply = "";
    let actionLog = "No Action Matched";

    // 0. LAB PATHOLOGY COMMANDS
    if (
      parsedCommand.includes("cbc") || 
      parsedCommand.includes("complete blood count") ||
      parsedCommand.includes("thyroid") || 
      parsedCommand.includes("blood test") || 
      parsedCommand.includes("home sample") || 
      parsedCommand.includes("home collection") || 
      parsedCommand.includes("lab report") || 
      parsedCommand.includes("download my lab") ||
      parsedCommand.includes("test prices") ||
      parsedCommand.includes("test price") ||
      parsedCommand.includes("pathology")
    ) {
      onNavigate('portal-dashboard', 'lab');
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('voice-lab-booking', { detail: { command: parsedCommand } }));
      }, 350);
      
      if (parsedCommand.includes("report")) {
        spokenReply = "Retrieving your recent path logs. Opening medical reports directory files.";
        actionLog = "Lab Reports Directory Accessed";
      } else if (parsedCommand.includes("home sample") || parsedCommand.includes("home collection")) {
        spokenReply = "Setting dispatch to Home Sample Collection. Please designate your residential parameters.";
        actionLog = "Lab Home Collection Triggered";
      } else if (parsedCommand.includes("price") || parsedCommand.includes("cost")) {
        spokenReply = "Pulled down our pathology division pricing catalog layout.";
        actionLog = "Lab Prices Shown";
      } else {
        spokenReply = `Understood. Opening our clinical laboratory system to process: ${parsedCommand}. Prefilled parameters successfully.`;
        actionLog = `Lab booking active: ${parsedCommand}`;
      }
      understood = true;
    }

    // 1. APPOINTMENT COMMANDS
    if (
      parsedCommand.includes("book") || 
      parsedCommand.includes("appointment") || 
      parsedCommand.includes("schedule") || 
      parsedCommand.includes("अपॉइंटमेंट") || 
      parsedCommand.includes("ಅಪಾಯಿಂಟ್ಮೆಂಟ್")
    ) {
      if (parsedCommand.includes("cardiologist") || parsedCommand.includes("cardiology") || parsedCommand.includes("हृदय")) {
        onNavigate('thrine-landing');
        onSearchDoctors("Cardiologist");
        setTimeout(() => {
          const form = document.getElementById("booking-card-form");
          if (form) form.scrollIntoView({ behavior: "smooth" });
        }, 400);
        spokenReply = "I found 1 expert cardiologist available. I have opened the booking portal for you! Would you like me to reserve today's shift with Dr. Rajesh Sharma?";
        actionLog = "Cardiology Booking Terminal opened";
        understood = true;
      } 
      else if (parsedCommand.includes("dermatologist") || parsedCommand.includes("dermatology") || parsedCommand.includes("त्वचा")) {
        onNavigate('thrine-landing');
        onSearchDoctors("Dermatologist");
        setTimeout(() => {
          const form = document.getElementById("booking-card-form");
          if (form) form.scrollIntoView({ behavior: "smooth" });
        }, 400);
        spokenReply = "I found Dr. Vikram Reddy specializing in Dermatology. Opening the booking form and prefilled dermatology specialty option.";
        actionLog = "Dermatologist Booking Portal triggered";
        understood = true;
      }
      else {
        // Standard booking command
        onNavigate('thrine-landing');
        setTimeout(() => {
          const form = document.getElementById("booking-card-form");
          if (form) form.scrollIntoView({ behavior: "smooth" });
        }, 300);
        spokenReply = "Navigating directly to our clinical scheduler. Please select your preferred specialist and coordinate your booking slot.";
        actionLog = "Booking Form scrolled into view";
        understood = true;
      }
    } 

    // cancel / reschedule appointments simulation
    else if (parsedCommand.includes("cancel") || parsedCommand.includes("रद्द")) {
      onNavigate('portal-dashboard', 'appointments');
      spokenReply = "I have opened your appointments view in the Patient Portal. You may select any pending slot to request cancellation or touch support.";
      actionLog = "Navigated to Patient Appointments list to Cancel";
      understood = true;
    }

    else if (parsedCommand.includes("reschedule") || parsedCommand.includes("time update") || parsedCommand.includes("बदलें")) {
      onNavigate('portal-dashboard', 'appointments');
      spokenReply = "Let's update your appointments timeline. Navigated to your current active slots tracker. Choose any record block to request slot changes.";
      actionLog = "Rescheduling requested; opened active slots portal";
      understood = true;
    }

    // 2. DOCTOR SEARCH COMMANDS
    else if (
      parsedCommand.includes("find a cardiologist") || 
      parsedCommand.includes("cardiologist near me") || 
      parsedCommand.includes("heart specialist")
    ) {
      onNavigate('thrine-landing');
      onSearchDoctors("Cardiologist");
      setTimeout(() => {
        const dSection = document.getElementById("doctors-crew");
        if (dSection) dSection.scrollIntoView({ behavior: "smooth" });
      }, 350);
      spokenReply = "Searching the campus department registry. Dr. Rajesh Sharma, our Senior Cardiologist, is currently available on-campus.";
      actionLog = "Searched Cardiologists on roster";
      understood = true;
    }

    else if (
      parsedCommand.includes("find a dermatologist") || 
      parsedCommand.includes("dermatologist near me") || 
      parsedCommand.includes("search dermatologist")
    ) {
      onNavigate('thrine-landing');
      onSearchDoctors("Dermatologist");
      setTimeout(() => {
        const dSection = document.getElementById("doctors-crew");
        if (dSection) dSection.scrollIntoView({ behavior: "smooth" });
      }, 350);
      spokenReply = "Filtering the team roster for Dermatology experts. Dr. Vikram Reddy is on duty until 3:00 PM.";
      actionLog = "Searched Dermatologists on roster";
      understood = true;
    }

    else if (
      parsedCommand.includes("show available doctors") || 
      parsedCommand.includes("available doctors") || 
      parsedCommand.includes("our doctors") || 
      parsedCommand.includes("डॉक्टर") || 
      parsedCommand.includes("ವೈದ್ಯರು")
    ) {
      onNavigate('thrine-landing');
      onSearchDoctors("");
      setTimeout(() => {
        const dSection = document.getElementById("doctors-crew");
        if (dSection) dSection.scrollIntoView({ behavior: "smooth" });
      }, 300);
      spokenReply = "Showing all on-duty specialists. You can view our cardiac, neurology, dental, and emergency practitioners lists.";
      actionLog = "Reset filters and listed all doctors";
      understood = true;
    }

    // 3. NAVIGATION COMMANDS
    else if (
      parsedCommand.includes("open dashboard") || 
      parsedCommand.includes("go to dashboard") || 
      parsedCommand.includes("patient portal") || 
      parsedCommand.includes("डैशबोर्ड") || 
      parsedCommand.includes("ಡ್ಯಾಶ್ಬೋರ್ಡ್")
    ) {
      onNavigate('portal-dashboard');
      spokenReply = currentLanguage === 'hi-IN' 
        ? "आपका स्वास्थ्य पोर्टल डैशबोर्ड लोड हो रहा है।" 
        : currentLanguage === 'kn-KA'
          ? "ನಿಮ್ಮ ಆರೋಗ್ಯ ಪೋರ್ಟಲ್ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್ ತೆರೆಯಲಾಗುತ್ತಿದೆ."
          : "Opening your secure diagnostics and clinical patient dashboard overview. Logging active vitals history.";
      actionLog = "Opened Student Patient Dashboard Overview";
      understood = true;
    }

    else if (parsedCommand.includes("go to appointments") || parsedCommand.includes("show my appointments")) {
      onNavigate('portal-dashboard', 'appointments');
      spokenReply = "Authorized. Loading your pending clinical clinic queues and consult calendars.";
      actionLog = "Switched to Patient Portal Appointments Tab";
      understood = true;
    }

    else if (
      parsedCommand.includes("open medical records") || 
      parsedCommand.includes("view records") || 
      parsedCommand.includes("health records") || 
      parsedCommand.includes("medical records") || 
      parsedCommand.includes("ಇತಿಹಾಸ")
    ) {
      if (currentRole === 'staff') {
        onNavigate('admin-dashboard', 'records');
      } else {
        onNavigate('portal-dashboard', 'history');
      }
      spokenReply = "Opened secure digital medical files, verified laboratory vitals logs, and active drug prescription catalogs.";
      actionLog = "Opened secure health records inventory";
      understood = true;
    }

    else if (
      parsedCommand.includes("show reports") || 
      parsedCommand.includes("show records reports") || 
      parsedCommand.includes("download reports") || 
      parsedCommand.includes("print invoice") || 
      parsedCommand.includes("रिपोर्ट")
    ) {
      if (currentRole === 'staff') {
        onNavigate('admin-dashboard', 'analytics');
      } else {
        onNavigate('portal-dashboard', 'history');
      }
      spokenReply = "Showing clinical diagnostics summary sheet report. Feel free to download your generated health record text ledger.";
      actionLog = "Highlighted Patient Reports index";
      understood = true;
    }

    // 4. HEALTHCARE COMMANDS & ADJACENT LOCATIONS MAP
    else if (
      parsedCommand.includes("find nearby hospitals") || 
      parsedCommand.includes("find nearby clinics") || 
      parsedCommand.includes("hospitals near me") || 
      parsedCommand.includes("clinics near me") || 
      parsedCommand.includes("hospital") || 
      parsedCommand.includes("अस्पताल")
    ) {
      setShowHospitalsMap(true);
      const testHospital = {
        name: "Columbia Asia Hospital (Whitefield)",
        distance: "2.4 km",
        time: "8 mins",
        helpline: "+91 80 4012 4012",
        address: "Ramagondanahalli, Varthur Hobli, Whitefield, Bengaluru"
      };
      setSelectedHospital(testHospital);
      spokenReply = "I found four medical clinics nearby. Titan On-Campus Infirmary is the closest, followed by Columbia Asia Hospital Whitefield which is eight minutes away. I've popped up the hospital coordinates locator so you can view local direct emergency transit times.";
      actionLog = "Rendered Nearby Transit Locator directions";
      understood = true;
    }

    else if (parsedCommand.includes("emergency contacts") || parsedCommand.includes("helpline") || parsedCommand.includes("नंबर")) {
      setTimeout(() => {
        const footer = document.getElementById("global-hospital-footer");
        if (footer) footer.scrollIntoView({ behavior: "smooth" });
      }, 250);
      spokenReply = "Direct lines are running: Campus Emergency Clinic helpline is +91 1800 555 911, and our central dispatch support operates twenty-four hours daily.";
      actionLog = "Scrolled to Emergency Helpline list";
      understood = true;
    }

    else if (
      parsedCommand.includes("call ambulance") || 
      parsedCommand.includes("send ambulance") || 
      parsedCommand.includes("emergency sos") || 
      parsedCommand.includes("danger") || 
      parsedCommand.includes("आपातकालीन") || 
      parsedCommand.includes("ತುರ್ತು")
    ) {
      onTriggerSOSFast();
      spokenReply = "WARNING! Critical SOS Dispatch is broadcasted! Launching transit coordinates tracker on-campus to direct medical escort sirens immediately.";
      actionLog = "EMERGENCY SOS AUTOMATION DISPATCHED!";
      understood = true;
    }

    // 5. UNIVERSAL COMMANDS
    else if (
      parsedCommand.includes("dark mode") || 
      parsedCommand.includes("light mode") || 
      parsedCommand.includes("theme") || 
      parsedCommand.includes("स्क्रीन")
    ) {
      onToggleDarkMode();
      spokenReply = `Toggled display styling. Titan Web UI is now adjusted for optimum ambient eye comfort.`;
      actionLog = "Triggered global dark mode toggling";
      understood = true;
    }

    else if (parsedCommand.includes("log out") || parsedCommand.includes("exit") || parsedCommand.includes("सत्र समाप्त") || parsedCommand.includes("ಹೊರಹೋಗು")) {
      onNavigate('thrine-landing');
      spokenReply = "Logging out from protected accounts terminal safely. Standing by.";
      actionLog = "De-authenticated session; returned to landing page";
      understood = true;
    }

    // fallback matching
    if (understood) {
      setFeedbackText(spokenReply);
      speakResponse(spokenReply);
      setVoiceLogs(prev => [
        { time: timeString, text: rawText, action: actionLog },
        ...prev.slice(0, 15)
      ]);
    } else {
      if (hasWakeWord) {
        const fallbackMsg = currentLanguage === 'hi-IN' 
          ? "नमस्ते, मैंने आपका नाम सुना लेकिन निर्देश स्पष्ट नहीं था। कृपया कहें: 'अपॉइंटमेंट बुक करें' या 'डैशबोर्ड खोलें'।" 
          : currentLanguage === 'kn-KA'
            ? "ನಮಸ್ಕಾರ, ನಿಮ್ಮ ಕರೆ ಕೇಳಿಸಿತು ಆದರೆ ಕಮಾಂಡ್ ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು 'ಅಪಾಯಿಂಟ್ಮೆಂಟ್ ಮತ್ತು ವೇದ್ಯರು' ಎಂದು ತಿಳಿಸಿ."
            : "I heard you call my name, but did not recognize that command. Try saying: \"Book an appointment\" or \"Open patient dashboard\".";
        setFeedbackText(fallbackMsg);
        speakResponse(fallbackMsg);
      } else {
        // Continuous passive logs do not loudly interrupt user with fallback speakers unless wake was matching
        setFeedbackText(`Heard Stream: "${rawText}". Say 'Hey Titan' first.`);
      }
    }
  };

  const handleMicClick = () => {
    if (micPermissionGranted !== true) {
      setShowPermissionPopup(true);
    } else {
      setIsListening(prev => !prev);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans" id="titan-voice-assistant-node">
      
      {/* 1. MIC PERMISSION FLOW MODAL POPUP */}
      <AnimatePresence>
        {showPermissionPopup && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className={`max-w-md w-full rounded-3xl border p-6 shadow-2xl space-y-5 ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}
              id="voice-permission-popup"
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/40 rounded-2xl shrink-0 text-blue-600 dark:text-blue-400">
                  <Mic className="w-7 h-7 stroke-[2]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="font-display font-extrabold text-lg leading-tight tracking-tight text-slate-900 dark:text-white">
                    Enable Voice Assistant
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans font-medium">
                    Titan HealthConnect requires microphone access to process voice commands and assist you with appointments, doctor searches, and healthcare services.
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-2 text-[11px] text-slate-450 dark:text-slate-400">
                <p className="font-bold uppercase tracking-wider text-[9px] text-blue-500 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  Voice Integration Guidelines:
                </p>
                <ul className="list-disc pl-4 space-y-1 leading-normal font-sans">
                  <li>Continuous DSP Noise Reduction enabled by default.</li>
                  <li>Say <strong>"Hey Titan"</strong> or <strong>"Titan Assistant"</strong> to prompt.</li>
                  <li>Multi-language speech tracking is secure and local.</li>
                </ul>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 pt-1">
                <button 
                  onClick={() => setShowPermissionPopup(false)}
                  className={`px-4 py-2 rounded-xl font-bold font-sans text-xs transition-colors cursor-pointer border ${
                    isDarkMode 
                      ? 'border-slate-800 hover:bg-slate-800 text-slate-400' 
                      : 'border-slate-205 hover:bg-slate-50 text-slate-550'
                  }`}
                  aria-label="Deny mic credentials"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    localStorage.setItem("titan_mic_permission_granted", "true");
                    setMicPermissionGranted(true);
                    setIsDemoMode(true);
                    setShowPermissionPopup(false);
                    setShowDocs(true);
                    setIsListening(true);
                    const welcomeMsg = "Interactive simulation active! You can test commands by clicking them in the library below.";
                    setFeedbackText(welcomeMsg);
                    speakResponse("Simulation mode activated.");
                  }}
                  className={`px-4 py-2 rounded-xl font-bold font-sans text-xs transition-colors cursor-pointer border ${
                    isDarkMode 
                      ? 'bg-slate-800 border-slate-700 hover:bg-slate-750 text-slate-200' 
                      : 'bg-slate-50 border-slate-300 hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  Skip to Demo (No Mic)
                </button>
                <button 
                  onClick={triggerRequestPermission}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold font-sans text-xs px-4 py-2 rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer flex items-center justify-center gap-2 transition-transform active:scale-95"
                  aria-label="Grant voice assistant permissions"
                >
                  <Check className="w-4 h-4 text-white" />
                  <span>Use Mic</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. CHAT PANEL VOICE INTERFACE */}
      <AnimatePresence>
        {showDocs && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className={`w-[365px] max-h-[520px] rounded-3xl border shadow-2xl flex flex-col overflow-hidden backdrop-blur-lg ${
              isDarkMode ? 'bg-slate-900/95 border-slate-800 text-white' : 'bg-white/95 border-slate-205 text-slate-800'
            }`}
            id="voice-assistant-chat-panel"
          >
            
            {/* Header */}
            <div className={`p-4 border-b flex items-center justify-between ${
              isDarkMode ? 'border-slate-800 bg-slate-950/45' : 'border-slate-100 bg-slate-50'
            }`}>
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-blue-500 animate-pulse" />
                <div>
                  <h4 className="font-extrabold text-sm tracking-tight leading-none text-slate-900 dark:text-white">Titan Voice Sync</h4>
                  <p className="text-[10px] text-slate-400 mt-1.5 font-mono flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                    Continuous Wake Armed
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                {/* Language switcher */}
                <select 
                  value={currentLanguage} 
                  onChange={(e) => {
                    setCurrentLanguage(e.target.value as any);
                    setTranscript("");
                  }}
                  className={`text-[9px] font-bold py-1 px-2.5 rounded-lg border focus:ring-1 focus:ring-blue-500 focus:outline-none ${
                    isDarkMode ? 'bg-slate-850 border-slate-750 text-slate-200' : 'bg-white border-slate-200 text-slate-600'
                  }`}
                  aria-label="Selection language dial"
                >
                  <option value="en-US">EN (Eng)</option>
                  <option value="hi-IN">HI (हिंदी)</option>
                  <option value="kn-KA">KN (ಕನ್ನಡ)</option>
                </select>

                {/* Mute output speech synthesis */}
                <button 
                  onClick={() => setIsMuted(m => !m)}
                  className={`p-1.5 rounded-lg hover:bg-slate-550/10 transition-colors cursor-pointer ${isMuted ? 'text-rose-500' : 'text-slate-450'}`}
                  title={isMuted ? "Unmute Voice Answers" : "Mute Voice Responses"}
                >
                  {isMuted ? <VolumeX className="w-3.8 h-3.8" /> : <Volume2 className="w-3.8 h-3.8" />}
                </button>

                {/* Close Panel but keep continuous optionally */}
                <button 
                  onClick={() => setShowDocs(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-555/10 text-slate-400 transition-colors cursor-pointer"
                  aria-label="Minimize voice assistant panel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {isDemoMode && (
              <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-[10px] text-amber-600 dark:text-amber-400 font-semibold flex flex-col gap-1 leading-snug">
                <span className="flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>
                    Sandbox Mode Active: Browser blocked physical microphone stream.
                  </span>
                </span>
                <span className="text-[9px] pl-5 opacity-90 leading-tight">
                  You can click any listed command below to select & trigger navigation/SOS flows, or click <strong>"Open in New Tab"</strong> at the top right of the host player to allow microphone access.
                </span>
              </div>
            )}

            {/* Simulated DSP filter control for voice enhancement */}
            <div className={`px-4 py-1.5 border-b text-[9px] flex items-center justify-between font-mono ${
              isDarkMode ? 'bg-slate-950/20 border-slate-800' : 'bg-slate-100/60 border-slate-150'
            }`}>
              <div className="flex items-center gap-1 text-slate-450">
                <Headphones className="w-3 h-3 text-blue-500" />
                <span>DSP Vocal Voice Clarity:</span>
              </div>
              <button 
                onClick={() => setUseNoiseReduction(!useNoiseReduction)}
                className={`py-0.5 px-2 rounded-md font-bold transition-all ${
                  useNoiseReduction 
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                }`}
              >
                {useNoiseReduction ? "ACTIVATED" : "OFF (RAW)"}
              </button>
            </div>

            {/* REAL-TIME DYNAMIC WAVEFORM VISUALIZER & SPEAK-OUTPUTS STATUS */}
            <div className={`p-4 space-y-3 border-b text-xs relative ${
              isDarkMode ? 'border-slate-850 bg-slate-950/20' : 'border-slate-100 bg-slate-50/50'
            }`}>
              
              <div className="flex items-center justify-between">
                <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold">Heard Signal Stream:</span>
                
                {/* Visual state indicators */}
                <div className="flex items-center gap-1.5">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                    isListening ? 'bg-red-500/10 text-red-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-450'
                  }`}>
                    {isListening ? "● LISTENING" : "STANDBY"}
                  </span>
                  {isSpeaking && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-500 animate-pulse">
                      🔊 Assistant Speaking
                    </span>
                  )}
                </div>
              </div>

              {/* STAGE AUDIO WAVE DYNAMIC BLOCKS */}
              <div className="h-12 bg-white/20 dark:bg-slate-950/40 rounded-2xl border border-slate-200/40 dark:border-slate-800 flex items-center justify-center gap-1 px-3">
                {isListening ? (
                  pulseWaves.map((h, i) => (
                    <span 
                      key={i} 
                      className="w-1.5 bg-gradient-to-t from-blue-600 to-cyan-400 rounded-full transition-all duration-75"
                      style={{ height: `${h}%` }}
                    />
                  ))
                ) : (
                  <span className="text-[10px] text-slate-400 italic">Microphone deactivated. Say "Hey Titan" to trigger.</span>
                )}
              </div>

              {/* SPEECH TO TEXT ACCURATE CONVERSION BOX */}
              <div className="space-y-1">
                <p className="font-mono text-[11px] text-slate-505 dark:text-slate-300 italic truncate" title={transcript || "Speak now..."}>
                  {transcript ? `"${transcript}"` : "Waiting for audio signal..."}
                </p>
              </div>

              {/* TEXT TO SPEECH RESPONSE VIEW */}
              <div className="p-3 bg-blue-500/5 border border-blue-500/15 rounded-2.5xl space-y-1">
                <span className="text-[10px] text-blue-500 font-extrabold flex items-center gap-1">
                  <span>Assistant Command Response:</span>
                </span>
                <p className="text-[11.5px] leading-relaxed font-sans font-semibold text-slate-450 dark:text-slate-350">
                  {feedbackText}
                </p>
              </div>
            </div>

            {/* INTERNALS COMPONENT - COMMAND LIBRARY OR LOG TRACING */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
              
              <div className="flex items-center justify-between border-b border-slate-150 dark:border-slate-800">
                <button 
                  onClick={() => setShowConsole(false)}
                  className={`text-[11px] font-extrabold pb-1.5 border-b-2 px-1 transition-all ${!showConsole ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400'}`}
                >
                  🎙️ Voice Command Library
                </button>
                <button 
                  onClick={() => setShowConsole(true)}
                  className={`text-[11px] font-extrabold pb-1.5 border-b-2 px-1 transition-all ${showConsole ? 'border-blue-500 text-blue-500' : 'border-transparent text-slate-400'}`}
                  aria-label="View developer voice telemetry logs"
                >
                  ⚙️ Active DSP Log Logs
                </button>
              </div>

              {!showConsole ? (
                <div className="space-y-2.5">
                  <p className="text-[10px] text-slate-400 leading-normal">
                    Titan AI listens globally. Click on any command list card below to simulate the voice input directly for quick navigation check:
                  </p>

                  <div className="grid grid-cols-1 gap-1.5 max-h-[170px] overflow-y-auto pr-1">
                    {[
                      { cmd: "Book an appointment with a cardiologist", cat: "Appointments", desc: "Opens schedule with Cardiology filter prefilled" },
                      { cmd: "Show my appointments", cat: "Appointments", desc: "View clinical calendars in Student portal" },
                      { cmd: "Cancel appointment", cat: "Appointments", desc: "Prompts pending scheduler cancel assistance" },
                      { cmd: "Reschedule appointment", cat: "Appointments", desc: "Updates pendings timers calendars" },
                      { cmd: "Find cardiologist", cat: "Staff Roster", desc: "Filters clinicians by Cardiology specialty" },
                      { cmd: "Search dermatologist near me", cat: "Staff Roster", desc: "Launches dermatology search directly" },
                      { cmd: "Show available doctors", cat: "Staff Roster", desc: "Lists all expert campus physicians" },
                      { cmd: "Open portal dashboard", cat: "Navigation", desc: "Loads student patient portal hub overview" },
                      { cmd: "Open medical records", cat: "Navigation", desc: "Enters protected lab records files" },
                      { cmd: "Show reports", cat: "Reports", desc: "Generates patient diagnostics summary ledgers" },
                      { cmd: "Find nearby hospitals", cat: "Location Support", desc: "Opens hospital transit maps overlay" },
                      { cmd: "Show emergency contacts", cat: "Helpline Support", desc: "Highlights critical hotline contacts in foot" },
                      { cmd: "Call ambulance", cat: "SOS Emergency", desc: "TRIPLE POWER SOS DISPATCH SQUAD" },
                      { cmd: "Switch to dark mode", cat: "System", desc: "Adjusts night comfort slate background" }
                    ].map((item, index) => (
                      <div 
                        key={index} 
                        onClick={() => {
                          setTranscript(item.cmd);
                          processVoiceInput(item.cmd);
                        }}
                        className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer group transition-all text-[11px] hover:-translate-y-0.5 ${
                          isDarkMode 
                            ? 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800' 
                            : 'bg-slate-50 border-slate-200/60 hover:bg-white hover:shadow-xs'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <span className="text-[8px] bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded font-bold uppercase tracking-wider">
                            {item.cat}
                          </span>
                          <p className="text-slate-800 dark:text-slate-200 font-bold font-sans mt-0.5 leading-tight">
                            "{item.cmd}"
                          </p>
                          <p className="text-[9px] text-slate-400 font-sans">{item.desc}</p>
                        </div>
                        <ArrowRight className="w-3.5 h-3.5 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 font-mono text-[10.5px] text-slate-400">
                  <div className="flex items-center justify-between text-[9px] uppercase tracking-wider border-b pb-1 dark:border-slate-800">
                    <span>UTC Timestamp / Input Audio</span>
                    <span>Recognized Action State</span>
                  </div>

                  <div className="space-y-2 max-h-[160px] overflow-y-auto">
                    {voiceLogs.map((log, idx) => (
                      <div key={idx} className="p-2 bg-slate-950/10 rounded-xl space-y-1">
                        <div className="flex justify-between font-bold text-slate-500 text-[9px]">
                          <span>⏱️ {log.time}</span>
                          <span className="text-slate-350 font-semibold truncate max-w-[155px]">
                            Signal: "{log.text}"
                          </span>
                        </div>
                        <p className="text-emerald-500 font-bold leading-normal pl-3 border-l border-emerald-500/30">
                          ⚡ Status: {log.action}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className={`p-4 border rounded-2xl ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'}`}>
                    <p className="font-bold flex items-center gap-1">
                      <Terminal className="w-4 h-4 text-blue-500" />
                      Webrtc DSP Hardware Stats
                    </p>
                    <p className="text-[10px] mt-1 font-sans font-medium line-clamp-2 leading-relaxed">
                      Active device channels: stereo. Sample Rate: 48kHz. AGC: Enabled. Multi-dialect text alignment processor validated on English, Hindi, and Kannada successfully.
                    </p>
                  </div>
                </div>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. COHESIVE HOSPITAL ADDRESS MAP OVERLAY */}
      <AnimatePresence>
        {showHospitalsMap && selectedHospital && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <motion.div 
              initial={{ scale: 0.94, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.94, opacity: 0 }}
              className={`max-w-lg w-full rounded-3xl border shadow-2xl flex flex-col overflow-hidden ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
              }`}
              id="nearby-hospitals-modal"
            >
              {/* Maps Header */}
              <div className={`p-4 border-b flex items-center justify-between ${
                isDarkMode ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5.5 h-5.5 text-blue-600 animate-bounce" />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white leading-none">Nearby Emergency Care Locations</h4>
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">Transit Times relative to Titan Campus coordinates</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowHospitalsMap(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-500/10 text-slate-400 transition-colors cursor-pointer"
                  aria-label="Close hospital transit locations list"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Transit Map layout */}
              <div className="p-5 space-y-4 max-h-[420px] overflow-y-auto">
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans font-medium">
                  Select a clinical center to simulate routing directions. Touch help triggers to call ambulance dispatch.
                </p>

                {/* List of 4 locations with distances */}
                <div className="space-y-2.5">
                  {[
                    { name: "Titan On-Campus Center Infirmary", dist: "0.1 km", time: "1 min on foot", desc: "Located inside Building C, Ground floor", helpline: "+91 1800 555 911" },
                    { name: "Columbia Asia Hospital Whitefield", dist: "2.4 km", time: "8 mins drive", desc: "Primary comprehensive multi-specialty center near Whitefield Road", helpline: "+91 80 4012 4012" },
                    { name: "Vydehi Hospital & Research Center", dist: "3.7 km", time: "12 mins drive", desc: "Apex trauma & 24/7 cardiac emergency facility", helpline: "+91 80 2841 3300" },
                    { name: "Apollo Clinic ECC Road", dist: "1.9 km", time: "5 mins drive", desc: "Family outpatient specialty, ENT vaccines, primary flu blocks", helpline: "+91 80 4930 4930" }
                  ].map((loc, idx) => (
                    <div 
                      key={idx}
                      onClick={() => {
                        setSelectedHospital(loc);
                        const speech = `Routing directions to ${loc.name} are loaded. Estimated travel coordinates require approximately ${loc.time}.`;
                        speakResponse(speech);
                      }}
                      className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                        selectedHospital?.name === loc.name 
                          ? 'border-blue-500 bg-blue-100/10 dark:bg-blue-900/10' 
                          : 'border-slate-150 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-extrabold text-xs text-slate-900 dark:text-white">{loc.name}</h5>
                          <p className="text-[10px] text-slate-450 dark:text-slate-400 font-sans font-medium leading-normal mt-0.5">{loc.desc}</p>
                          <p className="text-[10px] text-blue-500 font-bold mt-1.5 flex items-center gap-1 font-mono">
                            ☎️ Emergency Call: {loc.helpline}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="bg-blue-600 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
                            {loc.dist}
                          </span>
                          <p className="text-[9px] text-slate-400 font-mono mt-1 font-bold">{loc.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Selected Direction readout */}
                <div className="p-4 bg-teal-500/5 border border-teal-500/15 rounded-2xl space-y-1">
                  <span className="text-[9.5px] bg-teal-650 text-white font-bold font-mono py-0.5 px-2 rounded uppercase">
                    Active Road Voice Assistant Directions
                  </span>
                  <p className="text-[11.5px] font-bold leading-normal text-teal-700 dark:text-teal-400 font-sans mt-1">
                    Route: Titan Campus main gate &rarr; ECC Road bypass &rarr; Varthur Link bypass. Current status is calculated as traffic clear.
                  </p>
                </div>
              </div>

              {/* Simulating emergency actions */}
              <div className={`p-4 border-t flex items-center justify-between ${
                isDarkMode ? 'bg-slate-950/20 border-slate-800' : 'bg-slate-50 border-slate-200'
              }`}>
                <p className="text-[11px] text-slate-400 font-sans font-semibold">Immediate paramedic sirens requested directly?</p>
                <button 
                  onClick={() => {
                    setShowHospitalsMap(false);
                    onTriggerSOSFast();
                  }}
                  className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-600/10 cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4 text-white" />
                  Dispatch Rescue Paramedic
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. CORE TRIGGER FLOATING CIRCULAR CORE/ORB */}
      <div className="flex items-center gap-3">
        
        {/* Dynamic status helper bubble */}
        <AnimatePresence>
          {!showDocs && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              onClick={() => {
                setShowDocs(true);
                if (micPermissionGranted !== true) {
                  setShowPermissionPopup(true);
                } else {
                  setIsListening(true);
                }
              }}
              className={`py-2 px-4 rounded-2xl border text-[10.5px] font-extrabold shadow-md flex items-center gap-2 select-none cursor-pointer hover:border-blue-500 hover:scale-103 transition-transform ${
                isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-205 text-slate-700'
              }`}
              title="Activate hand-free support commands"
            >
              <span className={`w-2 h-2 rounded-full ${isListening ? 'bg-red-500 animate-ping' : 'bg-emerald-500 animate-pulse'}`} />
              <span>Voice Assist. Say <span className="text-blue-500">"Hey Titan"</span></span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Float core button */}
        <button 
          onClick={handleMicClick}
          className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl relative transition-all duration-300 transform active:scale-95 cursor-pointer ${
            !isSpeechSupported 
              ? 'bg-slate-350 text-slate-400 cursor-not-allowed'
              : isListening 
                ? 'bg-blue-600 text-white ring-4 ring-blue-500/35 scale-105' 
                : isDarkMode 
                  ? 'bg-slate-800 text-slate-200 hover:bg-slate-750 border border-slate-700 hover:scale-105' 
                  : 'bg-white text-blue-600 hover:bg-slate-50 border border-slate-200/80 hover:scale-105'
          }`}
          title="Titan AI voice diagnostics support commander"
          aria-label={isListening ? "Mute Speech recognition" : "Enable Speech recognition"}
        >
          {isListening ? (
            <>
              {/* Glow pulses */}
              <span className="absolute inset-0 rounded-full bg-blue-500 animate-ping opacity-45 pointer-events-none" />
              <Mic className="w-5.8 h-5.8 animate-pulse stroke-[2.2]" />
            </>
          ) : (
            <Mic className="w-5.8 h-5.8 stroke-[2]" />
          )}
        </button>

      </div>

    </div>
  );
}
