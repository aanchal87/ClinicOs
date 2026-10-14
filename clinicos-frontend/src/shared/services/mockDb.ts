import { Patient, QueueToken, Appointment, Consultation, LabReport, TreatmentGalleryItem, PrescriptionItem, TokenStatus } from '../types';

// Check if localStorage is available (SSR safety)
const isBrowser = typeof window !== 'undefined';

const INITIAL_PATIENTS: Patient[] = [
  {
    id: "p-1",
    name: "Sarah Jenkins",
    phone: "+1 (555) 019-2834",
    email: "sarah.jenkins@example.com",
    dob: "1994-08-12",
    gender: "Female",
    bloodGroup: "O+",
    address: "742 Evergreen Terrace, Springfield",
    allergies: ["Penicillin", "Peanuts"],
    medicalConditions: ["Mild Asthma", "Eczema"],
    treatmentStatus: "Active Treatment",
    dateAdded: "2026-02-14",
    avatarUrl: "/patient_avatar_1.png"
  },
  {
    id: "p-2",
    name: "David Miller",
    phone: "+1 (555) 014-9988",
    email: "david.miller@example.com",
    dob: "1981-11-23",
    gender: "Male",
    bloodGroup: "A-",
    address: "123 Maple Street, Riverdale",
    allergies: ["Sulfa Drugs"],
    medicalConditions: ["Hypertension"],
    treatmentStatus: "Maintenance",
    dateAdded: "2026-03-01",
    avatarUrl: undefined
  },
  {
    id: "p-3",
    name: "Elena Rostova",
    phone: "+1 (555) 017-4455",
    email: "elena.rostova@example.com",
    dob: "1998-04-05",
    gender: "Female",
    bloodGroup: "B+",
    address: "456 Oak Avenue, Metropolis",
    allergies: [],
    medicalConditions: ["Contact Dermatitis"],
    treatmentStatus: "Consultation",
    dateAdded: "2026-05-20",
    avatarUrl: undefined
  },
  {
    id: "p-4",
    name: "Marcus Chen",
    phone: "+1 (555) 012-7711",
    email: "marcus.chen@example.com",
    dob: "1976-06-30",
    gender: "Male",
    bloodGroup: "AB+",
    address: "789 Pine Lane, Gotham",
    allergies: ["Aspirin"],
    medicalConditions: ["Type 2 Diabetes", "Rosacea"],
    treatmentStatus: "Active Treatment",
    dateAdded: "2026-01-10",
    avatarUrl: undefined
  }
];

const INITIAL_TOKENS: QueueToken[] = [
  {
    id: "t-1",
    tokenNumber: "T-04",
    patientId: "p-1",
    patientName: "Sarah Jenkins",
    status: "started",
    priority: "normal",
    visitReason: "Weekly Skin Laser Review",
    doctorName: "Dr. Adrian Vance",
    checkInTime: "09:15 AM",
    startTime: "09:30 AM"
  },
  {
    id: "t-2",
    tokenNumber: "T-05",
    patientId: "p-2",
    patientName: "David Miller",
    status: "waiting",
    priority: "urgent",
    visitReason: "Hypertension Checkup",
    doctorName: "Dr. Adrian Vance",
    checkInTime: "09:35 AM"
  },
  {
    id: "t-3",
    tokenNumber: "T-06",
    patientId: "p-3",
    patientName: "Elena Rostova",
    status: "waiting",
    priority: "normal",
    visitReason: "Acne Flare-Up Consultation",
    doctorName: "Dr. Adrian Vance",
    checkInTime: "09:40 AM"
  },
  {
    id: "t-4",
    tokenNumber: "T-01",
    patientId: "p-4",
    patientName: "Marcus Chen",
    status: "completed",
    priority: "normal",
    visitReason: "Rosacea Progress Assessment",
    doctorName: "Dr. Adrian Vance",
    checkInTime: "08:30 AM",
    startTime: "08:45 AM",
    endTime: "09:10 AM"
  },
  {
    id: "t-5",
    tokenNumber: "T-02",
    patientId: "p-1",
    patientName: "Sarah Jenkins",
    status: "missed",
    priority: "normal",
    visitReason: "Emergency Patch Test",
    doctorName: "Dr. Adrian Vance",
    checkInTime: "08:40 AM"
  }
];

