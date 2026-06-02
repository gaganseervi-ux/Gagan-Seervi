export interface PatientVital {
  id: string;
  studentName: string;
  studentId: string;
  symptoms: string;
  temperature: number;
  heartRate: number;
  allergies: string;
  severity: 'normal' | 'moderate' | 'critical';
  timestamp: string;
}

export interface Appointment {
  id: string;
  studentName: string;
  studentId: string;
  reason: string;
  date: string;
  time: string;
  status: 'pending' | 'checked-in' | 'in-consultation' | 'completed' | 'cancelled';
  notes?: string;
  timestamp: string;
}

export interface SOSAlert {
  id: string;
  studentName: string;
  studentId: string;
  building: string;
  room: string;
  additionalDetails?: string;
  timestamp: string;
  status: 'active' | 'dispatched' | 'resolved';
  resolvedBy?: string;
  resolvedAt?: string;
}

export interface Prescription {
  id: string;
  appointmentId?: string;
  studentName: string;
  studentId: string;
  doctorName: string;
  medication: string;
  dosage: string;
  instructions: string;
  datePrescribed: string;
}

export interface TriageResult {
  disclaimer: string;
  urgency: 'normal' | 'moderate' | 'critical';
  summary: string;
  homeCare: string;
  shouldTriggerSOS: boolean;
}

export interface PaymentTransaction {
  id: string;               // e.g. "tx-12345"
  invoiceNumber: string;    // e.g. "INV-2026-90412"
  studentId: string;
  studentName: string;
  patientEmail: string;
  patientMobile: string;
  serviceType: 'appointment' | 'lab_test' | 'medicine' | 'home_collection' | 'healthcare_service';
  serviceDetails: string;   // e.g. "Dr. Arthur Mercer - General Consultation"
  amount: number;
  discount: number;
  tax: number;
  totalAmount: number;
  paymentMethod: 'UPI' | 'Credit Card' | 'Debit Card' | 'Net Banking' | 'Digital Wallet' | 'QR Code' | 'Cash on Delivery' | 'Cash at Hospital';
  paymentDate: string;      // ISO format
  status: 'pending' | 'successful' | 'failed' | 'refund_requested' | 'refund_under_review' | 'refunded' | 'refund_rejected';
  refundReason?: string;
  refundProcessedAt?: string;
}
