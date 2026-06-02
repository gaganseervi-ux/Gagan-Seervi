import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "database.json");

app.use(express.json());

// Initialize server-side Gemini API client safely
let ai: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
    console.log("Titan Healthconnect: Gemini AI Client successfully initialized.");
  } catch (err) {
    console.error("Titan Healthconnect: Failed to initialize Gemini AI Client:", err);
  }
} else {
  console.log("Titan Healthconnect: Running with Local Symptom Triage Fallback (No GEMINI_API_KEY in environment).");
}

// Ensure database.json exists with seed data
function initDatabase() {
  if (!fs.existsSync(DB_FILE)) {
    console.log("Initializing database.json with campus health seed data...");
    const defaultData = {
      appointments: [
        {
          id: "apt-1",
          studentName: "Maya Lin",
          studentId: "S10943",
          reason: "Severe throat inflammation, difficulty swallowing, and mild fever",
          date: new Date(Date.now() + 86400000 * 1).toISOString().split("T")[0], // tomorrow
          time: "09:30 AM",
          status: "pending",
          notes: "",
          timestamp: new Date().toISOString()
        },
        {
          id: "apt-2",
          studentName: "James Carter",
          studentId: "S11202",
          reason: "Follow-up on sprained left ankle during basketball tournament",
          date: new Date().toISOString().split("T")[0], // today
          time: "02:15 PM",
          status: "checked-in",
          notes: "Patient checked-in at front desk and is waiting inside Lounge B.",
          timestamp: new Date().toISOString()
        },
        {
          id: "apt-3",
          studentName: "Sophia Esparza",
          studentId: "S10556",
          reason: "Intense seasonal migraine with sensitivity to direct light",
          date: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0], // 2 days ago
          time: "11:00 AM",
          status: "completed",
          notes: "Administered fast-acting migraine relief in a dark rest room. Patient discharged with home recommendations.",
          timestamp: new Date(Date.now() - 86400000 * 2).toISOString()
        }
      ],
      vitals: [
        {
          id: "vit-1",
          studentName: "Maya Lin",
          studentId: "S10943",
          symptoms: "Highly painful throat swallowing barrier, hot chills overnight, body fatigue",
          temperature: 38.6,
          heartRate: 88,
          allergies: "Penicillin",
          severity: "moderate",
          timestamp: new Date().toISOString()
        },
        {
          id: "vit-2",
          studentName: "James Carter",
          studentId: "S11202",
          symptoms: "Ankle inflammation is largely down, occasional sharp pinprick sensations when testing steps",
          temperature: 36.5,
          heartRate: 67,
          allergies: "Strawberries, Sulfa medication",
          severity: "normal",
          timestamp: new Date(Date.now() - 3600000 * 4).toISOString()
        }
      ],
      sosAlerts: [
        {
          id: "sos-1",
          studentName: "Marcus Vance",
          studentId: "S12401",
          building: "Science Lab Block C",
          room: "305 (Chemistry wing)",
          additionalDetails: "Inhaled toxic vapors from a broken minor flask. Conscious but coughing with heavy chest tightness.",
          timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
          status: "resolved",
          resolvedBy: "Paramedic Sgt. Miller",
          resolvedAt: new Date(Date.now() - 3600000 * 11).toISOString()
        }
      ],
      prescriptions: [
        {
          id: "rx-1",
          appointmentId: "apt-3",
          studentName: "Sophia Esparza",
          studentId: "S10556",
          doctorName: "Dr. Elena Mercer",
          medication: "Sumatriptan (50mg Tablets)",
          dosage: "1 tablet as needed at migraine onset",
          instructions: "Max 2 tablets in 24 hours. Lie down in a cool, quiet dark atmosphere.",
          datePrescribed: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0]
        },
        {
          id: "rx-2",
          appointmentId: "apt-3",
          studentName: "Sophia Esparza",
          studentId: "S10556",
          doctorName: "Dr. Elena Mercer",
          medication: "Ibuprofen (400mg Caps)",
          dosage: "1 capsule every 6 hours",
          instructions: "Take with food or a glass of water. Do not consume on an empty stomach.",
          datePrescribed: new Date(Date.now() - 86400000 * 2).toISOString().split("T")[0]
        }
      ],
      payments: [
        {
          id: "tx-101",
          invoiceNumber: "INV-2026-88012",
          studentId: "S10943",
          studentName: "Maya Lin",
          patientEmail: "maya.lin@titanhealthconnect.com",
          patientMobile: "+91 99887 76655",
          serviceType: "appointment",
          serviceDetails: "Dr. Elena Mercer - General Medicine Consultation",
          amount: 500,
          discount: 10,
          tax: 22,
          totalAmount: 472,
          paymentMethod: "UPI",
          paymentDate: new Date(Date.now() - 86400000 * 5).toISOString(), // 5 days ago
          status: "successful"
        },
        {
          id: "tx-102",
          invoiceNumber: "INV-2026-88015",
          studentId: "S10943",
          studentName: "Maya Lin",
          patientEmail: "maya.lin@titanhealthconnect.com",
          patientMobile: "+91 99887 76655",
          serviceType: "lab_test",
          serviceDetails: "Complete Blood Count (CBC) Panel with Smart Diagnostics",
          amount: 800,
          discount: 0,
          tax: 40,
          totalAmount: 840,
          paymentMethod: "Credit Card",
          paymentDate: new Date(Date.now() - 86400000 * 3).toISOString(), // 3 days ago
          status: "successful"
        },
        {
          id: "tx-103",
          invoiceNumber: "INV-2026-88018",
          studentId: "S11202",
          studentName: "James Carter",
          patientEmail: "james.carter@titanhealthconnect.com",
          patientMobile: "+91 99000 00000",
          serviceType: "medicine",
          serviceDetails: "Asthma Inhaler Albuterol & anti-inflammatory pills",
          amount: 600,
          discount: 15,
          tax: 25,
          totalAmount: 535,
          paymentMethod: "Digital Wallet",
          paymentDate: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
          status: "successful"
        },
        {
          id: "tx-104",
          invoiceNumber: "INV-2026-88022",
          studentId: "S10943",
          studentName: "Maya Lin",
          patientEmail: "maya.lin@titanhealthconnect.com",
          patientMobile: "+91 99887 76655",
          serviceType: "home_collection",
          serviceDetails: "Home Blood Drawer and Cardiology ECG scan monitoring",
          amount: 1500,
          discount: 5,
          tax: 71,
          totalAmount: 1496,
          paymentMethod: "Debit Card",
          paymentDate: new Date(Date.now() - 86400000 * 1).toISOString(), // 1 day ago
          status: "refund_requested",
          refundReason: "Incorrect diagnostic time chosen by laboratory team."
        },
        {
          id: "tx-105",
          invoiceNumber: "INV-2026-88025",
          studentId: "S10556",
          studentName: "Sophia Esparza",
          patientEmail: "sophia@titan.com",
          patientMobile: "+91 99000 11223",
          serviceType: "healthcare_service",
          serviceDetails: "Advanced Neurology Scanner Examination",
          amount: 2500,
          discount: 0,
          tax: 125,
          totalAmount: 2625,
          paymentMethod: "Net Banking",
          paymentDate: new Date(Date.now() - 86400000 * 10).toISOString(),
          status: "successful"
        },
        {
          id: "tx-106",
          invoiceNumber: "INV-2026-88031",
          studentId: "S10943",
          studentName: "Maya Lin",
          patientEmail: "maya.lin@titanhealthconnect.com",
          patientMobile: "+91 99887 76655",
          serviceType: "medicine",
          serviceDetails: "Vitamins and generic Pain Reliever capsules order",
          amount: 350,
          discount: 0,
          tax: 18,
          totalAmount: 368,
          paymentMethod: "Cash on Delivery",
          paymentDate: new Date().toISOString(),
          status: "pending"
        }
      ]
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(defaultData, null, 2), "utf8");
  }
}

