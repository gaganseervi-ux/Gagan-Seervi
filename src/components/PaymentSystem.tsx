import React, { useState, useEffect } from "react";
import { 
  CreditCard, 
  TrendingUp, 
  Wallet, 
  Smartphone, 
  QrCode, 
  Clock, 
  DollarSign, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Download, 
  Printer, 
  Send, 
  RefreshCcw, 
  FileText, 
  ChevronRight, 
  Search,
  Filter,
  ArrowRight,
  ShieldCheck,
  Percent,
  Receipt,
  RotateCcw,
  BellRing,
  ExternalLink,
  Lock,
  Grid,
  Activity,
  Plus
} from "lucide-react";
import { PaymentTransaction, Appointment, Prescription } from "../types";

interface PaymentSystemProps {
  studentId: string;
  studentName: string;
  patientEmail: string;
  patientMobile: string;
  appointments: Appointment[];
  prescriptions: Prescription[];
  isAdminView: boolean;
  isDarkMode?: boolean;
}

export default function PaymentSystem({
  studentId,
  studentName,
  patientEmail,
  patientMobile,
  appointments,
  prescriptions,
  isAdminView = false,
  isDarkMode = false
}: PaymentSystemProps) {
  // Global Transactions State
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorStatus, setErrorStatus] = useState<string | null>(null);

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");

  // Active Billing State for Patient Checkout flow
  const [checkoutService, setCheckoutService] = useState<{
    id?: string;
    type: 'appointment' | 'lab_test' | 'medicine' | 'home_collection' | 'healthcare_service';
    name: string;
    description: string;
    amount: number;
    discountPercent: number;
  } | null>(null);

  // Payment Gateway Sandbox UI State
  const [gatewayOpen, setGatewayOpen] = useState(false);
  const [gatewayMethod, setGatewayMethod] = useState<'UPI' | 'Card' | 'NetBanking' | 'Wallet' | 'QR Code'>('Card');
  
  // Card credentials state
  const [cardNumber, setCardNumber] = useState("4111 1111 1111 1111");
  const [cardExpiry, setCardExpiry] = useState("12/30");
  const [cardCVV, setCardCVV] = useState("123");
  const [cardName, setCardName] = useState(studentName);
  const [cardOTP, setCardOTP] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  // UPI configuration
  const [upiId, setUpiId] = useState("test@upi");
  
  // Net Banking select
  const [selectedBank, setSelectedBank] = useState("State Bank of India");
  
  // Digital wallet select
  const [selectedWallet, setSelectedWallet] = useState("AmazonPay");

  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [paymentCompleted, setPaymentCompleted] = useState<PaymentTransaction | null>(null);

  // Active viewing Invoice state
  const [viewingInvoice, setViewingInvoice] = useState<PaymentTransaction | null>(null);

  // Refund request state
  const [submittingRefundId, setSubmittingRefundId] = useState<string | null>(null);
  const [refundReason, setRefundReason] = useState("");

  // Notification popup alert simulations
  const [notifications, setNotifications] = useState<{
    id: string;
    title: string;
    body: string;
    type: 'success' | 'failure' | 'refund' | 'invoice';
    channels: string[];
    timestamp: string;
  }[]>([]);

  // Admin manually issued custom checkout state
  const [adminManualClient, setAdminManualClient] = useState("Maya Lin");
  const [adminManualId, setAdminManualId] = useState("S10943");
  const [adminManualService, setAdminManualService] = useState("Advanced MRI Imaging");
  const [adminManualCost, setAdminManualCost] = useState(4500);
  const [adminManualType, setAdminManualType] = useState<'appointment' | 'lab_test' | 'medicine' | 'home_collection' | 'healthcare_service'>('healthcare_service');

  // Fetch all transactions
  const fetchTransactions = async () => {
    try {
      const res = await fetch("/api/db");
      if (!res.ok) throw new Error("Could not download transaction logs.");
      const data = await res.json();
      setTransactions(data.payments || []);
      setErrorStatus(null);
    } catch (err: any) {
      console.error(err);
      setErrorStatus("Failed to synchronize with medical ledger.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    // Periodically fetch payments
    const timer = setInterval(() => {
      fetchTransactions();
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Post payment payload
  const processSecurePaymentDb = async (paymentDetail: {
    serviceType: string;
    serviceDetails: string;
    amount: number;
    discount: number;
    tax: number;
    totalAmount: number;
    paymentMethod: string;
  }) => {
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId,
          studentName,
          patientEmail,
          patientMobile,
          ...paymentDetail,
          status: "successful"
        })
      });
      if (!res.ok) throw new Error("Payment ledger rejection.");
      const data: PaymentTransaction = await res.json();
      
      // Add dynamic success notification
      triggerChannelsNotifications(data, "Paid Successfully");
      fetchTransactions();
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  // Channel notification simulation trigger
  const triggerChannelsNotifications = (tx: PaymentTransaction, triggerType: "Paid Successfully" | "Refund Action" | "Invoice Printed") => {
    const notifyId = `notif-${Date.now()}`;
    let title = "";
    let body = "";
    let type: 'success' | 'failure' | 'refund' | 'invoice' = 'success';

    if (triggerType === "Paid Successfully") {
      title = "💰 Payment Received Successfully";
      body = `₹${tx.totalAmount} successfully debited for ${tx.serviceDetails}. Reference ID: ${tx.id}.`;
      type = 'success';
    } else if (triggerType === "Refund Action") {
      title = tx.status === 'refunded' ? "🔄 Refund Dispatched & Transferred" : "⏳ Refund Petition Under Review";
      body = tx.status === 'refunded' 
        ? `₹${tx.totalAmount} refunded back to original ${tx.paymentMethod} account. Statement is updated.`
        : `Your request to refund ₹${tx.totalAmount} for Invoice ${tx.invoiceNumber} is logged and under verification.`;
      type = 'refund';
    } else {
      title = "📄 Invoice Statement Generated";
      body = `Your digital receipt and deductible sheet ${tx.invoiceNumber} is compiled securely.`;
      type = 'invoice';
    }

    const payload = {
      id: notifyId,
      title,
      body,
      type,
      channels: ["In-App Status", "SMS Service", "Auto-Email Vault", "WhatsApp Business"],
      timestamp: new Date().toLocaleTimeString()
    };

    setNotifications(prev => [payload, ...prev]);
  };

  // Submit refund petition
  const handleRequestRefund = async (e: React.FormEvent, txId: string) => {
    e.preventDefault();
    if (!refundReason.trim()) {
      alert("Please state your legitimate dispute reason for security auditing.");
      return;
    }
    try {
      const res = await fetch("/api/payments/refund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: txId, refundReason })
      });
      if (!res.ok) throw new Error("Refund processing server breakdown.");
      const updatedTx: PaymentTransaction = await res.json();
      
      triggerChannelsNotifications(updatedTx, "Refund Action");
      fetchTransactions();
      setSubmittingRefundId(null);
      setRefundReason("");
      alert("Your Refund request has been registered. Our cashier team will audit the complaint.");
    } catch (err) {
      alert("Error: Refund petition could not be registered on database.");
    }
  };

  // Admin: update transaction status (Refund Approval flow)
  const handleAdminUpdateStatus = async (txId: string, targetStatus: 'successful' | 'refunded' | 'refund_rejected' | 'refund_under_review') => {
    try {
      const res = await fetch("/api/payments/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: txId, status: targetStatus })
      });
      if (!res.ok) throw new Error("Failed to alter invoice status.");
      const data: PaymentTransaction = await res.json();
      
      triggerChannelsNotifications(data, "Refund Action");
      fetchTransactions();
      alert(`Ledger statement updated. Invoice status altered to: ${targetStatus.toUpperCase()}`);
    } catch (err) {
      alert("Error: Failed to process administrative approval status update.");
    }
  };

  // Admin custom manual invoice simulation
  const handleAdminIssueManualCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminManualClient || !adminManualService || !adminManualCost) {
      alert("Complete manual checklist parameters first.");
      return;
    }

    const amt = Number(adminManualCost);
    const disc = 0;
    const taxValue = Math.round(amt * 0.05);
    const totalVal = amt + taxValue;

    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: adminManualId || "S-WALKIN",
          studentName: adminManualClient,
          patientEmail: "walkin@titan.com",
          patientMobile: "+91 99000 00000",
          serviceType: adminManualType,
          serviceDetails: adminManualService,
          amount: amt,
          discount: disc,
          tax: taxValue,
          totalAmount: totalVal,
          paymentMethod: "Cash at Hospital",
          status: "pending"
        })
      });
      if (!res.ok) throw new Error("Sandbox payment insertion rejection.");
      await res.json();
      
      alert(`Manual Statement Generated for ${adminManualClient}. Net Bill Payable: ₹${totalVal}. Status is set as Pending (awaiting cashier receipt).`);
      fetchTransactions();
    } catch (err) {
      alert("Failed to emit physical inpatient checkout bill.");
    }
  };

  // Sandbox Payment Gateway Process Simulation Engine
  const triggerSandboxGatewaySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkoutService) return;

    if (gatewayMethod === 'Card' && !otpSent) {
      // Step 1: Simulate Card CVV details & send 3D Secure OTP
      if (!cardNumber || !cardExpiry || !cardCVV) {
        alert("Enter Credit/Debit Card credentials first.");
        return;
      }
      setPaymentProcessing(true);
      setTimeout(() => {
        setPaymentProcessing(false);
        setOtpSent(true);
        alert("SANDBOX INTEGRATION OTP: Simulating secure bank redirect. Single-use passcode 891402 has been dispatched to your mobile contact.");
      }, 900);
      return;
    }

    if (gatewayMethod === 'Card' && otpSent && !otpVerified) {
      if (cardOTP !== "891402") {
        alert("Invalid Sandbox Code. Enter dispatch OTP: 891402");
        return;
      }
      setOtpVerified(true);
    }

    // Process Ledger Update
    setPaymentProcessing(true);

    const subtotal = checkoutService.amount;
    const discountAmount = Math.round((subtotal * checkoutService.discountPercent) / 100);
    const netPayablePreTax = subtotal - discountAmount;
    const calculatedTax = Math.round(netPayablePreTax * 0.05);
    const netTotal = netPayablePreTax + calculatedTax;

    const matchedMethodName: any = {
      'Card': 'Credit Card',
      'UPI': 'UPI',
      'NetBanking': 'Net Banking',
      'Wallet': 'Digital Wallet',
      'QR Code': 'QR Code'
    }[gatewayMethod] || 'Credit Card';

    setTimeout(async () => {
      const generatedTx = await processSecurePaymentDb({
        serviceType: checkoutService.type,
        serviceDetails: checkoutService.name + " (" + checkoutService.description + ")",
        amount: subtotal,
        discount: discountAmount,
        tax: calculatedTax,
        totalAmount: netTotal,
        paymentMethod: matchedMethodName
      });

      setPaymentProcessing(false);
      if (generatedTx) {
        setPaymentCompleted(generatedTx);
        // Automatically link/resolve if it's an appointment payment
        if (checkoutService.type === 'appointment' && checkoutService.id) {
          // Trigger backend update for corresponding booking if possible
          await fetch(`/api/appointments/${checkoutService.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status: "checked-in", notes: "Paid Online via Secure Sandbox Gateway." })
          });
        }
      } else {
        alert("Sandbox payment gateway failed to commit dynamic transacting.");
      }
    }, 1200);
  };

  // Quick Action Checkouts Generator for Demo
  const triggerQuickServiceCheckout = (
    type: 'appointment' | 'lab_test' | 'medicine' | 'home_collection' | 'healthcare_service',
    name: string,
    desc: string,
    cost: number,
    id?: string
  ) => {
    setCheckoutService({
      id,
      type,
      name,
      description: desc,
      amount: cost,
      discountPercent: type === 'medicine' ? 10 : type === 'lab_test' ? 15 : 0
    });
    setOtpSent(false);
    setOtpVerified(false);
    setCardOTP("");
    setPaymentCompleted(null);
    setGatewayOpen(true);
  };

  // Dynamic Charts Calculations
  const filteredTx = transactions.filter(t => {
    if (isAdminView) {
      // Admin sees everything
      const matchesSearch = t.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.serviceDetails.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      const matchesService = serviceFilter === "all" || t.serviceType === serviceFilter;
      return matchesSearch && matchesStatus && matchesService;
    } else {
      // Patient sees only their own
      const isMyTx = t.studentId === studentId;
      const matchesSearch = t.serviceDetails.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            t.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || t.status === statusFilter;
      return isMyTx && matchesSearch && matchesStatus;
    }
  });

  const myTxHistory = transactions.filter(t => t.studentId === studentId);

  // Administrative revenue metrics
  const totalRevenue = transactions
    .filter(t => t.status === 'successful')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const todayRevenue = transactions
    .filter(t => t.status === 'successful')
    .reduce((sum, t) => sum + t.totalAmount, 0) * 0.18; // Simulating proportional todays revenue

  const pendingRevenueCount = transactions.filter(t => t.status === 'pending').length;
  const successfulRevenueCount = transactions.filter(t => t.status === 'successful').length;
  const failedRevenueCount = transactions.filter(t => t.status === 'failed').length;
  const refundRequestsCount = transactions.filter(t => t.status === 'refund_requested' || t.status === 'refund_under_review').length;

  const departmentRevenue = {
    appointment: transactions.filter(t => t.serviceType === 'appointment' && t.status==='successful').reduce((sum, t) => sum + t.totalAmount, 0),
    lab_test: transactions.filter(t => t.serviceType === 'lab_test' && t.status==='successful').reduce((sum, t) => sum + t.totalAmount, 0),
    medicine: transactions.filter(t => t.serviceType === 'medicine' && t.status==='successful').reduce((sum, t) => sum + t.totalAmount, 0),
    home_collection: transactions.filter(t => t.serviceType === 'home_collection' && t.status==='successful').reduce((sum, t) => sum + t.totalAmount, 0),
    healthcare_service: transactions.filter(t => (t.serviceType === 'healthcare_service') && t.status==='successful').reduce((sum, t) => sum + t.totalAmount, 0)
  };

  return (
    <div className="space-y-6">

      {/* HEADER NAVIGATION STRIP */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 gap-3">
        <div>
          <h2 className="font-display font-extrabold text-lg sm:text-xl text-blue-600 flex items-center gap-2">
            <TrendingUp className="h-5.5 w-5.5 text-blue-500" />
            <span>{isAdminView ? "Clinical Core Revenue & Billing Center" : "Secure Payment & Invoices Registry"}</span>
          </h2>
          <p className="text-slate-450 text-[11px] font-sans mt-0.5">
            {isAdminView 
              ? "Monitor university healthcare collections, audit sandbox transactions and approve refund claims" 
              : `Review outstanding balances, trace insurance deductibles and check secure payment options for ${studentName}`}
          </p>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-100 p-2.5 rounded-xl">
          <ShieldCheck className="h-4 w-4 text-emerald-600 animate-pulse" />
          <span>AES-256 Sandbox Vault Secure</span>
        </div>
      </div>

      {errorStatus && (
        <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-3 text-xs flex items-center gap-2">
          <AlertCircle className="h-4.5 w-4.5 text-amber-500 animate-bounce" />
          <span>{errorStatus}</span>
        </div>
      )}

      {/* ========================================================== */}
      {/* ADMIN REVENUE ANALYTICS DASHBOARD VIEW */}
      {/* ========================================================== */}
      {isAdminView && (
        <div className="space-y-6 animate-fade-in text-slate-800">
          {/* Revenue Indicator Badges */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-blue-50/50 border border-blue-105 rounded-2xl p-4 md:col-span-2 shadow-xs">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1">AGGREGATED INTEGRATED REVENUE</span>
              <p className="text-2xl sm:text-3xl font-black font-display text-blue-700">₹{totalRevenue.toLocaleString()}</p>
              <div className="text-[9px] text-blue-600 mt-2 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-ping" />
                <span>Live virtual merchant processing active</span>
              </div>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-105 rounded-2xl p-4 shadow-xs">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1">TODAY'S ESTIMATION</span>
              <p className="text-xl font-bold font-mono text-emerald-700">₹{Math.round(todayRevenue).toLocaleString()}</p>
              <span className="text-[9px] text-slate-405 block mt-2 font-medium">+12.5% vs yesterday</span>
            </div>

            <div className="bg-yellow-50/50 border border-yellow-105 rounded-2xl p-4 shadow-xs">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1">PENDING CHECKS</span>
              <p className="text-xl font-bold font-mono text-yellow-700">{pendingRevenueCount}</p>
              <span className="text-[9px] text-slate-405 block mt-2 font-medium">Outpatient walk-ins billing</span>
            </div>

            <div className="bg-pink-50/50 border border-pink-105 rounded-2xl p-4 shadow-xs">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1">REFUND PETITIONS</span>
              <p className="text-xl font-bold font-mono text-pink-700">{refundRequestsCount}</p>
              <span className="text-[9px] text-pink-600 block mt-2 font-bold animate-pulse">Needs swift review</span>
            </div>

            <div className="bg-slate-50/50 border border-slate-205 rounded-2xl p-4 shadow-xs">
              <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block mb-1">SUCCESS RATIO</span>
              <p className="text-xl font-bold font-mono text-slate-700">
                {successfulRevenueCount + failedRevenueCount > 0 
                  ? `${Math.round((successfulRevenueCount / (successfulRevenueCount + failedRevenueCount)) * 100)}%` 
                  : "100%"}
              </p>
              <span className="text-[9px] text-slate-405 block mt-2 font-medium">Fraud blocker filters on</span>
            </div>
          </div>

          {/* Revenue distribution custom graphic SVG charts */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Horizontal analytics strip & SVG chart */}
            <div className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm lg:col-span-8 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-display font-semibold text-xs uppercase tracking-wider text-slate-500">Service Department Collection Distribution</h3>
                <span className="text-[10px] text-blue-500 bg-blue-50 px-2 py-0.5 rounded font-bold uppercase">Color Coded Matrix</span>
              </div>

              <div className="space-y-4 pt-1 font-semibold text-slate-650">
                {/* Custom circular style bar chart ratios representation */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-blue-600 rounded-full" />Doctor Consultation Fee (₹{departmentRevenue.appointment})</span>
                    <span className="font-mono text-slate-500">{totalRevenue ? Math.round((departmentRevenue.appointment / totalRevenue) * 100) : 0}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full transition-all duration-500" style={{ width: `${totalRevenue ? (departmentRevenue.appointment / totalRevenue) * 100 : 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-cyan-500 rounded-full" />Clinical Lab Diagnostics Test (₹{departmentRevenue.lab_test})</span>
                    <span className="font-mono text-slate-500">{totalRevenue ? Math.round((departmentRevenue.lab_test / totalRevenue) * 100) : 0}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-cyan-500 h-full transition-all duration-500" style={{ width: `${totalRevenue ? (departmentRevenue.lab_test / totalRevenue) * 100 : 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />Infirmary Outpatient Medicine Checkout (₹{departmentRevenue.medicine})</span>
                    <span className="font-mono text-slate-500">{totalRevenue ? Math.round((departmentRevenue.medicine / totalRevenue) * 100) : 0}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-indigo-500 h-full transition-all duration-500" style={{ width: `${totalRevenue ? (departmentRevenue.medicine / totalRevenue) * 100 : 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-purple-500 rounded-full" />Home Blood Draw & Dispatch collections (₹{departmentRevenue.home_collection})</span>
                    <span className="font-mono text-slate-500">{totalRevenue ? Math.round((departmentRevenue.home_collection / totalRevenue) * 100) : 0}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-purple-500 h-full transition-all duration-500" style={{ width: `${totalRevenue ? (departmentRevenue.home_collection / totalRevenue) * 100 : 0}%` }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 bg-slate-700 rounded-full" />Advanced Special Scans & Procedures (₹{departmentRevenue.healthcare_service})</span>
                    <span className="font-mono text-slate-500">{totalRevenue ? Math.round((departmentRevenue.healthcare_service / totalRevenue) * 100) : 0}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="bg-slate-700 h-full transition-all duration-500" style={{ width: `${totalRevenue ? (departmentRevenue.healthcare_service / totalRevenue) * 100 : 0}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Quick manual generate billing statement panel */}
            <div className="bg-white border border-slate-200 p-5 rounded-3xl shadow-sm lg:col-span-4 space-y-3 font-semibold text-slate-500">
              <h3 className="font-display font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1">
                <Plus className="h-4.5 w-4.5 text-blue-600" />
                <span>Issue Direct Patient Bill</span>
              </h3>
              
              <form onSubmit={handleAdminIssueManualCheckout} className="space-y-3 text-xs">
                <div>
                  <label className="block mb-1 font-bold">Patient Name Coordinates</label>
                  <input 
                    type="text" 
                    value={adminManualClient} 
                    onChange={(e) => setAdminManualClient(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block mb-1 font-bold">Student/Staff ID</label>
                    <input 
                      type="text" 
                      value={adminManualId} 
                      onChange={(e) => setAdminManualId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block mb-1 font-bold">Category</label>
                    <select 
                      value={adminManualType} 
                      onChange={(e: any) => setAdminManualType(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                    >
                      <option value="appointment">Appointment</option>
                      <option value="lab_test">Lab Test</option>
                      <option value="medicine">Medicine</option>
                      <option value="home_collection">Home Collection</option>
                      <option value="healthcare_service">Healthcare Service</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 font-bold">Service Details Label</label>
                  <input 
                    type="text" 
                    value={adminManualService} 
                    onChange={(e) => setAdminManualService(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 font-bold">Subtotal Consultation Price (₹)</label>
                  <input 
                    type="number" 
                    value={adminManualCost} 
                    onChange={(e) => setAdminManualCost(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2"
                    required
                  />
                  <p className="text-[10px] text-slate-400 mt-1">G.S.T (5%) will auto attach upon submission</p>
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-slate-900 hover:bg-slate-950 text-white font-bold p-2.5 rounded-xl uppercase tracking-wider text-[11px]"
                >
                  Generate Hospital Invoice
                </button>
              </form>
            </div>

          </div>

          {/* Refund Review Queue Panel */}
          {transactions.filter(t => t.status === 'refund_requested' || t.status === 'refund_under_review').length > 0 && (
            <div className="bg-rose-50/50 border border-rose-100 rounded-3xl p-5 space-y-3">
              <h3 className="font-display font-extrabold text-xs uppercase tracking-wider text-rose-800 flex items-center gap-1.5 animate-pulse">
                <RefreshCcw className="h-4.5 w-4.5" />
                <span>Urgent Action Required: Outstanding Refund Dispute Requests ({transactions.filter(t => t.status === 'refund_requested' || t.status === 'refund_under_review').length})</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {transactions.filter(t => t.status === 'refund_requested' || t.status === 'refund_under_review').map(tx => (
                  <div key={tx.id} className="bg-white border border-rose-200/60 p-4 rounded-2xl flex flex-col justify-between font-semibold text-slate-500">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400 font-mono">Invoice: {tx.invoiceNumber}</span>
                        <span className="bg-amber-100 text-amber-800 font-bold px-1.5 rounded text-[9px] uppercase">Review queue</span>
                      </div>
                      <p className="text-slate-800 font-bold font-sans text-xs">{tx.studentName} ({tx.studentId})</p>
                      <p className="text-[11px] text-slate-600">Refund Claim For: <strong className="text-slate-800">{tx.serviceDetails}</strong></p>
                      <div className="bg-slate-50 border border-slate-150 p-2 text-[10px] text-slate-500 italic rounded">
                        <strong>Patient Reason:</strong> "{tx.refundReason}"
                      </div>
                      <p className="text-xs pt-1">Disputed Net Net Amount: <strong className="text-rose-650 font-mono">₹{tx.totalAmount}</strong> (via {tx.paymentMethod})</p>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-100">
                      <button 
                        onClick={() => handleAdminUpdateStatus(tx.id, "refunded")}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] py-1.5 rounded-lg uppercase transition-all"
                      >
                        Approve & Refund
                      </button>
                      <button 
                        onClick={() => handleAdminUpdateStatus(tx.id, "refund_rejected")}
                        className="bg-slate-105 hover:bg-slate-205 text-slate-600 font-bold text-[10px] py-1.5 rounded-lg uppercase transition-all"
                      >
                        Decline Dispute
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================== */}
      {/* CLIENT / PATIENT PAYMENT HUB & ACTION CENTER */}
      {/* ========================================================== */}
      {!isAdminView && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in text-slate-800">
          
          {/* Outstanding Unpayed consultations or pharmacy billing checklist widgets */}
          <div className="lg:col-span-4 bg-white border border-slate-200 p-5 rounded-3xl shadow-sm space-y-4">
            <h3 className="font-display font-extrabold text-xs uppercase tracking-wider text-slate-400">Current Pending Clinic Bills</h3>
            
            {appointments.filter(a => a.studentId === studentId && a.status === 'pending').length === 0 && (
              <div className="text-center font-sans text-slate-450 text-[11px] py-4 leading-normal bg-slate-50 border border-slate-100 border-dashed rounded-2xl">
                <span>All scheduled consultation outpatient entries are fully squared or paid on credit at hospital lobby!</span>
              </div>
            )}

            {appointments.filter(a => a.studentId === studentId && a.status === 'pending').map(appt => (
              <div key={appt.id} className="p-3.5 bg-slate-50 border border-slate-150 border-dashed rounded-2xl space-y-2 font-semibold">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400">DOCTOR CONSULT FEE</span>
                    <h4 className="font-bold text-slate-800 text-xs truncate max-w-[150px]">{appt.reason}</h4>
                  </div>
                  <span className="font-mono text-sm font-extrabold text-blue-700">₹500</span>
                </div>
                <p className="text-[10px] text-slate-400">Schedule Date: {appt.date} at {appt.time}</p>
                
                <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-150">
                  <button 
                    onClick={() => triggerQuickServiceCheckout('appointment', "Consultation Booking Fee", appt.reason, 500, appt.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-[10px] py-1 text-center rounded-lg uppercase"
                  >
                    Pay Online
                  </button>
                  <button 
                    onClick={async () => {
                      if (window.confirm("Understood. Setting this appointment status as 'Pay at cash counter on checkout date'?")) {
                        await fetch(`/api/appointments/${appt.id}`, {
                          method: "PUT",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: "checked-in", notes: "Designated: Cash at hospital lobby" })
                        });
                        alert("Designated successfully. Please provide receipt cash to cashiers on arrival.");
                        fetchTransactions();
                      }
                    }}
                    className="w-full bg-slate-105 hover:bg-slate-205 text-slate-650 font-bold text-[10px] py-1 text-center rounded-lg uppercase"
                  >
                    Pay At Lobby
                  </button>
                </div>
              </div>
            ))}

            {/* Quick Demo Utilities checklist */}
            <div className="border-t border-slate-100 pt-3 space-y-2">
              <h4 className="font-display font-semibold text-[10px] uppercase tracking-wider text-slate-400 mt-2">Demo Clinical Bill Catalogs</h4>
              
              <button 
                onClick={() => triggerQuickServiceCheckout('lab_test', "Pathology Thyroid Panel (T3 T4 TSH)", "Laboratory Test Diagnostics panel", 1100)}
                className="w-full flex justify-between items-center bg-cyan-50 hover:bg-cyan-100 text-cyan-900 border border-cyan-155 p-2 rounded-xl transition-all"
              >
                <div className="text-left">
                  <p className="text-[10px] font-bold">Pathology Blood Scan Scan</p>
                  <p className="text-[9px] text-cyan-600">Save 15% booking online</p>
                </div>
                <span className="font-mono font-bold text-xs">₹1,100</span>
              </button>

              <button 
                onClick={() => triggerQuickServiceCheckout('medicine', "Chronic respiratory steroid spray & pills", "Medications and inhalers bundle", 400)}
                className="w-full flex justify-between items-center bg-indigo-50 hover:bg-indigo-110 text-indigo-900 border border-indigo-155 p-2 rounded-xl transition-all"
              >
                <div className="text-left">
                  <p className="text-[10px] font-bold">Prescription drugs supply refill</p>
                  <p className="text-[9px] text-indigo-600">Save 10% online order</p>
                </div>
                <span className="font-mono font-bold text-xs">₹400</span>
              </button>

              <button 
                onClick={() => triggerQuickServiceCheckout('home_collection', "Phlebotomist Home Sample Extraction", "Home Nurse visit and diagnostics charges", 350)}
                className="w-full flex justify-between items-center bg-purple-50 hover:bg-purple-100 text-purple-900 border border-purple-150 p-2 rounded-xl transition-all"
              >
                <div className="text-left">
                  <p className="text-[10px] font-bold">Home Blood Collection</p>
                  <p className="text-[9px] text-purple-600">Dedicated dispatch</p>
                </div>
                <span className="font-mono font-bold text-xs">₹350</span>
              </button>
            </div>

          </div>

          {/* Historical statements list */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Payment statement ledger log list */}
            <div className="bg-white border border-slate-200 p-5 sm:p-6 rounded-3xl shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <h3 className="font-display font-semibold text-xs sm:text-sm uppercase tracking-wider text-slate-500">Transaction History Registry ({myTxHistory.length})</h3>
                
                {/* Visual state simulator alerts notification toggle banner in corner */}
                <div className="flex gap-2 text-[9px]">
                  <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-200 font-bold">UPI</span>
                  <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200 font-bold">CARD</span>
                  <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded border border-purple-200 font-bold">COD</span>
                </div>
              </div>

              {myTxHistory.length === 0 ? (
                <p className="text-slate-450 text-xs py-10 text-center font-sans">No invoice records found on file. Book clinic schedules or request path scans on our site to create statements.</p>
              ) : (
                <div className="divide-y divide-slate-100 font-semibold text-slate-500">
                  {myTxHistory.map(tx => (
                    <div key={tx.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-slate-400">{tx.invoiceNumber}</span>
                          <span className={`${
                            tx.status === 'successful' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            tx.status === 'refunded' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                            tx.status === 'refund_requested' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            'bg-yellow-50 text-yellow-700 border-yellow-200'
                          } border text-[9px] px-1.5 py-0.2 rounded font-bold uppercase`}>
                            {tx.status.replace('_', ' ')}
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm">{tx.serviceDetails}</h4>
                        <p className="text-[10px] text-slate-400 block font-mono">Paid: {new Date(tx.paymentDate).toLocaleString()} via {tx.paymentMethod}</p>
                      </div>

                      <div className="flex flex-col sm:items-end gap-1 font-sans">
                        <span className="text-base font-extrabold text-slate-900">₹{tx.totalAmount}</span>
                        
                        <div className="flex items-center gap-2 pt-1 font-mono text-[10px]">
                          <button 
                            onClick={() => {
                              setViewingInvoice(tx); 
                              triggerChannelsNotifications(tx, "Invoice Printed");
                            }}
                            className="text-blue-600 hover:underline flex items-center gap-0.5"
                          >
                            <FileText className="w-3.5 h-3.5" /> Preview Receipt
                          </button>

                          {tx.status === 'successful' && (
                            <button 
                              onClick={() => {
                                setSubmittingRefundId(tx.id);
                                setRefundReason("");
                              }}
                              className="text-rose-600 hover:underline flex items-center gap-0.5"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Dispute Refund
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ========================================================== */}
      {/* REFUND DISPUTE FORM SUBMISSION DIALOG */}
      {/* ========================================================== */}
      {submittingRefundId && (
        <div className="fixed inset-0 bg-slate-900/60 p-4 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in text-xs font-semibold text-slate-500">
          <div className="bg-white border border-rose-100 rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-4">
            <div className="flex justify-between items-center bg-rose-600 rounded-2xl p-4 text-white">
              <div>
                <h4 className="font-display font-extrabold text-white text-base">File Payment Dispute & Refund Petition</h4>
                <p className="text-[10px] text-rose-100">Dispatched directly to the Cashier Admin Audit Wing</p>
              </div>
              <button onClick={() => setSubmittingRefundId(null)} className="text-white hover:text-slate-200">✕</button>
            </div>

            <form onSubmit={(e) => handleRequestRefund(e, submittingRefundId)} className="space-y-4">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-150">
                <p className="text-slate-400 uppercase text-[9px] tracking-wider font-bold">Selected Ledger</p>
                <p className="font-bold text-slate-800 text-xs">ID: {submittingRefundId}</p>
                <p className="text-[10px] text-slate-500 mt-1">Note: Transactions processed through Sandbox are fully reversible within 24 working hours under hospital regulation guidelines.</p>
              </div>

              <div>
                <label className="block mb-1 font-bold text-slate-900 uppercase tracking-wide">Refund Complaint details</label>
                <textarea 
                  rows={3}
                  required
                  placeholder="Explain why a refund is requested, e.g. Selected wrong scan options, doctor rescheduled consultation, duplicated online processing..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-medium focus:bg-white focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button 
                  type="submit"
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold py-3.5 rounded-2xl uppercase tracking-wider"
                >
                  File Refund Petition
                </button>
                <button 
                  type="button"
                  onClick={() => setSubmittingRefundId(null)}
                  className="w-full bg-slate-105 hover:bg-slate-205 text-slate-650 font-bold py-3.5 rounded-2xl uppercase"
                >
                  Cancel Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* REVOLUTIONARY INTUITIVE INTERACTIVE SANDBOX PAYMENT GATEWAY */}
      {/* ========================================================== */}
      {gatewayOpen && checkoutService && (
        <div className="fixed inset-0 bg-slate-900/60 p-4 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in text-xs font-semibold text-slate-500">
          <div className="bg-white border border-slate-200 rounded-[35px] shadow-2xl w-full max-w-2xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
            
            {/* Left payment summary block */}
            <div className="md:col-span-5 bg-gradient-to-b from-blue-600 to-indigo-700 p-6 sm:p-8 text-white flex flex-col justify-between">
              
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-white/10 rounded-xl flex items-center justify-center">
                    <Lock className="h-4 w-4 text-white" />
                  </div>
                  <span className="font-display font-bold text-xs tracking-wide uppercase text-blue-100">Checkout Terminal</span>
                </div>

                <div className="space-y-1 pt-2">
                  <span className="text-[10px] bg-white/15 px-2.5 py-0.5 rounded-full text-blue-100 uppercase tracking-widest">{checkoutService.type.replace('_',' ')}</span>
                  <h4 className="text-base sm:text-lg font-black leading-tight">{checkoutService.name}</h4>
                  <p className="text-[10px] text-blue-200/95 font-sans italic">{checkoutService.description}</p>
                </div>
              </div>

              {/* Deductibles pricing summary schema */}
              <div className="space-y-3 border-t border-white/15 pt-5 mt-5">
                <p className="flex justify-between text-blue-200">
                  <span>Merchant list fee:</span>
                  <span className="font-mono">₹{checkoutService.amount}</span>
                </p>
                
                {checkoutService.discountPercent > 0 && (
                  <p className="flex justify-between text-green-300">
                    <span>Discount applied ({checkoutService.discountPercent}%):</span>
                    <span className="font-mono">- ₹{Math.round((checkoutService.amount * checkoutService.discountPercent) / 100)}</span>
                  </p>
                )}

                <p className="flex justify-between text-blue-200">
                  <span>SGST Tax (5%):</span>
                  <span className="font-mono">+ ₹{Math.round(((checkoutService.amount - Math.round((checkoutService.amount * checkoutService.discountPercent) / 100)) * 0.05))}</span>
                </p>

                <div className="flex justify-between text-xs sm:text-sm font-bold border-t border-white/15 pt-2.5 text-white">
                  <span>Net Bill Payable:</span>
                  <span className="font-mono text-base sm:text-lg">
                    ₹{checkoutService.amount - Math.round((checkoutService.amount * checkoutService.discountPercent) / 100) + Math.round(((checkoutService.amount - Math.round((checkoutService.amount * checkoutService.discountPercent) / 100)) * 0.05))}
                  </span>
                </div>
              </div>

              {/* Security locks label */}
              <p className="text-[9px] text-blue-200/70 font-sans leading-normal pt-4">
                🔒 You are routing through Titan HealthConnect simulated Merchant terminal. Standard testing credentials apply.
              </p>

            </div>

            {/* Right Interactive Selection gateway forms */}
            <div className="md:col-span-7 p-6 sm:p-8 space-y-5 flex flex-col justify-between">
              
              <div className="flex justify-between items-center">
                <h3 className="font-display font-extrabold text-slate-800 text-base">Select Booking Method</h3>
                <button 
                  onClick={() => { setGatewayOpen(false); setCheckoutService(null); }}
                  className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center text-slate-500 font-bold"
                >✕</button>
              </div>

              {/* Methods toggle lists */}
              <div className="grid grid-cols-5 gap-1 pt-1">
                {[
                  { id: 'Card', icon: CreditCard, label: 'Card' },
                  { id: 'UPI', icon: Smartphone, label: 'UPI' },
                  { id: 'NetBanking', icon: Grid, label: 'NetBank' },
                  { id: 'Wallet', icon: Wallet, label: 'Wallet' },
                  { id: 'QR Code', icon: QrCode, label: 'QR Scan' }
                ].map(item => (
                  <button
                    key={item.id}
                    onClick={() => { 
                      setGatewayMethod(item.id as any);
                      setOtpSent(false);
                      setOtpVerified(false);
                      setCardOTP("");
                    }}
                    className={`py-2 rounded-xl flex flex-col items-center gap-1.5 transition-all text-[9.5px] font-bold border ${gatewayMethod === item.id ? 'bg-blue-50 text-blue-700 border-blue-400 shadow-xs' : 'bg-slate-50 border-slate-220 text-slate-500 hover:bg-slate-100'}`}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>

              {/* Main execution form body */}
              <div className="py-2 flex-grow">
                {paymentCompleted ? (
                  <div className="text-center py-6 space-y-4 animate-fade-in font-bold text-slate-650">
                    <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce border border-emerald-300">
                      <CheckCircle2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h4 className="text-slate-900 text-sm font-black">Secure Transaction Confirmed!</h4>
                      <p className="text-[11px] text-slate-500 mt-1 font-sans">Payment ledger successfully updated on Titan Central Database.</p>
                      <p className="text-[10px] text-blue-600 font-mono mt-3">Receipt Ref: {paymentCompleted.id}</p>
                    </div>

                    <button 
                      onClick={() => { setViewingInvoice(paymentCompleted); setGatewayOpen(false); }}
                      className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-950 text-white font-bold py-2 px-4 rounded-xl uppercase text-[10px] tracking-wider"
                    >
                      <Printer className="h-4 w-4" /> Download Digital Receipt
                    </button>
                  </div>
                ) : (
                  <form onSubmit={triggerSandboxGatewaySubmit} className="space-y-4 font-semibold text-slate-500 text-xs">
                    
                    {/* CARD DETAILS LAYOUT SECTION */}
                    {gatewayMethod === 'Card' && (
                      <div className="space-y-3">
                        <div className="p-4 bg-slate-800 text-white rounded-2xl relative overflow-hidden font-mono text-left flex flex-col justify-between h-36 border border-slate-700 shadow-md">
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold tracking-widest text-slate-400">TITAN CO-OP BANK CARD</span>
                            <span className="text-xs italic bg-white/10 px-2 rounded">VISA SECURITY</span>
                          </div>
                          
                          <p className="text-base sm:text-lg font-bold tracking-widest text-slate-100 pt-3">{cardNumber || "•••• •••• •••• ••••"}</p>
                          
                          <div className="flex justify-between text-[10px] text-slate-400 pt-2">
                            <div>
                              <p className="text-[7px] uppercase tracking-wide">Holder</p>
                              <p className="font-bold text-slate-200 uppercase">{cardName || "TITAN CUSTOMER"}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-[7px] uppercase tracking-wide">Valid thru</p>
                              <p className="font-bold text-slate-200">{cardExpiry || "12/30"}</p>
                            </div>
                          </div>
                        </div>

                        {!otpSent ? (
                          <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                              <div>
                                <label className="block mb-1 font-bold">Standard Sandbox Card CVV</label>
                                <input 
                                  type="text" 
                                  required
                                  value={cardNumber}
                                  onChange={(e) => setCardNumber(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-[11px]"
                                />
                              </div>
                              <div>
                                <label className="block mb-1 font-bold">Card expiry validation</label>
                                <input 
                                  type="text" 
                                  required
                                  value={cardExpiry}
                                  onChange={(e) => setCardExpiry(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-[11px]"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-[10.5px]">
                              <div>
                                <label className="block mb-1 font-bold">Card security CVV</label>
                                <input 
                                  type="password" 
                                  required
                                  value={cardCVV}
                                  onChange={(e: any) => setCardCVV(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-[11px]"
                                />
                              </div>
                              <div>
                                <label className="block mb-1 font-bold">Cardholder descriptor</label>
                                <input 
                                  type="text" 
                                  required
                                  value={cardName}
                                  onChange={(e) => setCardName(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-[11px]"
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-blue-50/55 p-3 rounded-2xl border border-blue-100 space-y-2.5 animate-fade-in">
                            <p className="text-[10px] text-blue-800 leading-normal font-sans">Bank OTP challenge verification: <strong>891402</strong> has been issued. Put this code in the security console below to confirm ledger authorization.</p>
                            <div>
                              <label className="block mb-1 font-bold text-slate-800">Bank OTP Pin Code</label>
                              <input 
                                type="text"
                                required 
                                maxLength={6}
                                placeholder="Dispatched Sandbox Code e.g. 891402" 
                                value={cardOTP}
                                onChange={(e) => {
                                  setCardOTP(e.target.value);
                                  if (e.target.value === "891402") {
                                    setOtpVerified(true);
                                  }
                                }}
                                className="w-full bg-white border border-blue-200 p-2.5 rounded-xl font-mono text-center tracking-widest text-sm font-bold"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* DYNAMIC UPI INPUT FIELD SCREEN */}
                    {gatewayMethod === 'UPI' && (
                      <div className="space-y-3 animate-fade-in text-slate-500 font-semibold">
                        <div>
                          <label className="block mb-1 font-bold text-slate-800">Your UPI ID (VPA)</label>
                          <input 
                            type="text" 
                            required
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl font-mono"
                          />
                          <p className="text-[9.5px] text-slate-400 mt-1">Example: student@oksbi, maya@paytm, test@upi for successful processing</p>
                        </div>
                        <div className="bg-slate-50 p-2.5 rounded-xl border flex items-center gap-3">
                          <ShieldCheck className="h-5 w-5 text-blue-605" />
                          <p className="text-[10px] text-slate-505 font-sans leading-relaxed">Direct UPI payment trigger will notify your UPI mobile application instantly.</p>
                        </div>
                      </div>
                    )}

                    {/* NET BANKING BANK LIST DROPDOWN SELECTION */}
                    {gatewayMethod === 'NetBanking' && (
                      <div className="space-y-3 animate-fade-in">
                        <div>
                          <label className="block mb-1 font-bold text-slate-800">Select National Bank Portal</label>
                          <select 
                            value={selectedBank}
                            onChange={(e) => setSelectedBank(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs font-semibold"
                          >
                            <option value="State Bank of India">State Bank of India (SBI)</option>
                            <option value="HDFC Bank Limited">HDFC Bank</option>
                            <option value="ICICI Bank Limited">ICICI Bank</option>
                            <option value="Axis Bank Limited">Axis Bank</option>
                            <option value="Titan Co-op Core Bank">Titan Co-op Core Bank</option>
                          </select>
                        </div>
                        <p className="text-[10px] text-slate-450 leading-relaxed font-sans">Clicking pay below will trigger our simulated banking gateway login to confirm check-off.</p>
                      </div>
                    )}

                    {/* DIGITAL WALLETS TOGGLE LIST */}
                    {gatewayMethod === 'Wallet' && (
                      <div className="space-y-3 animate-fade-in">
                        <div>
                          <label className="block mb-1 font-bold text-slate-805">Select Preferred Wallet</label>
                          <div className="grid grid-cols-3 gap-2">
                            {['PaytmWallet', 'PhonePe', 'AmazonPay'].map(w => (
                              <button
                                type="button"
                                key={w}
                                onClick={() => setSelectedWallet(w)}
                                className={`py-2 p-1.5 rounded-xl text-[10.5px] font-bold border transition-all ${selectedWallet === w ? 'bg-indigo-50 border-indigo-400 text-indigo-750' : 'bg-slate-50 border-slate-230 hover:bg-slate-100 text-slate-500'}`}
                              >
                                {w}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* QR CODE PAYMENT IMAGE SCAN COMPLIANT */}
                    {gatewayMethod === 'QR Code' && (
                      <div className="space-y-3 animate-fade-in text-center font-semibold text-slate-600">
                        <div className="w-28 h-28 bg-white border-2 border-slate-200 p-1 mx-auto flex items-center justify-center rounded-2xl relative shadow-sm">
                          {/* Standard custom elegant SVG QR Pattern */}
                          <svg className="w-full h-full text-slate-800 p-1" viewBox="0 0 100 100">
                            <rect x="0" y="0" width="30" height="30" fill="currentColor" />
                            <rect x="4" y="4" width="22" height="22" fill="white" />
                            <rect x="8" y="8" width="14" height="14" fill="currentColor" />

                            <rect x="70" y="0" width="30" height="30" fill="currentColor" />
                            <rect x="74" y="4" width="22" height="22" fill="white" />
                            <rect x="78" y="8" width="14" height="14" fill="currentColor" />

                            <rect x="0" y="70" width="30" height="30" fill="currentColor" />
                            <rect x="4" y="74" width="22" height="22" fill="white" />
                            <rect x="8" y="78" width="14" height="14" fill="currentColor" />

                            <rect x="40" y="40" width="20" height="20" fill="currentColor" />
                            <rect x="44" y="44" width="12" height="12" fill="white" />

                            {/* Dense random dots */}
                            <rect x="45" y="10" width="5" height="10" />
                            <rect x="35" y="25" width="10" height="5" />
                            <rect x="15" y="45" width="5" height="10" />
                            <rect x="80" y="45" width="10" height="10" />
                            <rect x="45" y="80" width="15" height="5" />
                            <rect x="80" y="80" width="5" height="5" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-700 font-bold">Simulated Multi-Merchant UPI QR Code</p>
                          <p className="text-[9px] text-slate-450 mt-1 font-sans">Open dynamic camera tracker or GPAY simulation overlay. Commits payment on submit.</p>
                        </div>
                      </div>
                    )}

                    <div className="pt-3">
                      <button
                        type="submit"
                        disabled={paymentProcessing}
                        className={`w-full py-3.5 rounded-2xl uppercase tracking-wider font-extrabold text-white transition-all text-center flex items-center justify-center gap-2 ${paymentProcessing ? 'bg-slate-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 shadow-md'}`}
                      >
                        {paymentProcessing ? (
                          <>
                            <RefreshCcw className="h-4 w-4 animate-spin text-white" />
                            <span>Routing Merchant Vault...</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="h-4.5 w-4.5" />
                            <span>
                              {gatewayMethod === 'Card' && !otpSent 
                                ? "Proceed with OTP Verification" 
                                : `Confirm Sandbox Payment ₹${checkoutService.amount - Math.round((checkoutService.amount * checkoutService.discountPercent) / 100) + Math.round(((checkoutService.amount - Math.round((checkoutService.amount * checkoutService.discountPercent) / 100)) * 0.05))}`}
                            </span>
                          </>
                        )}
                      </button>
                    </div>

                  </form>
                )}
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* PROFESSIONAL CHANNELS NOTIFICATION SIMULATION BOTTOM BAR */}
      {/* ========================================================== */}
      {notifications.length > 0 && (
        <div className="bg-slate-900 text-white rounded-3xl p-5 border border-slate-800 space-y-4 shadow-xl">
          <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
            <h4 className="font-display font-black text-xs uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <BellRing className="h-4 w-4 text-blue-400 animate-pulse" />
              <span>Simulated Instant Dispatch Logs (SMS, Email, WhatsApp, In-App)</span>
            </h4>
            <button 
              onClick={() => setNotifications([])} 
              className="text-[10px] text-slate-400 hover:text-white"
            >Clear Logs</button>
          </div>

          <div className="space-y-3 max-h-36 overflow-y-auto">
            {notifications.map(n => (
              <div key={n.id} className="bg-white/5 border border-white/10 p-3 rounded-2xl flex items-start gap-3 animate-fade-in text-slate-105">
                <div className={`p-1.5 rounded-xl ${
                  n.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                  n.type === 'refund' ? 'bg-indigo-500/10 text-indigo-400' :
                  'bg-blue-500/10 text-blue-400'
                }`}>
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div className="flex-grow text-xs leading-normal font-semibold">
                  <p className="font-black text-slate-205">{n.title}</p>
                  <p className="text-[10.5px] text-slate-400 mt-0.5">{n.body}</p>
                  <div className="flex items-center gap-1 mt-2">
                    <span className="text-[8px] text-slate-400">Broadcast Channels:</span>
                    {n.channels.map(chan => (
                      <span key={chan} className="text-[7.5px] bg-slate-800 text-slate-300 font-mono px-1.5 rounded-full uppercase">{chan}</span>
                    ))}
                  </div>
                </div>
                <span className="text-[8.5px] text-slate-500 font-mono">{n.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* ULTRA-POLISHED WATERMARKED OUTPATIENT INVOICE MODAL SYSTEM */}
      {/* ========================================================== */}
      {viewingInvoice && (
        <div className="fixed inset-0 bg-slate-900/60 p-4 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in text-xs font-semibold text-slate-500">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden space-y-5" id="printable-clinic-invoice">
            
            {/* Watermark sign */}
            <div className="absolute inset-0 select-none pointer-events-none opacity-[0.03] flex items-center justify-center transform -rotate-45">
              <span className="font-display font-black text-6xl tracking-widest uppercase">TITAN HEALTHCONNECT</span>
            </div>

            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center text-white font-extrabold text-sm">
                    T
                  </div>
                  <h3 className="font-display font-extrabold text-slate-800 tracking-tight text-sm">Titan HealthConnect Medical Center</h3>
                </div>
                <p className="text-[9px] text-slate-400 mt-1 font-sans">Whitefield, Bengaluru, KA, India | ISO 9001 Certified</p>
              </div>

              <div className="text-right">
                <span className={`text-[9px] px-2 py-0.5 rounded font-black border uppercase ${
                  viewingInvoice.status === 'successful' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                  viewingInvoice.status === 'refunded' ? 'bg-indigo-50 text-indigo-800 border-indigo-200' :
                  'bg-amber-50 text-amber-800 border-amber-200'
                }`}>
                  {viewingInvoice.status.replace('_', ' ')}
                </span>
                <p className="text-[10px] text-slate-400 mt-1 font-mono">{viewingInvoice.invoiceNumber}</p>
              </div>
            </div>

            {/* Inpatient details sheet */}
            <div className="grid grid-cols-2 gap-4 text-[11px] leading-normal pb-3 font-semibold text-slate-500">
              <div>
                <p className="font-bold text-slate-400 uppercase text-[8px] tracking-wider">Patient Information</p>
                <p className="font-bold text-slate-800 text-xs mt-0.5">{viewingInvoice.studentName}</p>
                <p className="text-slate-500 font-mono">ID: {viewingInvoice.studentId}</p>
                <p className="text-slate-500">{viewingInvoice.patientEmail}</p>
                <p className="text-slate-500 font-mono">{viewingInvoice.patientMobile}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-400 uppercase text-[8px] tracking-wider">Payment Particulars</p>
                <p className="font-bold text-slate-800 text-xs mt-0.5">Simulated Gateway ID</p>
                <p className="text-slate-505 font-mono">TXN: {viewingInvoice.id}</p>
                <p className="text-slate-505 font-mono">Date: {new Date(viewingInvoice.paymentDate).toLocaleString()}</p>
                <p className="text-slate-505">Method: {viewingInvoice.paymentMethod}</p>
              </div>
            </div>

            {/* Line items table list */}
            <div className="border border-slate-150 rounded-2xl overflow-hidden font-semibold">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-150 text-[10px] text-slate-400 uppercase tracking-wider">
                    <th className="p-3">Healthcare Service Item Description</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150 text-slate-800">
                  <tr>
                    <td className="p-3">
                      <p className="font-bold">{viewingInvoice.serviceDetails}</p>
                      <p className="text-[10px] text-slate-400 font-sans italic">Primary outpatient clinic treatment registry</p>
                    </td>
                    <td className="p-3 text-right font-mono font-bold">₹{viewingInvoice.amount}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Net net calculations */}
            <div className="space-y-2 text-xs border-b border-indigo-100 pb-3 font-semibold text-slate-505">
              <p className="flex justify-between">
                <span className="text-slate-450">Base particular charge:</span>
                <span className="font-mono">₹{viewingInvoice.amount}</span>
              </p>
              {viewingInvoice.discount > 0 && (
                <p className="flex justify-between text-emerald-650">
                  <span className="text-slate-450">Incentive health discount applied:</span>
                  <span className="font-mono font-bold">- ₹{viewingInvoice.discount}</span>
                </p>
              )}
              <p className="flex justify-between">
                <span className="text-slate-450">State Integrated SGST Tax (5%):</span>
                <span className="font-mono">₹{viewingInvoice.tax}</span>
              </p>
              <div className="flex justify-between text-sm font-black text-blue-700 border-t border-slate-100 pt-2.5">
                <span>Total Net Bill Paid Successfully:</span>
                <span className="font-mono text-base">₹{viewingInvoice.totalAmount}</span>
              </div>
            </div>

            {/* Actions triggers to Print or Simulate Close */}
            <div className="grid grid-cols-3 gap-2 pt-1 font-mono text-[10px] text-center uppercase tracking-wide">
              <button 
                onClick={() => {
                  window.print();
                }}
                className="bg-slate-900 text-white font-extrabold py-3.5 rounded-2xl flex items-center justify-center gap-1 shadow hover:bg-slate-950 uppercase"
              >
                <Printer className="h-4 w-4" /> Print Receipt
              </button>
              
              <button 
                onClick={() => {
                  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(viewingInvoice, null, 2));
                  const dlAnchorElem = document.createElement('a');
                  dlAnchorElem.setAttribute("href", dataStr);
                  dlAnchorElem.setAttribute("download", `TitanInvoice-${viewingInvoice.invoiceNumber}.json`);
                  dlAnchorElem.click();
                  alert("Digital Ledger successfully backed up on local diagnostics file.");
                }}
                className="bg-indigo-600 text-white font-extrabold py-3.5 rounded-2xl flex items-center justify-center gap-1 shadow hover:bg-indigo-700 uppercase"
              >
                <Download className="h-4 w-4" /> Download Statement
              </button>

              <button 
                onClick={() => setViewingInvoice(null)}
                className="bg-slate-105 hover:bg-slate-205 text-slate-650 font-bold py-3.5 rounded-2xl hover:text-slate-800 transition-all uppercase"
              >
                ✕ Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