const INITIAL_APPOINTMENTS: Appointment[] = [
  { id: "a-1", patientId: "p-1", patientName: "Sarah Jenkins", date: "2026-06-18", timeSlot: 1, status: "booked", type: "consultation", notes: "Weekly Skin Review" },
  { id: "a-2", patientId: "p-2", patientName: "David Miller", date: "2026-06-18", timeSlot: 2, status: "followup", type: "followup", notes: "Blood pressure assessment" },
  { id: "a-3", date: "2026-06-18", timeSlot: 3, status: "available" },
  { id: "a-4", patientId: "p-3", patientName: "Elena Rostova", date: "2026-06-18", timeSlot: 4, status: "booked", type: "consultation", notes: "Acne consult" },
  { id: "a-5", date: "2026-06-18", timeSlot: 5, status: "available" },
  { id: "a-6", date: "2026-06-18", timeSlot: 6, status: "holiday", notes: "Doctor Lunch Break" },
  { id: "a-7", date: "2026-06-18", timeSlot: 7, status: "available" },
  { id: "a-8", patientId: "p-4", patientName: "Marcus Chen", date: "2026-06-18", timeSlot: 8, status: "booked", type: "procedure", notes: "Laser session 2" },
  { id: "a-9", date: "2026-06-18", timeSlot: 9, status: "available" },
  { id: "a-10", date: "2026-06-18", timeSlot: 10, status: "available" },
  { id: "a-11", date: "2026-06-18", timeSlot: 11, status: "available" },
  { id: "a-12", date: "2026-06-18", timeSlot: 12, status: "available" }
];

const INITIAL_CONSULTATIONS: Consultation[] = [
  {
    id: "c-1",
    tokenNumber: "T-01",
    patientId: "p-4",
    date: "2026-06-18",
    symptoms: "Persistent redness on cheeks and nose. Occasional itching.",
    notes: "Patient reports slight improvement since using the custom topical cream. Redness flares up after eating spicy foods.",
    soapNotes: {
      subjective: "Patient states redness on cheeks has decreased about 20% but nose remains highly vascularized.",
      objective: "Erythema noted on nasal bridge. Mild papules present on cheeks. No telangiectasia observed.",
      assessment: "Rosacea - Erythematotelangiectatic subtype. Responding slowly to current topical regimen.",
      plan: "Adjust topical metronidazole concentration. Schedule follow-up IPL laser treatment in 2 weeks."
    },
    prescriptions: [
      { drugName: "Metronidazole 1% Cream", dosage: "Apply thin layer", frequency: "0-0-1", duration: "14 days", instructions: "Apply at bedtime after washing face" },
      { drugName: "Doxycycline 100mg", dosage: "1 tablet", frequency: "1-0-0", duration: "10 days", instructions: "Take with food; avoid sun exposure" }
    ],
    labOrders: ["Complete Blood Count (CBC)", "Liver Function Test (LFT)"],
    followUpDate: "2026-07-02"
  }
];

const INITIAL_LABS: LabReport[] = [
  {
    id: "l-1",
    patientId: "p-1",
    patientName: "Sarah Jenkins",
    testName: "Full Allergy Panel",
    testDate: "2026-05-10",
    status: "completed",
    results: [
      { parameter: "Penicillin IgE", value: "85.2 kU/L", range: "< 0.35 kU/L (High)" },
      { parameter: "Peanut IgE", value: "42.1 kU/L", range: "< 0.35 kU/L (High)" },
      { parameter: "Egg White IgE", value: "0.11 kU/L", range: "< 0.35 kU/L (Normal)" }
    ],
    doctorComments: "Severe Penicillin allergy verified. Absolutely do not prescribe beta-lactam antibiotics."
  },
  {
    id: "l-2",
    patientId: "p-2",
    patientName: "David Miller",
    testName: "Lipid Panel & Serum Creatinine",
    testDate: "2026-06-05",
    status: "completed",
    results: [
      { parameter: "Total Cholesterol", value: "240 mg/dL", range: "< 200 mg/dL (High)" },
      { parameter: "HDL", value: "38 mg/dL", range: "> 40 mg/dL (Low)" },
      { parameter: "LDL", value: "162 mg/dL", range: "< 100 mg/dL (High)" },
      { parameter: "Serum Creatinine", value: "0.9 mg/dL", range: "0.6 - 1.2 mg/dL (Normal)" }
    ],
    doctorComments: "Lipids remain elevated. Strongly advise dietary adjustment. Consider starting statins if unresolved by next follow-up."
  },
  {
    id: "l-3",
    patientId: "p-3",
    patientName: "Elena Rostova",
    testName: "Hormonal Profile",
    testDate: "2026-06-15",
    status: "pending",
    results: []
  }
];