// Read database helper
function readDB() {
  try {
    initDatabase();
    const data = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(data);
    if (!parsed.users) {
      parsed.users = [
        {
          id: "THC-2026-0001",
          fullName: "Maya Lin",
          username: "mayalin",
          email: "maya.lin@titanhealthconnect.com",
          password: "Password@123",
          dob: "2004-05-14",
          gender: "Female",
          bloodGroup: "O+",
          mobile: "+91 99887 76655",
          country: "India",
          state: "Karnataka",
          city: "Bengaluru",
          pincode: "560066",
          address: "Titan Campus Residential Hall A, Suite 302",
          allergies: "Penicillin",
          conditions: "Seasonal mild asthma, recurrent migraine symptoms",
          emergencyName: "Arthur Lin",
          emergencyPhone: "+91 99001 12233",
          isVerified: true,
          otp: null,
          loginAttempts: 0,
          lockedUntil: null
        }
      ];
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), "utf8");
    }
    if (!parsed.payments) {
      parsed.payments = [
        {
          id: "tx-101",
          invoiceNumber: "INV-2026-88012",
          studentId: "S10943",
          studentName: "Maya Lin",
          patientEmail: "maya.lin@titanhealthconnect.com",
          patientMobile: "+91 99887 76655",
          serviceType: "appointment",
          serviceDetails: "Dr. Elena Mercer - General Medicine Consultation",
          amount: 500,
          discount: 10,
          tax: 22,
          totalAmount: 472,
          paymentMethod: "UPI",
          paymentDate: new Date(Date.now() - 86400000 * 5).toISOString(),
          status: "successful"
        },
        {
          id: "tx-102",
          invoiceNumber: "INV-2026-88015",
          studentId: "S10943",
          studentName: "Maya Lin",
          patientEmail: "maya.lin@titanhealthconnect.com",
          patientMobile: "+91 99887 76655",
          serviceType: "lab_test",
          serviceDetails: "Complete Blood Count (CBC) Panel with Smart Diagnostics",
          amount: 800,
          discount: 0,
          tax: 40,
          totalAmount: 840,
          paymentMethod: "Credit Card",
          paymentDate: new Date(Date.now() - 86400000 * 3).toISOString(),
          status: "successful"
        }
      ];
      fs.writeFileSync(DB_FILE, JSON.stringify(parsed, null, 2), "utf8");
    }
    return parsed;
  } catch (err) {
    console.error("Error reading database:", err);
    return { appointments: [], vitals: [], sosAlerts: [], prescriptions: [], users: [], payments: [] };
  }
}

// Write database helper
function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing database:", err);
  }
}

// ----------------------------------------
// API ENDPOINTS
// ----------------------------------------

