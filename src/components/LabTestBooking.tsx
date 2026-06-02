import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Search, 
  Layers, 
  DollarSign, 
  Calendar, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  FileText, 
  Download, 
  Mail, 
  Share2, 
  Clock, 
  TrendingUp, 
  Users, 
  BookOpen, 
  Percent, 
  ChevronRight, 
  Info, 
  AlertCircle, 
  Check, 
  Sparkles,
  Map,
  Truck,
  Building,
  ArrowRight,
  ShieldCheck,
  Send,
  Star
} from "lucide-react";

// Types
export interface LabTest {
  id: string;
  name: string;
  category: string;
  price: number;
  symptoms?: string[];
}

export interface HealthPackage {
  id: string;
  name: string;
  price: number;
  tests: string[];
  description: string;
}

export interface LabBooking {
  id: string;
  patientName: string;
  patientId: string;
  age: number;
  gender: string;
  mobile: string;
  email: string;
  testCategory: string;
  testName: string;
  price: number;
  preferredDate: string;
  preferredTime: string;
  collectionType: 'visit' | 'home';
  address?: {
    houseNo: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentMethod: string;
  paymentStatus: 'paid' | 'pending';
  bookingStatus: 'confirmed' | 'pending' | 'completed';
  createdAt: string;
}

export interface LabReport {
  id: string;
  testName: string;
  category: string;
  patientName: string;
  patientId: string;
  dateCollected: string;
  status: 'Published' | 'Pending';
  findings: Record<string, { value: string; range: string; unit: string; isAbnormal: boolean }>;
  summary: string;
}

interface LabTestBookingProps {
  studentName: string;
  studentId: string;
  patientEmail?: string;
  patientMobile?: string;
  patientCity?: string;
  patientDob?: string;
  patientGender?: string;
  isDarkMode: boolean;
}

// ----------------------------------------------------
// RAW CLINICAL DATA CONSTANTS
// ----------------------------------------------------
const LAB_TEST_CATALOG: LabTest[] = [
  // Blood & Pathology
  { id: "b1", name: "Complete Blood Count (CBC)", category: "Blood Tests", price: 350, symptoms: ["fatigue", "fever", "weakness", "infection", "pallor"] },
  { id: "b2", name: "ESR", category: "Blood Tests", price: 150, symptoms: ["inflammation", "joint pain", "fever"] },
  { id: "b3", name: "CRP", category: "Blood Tests", price: 500, symptoms: ["swelling", "infection", "fever", "inflammation"] },
  { id: "b4", name: "Blood Group", category: "Blood Tests", price: 200, symptoms: ["emergency", "transfusion", "id card"] },
  { id: "b5", name: "Hemoglobin", category: "Blood Tests", price: 120, symptoms: ["anaemia", "fatigue", "shortness of breath", "cold hands"] },
  { id: "b6", name: "Platelet Count", category: "Blood Tests", price: 250, symptoms: ["easy bruising", "bleeding gums", "clotting issues"] },
  { id: "b7", name: "Peripheral Smear", category: "Blood Tests", price: 300, symptoms: ["abnormal blood cells", "parasite infection"] },
  { id: "b8", name: "Iron Profile", category: "Blood Tests", price: 900, symptoms: ["hair loss", "chronic fatigue", "paleness"] },
  { id: "b9", name: "Ferritin Test", category: "Blood Tests", price: 1000, symptoms: ["chronic fatigue", "restless legs"] },
  { id: "b10", name: "Vitamin D", category: "Blood Tests", price: 1200, symptoms: ["bone pain", "depression", "fatigue", "muscle weakness"] },
  { id: "b11", name: "Vitamin B12", category: "Blood Tests", price: 1000, symptoms: ["numbness", "brain fog", "fatigue", "tingling"] },

  // Diabetes
  { id: "d1", name: "Fasting Blood Sugar", category: "Diabetes Tests", price: 120, symptoms: ["frequent urination", "excessive thirst", "unexplained weight loss"] },
  { id: "d2", name: "PP Blood Sugar", category: "Diabetes Tests", price: 120, symptoms: ["post meal headache", "lethargy"] },
  { id: "d3", name: "Random Blood Sugar", category: "Diabetes Tests", price: 100, symptoms: ["dizziness", "shaking", "confusion"] },
  { id: "d4", name: "HbA1c", category: "Diabetes Tests", price: 500, symptoms: ["diabetes monitoring", "blurry vision", "dry mouth"] },
  { id: "d5", name: "Insulin Test", category: "Diabetes Tests", price: 900, symptoms: ["insulin resistance", "pcos", "sugar crashes"] },
  { id: "d6", name: "Diabetes Profile", category: "Diabetes Tests", price: 1200, symptoms: ["full checkup", "family history of diabetes"] },

  // Thyroid
  { id: "t1", name: "TSH", category: "Thyroid Tests", price: 350, symptoms: ["unexpected weight gain", "weight loss", "dry skin", "constipation"] },
  { id: "t2", name: "T3", category: "Thyroid Tests", price: 250, symptoms: ["racing heart", "anxiety", "heat sensitivity"] },
  { id: "t3", name: "T4", category: "Thyroid Tests", price: 250, symptoms: ["sluggishness", "cold sensitivity", "hair loss"] },
  { id: "t4", name: "Thyroid Profile", category: "Thyroid Tests", price: 650, symptoms: ["hormone imbalance", "sluggish metabolism"] },

  // Cardiac
  { id: "c1", name: "ECG", category: "Cardiac Tests", price: 300, symptoms: ["chest pain", "palpitations", "rapid pulse", "shortness of breath"] },
  { id: "c2", name: "2D Echo", category: "Cardiac Tests", price: 2000, symptoms: ["heart murmur", "swollen ankles", "fatigue"] },
  { id: "c3", name: "TMT", category: "Cardiac Tests", price: 2500, symptoms: ["stress induced chest pain", "exercise assessment"] },
  { id: "c4", name: "Troponin-I", category: "Cardiac Tests", price: 1500, symptoms: ["acute crushing chest pressure", "radiating jaw pain"] },
  { id: "c5", name: "CK-MB", category: "Cardiac Tests", price: 800, symptoms: ["chest pain", "suspected heart attack"] },
  { id: "c6", name: "Cardiac Risk Profile", category: "Cardiac Tests", price: 2500, symptoms: ["cholesterol check", "family stroke history"] },

  // Hormone
  { id: "h1", name: "Testosterone", category: "Hormone Tests", price: 900, symptoms: ["low libido", "decreased stamina", "muscle loss"] },
  { id: "h2", name: "Estrogen", category: "Hormone Tests", price: 1000, symptoms: ["irregular periods", "mood swings", "hot flashes"] },
  { id: "h3", name: "Progesterone", category: "Hormone Tests", price: 900, symptoms: ["pregnancy issues", "unusual spotting"] },
  { id: "h4", name: "Prolactin", category: "Hormone Tests", price: 700, symptoms: ["unexplained lactation", "infertility"] },
  { id: "h5", name: "FSH", category: "Hormone Tests", price: 850, symptoms: ["amenorrhea", "low sperm count", "menstrual sync"] },
  { id: "h6", name: "LH", category: "Hormone Tests", price: 850, symptoms: ["ovulation monitoring", "puberty timelines"] },

  // Infection & Viral
  { id: "i1", name: "Dengue Test", category: "Infection Tests", price: 1200, symptoms: ["high grade fever", "severe bone ache", "behind eyes pain"] },
  { id: "i2", name: "Malaria Test", category: "Infection Tests", price: 400, symptoms: ["shivering chills", "cyclic fever spikes", "sweating"] },
  { id: "i3", name: "Typhoid Test", category: "Infection Tests", price: 600, symptoms: ["step ladder fever", "stomach discomfort", "dry tongue"] },
  { id: "i4", name: "HIV Test", category: "Infection Tests", price: 600, symptoms: ["vulnerability", "swollen lymph nodes", "prolonged fever"] },
  { id: "i5", name: "Hepatitis B", category: "Infection Tests", price: 700, symptoms: ["jaundice", "dark yellow urine", "right upper quadrant chest pain"] },
  { id: "i6", name: "Hepatitis C", category: "Infection Tests", price: 900, symptoms: ["fatigue", "nausea", "loss of appetite"] },
  { id: "i7", name: "COVID RT-PCR", category: "Infection Tests", price: 700, symptoms: ["loss of smell and taste", "dry sore throat", "cough"] },
  { id: "i8", name: "Tuberculosis Screening", category: "Infection Tests", price: 1000, symptoms: ["chronic bloody cough", "night sweats", "weight loss"] },

  // Urine & Stool
  { id: "u1", name: "Urine Routine", category: "Urine Tests", price: 150, symptoms: ["burning urinary tract irritation", "cloudy urine", "pus cells"] },
  { id: "u2", name: "Urine Culture", category: "Urine Tests", price: 600, symptoms: ["recurrent bladder pain", "severe burning sensation"] },
  { id: "u3", name: "Pregnancy Test", category: "Urine Tests", price: 200, symptoms: ["missed period", "early morning sickness"] },
  { id: "u4", name: "Stool Routine", category: "Stool Tests", price: 250, symptoms: ["loose stools", "blood in stool", "stomach cramps"] },
  { id: "u5", name: "Stool Culture", category: "Stool Tests", price: 700, symptoms: ["chronic water diarrhea", "unexplained dysentery"] },

  // Allergy
  { id: "a1", name: "Food Allergy Panel", category: "Allergy Tests", price: 2500, symptoms: ["hives post meals", "swelling lips", "stomach pain"] },
  { id: "a2", name: "Dust Allergy Test", category: "Allergy Tests", price: 1800, symptoms: ["continuous sneezing", "watery eyes", "congested sinuses"] },
  { id: "a3", name: "Skin Allergy Test", category: "Allergy Tests", price: 2200, symptoms: ["chronic eczema", "itchy red welts", "contact dermatitis"] },
  { id: "a4", name: "Complete Allergy Profile", category: "Allergy Tests", price: 4500, symptoms: ["recurrent allergic shocks", "severe chronic dermatitis"] },

  // Cancer Screening
  { id: "ca1", name: "PSA Test", category: "Cancer Screening", price: 1200, symptoms: ["prostate wellness", "difficulty urinating in older males"] },
  { id: "ca2", name: "CA-125", category: "Cancer Screening", price: 1800, symptoms: ["ovarian surveillance", "unexplained abdominal bloating"] },
  { id: "ca3", name: "CEA Test", category: "Cancer Screening", price: 1500, symptoms: ["colorectal screen", "sudden extreme colon transitions"] },
  { id: "ca4", name: "PAP Smear", category: "Cancer Screening", price: 1200, symptoms: ["cervical cytopathology check", "irregular vaginal discharge"] },
  { id: "ca5", name: "Cancer Screening Package", category: "Cancer Screening", price: 5000, symptoms: ["preventative screen", "genetic cancer background"] },

  // Radiology
  { id: "r1", name: "X-Ray Chest", category: "Radiology Tests", price: 500, symptoms: ["persistent heavy cough", "rib pain", "breathing fluid rattle"] },
  { id: "r2", name: "X-Ray Spine", category: "Radiology Tests", price: 700, symptoms: ["chronic lower back pinch", "post fall alignment check"] },
  { id: "r3", name: "Ultrasound Abdomen", category: "Radiology Tests", price: 1200, symptoms: ["gallbladder pain", "appendix inflation", "liver health assessment"] },
  { id: "r4", name: "Ultrasound Pelvis", category: "Radiology Tests", price: 1200, symptoms: ["pelvic pain", "bladder scan", "pregnancy check"] },
  { id: "r5", name: "CT Scan Brain", category: "Radiology Tests", price: 3500, symptoms: ["severe skull injury", "sudden speech loss", "acute stroke symptoms"] },
  { id: "r6", name: "CT Scan Chest", category: "Radiology Tests", price: 4500, symptoms: ["pulmonary embolism suspect", "recurrent pneumonia scan"] },
  { id: "r7", name: "MRI Brain", category: "Radiology Tests", price: 6000, symptoms: ["persistent vertigo", "prolonged nerve fog", "fits or seizures"] },
  { id: "r8", name: "MRI Spine", category: "Radiology Tests", price: 7000, symptoms: ["herniated disk", "sciatica nerve radiation", "numb extremities"] },
  { id: "r9", name: "Mammography", category: "Radiology Tests", price: 2500, symptoms: ["breast lump screen", "preventative check"] }
];

const HEALTH_PACKAGES: HealthPackage[] = [
  {
    id: "pkg1",
    name: "Basic Health Checkup",
    price: 999,
    tests: ["Complete Blood Count (CBC)", "Random Blood Sugar", "Urine Routine", "BP Check"],
    description: "General body analysis monitoring hemoglobin, glucose index under generic parameters."
  },
  {
    id: "pkg2",
    name: "Advanced Health Checkup",
    price: 2499,
    tests: ["Complete Blood Count (CBC)", "Liver Function Test (LFT)", "Kidney Function Test (KFT)", "Lipid Profile", "Diabetes Screening"],
    description: "Comprehensive vital organ screen assessing hepatic function, renal filtration, and cardiac risk parameters."
  },
  {
    id: "pkg3",
    name: "Executive Health Package",
    price: 4999,
    tests: ["Full Body Screening", "ECG", "Thyroid Profile", "Vitamin D", "Vitamin B12"],
    description: "Elite diagnostic suite ideal for detailed metabolism reviews, cardiovascular strength assessments, and critical vitamin levels."
  },
  {
    id: "pkg4",
    name: "Senior Citizen Package",
    price: 3999,
    tests: ["Complete Health Assessment", "Heart Screening", "Diabetes Screening", "Bone Health Check"],
    description: "Tailored pathological check addressing bone calcium density, cardiac stability, and diabetes levels for elderly persons."
  }
];

const AVAILABLE_SLOTS = [
  "07:00 AM",
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM"
];

const CATEGORIES = [
  "All Tests",
  "Blood Tests",
  "Diabetes Tests",
  "Thyroid Tests",
  "Cardiac Tests",
  "Hormone Tests",
  "Infection Tests",
  "Urine Tests",
  "Stool Tests",
  "Allergy Tests",
  "Cancer Screening",
  "Radiology Tests",
  "Full Body Checkups"
];

// Seed initial reports history
const INITIAL_REPORTS: LabReport[] = [
  {
    id: "REP-2026-601",
    testName: "Complete Blood Count (CBC)",
    category: "Blood Tests",
    patientName: "Maya Lin",
    patientId: "S10943",
    dateCollected: "2026-05-18",
    status: "Published",
    findings: {
      "Hemoglobin": { value: "13.4", range: "12.0 - 15.5", unit: "g/dL", isAbnormal: false },
      "Red Blood Cell (RBC)": { value: "4.2", range: "3.8 - 5.1", unit: "million/mcL", isAbnormal: false },
      "White Blood Cell (WBC)": { value: "11.2", range: "4.5 - 11.0", unit: "billion/L", isAbnormal: true }, // slightly elevated
      "Platelet Count": { value: "280", range: "150 - 450", unit: "billion/L", isAbnormal: false },
      "Neutrophils": { value: "72", range: "40 - 70", unit: "%", isAbnormal: true }
    },
    summary: "Mild leukocytosis with elevated neutrophil percentage. Correlates with the reported acute throat inflammation/swelling symptoms."
  },
  {
    id: "REP-2026-440",
    testName: "Thyroid Profile",
    category: "Thyroid Tests",
    patientName: "Maya Lin",
    patientId: "S10943",
    dateCollected: "2026-03-12",
    status: "Published",
    findings: {
      "Triiodothyronine (T3)": { value: "1.4", range: "0.8 - 2.0", unit: "ng/mL", isAbnormal: false },
      "Thyroxine (T4)": { value: "7.8", range: "4.5 - 11.5", unit: "mcg/dL", isAbnormal: false },
      "Thyroid Stimulating Hormone (TSH)": { value: "2.1", range: "0.4 - 4.5", unit: "uIU/mL", isAbnormal: false }
    },
    summary: "Euthyroid state. Ambient serum hormone indicators fall entirely within acceptable non-critical ranges."
  },
  {
    id: "REP-2026-112",
    testName: "Fasting Blood Sugar",
    category: "Diabetes Tests",
    patientName: "James Carter",
    patientId: "S11202",
    dateCollected: "2026-04-05",
    status: "Published",
    findings: {
      "Fasting Plasma Glucose": { value: "92", range: "70 - 100", unit: "mg/dL", isAbnormal: false }
    },
    summary: "Normal fasting blood sugar profile. No indication of glycemic distress."
  }
];

export default function LabTestBooking({
  studentName,
  studentId,
  patientEmail = "guest@titan.com",
  patientMobile = "+91 99000 00000",
  patientCity = "Bengaluru",
  patientDob = "2004-05-14",
  patientGender = "Female",
  isDarkMode
}: LabTestBookingProps) {
  // Navigation states
  const [activeSubTab, setActiveSubTab] = useState<'catalog' | 'my-bookings' | 'reports' | 'dashboard'>('catalog');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Tests");
  const [priceRange, setPriceRange] = useState(8000);
  const [selectedSymptom, setSelectedSymptom] = useState("");

  // Booking details flow
  const [bookingStep, setBookingStep] = useState(1); // 1 = form, 2 = confirmation
  const [selectedTest, setSelectedTest] = useState<LabTest | HealthPackage | null>(null);

  // Form inputs
  const [formName, setFormName] = useState(studentName || "");
  const [formAge, setFormAge] = useState(22);
  const [formGender, setFormGender] = useState(patientGender || "Female");
  const [formMobile, setFormMobile] = useState(patientMobile || "");
  const [formEmail, setFormEmail] = useState(patientEmail || "");
  const [formDate, setFormDate] = useState("");
  const [formTimeSlot, setFormTimeSlot] = useState("");
  const [sampleCollectionType, setSampleCollectionType] = useState<'visit' | 'home'>('visit');
  
  // Home collection address
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [pincode, setPincode] = useState("");
  const [cityVal, setCityVal] = useState(patientCity || "Bengaluru");
  const [stateVal, setStateVal] = useState("Karnataka");

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState("UPI");

  // Local persistent storage lists
  const [bookingsList, setBookingsList] = useState<LabBooking[]>(() => {
    const saved = localStorage.getItem("titan_lab_bookings");
    if (saved) return JSON.parse(saved);
    // Starter defaults
    return [
      {
        id: "BOOK-8491",
        patientName: studentName || "Maya Lin",
        patientId: studentId || "S10943",
        age: 22,
        gender: patientGender || "Female",
        mobile: patientMobile || "+91 99887 76655",
        email: patientEmail || "maya.lin@titanhealthconnect.com",
        testCategory: "Thyroid Tests",
        testName: "Thyroid Profile",
        price: 650,
        preferredDate: new Date(Date.now() - 86400000 * 5).toISOString().split("T")[0],
        preferredTime: "09:00 AM",
        collectionType: "visit",
        paymentMethod: "UPI",
        paymentStatus: "paid",
        bookingStatus: "completed",
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
      },
      {
        id: "BOOK-3301",
        patientName: studentName || "Maya Lin",
        patientId: studentId || "S10943",
        age: 22,
        gender: patientGender || "Female",
        mobile: patientMobile || "+91 99887 76655",
        email: patientEmail || "maya.lin@titanhealthconnect.com",
        testCategory: "Blood Tests",
        testName: "Complete Blood Count (CBC)",
        price: 350,
        preferredDate: new Date().toISOString().split("T")[0],
        preferredTime: "10:00 AM",
        collectionType: "home",
        address: {
          houseNo: "Suite 302",
          street: "Campus Residential Hall A",
          city: "Bengaluru",
          state: "Karnataka",
          pincode: "560066"
        },
        paymentMethod: "Credit Card",
        paymentStatus: "paid",
        bookingStatus: "confirmed",
        createdAt: new Date().toISOString()
      }
    ];
  });

  const [reportsList, setReportsList] = useState<LabReport[]>(() => {
    const saved = localStorage.getItem("titan_lab_reports");
    return saved ? JSON.parse(saved) : INITIAL_REPORTS;
  });

  // Notifications Panel list
  const [notificationsList, setNotificationsList] = useState<{ id: string; title: string; body: string; type: string; date: string; read: boolean }[]>([
    {
      id: "ntf-1",
      title: "Report Published",
      body: "Your Thyroid Profile test report is published and available for secure offline storage or Doctor sharing.",
      type: "report",
      date: "May 28, 2026",
      read: false
    },
    {
      id: "ntf-2",
      title: "Appointment Confirmed",
      body: "Your Complete Blood Count (CBC) home collection session is confirmed for today at 10:00 AM.",
      type: "booking",
      date: "Today",
      read: false
    }
  ]);

  // Modal active state for printed report preview
  const [viewingReport, setViewingReport] = useState<LabReport | null>(null);

  // Sync state data on patient details change
  useEffect(() => {
    if (studentName) setFormName(studentName);
    if (patientMobile) setFormMobile(patientMobile);
    if (patientEmail) setFormEmail(patientEmail);
  }, [studentName, patientMobile, patientEmail]);

  // Save changes locally
  useEffect(() => {
    localStorage.setItem("titan_lab_bookings", JSON.stringify(bookingsList));
  }, [bookingsList]);

  useEffect(() => {
    localStorage.setItem("titan_lab_reports", JSON.stringify(reportsList));
  }, [reportsList]);

  // ----------------------------------------------------
  // VOICE COMMAND LISTENER
  // ----------------------------------------------------
  useEffect(() => {
    const handleVoiceLabBooking = (e: Event) => {
      const customEvent = e as CustomEvent;
      const cmd = customEvent.detail?.command?.toLowerCase() || "";
      
      console.log("Voice Command Captured in Lab Module:", cmd);

      // 1. Show Thyroid
      if (cmd.includes("thyroid")) {
        setSelectedCategory("Thyroid Profile" in cmd ? "All Tests" : "Thyroid Tests");
        setSearchQuery("thyroid");
        setActiveSubTab('catalog');
        triggerVoiceFeedback("I have loaded our available thyroid profile and pathology assays.");
      }
      // 2. Book CBC Test
      else if (cmd.includes("cbc") || cmd.includes("blood count")) {
        const cbcTest = LAB_TEST_CATALOG.find(t => t.name.includes("CBC") || t.name.toLowerCase().includes("complete blood count"));
        if (cbcTest) {
          setSelectedTest(cbcTest);
          setActiveSubTab('catalog');
          setBookingStep(1);
          // scroll to booking form
          setTimeout(() => {
            document.getElementById("booking-card-form")?.scrollIntoView({ behavior: 'smooth' });
          }, 300);
          triggerVoiceFeedback("Opening the booking scheduler for Complete Blood Count. Prefilled test profile successfully.");
        }
      }
      // 3. Schedule tomorrow
      else if (cmd.includes("tomorrow")) {
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
        setFormDate(tomorrow);
        setFormTimeSlot("09:00 AM");
        triggerVoiceFeedback("Configured preferred date slot to tomorrow at 9:00 AM.");
      }
      // 4. Book home collection
      else if (cmd.includes("home sample") || cmd.includes("home collection")) {
        setSampleCollectionType('home');
        triggerVoiceFeedback("Toggled sample configuration to home sample collection. Please complement your residential coordinates below.");
      }
      // 5. Download my lab report
      else if (cmd.includes("download") || cmd.includes("report")) {
        setActiveSubTab('reports');
        if (reportsList.length > 0) {
          setViewingReport(reportsList[0]);
          triggerVoiceFeedback("Pulled up your latest pathological report. You can audit results or tap print to download PDF.");
        } else {
          triggerVoiceFeedback("I couldn't locate any completed laboratory documents in your clinical path record.");
        }
      }
      // 6. Prices
      else if (cmd.includes("price") || cmd.includes("prices") || cmd.includes("cost")) {
        setActiveSubTab('catalog');
        setSearchQuery("");
        setSelectedCategory("All Tests");
        triggerVoiceFeedback("Displaying complete medical laboratory test pricing parameters from Titan HealthConnect pathology division.");
      }
    };

    window.addEventListener('voice-lab-booking', handleVoiceLabBooking);
    return () => window.removeEventListener('voice-lab-booking', handleVoiceLabBooking);
  }, [reportsList]);

  const triggerVoiceFeedback = (msg: string) => {
    // Speak using synthetic SpeechSynthesis if supported
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(msg);
      window.speechSynthesis.speak(u);
    }
  };