const INITIAL_GALLERY: TreatmentGalleryItem[] = [
  {
    id: "g-1",
    patientId: "p-1",
    patientName: "Sarah Jenkins",
    title: "Forearm Patch Hyperpigmentation",
    date: "2026-06-18",
    beforeUrl: "/skin_before.png",
    afterUrl: "/skin_after.png",
    notes: "Progress after 3 sessions of Q-Switched Nd:YAG laser treatment. Significant pigment clearance observed."
  }
];

// In-memory or localStorage DB wrapper
class MockDatabase {
  private getStorageItem<T>(key: string, defaultValue: T): T {
    if (!isBrowser) return defaultValue;
    const item = localStorage.getItem(`clinicos_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  }

  private setStorageItem<T>(key: string, value: T): void {
    if (!isBrowser) return;
    localStorage.setItem(`clinicos_${key}`, JSON.stringify(value));
  }

  getPatients(): Patient[] {
    return this.getStorageItem('patients', INITIAL_PATIENTS);
  }

  savePatients(patients: Patient[]): void {
    this.setStorageItem('patients', patients);
  }

  getTokens(): QueueToken[] {
    return this.getStorageItem('tokens', INITIAL_TOKENS);
  }

  saveTokens(tokens: QueueToken[]): void {
    this.setStorageItem('tokens', tokens);
  }

  getAppointments(): Appointment[] {
    return this.getStorageItem('appointments', INITIAL_APPOINTMENTS);
  }

  saveAppointments(appointments: Appointment[]): void {
    this.setStorageItem('appointments', appointments);
  }

  getConsultations(): Consultation[] {
    return this.getStorageItem('consultations', INITIAL_CONSULTATIONS);
  }

  saveConsultations(consultations: Consultation[]): void {
    this.setStorageItem('consultations', consultations);
  }

  getLabs(): LabReport[] {
    return this.getStorageItem('labs', INITIAL_LABS);
  }

  saveLabs(labs: LabReport[]): void {
    this.setStorageItem('labs', labs);
  }

  getGallery(): TreatmentGalleryItem[] {
    return this.getStorageItem('gallery', INITIAL_GALLERY);
  }

  saveGallery(gallery: TreatmentGalleryItem[]): void {
    this.setStorageItem('gallery', gallery);
  }

  resetAll(): void {
    if (!isBrowser) return;
    localStorage.removeItem('clinicos_patients');
    localStorage.removeItem('clinicos_tokens');
    localStorage.removeItem('clinicos_appointments');
    localStorage.removeItem('clinicos_consultations');
    localStorage.removeItem('clinicos_labs');
    localStorage.removeItem('clinicos_gallery');
  }
}

export const mockDb = new MockDatabase();

// WebSocket Event System Simulation
type EventCallback = (event: string, data: any) => void;
class EventBus {
  private listeners: Set<EventCallback> = new Set();

  subscribe(callback: EventCallback): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  emit(event: string, data: any): void {
    // console.log(`[WS Event] ${event}`, data);
    this.listeners.forEach(callback => callback(event, data));
  }
}

export const eventBus = new EventBus();

// Simulation helper to perform async updates
export const simulateAsync = <T>(data: T, delay = 250): Promise<T> => {
  return new Promise(resolve => setTimeout(() => resolve(data), delay));
};