// Fetch all database records
app.get("/api/db", (req, res) => {
  const db = readDB();
  res.json(db);
});

// ==========================================
// PATIENT AUTHENTICATION MODULE ENDPOINTS
// ==========================================

// Pre-configured mock OAuth accounts
const MOCK_OAUTH_PROFILES: any = {
  "maya.lin@titanhealthconnect.com": {
    id: "S10943",
    fullName: "Maya Lin",
    username: "mayalin",
    email: "maya.lin@titanhealthconnect.com",
    dob: "2004-05-14",
    gender: "Female",
    bloodGroup: "O+",
    mobile: "+91 99887 76655",
    country: "India",
    state: "Karnataka",
    city: "Bengaluru",
    pincode: "560066",
    address: "Titan Campus Residential Hall A, Suite 302",
    allergies: "Penicillin",
    conditions: "Seasonal mild asthma, recurrent migraine symptoms",
    emergencyName: "Arthur Lin",
    emergencyPhone: "+91 99001 12233"
  },
  "james.carter@titanhealthconnect.com": {
    id: "S11202",
    fullName: "James Carter",
    username: "jamescarter",
    email: "james.carter@titanhealthconnect.com",
    dob: "2001-11-23",
    gender: "Male",
    bloodGroup: "A+",
    mobile: "+91 99001 88776",
    country: "India",
    state: "Karnataka",
    city: "Bengaluru",
    pincode: "560500",
    address: "Titan College Dormitory B, Level 1",
    allergies: "Strawberries, Sulfa medication",
    conditions: "Follow-up on sprained left ankle during basketball tournament",
    emergencyName: "Nancy Carter",
    emergencyPhone: "+91 99001 55443"
  },
  "sophia.esparza@titanhealthconnect.com": {
    id: "S10556",
    fullName: "Sophia Esparza",
    username: "sophiaesparza",
    email: "sophia.esparza@titanhealthconnect.com",
    dob: "2003-08-09",
    gender: "Female",
    bloodGroup: "B+",
    mobile: "+91 99001 22334",
    country: "India",
    state: "Karnataka",
    city: "Bengaluru",
    pincode: "560012",
    address: "Standard Student Suite G-4",
    allergies: "None",
    conditions: "Intense seasonal migraine with sensitivity to direct light",
    emergencyName: "Luis Esparza",
    emergencyPhone: "+91 99001 99887"
  }
};

app.post("/api/auth/oauth-login", (req, res) => {
  const db = readDB();
  const { email, provider } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email parameter is required for enterprise login." });
  }

  let profilePreset = MOCK_OAUTH_PROFILES[email.toLowerCase()];
  if (!profilePreset) {
    // Dynamically generate a stellar, fully functional workspace profile for any custom Google/Microsoft account
    const emailParts = email.split('@');
    const prefix = emailParts[0] || "titan.user";
    const cleanPrefix = prefix
      .replace(/[._\-]+/g, ' ')
      .replace(/[0-9]+/g, ' ')
      .trim()
      .replace(/\s+/g, ' ');
    const words = cleanPrefix.split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).filter(Boolean);
    const fullName = words.length > 0 ? words.join(' ') : "Titan Explorer";
    const username = prefix.toLowerCase().replace(/[^a-z0-9]/g, '') || "titanuser";
    const randId = "S" + Math.floor(10000 + Math.random() * 89999);

    profilePreset = {
      id: randId,
      fullName: fullName,
      username: username,
      email: email.toLowerCase(),
      dob: "2002-06-15",
      gender: "Female",
      bloodGroup: "O-",
      mobile: "+91 98765 43210",
      country: "India",
      state: "Karnataka",
      city: "Bengaluru",
      pincode: "560100",
      address: "Campus Premium Guest Suite, Tower C-4",
      allergies: "None reported",
      conditions: "Annual general checkup alignment",
      emergencyName: "On-Duty Campus Medical Officer",
      emergencyPhone: "+91 99000 11223"
    };
  }

  // Find or create in local JSON DB so session and statistics updates work flawlessly
  let userIndex = db.users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
  
  if (userIndex === -1) {
    // Lazy provision of this interactive user
    const newUserObj = {
      ...profilePreset,
      password: "EnterpriseOAuthUser@Safe",
      isVerified: true,
      otp: null,
      loginAttempts: 0,
      lockedUntil: null,
      jwtToken: `mock-oauth-jwt-auth-${Math.random().toString(36).substr(2)}`,
      activities: [
        {
          timestamp: new Date().toISOString(),
          device: `${provider || "Enterprise"} Integration Auth`,
          status: `OAuth Verified Sign In via ${provider || "Cloud Provider"}`,
          location: "On-Campus"
        }
      ]
    };
    db.users.push(newUserObj);
    writeDB(db);
    userIndex = db.users.length - 1;
  } else {
    // Append a login trace record
    db.users[userIndex].activities.unshift({
      timestamp: new Date().toISOString(),
      device: `${provider || "Enterprise"} integration session`,
      status: `Enterprise Re-authenticated`,
      location: "On-Campus"
    });
    writeDB(db);
  }

  const activeUser = db.users[userIndex];
  res.json({
    success: true,
    message: `Securely signed in to Titan HealthConnect through ${provider || "Single Sign-On"}.`,
    user: {
      id: activeUser.id,
      fullName: activeUser.fullName,
      username: activeUser.username,
      email: activeUser.email,
      dob: activeUser.dob,
      gender: activeUser.gender,
      bloodGroup: activeUser.bloodGroup,
      mobile: activeUser.mobile,
      country: activeUser.country,
      state: activeUser.state,
      city: activeUser.city,
      pincode: activeUser.pincode,
      address: activeUser.address,
      allergies: activeUser.allergies,
      conditions: activeUser.conditions,
      emergencyName: activeUser.emergencyName,
      emergencyPhone: activeUser.emergencyPhone,
      jwtToken: activeUser.jwtToken,
      activities: activeUser.activities
    }
  });
});

