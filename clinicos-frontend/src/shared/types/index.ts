export interface Patient {
  id: string;
  patientCustomId?: string;
  aadhaar?: string;
  name: string;
  phone: string;
  email?: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  bloodGroup: string;
  address: string;
  allergies: string[];
  medicalConditions: string[];
  emergencyContact?: string;
  treatmentStatus: 'Consultation' | 'Active Treatment' | 'Maintenance' | 'Completed';
  dateAdded: string;
  createdAt?: string;
  avatarUrl?: string;
}

export type TokenStatus = 'waiting' | 'called' | 'started' | 'completed' | 'missed' | 'cancelled' | 'skipped' | 'recalled';
export type TokenPriority = 'normal' | 'urgent' | 'emergency';

export interface QueueToken {
  id: string;
  tokenNumber: string;
  patientId: string;
  patientName: string;
  status: TokenStatus;
  priority: TokenPriority;
  visitReason: string;
  doctorName: string;
  checkInTime: string;
  startTime?: string;
  endTime?: string;
}

export type AppointmentStatus = 'available' | 'booked' | 'followup' | 'cancelled' | 'holiday';

export interface Appointment {
  id: string;
  patientId?: string;
  patientName?: string;
  date: string; // YYYY-MM-DD
  timeSlot: number; // 1 to 12
  status: AppointmentStatus;
  type?: 'consultation' | 'followup' | 'procedure';
  notes?: string;
}

export interface PrescriptionItem {
  drugName: string;
  dosage: string;
  frequency: string; // e.g. "1-0-1", "0-0-1"
  duration: string;  // e.g. "5 days"
  instructions: string; // e.g. "After food"
}

export interface SoapNotes {
  subjective: string;
  objective: string;
  assessment: string;
  plan: string;
}

export interface Consultation {
  id: string;
  tokenNumber: string;
  patientId: string;
  date: string;
  symptoms: string;
  notes: string;
  soapNotes: SoapNotes;
  prescriptions: PrescriptionItem[];
  labOrders: string[];
  followUpDate?: string;
}

export interface LabReport {
  id: string;
  patientId: string;
  patientName: string;
  testName: string;
  testDate: string;
  status: 'Ordered' | 'Sample Collected' | 'Processing' | 'Uploaded' | 'Reviewed' | 'pending' | 'completed' | 'flagged';
  results: { parameter: string; value: string; range: string }[];
  fileUrl?: string;
  filePath?: string;
  doctorComments?: string;
  reviewNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface TreatmentGalleryItem {
  id: string;
  patientId: string;
  patientName: string;
  title: string;
  date: string;
  beforeUrl: string;
  afterUrl: string;
  notes: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'doctor' | 'receptionist';
  avatarUrl?: string;
}

export type PatientDocumentType = 'Referral' | 'Consent' | 'Insurance' | 'Prescription' | 'Lab Report' | 'Miscellaneous';

export interface PatientDocument {
  id: string;
  patientId: string;
  documentName: string;
  documentType: PatientDocumentType;
  fileUrl: string;
  fileSize: string;
  uploadedBy: string;
  uploadedByName: string;
  createdAt: string;
}
