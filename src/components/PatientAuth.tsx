import React, { useState, useEffect } from "react";
import { 
  Mail, 
  Lock, 
  User, 
  Calendar, 
  ShieldCheck, 
  Activity, 
  Phone, 
  MapPin, 
  Eye, 
  EyeOff, 
  HeartPulse, 
  CheckCircle2, 
  ChevronRight, 
  Key, 
  AlertCircle, 
  RefreshCw, 
  ArrowLeft,
  BookOpen,
  Fingerprint,
  Info
} from "lucide-react";
import TitanLogo from "./TitanLogo";

interface PatientAuthProps {
  onAuthSuccess: (user: any) => void;
  onBackToGuest: () => void;
  isDarkMode: boolean;
}

type AuthScreen = 'login' | 'register' | 'forgot' | 'reset' | 'verify';

export default function PatientAuth({ onAuthSuccess, onBackToGuest, isDarkMode }: PatientAuthProps) {
  const [screen, setScreen] = useState<AuthScreen>('login');
  
  // Registration States
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState("");
  const [gender, setGender] = useState("Female");
  const [bloodGroup, setBloodGroup] = useState("O+");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  
  const [country, setCountry] = useState("India");
  const [state, setState] = useState("Karnataka");
  const [city, setCity] = useState("Bengaluru");
  const [pincode, setPincode] = useState("");
  const [address, setAddress] = useState("");
  
  const [allergies, setAllergies] = useState("");
  const [conditions, setConditions] = useState("");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  
  // CAPTCHA details
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [numA] = useState(() => Math.floor(3 + Math.random() * 7));
  const [numB] = useState(() => Math.floor(2 + Math.random() * 8));
  
  // Auth Form Controls
  const [rememberMe, setRememberMe] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [formStep, setFormStep] = useState(1); // 1: Personal, 2: Address, 3: Medical, 4: Account
  
  // OTP Verification parameters 
  const [verifyEmail, setVerifyEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [debugOtp, setDebugOtp] = useState<string | null>(null);

  // Login variables
  const [loginEmailOrUser, setLoginEmailOrUser] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Password Strength Checker for live indicator
  const [passStrength, setPassStrength] = useState({ score: 0, label: "Very Weak", color: "bg-rose-500" });

  useEffect(() => {
    const pw = screen === 'register' ? password : loginPassword;
    if (!pw) {
      setPassStrength({ score: 0, label: "None", color: "bg-slate-200" });
      return;
    }
    let score = 0;
    if (pw.length >= 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^a-zA-Z0-9]/.test(pw)) score++;

    if (score <= 1) {
      setPassStrength({ score, label: "Weak", color: "bg-rose-505 bg-rose-500" });
    } else if (score === 2) {
      setPassStrength({ score, label: "Medium", color: "bg-amber-500" });
    } else if (score === 3) {
      setPassStrength({ score, label: "Strong", color: "bg-blue-500" });
    } else {
      setPassStrength({ score, label: "Highly Secure", color: "bg-emerald-500" });
    }
  }, [password, loginPassword, screen]);

  const [showOAuthModal, setShowOAuthModal] = useState<'google' | 'microsoft' | null>(null);
  const [customOAuthEmail, setCustomOAuthEmail] = useState("");

  // Handle OAuth specific account login simulation
  const handleOAuthLogin = async (email: string, provider: 'Google' | 'Microsoft') => {
    setLoading(true);
    setErrorMessage(null);
    setShowOAuthModal(null);
    try {
      const res = await fetch("/api/auth/oauth-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, provider })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `${provider} authentication failed.`);
      onAuthSuccess(data.user);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Quick Sandbox Account Autopopulate
  const handleSandboxLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrUsername: "mayalin",
          password: "Password@123"
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Sandbox server authentication delayed.");
      onAuthSuccess(data.user);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Submit sign in 
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmailOrUser || !loginPassword) {
      setErrorMessage("Please fill out both username/email and password.");
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailOrUsername: loginEmailOrUser,
          password: loginPassword
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Authentication failed.");
      onAuthSuccess(data.user);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Step controls for form sequence validation
  const validateStep = () => {
    setErrorMessage(null);
    if (formStep === 1) {
      if (!fullName.trim() || !dob || !gender || !mobile || !email) {
        setErrorMessage("Please complete all required Personal details.");
        return false;
      }
      if (!email.includes("@")) {
        setErrorMessage("Please enter a valid email address.");
        return false;
      }
    } else if (formStep === 2) {
      if (!country.trim() || !state.trim() || !city.trim() || !pincode.trim() || !address.trim()) {
        setErrorMessage("Address metrics are required to provide clinical logistics.");
        return false;
      }
    } else if (formStep === 3) {
      if (!emergencyName.trim() || !emergencyPhone.trim()) {
        setErrorMessage("Emergency contacts details are mandatory.");
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (validateStep()) {
      setFormStep(prev => prev + 1);
    }
  };

  const handlePrevStep = () => {
    setErrorMessage(null);
    setFormStep(prev => prev - 1);
  };

  // Registration Submit handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    
    // Final audits
    if (!username.trim() || !password || !confirmPassword) {
      setErrorMessage("Username, Password, and Confirmation are requested.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Confirm password does not match original password.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Password must satisfy minimum strength requirements (at least 8 characters).");
      return;
    }
    if (!captchaAnswer || parseInt(captchaAnswer) !== numA + numB) {
      setErrorMessage("Anti-spam verification math reply is incorrect.");
      return;
    }
    if (!termsAccepted || !privacyAccepted) {
      setErrorMessage("Please accept the Terms of Service and Privacy Policy to register with Clinical Center.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        fullName, dob, gender, bloodGroup, mobile, email,
        country, state, city, pincode, address,
        allergies, conditions, emergencyName, emergencyPhone,
        username, password
      };

      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit patient record.");

      // Transit to email verification screen
      setVerifyEmail(email);
      setDebugOtp(data.otpDebug);
      setScreen('verify');
      setInfoMessage("Registration recorded! An OTP has been simulated below for authentication.");
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Validate dispatch OTP
  const handleVerifyOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode) {
      setErrorMessage("Please input the 6-digit verification code.");
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifyEmail, otp: otpCode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "OTP confirmation failed.");
      
      setInfoMessage(data.message);
      // Wait slightly then proceed
      setTimeout(() => {
        onAuthSuccess(data.user);
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Forgot password request code 
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyEmail) {
      setErrorMessage("Registered email is required to dispatch reset code.");
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: verifyEmail })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Email not identified.");

      setDebugOtp(data.otpDebug);
      setScreen('reset');
      setInfoMessage("Verification OTP generated. Complete the secure change below.");
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset core password logic
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || !password || !confirmPassword) {
      setErrorMessage("Please fill all details to reset your secure key.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Confirm credentials must match perfectly.");
      return;
    }
    if (password.length < 8) {
      setErrorMessage("Password MUST contain at least 8 characters.");
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: verifyEmail,
          otp: otpCode,
          newPassword: password
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Password change reset was declined.");
      
      setInfoMessage(data.message + " Redirecting you to login...");
      setTimeout(() => {
        setScreen('login');
        setInfoMessage(null);
        setPassword("");
        setConfirmPassword("");
        setOtpCode("");
      }, 2000);
    } catch (err: any) {
      setErrorMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto my-6 lg:my-12">
      {/* Visual Identity Logo Banner */}
      <div className="text-center mb-8 space-y-2">
        <TitanLogo className="mx-auto w-16 h-16 shadow-2xl shadow-black/25 hover:scale-105 transition-transform duration-200" />
        <h2 className="font-display font-extrabold text-slate-905 text-2xl tracking-tight text-slate-900 dark:text-white">
          Titan HealthConnect
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
          Hospital-Grade Secure Authorization & Clinical Directory Portal
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl overflow-hidden transition-all">
        {/* Top Header Selector tabs */}
        <div className="border-b border-slate-100 dark:border-slate-800 flex bg-slate-50 dark:bg-slate-900/60 p-2">
          <button 
            type="button"
            onClick={() => {
              setScreen('login');
              setErrorMessage(null);
              setInfoMessage(null);
            }} 
            className={`flex-1 py-3 text-xs uppercase tracking-wider font-bold rounded-xl transition-all ${
              screen === 'login' 
                ? 'bg-white dark:bg-slate-850 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-805 hover:bg-slate-100/30 dark:hover:bg-slate-850/40'
            }`}
          >
            Patient Login
          </button>
          <button 
            type="button"
            onClick={() => {
              setScreen('register');
              setFormStep(1);
              setErrorMessage(null);
              setInfoMessage(null);
            }} 
            className={`flex-1 py-3 text-xs uppercase tracking-wider font-bold rounded-xl transition-all ${
              screen === 'register' 
                ? 'bg-white dark:bg-slate-850 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-slate-500 hover:text-slate-805 hover:bg-slate-100/30 dark:hover:bg-slate-850/40'
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Messages block */}
          {errorMessage && (
            <div className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 p-4 rounded-2xl flex items-start gap-3 border border-rose-100 dark:border-rose-900/40 text-xs shadow-sm">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold flex items-center gap-1">Security Alert</p>
                <p className="mt-0.5 leading-normal">{errorMessage}</p>
              </div>
            </div>
          )}

          {infoMessage && (
            <div className="bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 p-4 rounded-2xl flex items-start gap-3 border border-emerald-100 dark:border-emerald-900/40 text-xs shadow-sm">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <div>
                <p className="font-bold">Information verified</p>
                <p className="mt-0.5 leading-normal">{infoMessage}</p>
              </div>
            </div>
          )}

          {/* SCREEN 1: LOGIN */}
          {screen === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="space-y-4">
                <div className="relative">
                  <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1.5">Email Address or Username</label>
                  <div className="relative">
                    <User className="absolute left-4.5 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="e.g. mayalin or maya.lin@titanhealthconnect.com"
                      value={loginEmailOrUser}
                      onChange={e => setLoginEmailOrUser(e.target.value)}
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 dark:bg-slate-950 rounded-2xl text-xs border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1.5 focus:ring-blue-500 transition-all font-sans font-semibold placeholder:font-normal placeholder:text-slate-400" 
                    />
                  </div>
                </div>

                <div className="relative">
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider">Password</label>
                    <button 
                      type="button" 
                      onClick={() => setScreen('forgot')}
                      className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Forgot Credentials?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4.5 top-3 w-4 h-4 text-slate-400" />
                    <input 
                      type={showPass ? "text" : "password"} 
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={e => setLoginPassword(e.target.value)}
                      className="w-full pl-11 pr-11 py-3 bg-slate-50 dark:bg-slate-950 rounded-2xl text-xs border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1.5 focus:ring-blue-500 transition-all font-sans placeholder:text-slate-400" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-4.5 top-3 text-slate-400 hover:text-slate-600"
                    >
                      {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Remember Me Toggle */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-500 dark:text-slate-400 font-medium">
                  <input 
                    type="checkbox" 
                    checked={rememberMe} 
                    onChange={e => setRememberMe(e.target.checked)}
                    className="rounded text-blue-600 focus:ring-blue-550 h-4 w-4 bg-slate-50 border-slate-200" 
                  />
                  Don't ask again on this device (Remember me)
                </label>
              </div>

              {/* Login Button */}
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-2xl text-xs uppercase tracking-wider shadow-lg shadow-blue-500/10 cursor-pointer transition-all flex items-center justify-center gap-2.5"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                    Granting Access Securely...
                  </>
                ) : (
                  <>
                    <Fingerprint className="w-4.5 h-4.5" />
                    Secure Sign In to Portal
                  </>
                )}
              </button>

              {/* Social Login Button simulation */}
              <div className="text-center space-y-3 pt-2">
                <div className="flex items-center justify-center gap-2">
                  <span className="h-0.5 w-10 bg-slate-100 dark:bg-slate-800" />
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Or Sign In with Enterprise</span>
                  <span className="h-0.5 w-10 bg-slate-100 dark:bg-slate-800" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowOAuthModal('google')}
                    className="py-2.5 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="w-4 h-4 bg-red-100 text-red-600 rounded flex items-center justify-center text-[10px] font-bold">G</span>
                    Google Workspace
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setShowOAuthModal('microsoft')}
                    className="py-2.5 px-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span className="w-4 h-4 bg-blue-100 text-blue-600 rounded flex items-center justify-center text-[10px] font-bold">M</span>
                    Microsoft 365
                  </button>
                </div>

                {/* Quick Dev sandbox login helper */}
                <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 rounded-2xl border border-blue-100/50 dark:border-blue-900/30 text-left">
                  <div className="flex items-start gap-2 text-xs">
                    <Info className="w-4.5 h-4.5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-blue-800 dark:text-blue-300">Sandbox Preview Helper</p>
                      <p className="text-[11px] text-blue-600/90 dark:text-blue-400 mt-0.5 leading-normal">
                        To navigate instantly without full email signup, please use the <strong>Enterprise Google/Microsoft</strong> button or input credentials: <code className="bg-white/80 dark:bg-slate-950 px-1 py-0.2 rounded font-bold border">mayalin</code> / <code className="bg-white/80 dark:bg-slate-950 px-1 py-0.2 rounded font-bold border">Password@123</code>.
                      </p>
                    </div>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={onBackToGuest}
                  className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1 mx-auto mt-2 font-medium"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  View Guest Landing Page
                </button>
              </div>
            </form>
          )}

          {/* SCREEN 2: REGISTRATION LAYOUT SEQUENCE */}
          {screen === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              {/* Register progress step visual tracker */}
              <div className="mb-2">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  <span>Step {formStep} of 4:</span>
                  <span className="text-blue-600">
                    {formStep === 1 && "Personal Information"}
                    {formStep === 2 && "Address Information"}
                    {formStep === 3 && "Clinical Health Information"}
                    {formStep === 4 && "Account Settings"}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  <div className={`h-1.5 rounded-full transition-all ${formStep >= 1 ? 'bg-blue-600' : 'bg-slate-100'}`} />
                  <div className={`h-1.5 rounded-full transition-all ${formStep >= 2 ? 'bg-blue-600' : 'bg-slate-100'}`} />
                  <div className={`h-1.5 rounded-full transition-all ${formStep >= 3 ? 'bg-blue-600' : 'bg-slate-100'}`} />
                  <div className={`h-1.5 rounded-full transition-all ${formStep >= 4 ? 'bg-blue-600' : 'bg-slate-100'}`} />
                </div>
              </div>

              {/* STEP 1: Personal info */}
              {formStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1">Full Name *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Maya Lin"
                        required
                        value={fullName}
                        onChange={e => setFullName(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-1.5 focus:ring-blue-500 font-medium" 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1">Date of Birth *</label>
                      <input 
                        type="date" 
                        required
                        value={dob}
                        onChange={e => setDob(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-1.5 focus:ring-blue-500 font-medium font-mono" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1">Gender *</label>
                      <select 
                        value={gender}
                        onChange={e => setGender(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-1.5 focus:ring-blue-500 font-medium"
                      >
                        <option value="Female">Female</option>
                        <option value="Male">Male</option>
                        <option value="Non-Binary">Non-Binary</option>
                        <option value="Prefer Not To State">Prefer Not To State</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1">Blood Group</label>
                      <select 
                        value={bloodGroup}
                        onChange={e => setBloodGroup(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-1.5 focus:ring-blue-500 font-medium font-mono"
                      >
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1">Mobile Number *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input 
                          type="tel" 
                          placeholder="e.g. +91 99887 76655"
                          required
                          value={mobile}
                          onChange={e => setMobile(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-1.5 focus:ring-blue-500 font-mono font-medium" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1">Email Address *</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input 
                          type="email" 
                          placeholder="e.g. maya@example.com"
                          required
                          value={email}
                          onChange={e => setEmail(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-1.5 focus:ring-blue-500 font-medium" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Optional profile photo upload mockup */}
                  <div>
                    <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1">Profile Photo (Optional)</label>
                    <div className="border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors">
                      <p className="text-slate-400 text-xs">Drag and drop profile asset image, or click to browse</p>
                      <span className="text-[10px] text-slate-300 font-mono">JPG, PNG up to 2MB</span>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    onClick={handleNextStep}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wide transition-all flex items-center justify-center gap-1 mt-2 cursor-pointer"
                  >
                    Proceed to Address Info
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STEP 2: Address Info */}
              {formStep === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1">Country *</label>
                      <input 
                        type="text" 
                        value={country} 
                        onChange={e => setCountry(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-1.5 focus:ring-blue-500 font-medium" 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1">State *</label>
                      <input 
                        type="text" 
                        value={state} 
                        onChange={e => setState(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-1.5 focus:ring-blue-500 font-medium" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1">City *</label>
                      <input 
                        type="text" 
                        value={city} 
                        onChange={e => setCity(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-1.5 focus:ring-blue-500 font-medium" 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1">Pincode *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. 560066"
                        value={pincode} 
                        onChange={e => setPincode(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-1.5 focus:ring-blue-500 font-mono font-medium" 
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1">Full Address *</label>
                    <textarea 
                      placeholder="Street number, building suite, landmark details..."
                      rows={2}
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full p-4 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-1.5 focus:ring-blue-500 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button 
                      type="button" 
                      onClick={handlePrevStep}
                      className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-705 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold rounded-xl text-xs uppercase tracking-wide cursor-pointer text-center"
                    >
                      Back
                    </button>
                    <button 
                      type="button" 
                      onClick={handleNextStep}
                      className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wide transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Proceed
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Medical info */}
              {formStep === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1">Allergies (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Penicillin, Pollen, Nuts, Eggs"
                        value={allergies}
                        onChange={e => setAllergies(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-1.5 focus:ring-blue-500 font-medium animate-pulse-slow" 
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1">Existing Medical Conditions</label>
                      <input 
                        type="text" 
                        placeholder="e.g. Mild asthma, High blood pressure"
                        value={conditions}
                        onChange={e => setConditions(e.target.value)}
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-1.5 focus:ring-blue-500 font-medium" 
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-850 space-y-3">
                    <h4 className="font-display font-black text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-widest flex items-center gap-1">
                      <Activity className="w-3.5 h-3.5" />
                      Emergency Point of Contact (Mandatory)
                    </h4>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider mb-1">Contact Full Name *</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Arthur Lin"
                          required
                          value={emergencyName}
                          onChange={e => setEmergencyName(e.target.value)}
                          className="w-full px-4 py-2 bg-white dark:bg-slate-900 rounded-xl text-xs border border-slate-250 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none" 
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-455 dark:text-slate-400 uppercase tracking-wider mb-1">Emergency Phone *</label>
                        <input 
                          type="text" 
                          placeholder="e.g. +91 99001 12233"
                          required
                          value={emergencyPhone}
                          onChange={e => setEmergencyPhone(e.target.value)}
                          className="w-full px-4 py-2 bg-white dark:bg-slate-900 rounded-xl text-xs border border-slate-250 dark:border-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1.5 focus:ring-blue-500 font-mono" 
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button 
                      type="button" 
                      onClick={handlePrevStep}
                      className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-705 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold rounded-xl text-xs uppercase tracking-wide cursor-pointer text-center"
                    >
                      Back
                    </button>
                    <button 
                      type="button" 
                      onClick={handleNextStep}
                      className="py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase tracking-wide transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      Proceed
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Account Password & CAPTCHA with submit */}
              {formStep === 4 && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1">Desired Username *</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="e.g. mayalin"
                        required
                        value={username}
                        onChange={e => setUsername(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-1.5 focus:ring-blue-500 font-bold font-sans" 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1">Account Password *</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          required
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-100 focus:outline-none focus:ring-1.5 focus:ring-blue-500" 
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1">Confirm Password *</label>
                      <div className="relative">
                        <Key className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                        <input 
                          type="password" 
                          placeholder="••••••••"
                          required
                          value={confirmPassword}
                          onChange={e => setConfirmPassword(e.target.value)}
                          className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs border border-slate-200 dark:border-slate-800 text-slate-850 dark:text-slate-100 focus:outline-none" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Password Strength Indicator details */}
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850 flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Password Health Score:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className={`h-full ${passStrength.color}`} style={{ width: `${(passStrength.score / 4) * 100}%` }} />
                      </div>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{passStrength.label}</span>
                    </div>
                  </div>

                  {/* Anti-Spam CAPTCHA Simulation widget */}
                  <div className="bg-blue-50/40 dark:bg-blue-950/20 p-3.5 rounded-2xl border border-blue-100/50 dark:border-blue-900/30 text-xs">
                    <p className="font-bold text-blue-800 dark:text-blue-300 mb-1.5 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" />
                      Patient Anti-Spam CAPTCHA Verification
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 border border-slate-250 py-1.5 px-3.5 rounded-lg font-mono font-bold select-none text-center">
                        Solve: {numA} + {numB} ?
                      </div>
                      <input 
                        type="text" 
                        required
                        placeholder="Type answer..."
                        value={captchaAnswer}
                        onChange={e => setCaptchaAnswer(e.target.value)}
                        className="w-24 px-3 py-1.5 bg-white dark:bg-slate-950 rounded-lg text-xs text-center border focus:outline-none focus:ring-1 text-slate-900 dark:text-white" 
                      />
                    </div>
                  </div>

                  {/* Policies Agreement checkboxes */}
                  <div className="space-y-2 text-xs pt-1">
                    <label className="flex items-start gap-2.5 cursor-pointer text-slate-500 dark:text-slate-400">
                      <input 
                        type="checkbox" 
                        required
                        checked={termsAccepted} 
                        onChange={e => setTermsAccepted(e.target.checked)}
                        className="rounded text-blue-600 mt-0.5 focus:ring-blue-500 h-4 w-4" 
                      />
                      <span>I accept the Titan HealthConnect <a href="#terms" className="text-blue-600 underline">Terms of Clinical Operations</a> and acknowledge automated paramedic protocols.</span>
                    </label>
                    <label className="flex items-start gap-2.5 cursor-pointer text-slate-500 dark:text-slate-400">
                      <input 
                        type="checkbox" 
                        required
                        checked={privacyAccepted} 
                        onChange={e => setPrivacyAccepted(e.target.checked)}
                        className="rounded text-blue-600 mt-0.5 focus:ring-blue-500 h-4 w-4" 
                      />
                      <span>I authorize secure encryption and storage of my diagnostic, physical, and historical vital records under HIPAA & Local laws.</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button 
                      type="button" 
                      onClick={handlePrevStep}
                      className="py-2.5 px-4 bg-slate-100 dark:bg-slate-800 text-slate-705 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold rounded-xl text-xs uppercase tracking-wide cursor-pointer text-center"
                    >
                      Back
                    </button>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold rounded-xl text-xs uppercase tracking-wide transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      {loading ? "Registering..." : "Finalize & Sign Up"}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}

          {/* SCREEN 3: RESET PASSWORD DETAILS */}
          {screen === 'reset' && (
            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-2xl text-xs border border-blue-100 dark:border-blue-900/30">
                <p className="font-bold text-blue-800 dark:text-blue-300">Email Dispatch Simulated Successfully</p>
                <p className="text-[11px] text-blue-605 dark:text-blue-400 mt-1 leading-normal">
                  To authenticate safely, your password reset code is: <code className="bg-white dark:bg-slate-900 px-1.5 py-0.5 font-bold rounded border font-mono tracking-widest text-[#df2828] text-xs">{debugOtp}</code>. Use this key to override your password below.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1">Security Code (OTP)</label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter 6-digit simulated OTP"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs text-center font-mono tracking-widest font-bold border text-slate-900 dark:text-white" 
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1">New Secure Password</label>
                <input 
                  type="password" 
                  required
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs border text-slate-900 dark:text-white" 
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1">Confirm New Password</label>
                <input 
                  type="password" 
                  required
                  placeholder="Min 8 characters"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs border text-slate-900 dark:text-white" 
                />
              </div>

              <div className="flex justify-between gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setScreen('login')}
                  className="py-2.5 px-4 bg-slate-100 text-slate-600 font-bold rounded-xl text-xs uppercase cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-grow py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase cursor-pointer text-center"
                >
                  Save Credentials
                </button>
              </div>
            </form>
          )}

          {/* SCREEN 4: FORGOT PASSWORD */}
          {screen === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <div className="space-y-2">
                <h3 className="font-display font-bold text-slate-805 dark:text-white text-sm">Clinical Password Recovery</h3>
                <p className="text-xs text-slate-450 dark:text-slate-400 leading-normal">
                  Provide your verified Patient email address. We will simulate dispatching an OTP code to authorize password resetting.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-450 uppercase tracking-wider mb-1">Registered Patient Email</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-2.5 w-4.5 h-4.5 text-slate-400" />
                  <input 
                    type="email" 
                    required
                    placeholder="maya.lin@titanhealthconnect.com"
                    value={verifyEmail}
                    onChange={e => setVerifyEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 rounded-xl text-xs border text-slate-900 dark:text-white" 
                  />
                </div>
              </div>

              <div className="flex justify-between gap-3 pt-2">
                <button 
                  type="button" 
                  onClick={() => setScreen('login')}
                  className="py-2.5 px-4 bg-slate-100 text-slate-605 font-bold rounded-xl text-xs uppercase cursor-pointer"
                >
                  Back
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-grow py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs uppercase cursor-pointer text-center"
                >
                  Dispatch Security Reset Key
                </button>
              </div>
            </form>
          )}

          {/* SCREEN 5: OTP VERIFICATION EMAIL OTP */}
          {screen === 'verify' && (
            <form onSubmit={handleVerifyOtpSubmit} className="space-y-5">
              <div className="bg-emerald-50 dark:bg-emerald-950/20 p-4 rounded-xl text-xs border border-emerald-100 dark:border-emerald-900/30">
                <p className="font-bold text-emerald-800 dark:text-emerald-300">Action Required: Verify Email Address</p>
                <p className="text-[11px] text-emerald-600/90 dark:text-emerald-400 mt-1 leading-normal">
                  We have simulated dispatching a 6-digit confirmation code. Enter this debug code to finish registration: <strong className="font-mono bg-white dark:bg-slate-900 py-0.5 px-2 border rounded text-emerald-700">{debugOtp}</strong>.
                </p>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-450 dark:text-slate-400 uppercase tracking-wider mb-1.5 text-center">Simulated OTP Code</label>
                <input 
                  type="text" 
                  required
                  placeholder="Enter 6-digit OTP code"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 rounded-2xl text-base text-center font-bold font-mono tracking-widest border text-slate-900 dark:text-white" 
                />
              </div>

              <button 
                type="submit" 
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl text-xs uppercase cursor-pointer text-center tracking-wide"
              >
                Confirm Verification OTP
              </button>
            </form>
          )}

        </div>
      </div>

      {/* OAuth Mock Multi-Account Selector Modal */}
      {showOAuthModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-fade-in text-slate-800 dark:text-slate-100">
            {/* Header */}
            <div className="p-6 border-b border-slate-100 dark:border-slate-800 text-center space-y-2">
              <div className="mx-auto w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800">
                {showOAuthModal === 'google' ? (
                  <span className="text-red-500 font-extrabold font-sans">G</span>
                ) : (
                  <span className="text-blue-500 font-extrabold font-sans">M</span>
                )}
              </div>
              <h3 className="font-display font-semibold text-base text-slate-900 dark:text-white">
                Sign in with {showOAuthModal === 'google' ? 'Google Account' : 'Microsoft Account'}
              </h3>
              <p className="text-[11px] text-slate-400">
                to continue to <span className="font-semibold text-blue-600 dark:text-blue-400">Titan HealthConnect Directory</span>
              </p>
            </div>

            {/* List of accounts */}
            <div className="p-4 space-y-2 max-h-72 overflow-y-auto">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-1">
                Select a registered Titan Student identity:
              </p>

              {/* Maya Lin */}
              <button
                type="button"
                onClick={() => handleOAuthLogin("maya.lin@titanhealthconnect.com", showOAuthModal === 'google' ? 'Google' : 'Microsoft')}
                className="w-full text-left p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-850 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-9 h-9 bg-pink-100 dark:bg-pink-950/30 text-pink-600 dark:text-pink-400 rounded-full flex items-center justify-center font-bold text-xs shrink-0 font-display">
                  ML
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-850 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">Maya Lin</p>
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded font-mono text-slate-500">S10943</span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">maya.lin@titanhealthconnect.com</p>
                </div>
              </button>

              {/* James Carter */}
              <button
                type="button"
                onClick={() => handleOAuthLogin("james.carter@titanhealthconnect.com", showOAuthModal === 'google' ? 'Google' : 'Microsoft')}
                className="w-full text-left p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-850 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-9 h-9 bg-blue-100 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center font-bold text-xs shrink-0 font-display">
                  JC
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-850 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">James Carter</p>
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded font-mono text-slate-500">S11202</span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">james.carter@titanhealthconnect.com</p>
                </div>
              </button>

              {/* Sophia Esparza */}
              <button
                type="button"
                onClick={() => handleOAuthLogin("sophia.esparza@titanhealthconnect.com", showOAuthModal === 'google' ? 'Google' : 'Microsoft')}
                className="w-full text-left p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-850 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 transition-all flex items-center gap-3 cursor-pointer group"
              >
                <div className="w-9 h-9 bg-purple-100 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center font-bold text-xs shrink-0 font-display">
                  SE
                </div>
                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-slate-850 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">Sophia Esparza</p>
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.2 rounded font-mono text-slate-500">S10556</span>
                  </div>
                  <p className="text-[10.5px] text-slate-500 dark:text-slate-400">sophia.esparza@titanhealthconnect.com</p>
                </div>
              </button>
            </div>

            {/* Custom email option block */}
            <div className="p-5 bg-slate-50 dark:bg-slate-950 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
                  Or enter another recognized student email:
                </label>
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (customOAuthEmail.trim()) {
                      handleOAuthLogin(customOAuthEmail.trim(), showOAuthModal === 'google' ? 'Google' : 'Microsoft');
                    }
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="email"
                    required
                    placeholder="student@titanhealthconnect.com"
                    value={customOAuthEmail}
                    onChange={(e) => setCustomOAuthEmail(e.target.value)}
                    className="flex-grow px-3 py-1.5 bg-white dark:bg-slate-900 rounded-xl text-xs border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-1 text-slate-800 dark:text-slate-100"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold font-sans transition-all"
                  >
                    Continue
                  </button>
                </form>
              </div>

              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setShowOAuthModal(null)}
                  className="text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