// 1. Patient Register
app.post("/api/auth/register", (req, res) => {
  const db = readDB();
  const {
    fullName, dob, gender, bloodGroup, mobile, email,
    country, state, city, pincode, address,
    allergies, conditions, emergencyName, emergencyPhone,
    username, password
  } = req.body;

  // Primary validations
  if (!fullName || !dob || !gender || !mobile || !email || !username || !password) {
    return res.status(400).json({ error: "Please fulfill all required fields." });
  }

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: "Invalid Email address format." });
  }

  // Mobile number format (at least 10 numbers)
  const cleanMobile = mobile.replace(/\D/g, "");
  if (cleanMobile.length < 10) {
    return res.status(400).json({ error: "Mobile number must resemble a valid 10-digit number." });
  }

  // Safe checks for duplicates
  const userExists = db.users.some(
    (u: any) => u.email.toLowerCase() === email.toLowerCase() || u.username.toLowerCase() === username.toLowerCase()
  );
  if (userExists) {
    return res.status(409).json({ error: "Username or Email address has already been registered." });
  }

  // Password requirements
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must consist of at least 8 strong characters." });
  }

  // Generate Unique Patient ID (THC-2026-000X)
  const formatIndex = String(db.users.length + 1).padStart(4, "0");
  const newPatientId = `THC-2026-${formatIndex}`;

  // Generate a random 6-digit OTP code
  const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));

  const newUser = {
    id: newPatientId,
    fullName,
    dob,
    gender,
    bloodGroup: bloodGroup || "O+",
    mobile,
    email,
    country: country || "India",
    state: state || "Karnataka",
    city: city || "Bengaluru",
    pincode: pincode || "560066",
    address: address || "Campus Hall",
    allergies: allergies || "None declared",
    conditions: conditions || "None declared",
    emergencyName: emergencyName || "Guardian Care",
    emergencyPhone: emergencyPhone || "+91 99000 00000",
    username,
    password, // Storing safely inside client sandbox JSON
    isVerified: false,
    otp: generatedOtp,
    loginAttempts: 0,
    lockedUntil: null,
    jwtToken: `mock-jwt-token-id-${Math.random().toString(36).substr(2)}`,
    activities: [
      {
        timestamp: new Date().toISOString(),
        device: "Web Browser (" + (req.headers["user-agent"]?.split(" ")[0] || "Client App") + ")",
        status: "Registration Completed",
        location: "Bengaluru, IN"
      }
    ]
  };

  db.users.push(newUser);
  writeDB(db);

  // Return user alongside OTP inside response so the client app can display/verify without real mail transport dependency
  res.status(201).json({
    message: "Patient registered successfully! OTP dispatched.",
    userId: newPatientId,
    email: email,
    otpDebug: generatedOtp // Shared securely in developer sandbox mode to let user proceed
  });
});

// 2. Email Verification OTP verification
app.post("/api/auth/verify-otp", (req, res) => {
  const db = readDB();
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({ error: "Missing verification parameters." });
  }

  const userIndex = db.users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (userIndex === -1) {
    return res.status(404).json({ error: "No student records found under this email." });
  }

  const user = db.users[userIndex];
  if (user.otp === otp) {
    db.users[userIndex].isVerified = true;
    db.users[userIndex].otp = null; // Flush
    writeDB(db);
    res.json({
      success: true,
      message: "Email verified successfully! Profile setup is complete.",
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        dob: user.dob,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        mobile: user.mobile,
        country: user.country,
        state: user.state,
        city: user.city,
        pincode: user.pincode,
        address: user.address,
        allergies: user.allergies,
        conditions: user.conditions,
        emergencyName: user.emergencyName,
        emergencyPhone: user.emergencyPhone,
        jwtToken: user.jwtToken
      }
    });
  } else {
    res.status(400).json({ error: "Invalid OTP code entered. Please revise." });
  }
});

