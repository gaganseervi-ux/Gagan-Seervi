export interface DoctorProfile {
  id: string;
  name: string;
  specialty: string;
  department: string;
  credentials: string;
  experience: number;
  consultationFee: number;
  timings: string;
  email: string;
  languages: string[];
  avatarUrl: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  experience: number;
  department: string;
  email: string;
  shift: string;
}

export interface DepartmentInfo {
  id: string;
  name: string;
  iconName: string;
  description: string;
}

export interface Testimonial {
  id: string;
  quote: string;
  patientName: string;
  role: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export const medicalDepartments: DepartmentInfo[] = [
  { id: "dept-cardiology", name: "Cardiology", iconName: "Heart", description: "Comprehensive heart health screens, ECG monitoring, and cardiovascular therapeutics." },
  { id: "dept-neurology", name: "Neurology", iconName: "Brain", description: "Advanced neurological syndrome diagnostics, migraine consulting, and motor system analysis." },
  { id: "dept-orthopedics", name: "Orthopedics", iconName: "Bone", description: "Surgical and non-surgical orthopedic services, structural sprain healing, and posture guides." },
  { id: "dept-pediatrics", name: "Pediatrics", iconName: "Baby", description: "Primary child wellness screenings, immunizations, and developmental clinical support." },
  { id: "dept-dermatology", name: "Dermatology", iconName: "Sparkles", description: "Expert dermatology care for acute acne, allergic hives, and tissue bio-checks." },
  { id: "dept-dentistry", name: "Dentistry", iconName: "Smile", description: "Oral surgery, deep teeth cleanings, cavity restorations, and periodontal maintenance." },
  { id: "dept-general", name: "General Medicine", iconName: "Activity", description: "General health diagnosis, chronic distress sorting, seasonal virus vaccines, and care tips." },
  { id: "dept-emergency", name: "Emergency Care", iconName: "Flame", description: "24/7 critical state trauma backup, shock recovery, and ambulance dispatch teams." }
];

export const doctorProfiles: DoctorProfile[] = [
  {
    id: "doc-rajesh",
    name: "Dr. Rajesh Sharma",
    specialty: "Cardiologist",
    department: "Cardiology",
    credentials: "MBBS, MD Cardiology",
    experience: 15,
    consultationFee: 800,
    timings: "Mon-Sat 9:00 AM - 2:00 PM",
    email: "rajesh.sharma@titanhealthconnect.com",
    languages: ["English", "Hindi", "Kannada"],
    avatarUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "doc-priya",
    name: "Dr. Priya Verma",
    specialty: "Neurologist",
    department: "Neurology",
    credentials: "MBBS, DM Neurology",
    experience: 12,
    consultationFee: 1000,
    timings: "Mon-Fri 10:00 AM - 4:00 PM",
    email: "priya.verma@titanhealthconnect.com",
    languages: ["English", "Hindi"],
    avatarUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "doc-amit",
    name: "Dr. Amit Kumar",
    specialty: "Orthopedic Surgeon",
    department: "Orthopedics",
    credentials: "MBBS, MS Orthopedics",
    experience: 10,
    consultationFee: 700,
    timings: "Mon-Sat 8:00 AM - 1:00 PM",
    email: "amit.kumar@titanhealthconnect.com",
    languages: ["English", "Hindi"],
    avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "doc-neha",
    name: "Dr. Neha Singh",
    specialty: "Pediatrician",
    department: "Pediatrics",
    credentials: "MBBS, MD Pediatrics",
    experience: 8,
    consultationFee: 600,
    timings: "Mon-Sat 9:00 AM - 5:00 PM",
    email: "neha.singh@titanhealthconnect.com",
    languages: ["English", "Hindi"],
    avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "doc-vikram",
    name: "Dr. Vikram Reddy",
    specialty: "Dermatologist",
    department: "Dermatology",
    credentials: "MBBS, MD Dermatology",
    experience: 11,
    consultationFee: 750,
    timings: "Mon-Sat 10:00 AM - 3:00 PM",
    email: "vikram.reddy@titanhealthconnect.com",
    languages: ["English", "Hindi", "Telugu"],
    avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=200"
  },
  {
    id: "doc-ananya",
    name: "Dr. Ananya Kapoor",
    specialty: "Dentist",
    department: "Dentistry",
    credentials: "BDS, MDS",
    experience: 9,
    consultationFee: 500,
    timings: "Mon-Sat 9:00 AM - 1:00 PM",
    email: "ananya.kapoor@titanhealthconnect.com",
    languages: ["English", "Hindi"],
    avatarUrl: "https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&q=80&w=200"
  }
];

export const medicalStaffList: StaffMember[] = [
  {
    id: "stf-anjali",
    name: "Anjali Gupta",
    role: "Head Nurse",
    experience: 10,
    department: "General Nursing",
    email: "anjali.gupta@titanhealthconnect.com",
    shift: "Day"
  },
  {
    id: "stf-rohit",
    name: "Rohit Mehta",
    role: "Reception Manager",
    experience: 8,
    department: "Patient Services",
    email: "rohit.mehta@titanhealthconnect.com",
    shift: "General"
  },
  {
    id: "stf-sneha",
    name: "Sneha Patel",
    role: "Lab Technician",
    experience: 6,
    department: "Diagnostics",
    email: "sneha.patel@titanhealthconnect.com",
    shift: "Day/Night"
  },
  {
    id: "stf-vikram",
    name: "Vikram Rao",
    role: "Pharmacist",
    experience: 7,
    department: "Pharmacy Management",
    email: "vikram.rao@titanhealthconnect.com",
    shift: "Day"
  },
  {
    id: "stf-pooja",
    name: "Pooja Nair",
    role: "Administrative Officer",
    experience: 9,
    department: "Hospital Administration",
    email: "pooja.nair@titanhealthconnect.com",
    shift: "General"
  }
];

export const mockTestimonials: Testimonial[] = [
  {
    id: "tst-rahul",
    quote: "Excellent service and very professional doctors. The treatment I scheduled through Titan HealthConnect was smooth, prompt, and the diagnostic tracking helped my recovery incredibly.",
    patientName: "Rahul Sharma",
    role: "Patient — Senior Project Manager"
  },
  {
    id: "tst-priya",
    quote: "Booking appointments is quick and hassle-free. The smart AI symptoms assessment matches accurate nurse diagnostics, and on-duty specialists advise comfort steps perfectly.",
    patientName: "Priya Patel",
    role: "Patient — Academic Scholar"
  },
  {
    id: "tst-akash",
    quote: "Highly recommended healthcare platform. I felt very secure logging my vitals and syncing them with the local clinic's active physician queue. Absolutely premium healthcare support.",
    patientName: "Akash Verma",
    role: "Patient — Software Developer"
  }
];

export const faqItems: FAQItem[] = [
  {
    id: "faq-1",
    question: "How can I book an appointment?",
    answer: "Select your preferred medical doctor under the Appointment Booking section, choose your preferred available timeline date and slot, specify your main consultation reason, and process your request. You will see it listed on your patient portal active records tracker immediately!"
  },
  {
    id: "faq-2",
    question: "Can I cancel appointments online?",
    answer: "Yes. Simply scroll into your authenticated Patient Portal, select the 'Appointments' tab, locate the active slot, and contact staff or request state cancellation. Your appointments can be updated instantly from any device."
  },
  {
    id: "faq-3",
    question: "Are emergency services available?",
    answer: "Yes, 24/7 continuous health support can be initiated directly by tapping our Global Emergency SOS Alarm on the sidebar, triggering live location coordinates tracking for quick ambulance paramedic escort."
  },
  {
    id: "faq-4",
    question: "Where is Titan HealthConnect Medical Center located?",
    answer: "Our medical facility is central, residing at Titan HealthConnect Medical Center, Whitefield, Bengaluru, Karnataka, India."
  }
];