  // ----------------------------------------------------
  // SEARCH FILTERING ALGORITHM
  // ----------------------------------------------------
  const filteredTests = LAB_TEST_CATALOG.filter(test => {
    const matchesQuery = test.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         test.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (test.symptoms && test.symptoms.some(s => s.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesCategory = selectedCategory === "All Tests" || test.category === selectedCategory;
    const matchesPrice = test.price <= priceRange;
    const matchesSymptom = !selectedSymptom || (test.symptoms && test.symptoms.includes(selectedSymptom.toLowerCase()));

    return matchesQuery && matchesCategory && matchesPrice && matchesSymptom;
  });

  // Extract unique symptoms list for drop-down assistant
  const symptomsList = Array.from(
    new Set(LAB_TEST_CATALOG.flatMap(t => t.symptoms || []))
  ).sort();

  // ----------------------------------------------------
  // BOOKING SUBMISSION HANDLER
  // ----------------------------------------------------
  const handleConfirmReservation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTest) {
      alert("Please select a diagnostic test or package to schedule.");
      return;
    }
    if (!formDate || !formTimeSlot) {
      alert("Please designate a preferred date and suitable time slot.");
      return;
    }
    if (sampleCollectionType === 'home' && (!houseNo || !street || !pincode)) {
      alert("Please finalize your residence address for precise home sample collection.");
      return;
    }

    const uniqueId = "BOOK-" + Math.floor(1000 + Math.random() * 9000);
    const newBooking: LabBooking = {
      id: uniqueId,
      patientName: formName,
      patientId: studentId || "GUEST-ID",
      age: Number(formAge),
      gender: formGender,
      mobile: formMobile,
      email: formEmail,
      testCategory: 'tests' in selectedTest ? "Full Body Package" : selectedTest.category,
      testName: selectedTest.name,
      price: selectedTest.price,
      preferredDate: formDate,
      preferredTime: formTimeSlot,
      collectionType: sampleCollectionType,
      address: sampleCollectionType === 'home' ? {
        houseNo,
        street,
        city: cityVal,
        state: stateVal,
        pincode
      } : undefined,
      paymentMethod,
      paymentStatus: paymentMethod === 'Cash at Center' ? 'pending' : 'paid',
      bookingStatus: 'confirmed',
      createdAt: new Date().toISOString()
    };

    // Update state lists
    setBookingsList(prev => [newBooking, ...prev]);

    // Construct automated notification sequence
    const notifyBook: typeof notificationsList[0] = {
      id: "ntf-" + Math.random().toString(36).substr(2, 5),
      title: "Appointment Verified!",
      body: `Your booking for ${selectedTest.name} is confirmed for ${formDate} at ${formTimeSlot}.`,
      type: "booking",
      date: "Just Now",
      read: false
    };

    const notifyPay: typeof notificationsList[0] = {
      id: "ntf-" + Math.random().toString(36).substr(2, 5),
      title: "Payment Received Successfully",
      body: `Transaction of ₹${selectedTest.price} via ${paymentMethod} has been approved for reference ${uniqueId}.`,
      type: "payment",
      date: "Just Now",
      read: false
    };

    const notifySample: typeof notificationsList[0] = {
      id: "ntf-" + Math.random().toString(36).substr(2, 5),
      title: sampleCollectionType === 'home' ? "Collection Agent Dispatched" : "Prepare for Center Walk-In",
      body: sampleCollectionType === 'home' 
        ? `A certified phlebotomist is scheduled to arrive at ${houseNo}, ${street} between ${formTimeSlot}.`
        : `Your token reference is registered. Present at Titan Infirmary Lounge B, Main Campus on ${formDate}.`,
      type: "sample",
      date: "Just Now",
      read: false
    };

    setNotificationsList(prev => [notifySample, notifyPay, notifyBook, ...prev]);

    // Clear and navigate
    setBookingStep(2); // confirmed panel
  };