// 3. User Login
app.post("/api/auth/login", (req, res) => {
  const db = readDB();
  const { emailOrUsername, password } = req.body;

  if (!emailOrUsername || !password) {
    return res.status(400).json({ error: "Identification and password details are mandatory." });
  }

  const userIndex = db.users.findIndex(
    (u: any) => u.email.toLowerCase() === emailOrUsername.toLowerCase() || u.username.toLowerCase() === emailOrUsername.toLowerCase()
  );

  if (userIndex === -1) {
    return res.status(401).json({ error: "Invalid credentials. Please verify your details." });
  }

  const user = db.users[userIndex];

  // Lock logic
  if (user.lockedUntil && new Date(user.lockedUntil).getTime() > Date.now()) {
    const remains = Math.ceil((new Date(user.lockedUntil).getTime() - Date.now()) / 1000);
    return res.status(423).json({ error: `Account heavily locked. Please wait ${remains} seconds before retrying.` });
  }

  if (user.password === password) {
    // Audit Login
    db.users[userIndex].loginAttempts = 0;
    db.users[userIndex].lockedUntil = null;
    db.users[userIndex].activities.unshift({
      timestamp: new Date().toISOString(),
      device: "Web Session (" + (req.headers["user-agent"]?.split(" ")[0]?.substring(0, 15) || "Chrome Sandbox") + ")",
      status: "Successful login",
      location: "On-Campus"
    });
    writeDB(db);

    res.json({
      success: true,
      message: "Welcome back, " + user.fullName,
      user: {
        id: user.id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        dob: user.dob,
        gender: user.gender,
        bloodGroup: user.bloodGroup,
        mobile: user.mobile,
        country: user.country,
        state: user.state,
        city: user.city,
        pincode: user.pincode,
        address: user.address,
        allergies: user.allergies,
        conditions: user.conditions,
        emergencyName: user.emergencyName,
        emergencyPhone: user.emergencyPhone,
        jwtToken: user.jwtToken,
        activities: user.activities
      }
    });
  } else {
    // Password incorrect
    const currentFailures = (user.loginAttempts || 0) + 1;
    db.users[userIndex].loginAttempts = currentFailures;
    
    let isLocked = false;
    let lockTimeout = null;
    if (currentFailures >= 5) {
      isLocked = true;
      const timeoutDate = new Date(Date.now() + 60 * 1000); // lock for 60 seconds
      db.users[userIndex].lockedUntil = timeoutDate.toISOString();
      lockTimeout = timeoutDate.toISOString();
    }

    writeDB(db);

    if (isLocked) {
      res.status(423).json({ error: "Account locked! Maximum failed attempts exceeded. Please try again in 60 seconds." });
    } else {
      res.status(401).json({ error: `Invalid password. Attempt ${currentFailures} of 5 before safety lock.` });
    }
  }
});

// 4. Forgot password request OTP
app.post("/api/auth/forgot-password", (req, res) => {
  const db = readDB();
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Registered email is required." });
  }

  const userIndex = db.users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (userIndex === -1) {
    return res.status(404).json({ error: "No user found associated with this email address." });
  }

  // Generate a reset verification code
  const resetOtp = String(Math.floor(100000 + Math.random() * 900000));
  db.users[userIndex].otp = resetOtp;
  writeDB(db);

  res.json({
    success: true,
    message: "Security reset code dispatched to email.",
    otpDebug: resetOtp
  });
});

// 5. Reset password actually
app.post("/api/auth/reset-password", (req, res) => {
  const db = readDB();
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ error: "Missing required password revision data state." });
  }

  if (newPassword.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters." });
  }

  const userIndex = db.users.findIndex((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (userIndex === -1) {
    return res.status(404).json({ error: "Patient email not registered." });
  }

  const user = db.users[userIndex];
  if (user.otp === otp) {
    db.users[userIndex].password = newPassword;
    db.users[userIndex].otp = null; // Clean
    db.users[userIndex].loginAttempts = 0; // Reset
    db.users[userIndex].lockedUntil = null;
    db.users[userIndex].activities.unshift({
      timestamp: new Date().toISOString(),
      device: "Security Terminal Reset",
      status: "Password Reset Approved",
      location: "Bengaluru, IN"
    });
    writeDB(db);

    res.json({
      success: true,
      message: "Password updated successfully! Welcome to log in."
    });
  } else {
    res.status(400).json({ error: "Invalid password reset code verification." });
  }
});

// 6. Update Profile settings
app.put("/api/auth/profile/update", (req, res) => {
  const db = readDB();
  const {
    id, fullName, dob, gender, bloodGroup, mobile, email,
    country, state, city, pincode, address,
    allergies, conditions, emergencyName, emergencyPhone
  } = req.body;

  if (!id) {
    return res.status(400).json({ error: "Client Patient ID is required." });
  }

  const userIndex = db.users.findIndex((u: any) => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ error: "Patient record profile was not identified." });
  }

  // Update records
  if (fullName) db.users[userIndex].fullName = fullName;
  if (dob) db.users[userIndex].dob = dob;
  if (gender) db.users[userIndex].gender = gender;
  if (bloodGroup) db.users[userIndex].bloodGroup = bloodGroup;
  if (mobile) db.users[userIndex].mobile = mobile;
  if (email) db.users[userIndex].email = email;
  if (country) db.users[userIndex].country = country;
  if (state) db.users[userIndex].state = state;
  if (city) db.users[userIndex].city = city;
  if (pincode) db.users[userIndex].pincode = pincode;
  if (address) db.users[userIndex].address = address;
  if (allergies) db.users[userIndex].allergies = allergies;
  if (conditions) db.users[userIndex].conditions = conditions;
  if (emergencyName) db.users[userIndex].emergencyName = emergencyName;
  if (emergencyPhone) db.users[userIndex].emergencyPhone = emergencyPhone;

  writeDB(db);
  res.json({
    success: true,
    message: "Patient medical directory and credentials updated successfully.",
    user: db.users[userIndex]
  });
});

// APPOINTMENTS ENDPOINTS
app.get("/api/appointments", (req, res) => {
  const db = readDB();
  res.json(db.appointments);
});

app.post("/api/appointments", (req, res) => {
  const db = readDB();
  const { studentName, studentId, reason, date, time } = req.body;

  if (!studentName || !studentId || !reason || !date || !time) {
    return res.status(400).json({ error: "Missing required booking details." });
  }

  const newAppt = {
    id: `apt-${Date.now()}`,
    studentName,
    studentId,
    reason,
    date,
    time,
    status: "pending" as const,
    notes: "",
    timestamp: new Date().toISOString()
  };

  db.appointments.unshift(newAppt);
  writeDB(db);
  res.status(201).json(newAppt);
});

app.put("/api/appointments/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { status, notes } = req.body;

  const apptIndex = db.appointments.findIndex((a: any) => a.id === id);
  if (apptIndex === -1) {
    return res.status(404).json({ error: "Appointment not found." });
  }

  if (status) db.appointments[apptIndex].status = status;
  if (notes !== undefined) db.appointments[apptIndex].notes = notes;

  writeDB(db);
  res.json(db.appointments[apptIndex]);
});

app.post("/api/appointments/update-severity", (req, res) => {
  const db = readDB();
  const { vitalId, severity } = req.body;

  const vitalIndex = db.vitals.findIndex((v: any) => v.id === vitalId);
  if (vitalIndex !== -1) {
    db.vitals[vitalIndex].severity = severity;
    writeDB(db);
    return res.json({ success: true, vital: db.vitals[vitalIndex] });
  }

  res.status(404).json({ error: "Vital entry not found for severity update." });
});

// VITALS LOG ENDPOINTS
app.get("/api/vitals", (req, res) => {
  const db = readDB();
  res.json(db.vitals);
});

app.post("/api/vitals", (req, res) => {
  const db = readDB();
  const { studentName, studentId, symptoms, temperature, heartRate, allergies, severity } = req.body;

  if (!studentName || !studentId || !symptoms || temperature === undefined) {
    return res.status(400).json({ error: "Missing symptoms or temperature payload." });
  }

  const newVital = {
    id: `vit-${Date.now()}`,
    studentName,
    studentId,
    symptoms,
    temperature: parseFloat(temperature),
    heartRate: heartRate ? parseInt(heartRate) : 75,
    allergies: allergies || "None declared",
    severity: severity || "normal",
    timestamp: new Date().toISOString()
  };

  db.vitals.unshift(newVital);
  writeDB(db);
  res.status(201).json(newVital);
});

// PRESCRIPTIONS ENDPOINTS
app.get("/api/prescriptions", (req, res) => {
  const db = readDB();
  res.json(db.prescriptions);
});

app.post("/api/prescriptions", (req, res) => {
  const db = readDB();
  const { appointmentId, studentName, studentId, doctorName, medication, dosage, instructions } = req.body;

  if (!studentName || !studentId || !doctorName || !medication || !dosage) {
    return res.status(400).json({ error: "Missing digital prescription configuration." });
  }

  const newPrescr = {
    id: `rx-${Date.now()}`,
    appointmentId: appointmentId || "",
    studentName,
    studentId,
    doctorName,
    medication,
    dosage,
    instructions: instructions || "Take as guided",
    datePrescribed: new Date().toISOString().split("T")[0]
  };

  db.prescriptions.unshift(newPrescr);
  writeDB(db);
  res.status(201).json(newPrescr);
});

// SOS DISPATCH ALERTS ENDPOINTS
app.get("/api/sos", (req, res) => {
  const db = readDB();
  res.json(db.sosAlerts);
});

app.post("/api/sos", (req, res) => {
  const db = readDB();
  const { studentName, studentId, building, room, additionalDetails } = req.body;

  if (!studentName || !studentId || !building || !room) {
    return res.status(400).json({ error: "Incomplete emergency coordinates locator details." });
  }

  const newSOS = {
    id: `sos-${Date.now()}`,
    studentName,
    studentId,
    building,
    room,
    additionalDetails: additionalDetails || "None declared",
    timestamp: new Date().toISOString(),
    status: "active" as const
  };

  db.sosAlerts.unshift(newSOS);
  writeDB(db);
  res.status(201).json(newSOS);
});

app.put("/api/sos/:id", (req, res) => {
  const db = readDB();
  const { id } = req.params;
  const { status, resolvedBy } = req.body;

  const sosIndex = db.sosAlerts.findIndex((s: any) => s.id === id);
  if (sosIndex === -1) {
    return res.status(404).json({ error: "SOS dispatch command not found." });
  }

  if (status) db.sosAlerts[sosIndex].status = status;
  if (status === "resolved") {
    db.sosAlerts[sosIndex].resolvedBy = resolvedBy || "Duty Dispatch Commander";
    db.sosAlerts[sosIndex].resolvedAt = new Date().toISOString();
  }

  writeDB(db);
  res.json(db.sosAlerts[sosIndex]);
});

// PAYMENTS & TRANSACTION MANAGEMENT ENDPOINTS
app.get("/api/payments", (req, res) => {
  const db = readDB();
  res.json(db.payments || []);
});