  const resetBookingForm = () => {
    setSelectedTest(null);
    setBookingStep(1);
    setFormDate("");
    setFormTimeSlot("");
    setHouseNo("");
    setStreet("");
    setPincode("");
  };

  // Helper to trigger dummy PDF report generation or mock printing
  const printReport = (report: LabReport) => {
    window.print();
  };

  const emailReport = (report: LabReport) => {
    alert(`A digital copy of ${report.testName} pathological report (PDF format) has been securely dispatched to your authorized email address: ${formEmail}.`);
  };

  const shareReportWithDoctor = (report: LabReport) => {
    alert(`Authorized record release: Clinical data for report ID ${report.id} shared directly with Doctor roster (On-duty Resident practitioner can access this in AdminPortal now).`);
  };

  // ANALYTICS COMPUTATIONS
  const totalLabTestsBookedCount = bookingsList.length;
  const todayBookingsCount = bookingsList.filter(b => b.preferredDate === new Date().toISOString().split("T")[0]).length;
  const homeCollectionsScheduledCount = bookingsList.filter(b => b.collectionType === "home").length;
  const completedTestsCount = bookingsList.filter(b => b.bookingStatus === "completed").length;
  const pendingReportsCount = reportsList.filter(r => r.status === "Pending").length;
  const totalRevenueSum = bookingsList.reduce((acc, b) => acc + b.price, 0);