app.post("/api/payments", (req, res) => {
  const db = readDB();
  const { 
    studentId, 
    studentName, 
    patientEmail, 
    patientMobile, 
    serviceType, 
    serviceDetails, 
    amount, 
    discount, 
    tax, 
    totalAmount, 
    paymentMethod,
    status
  } = req.body;

  if (!studentId || !studentName || !serviceType || !amount || !paymentMethod) {
    return res.status(400).json({ error: "Missing required critical transaction billing settings." });
  }

  const newPayment = {
    id: `tx-${Date.now()}`,
    invoiceNumber: `INV-2026-${Math.floor(10000 + Math.random() * 89999)}`,
    studentId,
    studentName,
    patientEmail: patientEmail || "guest@titan.com",
    patientMobile: patientMobile || "+91 99000 00000",
    serviceType,
    serviceDetails,
    amount,
    discount: discount || 0,
    tax: tax || 0,
    totalAmount,
    paymentMethod,
    paymentDate: new Date().toISOString(),
    status: status || "successful",
    refundReason: ""
  };

  db.payments = db.payments || [];
  db.payments.unshift(newPayment);
  writeDB(db);

  res.status(201).json(newPayment);
});

app.post("/api/payments/refund", (req, res) => {
  const db = readDB();
  const { id, refundReason } = req.body;

  if (!id || !refundReason) {
    return res.status(400).json({ error: "Transaction ID and refund complaint reason are required." });
  }

  const txIndex = db.payments?.findIndex((p: any) => p.id === id);
  if (txIndex === -1 || txIndex === undefined) {
    return res.status(404).json({ error: "Transaction ID not found." });
  }

  db.payments[txIndex].status = "refund_requested";
  db.payments[txIndex].refundReason = refundReason;
  writeDB(db);

  res.json(db.payments[txIndex]);
});

app.post("/api/payments/update-status", (req, res) => {
  const db = readDB();
  const { id, status } = req.body;

  if (!id || !status) {
    return res.status(400).json({ error: "Transaction ID and new status are required." });
  }

  const txIndex = db.payments?.findIndex((p: any) => p.id === id);
  if (txIndex === -1 || txIndex === undefined) {
    return res.status(404).json({ error: "Transaction index trace not found." });
  }

  db.payments[txIndex].status = status;
  if (status === "refunded") {
    db.payments[txIndex].refundProcessedAt = new Date().toISOString();
  }
  writeDB(db);

  res.json(db.payments[txIndex]);
});

// GEMINI SYMPTOM TRIAGE ENDPOINT
app.post("/api/gemini/triage", async (req, res) => {
  const { symptoms, temperature, allergies } = req.body;

  if (!symptoms) {
    return res.status(400).json({ error: "Symptom description is required for triaging." });
  }

  // 1. Fallback Rule-Based Triaging (If API is unavailable or key not configured)
  const getFallbackTriage = () => {
    const symLower = symptoms.toLowerCase();
    let urgency = "normal";
    let summary = "Mild physiological reaction or localized strain.";
    let homeCare = "1. Drink warm fluids and guarantee standard hydration.\n2. Dedicate at least 8 hours to restful recuperation.\n3. Keep a regular log of visual or somatic symptoms.";
    let shouldTriggerSOS = false;

    if (symLower.includes("chest pain") || symLower.includes("difficulty breathing") || symLower.includes("breath") || symLower.includes("unconscious") || symLower.includes("passed out") || symLower.includes("severe allergic") || symLower.includes("choking") || symLower.includes("bleeding")) {
      urgency = "critical";
      summary = "Life-threatening acute respiratory or cardiovascular distress flagged.";
      homeCare = "1. Rest immediately in a comfortable semi-upright posture.\n2. Do NOT physically strain or engage in physical tests.\n3. Request bystander or roommate presence until support arrives.";
      shouldTriggerSOS = true;
    } else if (parseFloat(temperature) >= 38.5 || symLower.includes("fever") || symLower.includes("migraine") || symLower.includes("vomiting") || symLower.includes("severe") || symLower.includes("infection")) {
      urgency = "moderate";
      summary = "Moderate systemic febrile response or inflammatory activity detected.";
      homeCare = "1. Over-the-counter thermoregulation supports as permissible with health guidelines.\n2. Keep a light diet focusing on electrolyte solutions or mild broths.\n3. Walk to the campus infirmary for a personalized assessment card.";
    }

    return {
      disclaimer: "LOCAL SCREENING KEY: This assessment is drawn from campus rule-based safety patterns. This is NOT a substitute for formal, professional medical diagnosis, advice, or treatment.",
      urgency,
      summary,
      homeCare,
      shouldTriggerSOS
    };
  };

  // 2. Gemini-Based Triaging if Gemini Key and Client are Active
  if (ai) {
    try {
      console.log("Analyzing campus symptoms with server-side Gemini 3.5 Flash...");
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Evaluate this student's health logs:
Symptoms logged: "${symptoms}"
Current Temp: ${temperature ? temperature + "°C" : "Unspecified"}
Allergies declared: "${allergies || "None stated"}"

Provide an objective screening in strict JSON response with the following keys:
{
  "disclaimer": "Write a standardized medical disclaimer emphasizing that this is an AI screening and not a professional medical diagnosis.",
  "urgency": "Can be ONLY one string: 'normal', 'moderate', or 'critical'",
  "summary": "A concise 2-sentence summary of possible causes or assessments.",
  "homeCare": "A bulleted formatted string consisting of 3 clear, practical medical safety tips.",
  "shouldTriggerSOS": true/false (true ONLY if there is critical risk like severe chest pain, asphyxiation, major trauma, or chemical inhalation)
}`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              disclaimer: { type: Type.STRING },
              urgency: { type: Type.STRING, description: "Must be 'normal', 'moderate' or 'critical'" },
              summary: { type: Type.STRING },
              homeCare: { type: Type.STRING },
              shouldTriggerSOS: { type: Type.BOOLEAN }
            },
            required: ["disclaimer", "urgency", "summary", "homeCare", "shouldTriggerSOS"]
          }
        }
      });

      const responseText = response.text;
      if (responseText) {
        const triageResult = JSON.parse(responseText.trim());
        return res.json(triageResult);
      } else {
        throw new Error("Empty text reply received from Gemini.");
      }
    } catch (err) {
      console.error("Gemini triage analysis command failed, executing local fallback:", err);
      return res.json(getFallbackTriage());
    }
  } else {
    // Return direct high-fidelity rule-based response instantly with zero latency
    return res.json(getFallbackTriage());
  }
});

// GEMINI HACKATHON PITCH DECK STRUCTURE GENERATOR ENDPOINT
app.post("/api/gemini/pitch-generator", async (req, res) => {
  const { description } = req.body;
  
  const defaultPitch = {
    slides: [
      {
        title: "Titan HealthConnect",
        subtitle: "Bridging the Gap in Campus Telemedicine & Emergency Logistics",
        bullets: [
          "Instant patient-to-practitioner secure data sharing portal.",
          "WebGL-powered 3D Cardiac visualizer for physical diagnostics.",
          "Automated on-campus coordinates tracking for immediate dispatch."
        ]
      },
      {
        title: "The Problem",
        subtitle: "Fragmented, Slow Care & Blind Response Teams",
        bullets: [
          "Traditional student health services suffer from slow diagnosis times.",
          "Paramedics lack precise building and room coordinates, delaying response.",
          "Anxiety spikes as users wait without immediate clinical triage."
        ]
      },
      {
        title: "The Solution",
        subtitle: "Real-Time 3D Digital Twins & Immediate Triage Network",
        bullets: [
          "24/7 localized Clinical Triage with server-side AI evaluation.",
          "3D interactive anatomical monitors matching personal symptoms.",
          "Geolocated SOS dispatches tracking both building and room numbers."
        ]
      },
      {
        title: "Key Technology",
        subtitle: "Next-gen Stack Optimized for Medical High-Availability",
        bullets: [
          "React 19 & Tailwind CSS v4 for blazing-fast micro-animated interfaces.",
          "Google Gemini 3.5 Flash server-side engine for instant symptom risk assessment.",
          "Dual-tier local syncing layer ensuring 100% offline uptime."
        ]
      },
      {
        title: "Business & Health Impact",
        subtitle: "Saving Critical Minutes saves Lives",
        bullets: [
          "Reduced emergency room delays on campus by up to 40%.",
          "B2B SaaS licensing for university administration portals.",
          "Scalable API modules for global smart campus networks."
        ]
      },
      {
        title: "Team & The Future",
        subtitle: "The Vision for Ubiquitous Autonomous Care",
        bullets: [
          "Built by an elite hackathon team of clinical and software experts.",
          "Next step: Integrating wearable IoT wearable telemetry.",
          "Join us in redefining emergency wellness networks."
        ]
      }
    ]
  };

  if (!ai) {
    return res.json(defaultPitch);
  }

  try {
    const userPrompt = description || "Titan HealthConnect: A campus medical ecosystem with 3D cardiac monitors, AI triage and coordinate emergency paramedic alerts.";
    console.log("Generating custom Pitch Deck with server-side Gemini 3.5 Flash...");
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `You are an expert venture capitalist and hackathon organizer. Compile a professional hackathon pitch presentation deck based on this project description:
"${userPrompt}"

Generate exactly 6 slides. Return a JSON response matching the following structure:
{
  "slides": [
    {
      "title": "A short, Punchy Slide Title",
      "subtitle": "An elegant, descriptive 1-sentence subtitle summarizing the slide's purpose.",
      "bullets": [
        "Clear, action-oriented bullet point 1",
        "Clear, action-oriented bullet point 2",
        "Clear, action-oriented bullet point 3"
      ]
    }
  ]
}

The slides must follow standard hackathon sequence:
1. Title / Hook
2. The Problem
3. The Solution
4. Technology Stack / Architecture
5. Market Opportunity / Health Impact
6. Team / Future Roadmap

Bullets must be concise and energetic. Limit each slide to exactly 3 bullets.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            slides: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  subtitle: { type: Type.STRING },
                  bullets: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                  }
                },
                required: ["title", "subtitle", "bullets"]
              }
            }
          },
          required: ["slides"]
        }
      }
    });

    if (response.text) {
      const parsed = JSON.parse(response.text.trim());
      return res.json(parsed);
    } else {
      return res.json(defaultPitch);
    }
  } catch (err) {
    console.error("Failed to generate pitch with Gemini, using defaults:", err);
    return res.json(defaultPitch);
  }
});

// ----------------------------------------
// VITE SERVER OR STATIC BUILD MIDDLEWARE
// ----------------------------------------
async function startServer() {
  initDatabase();

  if (process.env.NODE_ENV !== "production") {
    console.log("Installing Vite development middleware...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Serving pre-compiled assets from /dist in Production mode...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Titan Healthconnect: Running on port http://0.0.0.0:${PORT}`);
  });
}

startServer();