  // Popular test metrics count
  const testFrequencyMap: Record<string, number> = {};
  bookingsList.forEach(b => {
    testFrequencyMap[b.testName] = (testFrequencyMap[b.testName] || 0) + 1;
  });
  const sortedPopularTests = Object.entries(testFrequencyMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a,b) => b.count - a.count)
    .slice(0, 3);

  return (
    <div className="space-y-6 @container">
      
      {/* Visual Header Grid banner representing contemporary Modern Pathology Wing block */}
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-[30px] p-6 sm:p-8 text-white relative overflow-hidden shadow-lg border border-white/10">
        <div className="absolute top-0 right-0 p-4 translate-x-4 -translate-y-4 text-white/5 font-display font-black text-8xl pointer-events-none select-none">
          LAB
        </div>
        
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-white/20 border border-white/25 text-white/95 px-3 py-1 rounded-full font-bold uppercase tracking-widest flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-blue-200 animate-pulse" />
              Pathology Services
            </span>
            <span className="text-[10px] bg-amber-400 text-slate-900 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
              24 HR Diagnostics
            </span>
          </div>
          
          <h1 className="font-display font-extrabold text-2xl sm:text-4xl tracking-tight leading-tight">
            Integrated Lab Booking & Diagnostics Hub
          </h1>
          
          <p className="text-xs sm:text-sm text-blue-100 font-sans leading-relaxed">
            Reserve clinical laboratory testing, schedule custom residential blood collections by certifed phlebotomists, evaluate live pathology reports, and manage all campus medical records in one continuous dashboard.
          </p>

          {/* Quick Subtab Selector Tabs inside wing */}
          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={() => setActiveSubTab('catalog')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSubTab === 'catalog' ? 'bg-white text-blue-700 shadow' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              🔍 Test Catalog & Booking
            </button>
            <button
              onClick={() => setActiveSubTab('my-bookings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all relative ${activeSubTab === 'my-bookings' ? 'bg-white text-blue-700 shadow' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              📅 Schedule Logs ({bookingsList.length})
            </button>
            <button
              onClick={() => setActiveSubTab('reports')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSubTab === 'reports' ? 'bg-white text-blue-700 shadow' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              📄 Medical Reports ({reportsList.length})
            </button>
            <button
              onClick={() => setActiveSubTab('dashboard')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSubTab === 'dashboard' ? 'bg-white text-blue-700 shadow' : 'bg-white/10 text-white hover:bg-white/20'}`}
            >
              📊 Live Lab Analytics
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area depends on active sub tab state */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: PRIMARY WORKSPACE PANEL (9 grid-cols on large layout) */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* CATALOGUE FLOW WORKSPACE */}
          {activeSubTab === 'catalog' && (
            <div className="space-y-6">
              
              {/* Filter controls panel */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-4">
                <h3 className="font-display font-bold text-slate-850 dark:text-white text-sm flex items-center gap-1.5">
                  <Layers className="text-blue-500 w-4 h-4" />
                  <span>Advanced Test Query Filter</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Search query */}
                  <div className="relative">
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-450 dark:text-slate-500" />
                    <input
                      type="text"
                      placeholder="e.g. CBC, Thyroid, Blood, Fever..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full text-xs font-medium pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-805 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 text-slate-850 dark:text-white"
                    />
                  </div>

                  {/* Symptom matching assistant */}
                  <div>
                    <select
                      value={selectedSymptom}
                      onChange={(e) => setSelectedSymptom(e.target.value)}
                      className="w-full text-xs font-bold px-3 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl focus:bg-white dark:focus:bg-slate-900 focus:outline-none text-slate-850 dark:text-white"
                    >
                      <option value="">Filter By Symptom</option>
                      {symptomsList.map(sym => (
                        <option key={sym} value={sym}>
                          Symptom: {sym.charAt(0).toUpperCase() + sym.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Price Slider */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      <span>Max Price Range:</span>
                      <span className="text-blue-600 dark:text-blue-400 font-mono font-bold">₹{priceRange}</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="8000"
                      step="50"
                      value={priceRange}
                      onChange={(e) => setPriceRange(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                  </div>
                </div>

                {/* Categories tab pills horizontal block */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(cat);
                        // reset selected symptom when switching main category
                        if (cat !== "All Tests") setSelectedSymptom("");
                      }}
                      className={`px-3 py-1.5 rounded-lg text-[10.5px] font-bold tracking-tight whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-850 text-slate-650 dark:text-slate-300 hover:bg-slate-200'}`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* HEALTH BUNDLES SECTION */}
              {selectedCategory === "All Tests" || selectedCategory === "Full Body Checkups" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-l-4 border-blue-500 pl-2">
                    <h3 className="font-display font-extrabold text-slate-855 dark:text-white text-base">Comprehensive Full Body Health Bundles</h3>
                    <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400 font-bold px-2 py-0.5 rounded">All-Inclusive Rates</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {HEALTH_PACKAGES.map(pkg => (
                      <div 
                        key={pkg.id}
                        className={`bg-white dark:bg-slate-900 border transition-all rounded-3xl p-5 shadow-sm flex flex-col justify-between ${selectedTest?.id === pkg.id ? 'border-2 border-blue-600 ring-2 ring-blue-50 dark:ring-blue-900/10' : 'border-slate-200/50 dark:border-slate-800 hover:border-slate-350 hover:shadow'}`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-1">
                            <span className="text-[10px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 font-extrabold px-2 py-0.5 rounded uppercase">Package Deal</span>
                            <span className="font-mono font-bold text-lg text-blue-600 dark:text-blue-400">₹{pkg.price}</span>
                          </div>

                          <h4 className="font-display font-extrabold text-slate-900 dark:text-white text-sm">{pkg.name}</h4>
                          <p className="text-[11px] text-slate-450 dark:text-slate-400 font-sans leading-relaxed">{pkg.description}</p>
                          
                          <div className="border-t border-slate-100 dark:border-slate-800 pt-2 space-y-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Included Tests ({pkg.tests.length}):</p>
                            <div className="flex flex-wrap gap-1">
                              {pkg.tests.map(t => (
                                <span key={t} className="text-[9.5px] bg-slate-50 dark:bg-slate-950 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded border border-slate-100 dark:border-slate-850">
                                  ✓ {t}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-4">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTest(pkg);
                              setBookingStep(1);
                              setTimeout(() => {
                                document.getElementById("booking-card-form")?.scrollIntoView({ behavior: 'smooth' });
                              }, 350);
                            }}
                            className={`w-full py-2 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer ${selectedTest?.id === pkg.id ? 'bg-blue-600 text-white' : 'bg-slate-900 hover:bg-slate-950 text-white'}`}
                          >
                            {selectedTest?.id === pkg.id ? "Selected Bundle" : "Book This Bundle"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}

              {/* INDIVIDUAL TESTS SECTION */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-l-4 border-emerald-505 pl-2 border-emerald-500">
                  <h3 className="font-display font-extrabold text-slate-855 dark:text-white text-base">
                    Pathology & Laboratory Tests List
                  </h3>
                  <span className="text-[10px] font-mono text-slate-450">
                    Showing {filteredTests.length} diagnostic items
                  </span>
                </div>

                {filteredTests.length === 0 ? (
                  <div className="bg-slate-50 dark:bg-slate-950 py-10 rounded-3xl border border-slate-200/50 text-center space-y-2">
                    <Info className="w-8 h-8 text-slate-300 mx-auto" />
                    <p className="text-xs font-bold text-slate-500 dark:text-slate-450">No medical tests matched your filter criteria.</p>
                    <button 
                      onClick={() => { setSearchQuery(""); setSelectedCategory("All Tests"); setSelectedSymptom(""); setPriceRange(8000); }}
                      className="text-xs text-blue-600 hover:underline font-bold"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {filteredTests.map(test => (
                      <div 
                        key={test.id}
                        className={`bg-white dark:bg-slate-900 border rounded-2xl p-4 shadow-sm flex flex-col justify-between transition-all ${selectedTest?.id === test.id ? 'border-2 border-blue-600 ring-2 ring-blue-50 dark:ring-blue-900/10' : 'border-slate-100 dark:border-slate-805 hover:border-slate-250 dark:hover:border-slate-750'}`}
                      >
                        <div className="space-y-2">
                          <div className="flex justify-between items-start gap-1">
                            <span className="text-[9px] bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1.5 py-0.2 rounded font-bold uppercase tracking-wide">
                              {test.category}
                            </span>
                            <span className="font-bold text-slate-800 dark:text-white font-mono text-xs">₹{test.price}</span>
                          </div>

                          <h4 className="font-display font-bold text-slate-900 dark:text-white text-xs leading-normal">{test.name}</h4>
                          
                          {test.symptoms && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {test.symptoms.slice(0, 3).map(sym => (
                                <span key={sym} className="text-[9px] text-slate-455 bg-slate-50 dark:bg-slate-950 px-1 py-0.2 rounded font-sans leading-none border border-slate-100/50 dark:border-slate-850">
                                  {sym}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="pt-3">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTest(test);
                              setBookingStep(1);
                              setTimeout(() => {
                                document.getElementById("booking-card-form")?.scrollIntoView({ behavior: 'smooth' });
                              }, 350);
                            }}
                            className={`w-full py-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${selectedTest?.id === test.id ? 'bg-blue-600 text-white' : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-white'}`}
                          >
                            {selectedTest?.id === test.id ? "Selected" : "Add to Booking"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* MY BOOKINGS / RECORDS SCHEDULE LOGS PANEL */}
          {activeSubTab === 'my-bookings' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl space-y-4 shadow-sm">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-base">Campus Laboratory Appointments Index</h3>
                    <p className="text-[10.5px] text-slate-500 font-sans mt-0.5">Track sample submissions, phlebotomist location dispatches, and diagnostics queue state</p>
                  </div>
                  <span className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-mono font-bold px-3 py-1 rounded-xl">
                    Records Count: {bookingsList.length}
                  </span>
                </div>

                {bookingsList.length === 0 ? (
                  <div className="py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl text-center space-y-3 text-slate-400">
                    <Calendar className="w-10 h-10 mx-auto opacity-40 text-blue-800" />
                    <p className="text-xs font-bold">No pathological bookings recorded.</p>
                    <button onClick={() => setActiveSubTab('catalog')} className="text-xs text-blue-600 font-bold underline cursor-pointer">
                      Browse Test Listing Menu
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookingsList.map(item => (
                      <div 
                        key={item.id}
                        className="bg-slate-50 dark:bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-sm space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/40 dark:border-slate-800">
                          <div className="space-y-1">
                            <span className="text-[9px] bg-indigo-100 dark:bg-indigo-900 text-indigo-805 dark:text-indigo-300 font-mono font-bold px-2 py-0.5 rounded">
                              ID: {item.id}
                            </span>
                            <h4 className="font-display font-extrabold text-slate-900 dark:text-white text-xs sm:text-sm">
                              {item.testName}
                            </h4>
                            <p className="text-[10.5px] text-slate-500 font-sans">
                              Category: {item.testCategory} • Patient ID: <strong className="font-mono">{item.patientId}</strong>
                            </p>
                          </div>

                          <div className="text-right sm:items-end flex flex-row sm:flex-col justify-between sm:justify-start items-center gap-1 shrink-0">
                            <p className="font-mono font-bold text-xs sm:text-sm text-blue-700 dark:text-blue-400">
                              ₹{item.price}
                            </p>
                            <span className={`inline-block px-2 py-0.5 rounded text-[8.5px] uppercase font-bold tracking-wide text-white ${
                              item.bookingStatus === 'completed' ? 'bg-emerald-600' : 'bg-amber-500'
                            }`}>
                              {item.bookingStatus === 'completed' ? 'Report Published' : 'In Diagnostic Queue'}
                            </span>
                          </div>
                        </div>

                        {/* Booking parameters line */}
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-slate-650 dark:text-slate-350 text-[11px] font-sans">
                          <div className="space-y-0.5">
                            <p className="text-[9.5px] text-slate-400 dark:text-slate-500 font-mono font-bold uppercase tracking-wider">Schedule Timeline</p>
                            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              {item.preferredDate}
                            </p>
                          </div>

                          <div className="space-y-0.5">
                            <p className="text-[9.5px] text-slate-400 dark:text-slate-500 font-mono font-bold uppercase tracking-wider">Preferred Slot</p>
                            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 font-mono">
                              <Clock className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              {item.preferredTime}
                            </p>
                          </div>

                          <div className="space-y-0.5">
                            <p className="text-[9.5px] text-slate-400 dark:text-slate-500 font-mono font-bold uppercase tracking-wider">Sample Dispatch Mode</p>
                            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5 uppercase text-[10px]">
                              {item.collectionType === 'home' ? (
                                <>
                                  <Truck className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                                  Home Collection
                                </>
                              ) : (
                                <>
                                  <Building className="w-3.5 h-3.5 text-cyan-600 shrink-0" />
                                  Visit Infirmary Center
                                </>
                              )}
                            </p>
                          </div>

                          <div className="space-y-0.5">
                            <p className="text-[9.5px] text-slate-400 dark:text-slate-500 font-mono font-bold uppercase tracking-wider">Payment Parameter</p>
                            <p className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <CreditCard className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              {item.paymentMethod} ({item.paymentStatus === 'paid' ? 'Approval Checked' : 'Pending Counter结算'})
                            </p>
                          </div>
                        </div>

                        {/* Address segment details for home dispatch */}
                        {item.collectionType === "home" && item.address && (
                          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl p-3 flex gap-2 sm:items-center">
                            <MapPin className="text-blue-500 w-4 h-4 shrink-0 mt-0.5" />
                            <div className="text-[10.5px] leading-relaxed">
                              <strong className="text-slate-700 dark:text-slate-300">Home Phlebotomy Coordinate: </strong>
                              {item.address.houseNo}, {item.address.street}, {item.address.city}, {item.address.state} - {item.address.pincode}
                              <span className="ml-2 inline-block px-1.5 bg-indigo-50 dark:bg-indigo-900/40 text-indigo-600 rounded text-[9px] uppercase font-bold tracking-wide">Ready for Dispatch</span>
                            </div>
                          </div>
                        )}

                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              alert(`Phlebotomist trace active for booking ID ${item.id}. A campus representative is scheduled for contact via phone: ${item.mobile}`);
                            }}
                            className="bg-slate-205 dark:bg-slate-900 border border-slate-300 dark:border-slate-850 text-slate-700 dark:text-slate-305 hover:bg-slate-100 font-bold px-3 py-1.5 rounded-lg text-xs tracking-tight transition-all cursor-pointer"
                          >
                            Trace Collection Status
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* REPORTS MANAGEMENT */}
          {activeSubTab === 'reports' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-6 rounded-3xl shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-105 dark:border-slate-800 pb-3">
                  <div>
                    <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-base">Authorized Medical Laboratory Reports</h3>
                    <p className="text-[10.5px] text-slate-550 font-sans mt-0.5">
                      Check diagnostic outputs, reference ranges, and share results securely with clinical general practitioners
                    </p>
                  </div>
                  <ShieldCheck className="text-emerald-505 w-6 h-6 text-emerald-500" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {reportsList.map(report => (
                    <div 
                      key={report.id}
                      className="bg-slate-50 dark:bg-slate-950 p-5 rounded-2xl border border-slate-200/45 dark:border-slate-900 flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] bg-emerald-50 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 font-mono font-bold px-2 py-0.5 rounded">
                            ID: {report.id}
                          </span>
                          <span className="text-[9px] bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                            {report.category}
                          </span>
                        </div>

                        <div className="space-y-0.5">
                          <h4 className="font-display font-bold text-slate-900 dark:text-white text-sm">{report.testName}</h4>
                          <p className="text-[10px] text-slate-450 font-sans">Collected Date: {report.dateCollected}</p>
                        </div>

                        <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 text-[10.5px] text-slate-650 dark:text-slate-400 font-sans leading-relaxed">
                          <strong>Summary findings: </strong>
                          {report.summary}
                        </div>
                      </div>

                      {/* Interactive Buttons footer */}
                      <div className="grid grid-cols-4 gap-2 pt-4">
                        <button
                          type="button"
                          onClick={() => setViewingReport(report)}
                          className="col-span-2 bg-blue-600 hover:bg-blue-700 text-white font-bold p-2 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>View Report</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setViewingReport(report);
                            setTimeout(() => window.print(), 350);
                          }}
                          title="Download PDF"
                          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold p-2 rounded-xl text-xs flex items-center justify-center cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => emailReport(report)}
                          title="Dispatched email copy"
                          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold p-2 rounded-xl text-xs flex items-center justify-center cursor-pointer"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* LABORATORY PORTAL ANALYTICS DASHBOARD */}
          {activeSubTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Counter Statistics Strip */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200/55 dark:border-slate-800 p-4 rounded-2xl shadow-sm text-center">
                  <p className="text-2xl font-bold font-display text-blue-600">{totalLabTestsBookedCount}</p>
                  <p className="text-[10px] font-mono tracking-wide text-slate-450 uppercase font-bold mt-1">Total Booked</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200/55 dark:border-slate-800 p-4 rounded-2xl shadow-sm text-center">
                  <p className="text-2xl font-bold font-display text-emerald-600">{homeCollectionsScheduledCount}</p>
                  <p className="text-[10px] font-mono tracking-wide text-slate-450 uppercase font-bold mt-1">Home Collection</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200/55 dark:border-slate-800 p-4 rounded-2xl shadow-sm text-center">
                  <p className="text-2xl font-bold font-display text-indigo-600">₹{totalRevenueSum}</p>
                  <p className="text-[10px] font-mono tracking-wide text-slate-450 uppercase font-bold mt-1">Total Value</p>
                </div>
                <div className="bg-white dark:bg-slate-900 border border-slate-200/55 dark:border-slate-800 p-4 rounded-2xl shadow-sm text-center">
                  <p className="text-2xl font-bold font-display text-amber-500">98.2%</p>
                  <p className="text-[10px] font-mono tracking-wide text-slate-450 uppercase font-bold mt-1">Patient Rating</p>
                </div>
              </div>

              {/* Chart simulation layout block */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800 p-5 rounded-3xl shadow-sm space-y-6">
                <div>
                  <h3 className="font-display font-extrabold text-slate-905 dark:text-white text-sm">Most Popular Pathology Investigations</h3>
                  <p className="text-[10.5px] text-slate-450 font-sans">Relative demand frequency based on local directory reservations</p>
                </div>

                <div className="space-y-3 pt-2">
                  {sortedPopularTests.length === 0 ? (
                    <p className="text-xs text-slate-450 italic py-6">No sufficient scheduling history compiled yet.</p>
                  ) : (
                    sortedPopularTests.map((item, index) => {
                      const maxCount = Math.max(...sortedPopularTests.map(t => t.count), 1);
                      const percentVal = (item.count / maxCount) * 100;
                      return (
                        <div key={item.name} className="space-y-1">
                          <div className="flex justify-between items-center text-xs font-sans">
                            <span className="font-bold text-slate-800 dark:text-slate-200">{index + 1}. {item.name}</span>
                            <span className="font-mono text-slate-500 font-bold">{item.count} Reserved</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                            <div 
                              className="bg-blue-600 h-full rounded-full transition-all duration-1000"
                              style={{ width: `${percentVal}%` }}
                            />
                          </div>
                        </div>
                      )
                    })
                  )}

                  {/* Standard fallback metrics to look complete */}
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-sans">
                      <span className="font-bold text-slate-850 dark:text-slate-200">Complete Blood Count (CBC) [General Baseline]</span>
                      <span className="font-mono text-slate-500 font-bold">14 Reserved</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                      <div className="bg-indigo-600 h-full rounded-full" style={{ width: '85%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-sans">
                      <span className="font-bold text-slate-850 dark:text-slate-200">Thyroid Hormone Profiling</span>
                      <span className="font-mono text-slate-500 font-bold">8 Reserved</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                      <div className="bg-indigo-650 h-full rounded-full" style={{ width: '55%' }} />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-xs font-sans">
                      <span className="font-bold text-slate-855 dark:text-slate-200">HbA1c / Glycemic Assays</span>
                      <span className="font-mono text-slate-500 font-bold">5 Reserved</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden">
                      <div className="bg-indigo-700 h-full rounded-full" style={{ width: '38%' }} />
                    </div>
                  </div>
                </div>

                {/* Patient satisfaction metrics block */}
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-650 dark:text-slate-350 text-[11px] font-sans">
                  <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900 rounded-2xl flex items-center gap-3">
                    <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                    <div>
                      <p className="font-bold text-emerald-950 dark:text-emerald-300">Fast Turnaround Priority</p>
                      <p className="text-[10px] text-slate-450 leading-relaxed font-sans">96.8% of pathology results uploaded within 12-24 hours of sample extraction.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900 rounded-2xl flex items-center gap-3">
                    <Users className="w-8 h-8 text-cyan-600 shrink-0" />
                    <div>
                      <p className="font-bold text-cyan-955 dark:text-cyan-300">Certified Phlebotomists</p>
                      <p className="text-[10px] text-slate-450 leading-relaxed font-sans">Registered home collection partners hold strict clinical diagnostics safety certifications.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: BOOKING CONTROLS WIDGET PANEL (4 grid-cols on large layout) */}
        <div className="xl:col-span-4 space-y-6">
          
          <div 
            id="booking-card-form"
            className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-805 p-6 rounded-[30px] shadow-sm space-y-6 relative text-slate-800 dark:text-slate-200"
          >
            {/* Header branding */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
              <span className="text-[9px] bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Interactive Schedule Form
              </span>
              <h3 className="font-display font-extrabold text-slate-900 dark:text-white text-base mt-2">
                Diagnostics Scheduler
              </h3>
              <p className="text-[10.5px] text-slate-455 font-sans mt-0.5 leading-relaxed">
                Choose a specific investigation assay from the catalog tree and coordinate sample delivery timings.
              </p>
            </div>

            {/* If no test is selected, provide friendly guidance */}
            {!selectedTest ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/40 rounded-full flex items-center justify-center mx-auto text-blue-600">
                  <Layers className="w-5 h-5" />
                </div>
                <p className="text-[11.5px] font-bold text-slate-450 leading-relaxed font-sans">
                  Select an individual test or package deal card from our Pathology listing on the left to activate booking parameters.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const sampleCbc = LAB_TEST_CATALOG[0];
                    setSelectedTest(sampleCbc);
                  }}
                  className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-bold py-1.5 px-3.5 rounded-xl cursor-pointer"
                >
                  Quick Demo (Select CBC)
                </button>
              </div>
            ) : (
              // Selecting details
              <div className="space-y-4">
                {/* Active Diagnostic Choice Capsule */}
                <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900 rounded-2xl p-4 space-y-2 relative">
                  <button 
                    type="button"
                    onClick={resetBookingForm}
                    className="absolute top-2 right-2 text-[9.5px] font-bold text-rose-600 hover:underline cursor-pointer"
                  >
                    Change selection
                  </button>

                  <span className="text-[8.5px] bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 font-bold px-2 py-0.5 rounded uppercase">
                    Your Selection
                  </span>
                  
                  <div className="pt-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-normal pr-16">{selectedTest.name}</p>
                    <p className="text-sm font-extrabold text-blue-600 dark:text-blue-400 mt-1 font-mono">₹{selectedTest.price}</p>
                  </div>
                </div>

                {bookingStep === 1 ? (
                  // Active form input state
                  <form onSubmit={handleConfirmReservation} className="space-y-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
                    
                    {/* Patient Information Prefilled parameters */}
                    <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                      <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Patient Details</p>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] mb-1">Full Name</label>
                          <input 
                            type="text" 
                            required
                            value={formName}
                            onChange={(e) => setFormName(e.target.value)}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-lg p-2 font-medium focus:bg-white text-slate-800 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] mb-1">Patient ID Reference</label>
                          <input 
                            type="text" 
                            disabled
                            value={studentId || "GUEST"}
                            className="w-full text-xs bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-950 rounded-lg p-2 font-mono text-slate-500 cursor-not-allowed"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] mb-1">Age</label>
                          <input 
                            type="number" 
                            required
                            value={formAge}
                            onChange={(e) => setFormAge(Number(e.target.value))}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-lg p-2 font-medium focus:bg-white text-slate-800 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] mb-1">Gender</label>
                          <select 
                            value={formGender}
                            onChange={(e) => setFormGender(e.target.value)}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-lg p-2 font-bold focus:bg-white text-slate-850 dark:text-white"
                          >
                            <option value="Female">Female</option>
                            <option value="Male">Male</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] mb-1">Mobile Contact</label>
                          <input 
                            type="tel" 
                            required
                            value={formMobile}
                            onChange={(e) => setFormMobile(e.target.value)}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-lg p-2 font-medium focus:bg-white text-slate-800 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] mb-1">Email Coordinates</label>
                          <input 
                            type="email" 
                            required
                            value={formEmail}
                            onChange={(e) => setFormEmail(e.target.value)}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-lg p-2 font-medium focus:bg-white text-slate-800 dark:text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Schedule Parameters */}
                    <div className="space-y-3 pt-2">
                      <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Timings & Location Coordinates</p>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] mb-1">Preferred Date</label>
                          <input 
                            type="date"
                            required
                            value={formDate}
                            onChange={(e) => setFormDate(e.target.value)}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-lg p-2 font-bold focus:bg-white text-slate-850 dark:text-white"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] mb-1">Time Slot Range</label>
                          <select
                            required
                            value={formTimeSlot}
                            onChange={(e) => setFormTimeSlot(e.target.value)}
                            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-800 rounded-lg p-2 font-bold focus:bg-white text-slate-850 dark:text-white"
                          >
                            <option value="">Select Timing</option>
                            {AVAILABLE_SLOTS.map(slot => (
                              <option key={slot} value={slot}>{slot}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Collection Mode Selection */}
                      <div>
                        <label className="block text-[10px] mb-1.5 font-bold uppercase">Sample Collection Category</label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setSampleCollectionType('visit')}
                            className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${sampleCollectionType === 'visit' ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-600 text-blue-700 dark:text-blue-300' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-55'}`}
                          >
                            <Building className="w-4 h-4" />
                            <span className="text-[10px] font-bold">Visit Center</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSampleCollectionType('home')}
                            className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${sampleCollectionType === 'home' ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-600 text-indigo-700 dark:text-indigo-300' : 'border-slate-200 dark:border-slate-800 hover:bg-slate-55'}`}
                          >
                            <Truck className="w-4 h-4" />
                            <span className="text-[10px] font-bold">Home Sample</span>
                          </button>
                        </div>
                      </div>

                      {/* Explicit Home Sample Address Box */}
                      {sampleCollectionType === 'home' && (
                        <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-855 space-y-2 animate-fade-in">
                          <p className="text-[10px] font-bold text-indigo-650 dark:text-indigo-400">Residential Postal Address</p>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9.5px]">House/Suite No.</label>
                              <input 
                                type="text"
                                required
                                placeholder="e.g. Suite 302"
                                value={houseNo}
                                onChange={(e) => setHouseNo(e.target.value)}
                                className="w-full text-[10.5px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[9.5px]">Pincode</label>
                              <input 
                                type="text"
                                required
                                placeholder="e.g. 560066"
                                value={pincode}
                                onChange={(e) => setPincode(e.target.value)}
                                className="w-full text-[10.5px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 focus:outline-none font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[9.5px]">Street Address</label>
                            <input 
                              type="text"
                              required
                              placeholder="e.g. Campus Residential Hall A"
                              value={street}
                              onChange={(e) => setStreet(e.target.value)}
                              className="w-full text-[10.5px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-1.5 focus:outline-none"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[9.5px]">City</label>
                              <input 
                                type="text"
                                disabled
                                value={cityVal}
                                className="w-full text-[10.5px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-850 rounded-lg p-1.5 text-slate-500 cursor-not-allowed"
                              />
                            </div>
                            <div>
                              <label className="block text-[9.5px]">State</label>
                              <input 
                                type="text"
                                disabled
                                value={stateVal}
                                className="w-full text-[10.5px] bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-850 rounded-lg p-1.5 text-slate-500 cursor-not-allowed"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Payment Mode */}
                    <div className="border-t border-slate-150 dark:border-slate-800 pt-3 space-y-2">
                      <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Payment Strategy</label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-205 dark:border-slate-805 rounded-xl p-2.5 font-bold focus:bg-white text-slate-850 dark:text-white"
                      >
                        <option value="UPI">UPI Instant Payment</option>
                        <option value="Credit Card">Credit Insurance Card</option>
                        <option value="Debit Card">Debit Card Swipe</option>
                        <option value="Net Banking">Net Banking Portal</option>
                        <option value="Cash at Center">Pay Cash at Infirmary Counter</option>
                      </select>
                    </div>

                    {/* Submission CTA */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all uppercase tracking-wider cursor-pointer flex items-center justify-center gap-2"
                      >
                        <span>Reserve Lab Seat Now</span>
                        <ArrowRight className="w-4 h-4 text-blue-200" />
                      </button>
                    </div>

                  </form>
                ) : (
                  // Step 2: Confirmed panel displaying high fidelity receipt
                  <div className="space-y-4 text-center py-4 animate-fade-in">
                    <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-8 h-8" />
                    </div>

                    <div className="space-y-1">
                      <h4 className="font-display font-extrabold text-slate-900 dark:text-white text-sm">Pathology Slot Locked!</h4>
                      <p className="text-[10.5px] text-slate-455">
                        Your appointment has been registered inside Titan HealthConnect databases.
                      </p>
                    </div>

                    {/* Receipt breakdown */}
                    <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 text-left space-y-2 text-[11px] font-sans">
                      <div className="flex justify-between border-b pb-1 dark:border-slate-800">
                        <span className="text-slate-400">Patient:</span>
                        <strong className="text-slate-800 dark:text-white">{formName}</strong>
                      </div>
                      <div className="flex justify-between border-b pb-1 dark:border-slate-800">
                        <span className="text-slate-400">Scheduled Date:</span>
                        <strong className="text-slate-800 dark:text-white">{formDate}</strong>
                      </div>
                      <div className="flex justify-between border-b pb-1 dark:border-slate-800">
                        <span className="text-slate-400">Timing Slot:</span>
                        <strong className="text-slate-800 dark:text-white font-mono">{formTimeSlot}</strong>
                      </div>
                      <div className="flex justify-between border-b pb-1 dark:border-slate-800">
                        <span className="text-slate-400">Dispatch Mode:</span>
                        <strong className="text-slate-1000 dark:text-white uppercase font-bold text-[10px] text-blue-600 dark:text-blue-400">
                          {sampleCollectionType === 'home' ? 'Home collection' : 'Center walk-in'}
                        </strong>
                      </div>
                      <div className="flex justify-between pt-1">
                        <span className="text-slate-400">Total charge:</span>
                        <strong className="text-blue-750 dark:text-blue-300 font-bold font-mono">₹{selectedTest.price}</strong>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => setActiveSubTab('my-bookings')}
                        className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl cursor-pointer"
                      >
                        View Interactive Schedule Logs
                      </button>
                      
                      <button
                        type="button"
                        onClick={resetBookingForm}
                        className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                      >
                        Return to booking form
                      </button>
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>

          {/* NOTIFICATION CENTER SEGMENT CARD */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-805 p-6 rounded-[30px] shadow-sm space-y-4 text-slate-850 dark:text-white">
            <h3 className="font-display font-extrabold text-sm flex items-center gap-1.5 border-b border-slate-105 dark:border-slate-800 pb-3">
              <Send className="w-4 h-4 text-blue-500" />
              <span>Diagnostics Stage Update Channel</span>
            </h3>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {notificationsList.map(item => (
                <div 
                  key={item.id}
                  className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-100/50 dark:border-slate-900 text-left space-y-1 relative"
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-[8px] uppercase tracking-wider font-extrabold px-1.5 py-0.2 rounded ${
                      item.type === 'report' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-300' :
                      item.type === 'payment' ? 'bg-cyan-50 text-cyan-800 dark:bg-cyan-950/20 dark:text-cyan-300' :
                      'bg-indigo-50 text-indigo-805 dark:bg-indigo-950/20 dark:text-indigo-300'
                    }`}>
                      {item.type} Checkup
                    </span>
                    <span className="text-[9px] text-slate-350 dark:font-mono font-medium">{item.date}</span>
                  </div>

                  <p className="text-[11px] font-bold text-slate-850 dark:text-slate-150 leading-tight">{item.title}</p>
                  <p className="text-[10.5px] text-slate-455 dark:text-indigo-400 font-sans leading-normal leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* PRINT DIALOG PREVIEW OVERLAY MODAL */}
      <AnimatePresence>
        {viewingReport && (
          <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-55 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white text-slate-900 w-full max-w-2xl rounded-3xl border border-slate-205 shadow-2xl overflow-hidden print:border-none print:shadow-none print:rounded-none text-xs"
            >
              {/* Header block with hospital diagnostics sign off */}
              <div className="p-6 bg-gradient-to-r from-blue-800 to-indigo-900 text-white flex justify-between items-center print:bg-white print:text-black">
                <div className="space-y-1">
                  <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded uppercase font-bold tracking-widest font-mono">
                    Official Path Report
                  </span>
                  <h2 className="text-xl font-display font-black tracking-tight print:text-black">
                    TITAN HEALTH DIAGNOSTICS LABS
                  </h2>
                  <p className="text-[10px] text-blue-100 font-sans">
                    NABL Accredited & ISO 9001:2015 Approved Clinical Laboratory division
                  </p>
                </div>

                <div className="text-right space-y-1 font-mono text-[10.5px] text-blue-100 print:text-black">
                  <p>Report Ref: <strong>{viewingReport.id}</strong></p>
                  <p>Date Generated: {viewingReport.dateCollected}</p>
                </div>
              </div>

              {/* Patient general metadata section */}
              <div className="p-6 bg-slate-50 border-b border-slate-200 grid grid-cols-2 md:grid-cols-4 gap-4 text-[11px] print:bg-white">
                <div>
                  <p className="text-slate-400 font-mono text-[9px] uppercase tracking-wider">Patient Name</p>
                  <p className="font-extrabold text-slate-900">{viewingReport.patientName}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-mono text-[9px] uppercase tracking-wider">ID Reference</p>
                  <p className="font-bold text-slate-900 font-mono">{viewingReport.patientId}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-mono text-[9px] uppercase tracking-wider">Sex / Age</p>
                  <p className="font-bold text-slate-900">{viewingReport.patientName === 'Maya Lin' ? 'Female / 22 Yrs' : 'Male / 25 Yrs'}</p>
                </div>
                <div>
                  <p className="text-slate-400 font-mono text-[9px] uppercase tracking-wider">Referring Wing</p>
                  <p className="font-bold text-blue-700">Titan Campus Infirmary</p>
                </div>
              </div>

              {/* Physical Parameters List */}
              <div className="p-6 space-y-4">
                <div className="border-b pb-2 flex items-center justify-between">
                  <h3 className="font-display font-extrabold text-sm text-slate-900 uppercase">
                    Assay Investigation: {viewingReport.testName}
                  </h3>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold font-sans">
                    Status: Certified published
                  </span>
                </div>

                {/* Table representing actual metrics */}
                {(() => {
                  const findingsEntries = Object.entries(viewingReport.findings) as [string, { value: string; range: string; unit: string; isAbnormal: boolean }][];
                  return (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b text-[10.5px] font-mono text-slate-400 uppercase tracking-wider bg-slate-50/50">
                          <th className="py-2.5 px-2">Parameter Name</th>
                          <th className="py-2.5 px-2 text-center">Observed Value</th>
                          <th className="py-2.5 px-2 text-center">Biomarker Range</th>
                          <th className="py-2.5 px-2 text-center">Unit</th>
                          <th className="py-2.5 px-2 text-right">Status Flag</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-sans text-xs">
                        {findingsEntries.map(([paramName, details]) => (
                          <tr key={paramName} className={`hover:bg-slate-50/40 ${details.isAbnormal ? 'bg-red-50/50' : ''}`}>
                            <td className="py-3 px-2 font-bold text-slate-800">{paramName}</td>
                            <td className="py-3 px-2 text-center font-bold font-mono text-slate-900">{details.value}</td>
                            <td className="py-3 px-2 text-center font-mono text-slate-500">{details.range}</td>
                            <td className="py-3 px-2 text-center text-slate-500">{details.unit}</td>
                            <td className="py-3 px-2 text-right font-bold">
                              {details.isAbnormal ? (
                                <span className="text-red-650 bg-red-100 px-2 py-0.5 rounded text-[9.5px]">HI ABNORMAL</span>
                              ) : (
                                <span className="text-emerald-700 font-mono">NORMAL</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  );
                })()}

                {/* Summarized comments */}
                <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl space-y-1.5 mt-4">
                  <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Pathology Doctor Interpretation Notes</p>
                  <p className="text-slate-700 font-sans leading-relaxed leading-normal">{viewingReport.summary}</p>
                </div>
              </div>

              {/* Signatures & Footer block */}
              <div className="p-6 bg-slate-50 border-t border-slate-205 flex flex-col sm:flex-row justify-between items-center gap-4 text-[11px] text-slate-500">
                <div className="space-y-1">
                  <p className="font-bold text-slate-800">Technician Signature</p>
                  <p className="font-mono text-[10px]">Mr. Ramesh Kumar (B.MLT)</p>
                </div>

                <div className="text-center sm:text-right space-y-1">
                  <p className="font-bold text-slate-850">Chief Clinical Pathologist</p>
                  <p className="font-sans italic text-blue-700 font-bold">Dr. Elena Mercer (MD, DNB Pathology)</p>
                </div>
              </div>

              {/* Operations row for screen rendering, omitted from native windows print */}
              <div className="p-4 bg-slate-900 text-white flex justify-end gap-3 print:hidden">
                <button
                  type="button"
                  onClick={() => setViewingReport(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 font-bold rounded-xl cursor-pointer"
                >
                  Close Preview
                </button>

                <button
                  type="button"
                  onClick={() => printReport(viewingReport)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-extrabold rounded-xl cursor-pointer flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  <span>Download / Print Path PDF</span>
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
