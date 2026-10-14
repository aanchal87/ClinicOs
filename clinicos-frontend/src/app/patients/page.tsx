'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import * as Tabs from '@radix-ui/react-tabs';
import { 
  Users, UserPlus, Search, ArrowLeft, Calendar, 
  Phone, Mail, MapPin, AlertTriangle, FileText, 
  TestTube, ShieldAlert, Check, Plus, Trash2,
  ChevronRight, CalendarDays, ExternalLink, Sliders,
  UploadCloud, FileDown, Eye, CheckCircle2, AlertCircle,
  FileCheck, MessageSquare
} from 'lucide-react';
import { useUiStore } from '@/shared/stores/uiStore';
import { 
  usePatients, useCreatePatient, usePatient, 
  useConsultations, useLabs, useGallery,
  useDocuments, useUploadDocument, useDeleteDocument,
<<<<<<< HEAD
  useAadhaarCheck, usePatientHistory, useSendManualWhatsapp, useUploadClinicalPhoto
=======
  useAadhaarCheck, usePatientHistory, useSendManualWhatsapp
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
} from '@/shared/hooks/useClinicApi';
import Button from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';
import Select from '@/shared/components/ui/Select';
import Badge from '@/shared/components/ui/Badge';
import Avatar from '@/shared/components/ui/Avatar';
import Spinner from '@/shared/components/ui/Spinner';
import documentService from '@/shared/services/documentService';
import { Patient, PatientDocumentType, PrescriptionItem } from '@/shared/types';

// Patient Validation Schema
const patientSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Phone must be at least 10 characters'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  dob: z.string().min(1, 'Date of birth is required'),
  gender: z.enum(['Male', 'Female', 'Other'] as const),
  bloodGroup: z.string().min(1, 'Blood group is required'),
  address: z.string().min(5, 'Address is too short'),
  allergies: z.string().optional(),
  medicalConditions: z.string().optional(),
  aadhaar: z.string().refine(val => {
    if (!val) return true;
    const clean = val.replace(/[^0-9]/g, '');
    return /^\d{12}$/.test(clean);
  }, 'Aadhaar must be a 12-digit number').optional().or(z.literal('')),
  emergencyContact: z.string().optional(),
  treatmentStatus: z.enum(['Consultation', 'Active Treatment', 'Maintenance', 'Completed'] as const)
});

type PatientFormInputs = z.infer<typeof patientSchema>;

<<<<<<< HEAD
function getClinicalPhotoUrl(photoUrl?: string) {
  if (!photoUrl) return '';
  if (/^(https?:|data:|blob:)/i.test(photoUrl)) return photoUrl;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return `${apiUrl.replace(/\/$/, '')}/${photoUrl.replace(/^\/+/, '')}`;
}

=======
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
export default function PatientsPage() {
  const router = useRouter();
  const activePatientId = useUiStore((state) => state.activePatientId);
  const setActivePatientId = useUiStore((state) => state.setActivePatientId);
  const currentRole = useUiStore((state) => state.currentRole);

  const [isRegistering, setIsRegistering] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState('overview');

  const handleUploadReportClick = () => {
    setActiveTab('documents');
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 150);
  };

  // Document Vault State
  const [docSearch, setDocSearch] = useState('');
  const [docCategory, setDocCategory] = useState<string>('all');
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Medicine History Sub-Tab state
  const [medHistoryTab, setMedHistoryTab] = useState<'active' | 'completed'>('active');

  // Follow-ups internal filter state
  const [followupTab, setFollowupTab] = useState<'all' | 'pending' | 'completed'>('all');

  // Gallery slider state
  const [sliderVal, setSliderVal] = useState<number>(50);
<<<<<<< HEAD
  const [galleryBodyArea, setGalleryBodyArea] = useState('Face');
  const [galleryNotes, setGalleryNotes] = useState('');
  const [beforePhotoFile, setBeforePhotoFile] = useState<File | null>(null);
  const [afterPhotoFile, setAfterPhotoFile] = useState<File | null>(null);
  const [galleryUploadError, setGalleryUploadError] = useState('');
=======
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec

  // WhatsApp States
  const [isSendingWhatsapp, setIsSendingWhatsapp] = useState(false);
  const [whatsappMessageText, setWhatsappMessageText] = useState('');
  const sendWhatsappMutation = useSendManualWhatsapp();

  // API Queries
  const { data: patientsRaw, isLoading: listLoading } = usePatients();
  const patients = patientsRaw ?? [];

  const { data: activePatientData, isLoading: detailLoading, isError: detailError } = usePatientHistory(activePatientId);
  const activePatient = (activePatientData?.patient ? {
    ...activePatientData.patient,
    visits: activePatientData.visits ?? [],
    followUps: activePatientData.followUps ?? [],
    clinicalPhotos: activePatientData.treatmentImages ?? [],
    allergies: activePatientData.patient.allergies ?? [],
    medicalConditions: activePatientData.patient.medicalConditions ?? [],
  } : null) as (Patient & { visits?: any[]; followUps?: any[]; clinicalPhotos?: any[] }) | null;

  const { data: activeConsultsRaw } = useConsultations(activePatientId || undefined);
  const activeConsults = activeConsultsRaw ?? [];

  const { data: activeLabsRaw } = useLabs(activePatientId || undefined);
  const activeLabs = activeLabsRaw ?? [];

  const { data: activeGalleryRaw } = useGallery(activePatientId || undefined);
  const activeGallery = activeGalleryRaw ?? [];

  const { data: activeDocsRaw, isLoading: docsLoading } = useDocuments(activePatientId);
  const activeDocs = activeDocsRaw ?? [];

  const createPatientMutation = useCreatePatient();
  const uploadDocMutation = useUploadDocument();
  const deleteDocMutation = useDeleteDocument();
<<<<<<< HEAD
  const uploadClinicalPhotoMutation = useUploadClinicalPhoto();

  const handleGalleryUpload = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    if (!activePatient?.id || !beforePhotoFile || !afterPhotoFile) {
      setGalleryUploadError('Choose both a before image and an after image.');
      return;
    }

    const maxSize = 10 * 1024 * 1024;
    if (beforePhotoFile.size > maxSize || afterPhotoFile.size > maxSize) {
      setGalleryUploadError('Each image must be 10 MB or smaller.');
      return;
    }

    setGalleryUploadError('');
    try {
      await uploadClinicalPhotoMutation.mutateAsync({
        patientId: activePatient.id,
        file: beforePhotoFile,
        bodyArea: galleryBodyArea,
        photoType: 'BEFORE',
        notes: galleryNotes,
      });
      await uploadClinicalPhotoMutation.mutateAsync({
        patientId: activePatient.id,
        file: afterPhotoFile,
        bodyArea: galleryBodyArea,
        photoType: 'AFTER',
        notes: galleryNotes,
      });
      setBeforePhotoFile(null);
      setAfterPhotoFile(null);
      setGalleryNotes('');
      form.reset();
    } catch (error: any) {
      const message = error?.response?.data?.message;
      setGalleryUploadError(Array.isArray(message) ? message.join(', ') : message || 'Could not upload the treatment images.');
    }
  };
=======
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec

  // Aadhaar verification states
  const [aadhaarCheckResult, setAadhaarCheckResult] = useState<{ exists: boolean; patient?: any } | null>(null);
  const [aadhaarVerified, setAadhaarVerified] = useState(false);

  // Form feedback messages states
  const [formSuccessMessage, setFormSuccessMessage] = useState<string | null>(null);
  const [formErrorMessage, setFormErrorMessage] = useState<string | null>(null);
  const [aadhaarErrorMessage, setAadhaarErrorMessage] = useState<string | null>(null);

  // React Hook Form
  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<PatientFormInputs>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      gender: 'Female',
      treatmentStatus: 'Consultation',
      bloodGroup: 'O+',
      aadhaar: '',
      emergencyContact: ''
    }
  });

  const watchAadhaar = watch('aadhaar');
  const cleanAadhaarVal = watchAadhaar ? watchAadhaar.replace(/[^0-9]/g, '') : '';
  const checkAadhaarMutation = useAadhaarCheck();

  const handleAadhaarVerify = () => {
    setAadhaarErrorMessage(null);
    // console.log(`[Frontend/AadhaarVerify] Verify Button Clicked. Raw Input Value: "${watchAadhaar}"`);
    // console.log(`[Frontend/AadhaarVerify] Sanitized Value: "${cleanAadhaarVal}"`);
    
    if (!cleanAadhaarVal || cleanAadhaarVal.length !== 12) {
      console.warn(`[Frontend/AadhaarVerify] Validation Result: false (Expected 12 digits, got ${cleanAadhaarVal.length})`);
      setAadhaarErrorMessage('Aadhaar must be exactly 12 digits');
      return;
    }
    
    // console.log(`[Frontend/AadhaarVerify] Validation Result: true`);
    // console.log(`[Frontend/AadhaarVerify] Dispatching API Request to '/patients/aadhaar-check'...`);
    
    checkAadhaarMutation.mutate(cleanAadhaarVal, {
      onSuccess: (res) => {
        // console.log(`[Frontend/AadhaarVerify] API Response received:`, res);
        setAadhaarCheckResult(res);
        if (res.exists) {
          console.warn(`[Frontend/AadhaarVerify] Verification Result: already exists`);
          setAadhaarVerified(false);
          setAadhaarErrorMessage('Aadhaar already exists');
        } else {
          // console.log(`[Frontend/AadhaarVerify] Verification Result: unique, verified`);
          setAadhaarVerified(true);
        }
      },
      onError: (err: any) => {
        console.error(`[Frontend/AadhaarVerify] API Request failed:`, err);
        const msg = err.response?.data?.message || err.message;
        if (err.code === 'ERR_NETWORK') {
          setAadhaarErrorMessage('Network error: Unable to connect to server.');
        } else {
          setAadhaarErrorMessage(`Server error checking Aadhaar: ${msg}`);
        }
      }
    });
  };

  const onFormValidationError = (errors: any) => {
    console.warn(`[Frontend/FormSubmit] Validation Result: false (Form has validation errors):`, errors);
    setFormErrorMessage('Validation failed. Please verify required fields.');
  };

  const onSubmit = (data: PatientFormInputs) => {
    // console.log(`[Frontend/FormSubmit] Submit Registration Triggered.`);
    // console.log(`[Frontend/FormSubmit] Input values before mapping:`, data);
    setFormSuccessMessage(null);
    setFormErrorMessage(null);

    const cleanAadhaar = data.aadhaar ? data.aadhaar.replace(/[^0-9]/g, '') : '';
    const allergiesList = data.allergies ? data.allergies.split(',').map(a => a.trim()).filter(Boolean) : [];
    const conditionsList = data.medicalConditions ? data.medicalConditions.split(',').map(c => c.trim()).filter(Boolean) : [];
    
    const requestPayload = {
      ...data,
      aadhaar: cleanAadhaar,
      allergies: allergiesList,
      medicalConditions: conditionsList,
    };
    
    // console.log(`[Frontend/FormSubmit] Sanitized API Payload:`, requestPayload);
    // console.log(`[Frontend/FormSubmit] Dispatching API Request to '/patients'...`);

    createPatientMutation.mutate(requestPayload, {
      onSuccess: (res) => {
        // console.log(`[Frontend/FormSubmit] API Response Succeeded:`, res);
        setFormSuccessMessage('Patient created successfully');
        
        setTimeout(() => {
          setIsRegistering(false);
          setAadhaarVerified(false);
          setAadhaarCheckResult(null);
          setFormSuccessMessage(null);
          reset();
        }, 2000);
      },
      onError: (err: any) => {
        console.error(`[Frontend/FormSubmit] API Response Failed:`, err);
        const status = err.response?.status;
        const msg = err.response?.data?.message || err.message;
        if (status === 409) {
          setFormErrorMessage('Aadhaar already exists');
        } else if (status >= 500) {
          setFormErrorMessage(`Server error: ${msg}`);
        } else if (err.code === 'ERR_NETWORK') {
          setFormErrorMessage('Network error: Unable to connect to server.');
        } else {
          setFormErrorMessage(`Registration failed: ${msg}`);
        }
      }
    });
  };

  // Filter patients list
  const filteredPatients = patients.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.phone.includes(searchQuery) || 
                          (p.patientCustomId && p.patientCustomId.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (p.aadhaar && p.aadhaar.includes(searchQuery)) ||
                          (p.email && p.email.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || p.treatmentStatus === filterStatus;
    return matchesSearch && matchesFilter;
  });

  // Derive Medicine History Entries on-the-fly (Prescription -> Prescription Item -> Medicine History Entry)
  const derivedMedicines = activeConsults.flatMap(consult => {
    return consult.prescriptions.map((rx, idx) => {
      const startDate = new Date(consult.date);
      // Parse duration to extract days (e.g. "14 days" -> 14)
      const durationDays = parseInt(rx.duration) || 7;
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + durationDays);

      const isCompleted = new Date() > endDate;
      return {
        id: `${consult.id}-rx-${idx}`,
        drugName: rx.drugName,
        dosage: rx.dosage,
        frequency: rx.frequency,
        duration: rx.duration,
        startDate: consult.date,
        endDate: endDate.toISOString().split('T')[0],
        prescribingDoctor: 'Dr. Adrian Vance',
        status: isCompleted ? 'completed' : 'active' as const
      };
    });
  }).sort((a, b) => b.startDate.localeCompare(a.startDate));

  // Document Vault filtering
  const filteredDocs = activeDocs.filter(d => {
    const matchesSearch = d.documentName.toLowerCase().includes(docSearch.toLowerCase());
    const matchesCategory = docCategory === 'all' || d.documentType === docCategory;
    return matchesSearch && matchesCategory;
  });

  const selectedDoc = activeDocs.find(d => d.id === selectedDocId);

  // File Upload Handlers (Simulation)
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      triggerUploadSim(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      triggerUploadSim(files[0]);
    }
  };

  const triggerUploadSim = (file: File) => {
    // 10 MB limit per PRD/TRD rule
    if (file.size > 10 * 1024 * 1024) {
      alert("File exceeds maximum limit of 10 MB.");
      return;
    }

    setUploadProgress(0);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 20;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        
        // Map document categories by extension/keywords
        let docType: PatientDocumentType = 'Miscellaneous';
        const nameLower = file.name.toLowerCase();
        if (nameLower.includes('referral')) docType = 'Referral';
        else if (nameLower.includes('consent')) docType = 'Consent';
        else if (nameLower.includes('insurance')) docType = 'Insurance';
        else if (nameLower.includes('prescription') || nameLower.includes('rx')) docType = 'Prescription';
        else if (nameLower.includes('lab') || nameLower.includes('report')) docType = 'Lab Report';

        uploadDocMutation.mutate({
          patientId: activePatientId!,
          file: file,
          type: docType,
          uploadedByName: currentRole === 'doctor' ? 'Dr. Adrian Vance' : 'Receptionist Staff'
        }, {
          onSuccess: () => {
            setUploadProgress(null);
          }
        });
      }
    }, 150);
  };

  const handleDeleteDoc = (docId: string) => {
    if (confirm("Are you sure you want to delete this document?")) {
      deleteDocMutation.mutate({ documentId: docId, patientId: activePatientId! }, {
        onSuccess: () => {
          if (selectedDocId === docId) setSelectedDocId(null);
        }
      });
    }
  };

  const handleDownloadDoc = async (docId: string, name: string) => {
    try {
      const blob = await documentService.downloadDocument(docId);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download document', err);
      alert('Failed to download document');
    }
  };

  // Render Directory
  if (!activePatientId) {
    return (
      <div className="flex flex-col gap-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-clinic-text-primary">Patient Directory</h1>
            <p className="text-sm text-clinic-text-secondary mt-1">
              Search, filter, and review patient demographic profiles.
            </p>
          </div>
          <Button 
            onClick={() => setIsRegistering(true)}
            className="flex items-center gap-2 self-start"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Patient</span>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-clinic-surface border border-clinic-border p-4 rounded-clinic-14 shadow-sm">
          <div className="relative w-full sm:max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-clinic-text-secondary" />
            <input
              type="text"
              placeholder="Search by name, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-clinic-bg border border-clinic-border rounded-clinic-10 focus:outline-none focus:ring-1 focus:ring-clinic-accent focus:border-clinic-accent text-clinic-text-primary"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            {['all', 'Consultation', 'Active Treatment', 'Maintenance', 'Completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-clinic-10 cursor-pointer border transition-all ${
                  filterStatus === status 
                    ? 'bg-clinic-accent text-white border-transparent' 
                    : 'bg-clinic-surface text-clinic-text-secondary border-clinic-border hover:bg-clinic-bg hover:text-clinic-text-primary'
                }`}
              >
                {status === 'all' ? 'All Statuses' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Directory Table */}
        <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 shadow-sm overflow-hidden">
          {listLoading ? (
            <div className="py-16 flex justify-center"><Spinner /></div>
          ) : filteredPatients.length === 0 ? (
            <div className="py-16 text-center text-clinic-text-secondary flex flex-col items-center gap-2 justify-center">
              <Users className="h-10 w-10 text-clinic-border" />
              <p className="text-sm font-semibold">No patients found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-clinic-border bg-clinic-bg/50 text-clinic-text-secondary font-semibold uppercase tracking-wider text-xs">
                    <th className="px-6 py-4">Patient Name</th>
                    <th className="px-6 py-4">Aadhaar</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Blood Group</th>
                    <th className="px-6 py-4">Treatment Status</th>
                    <th className="px-6 py-4">Date Added</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-clinic-border text-clinic-text-primary">
                  {filteredPatients.map((p) => (
                    <tr 
                      key={p.id}
                      onClick={() => setActivePatientId(p.id)}
                      className="hover:bg-clinic-bg/40 cursor-pointer transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={p.name} src={p.avatarUrl} size="sm" />
                          <div className="flex flex-col">
                            <span className="font-semibold text-clinic-text-primary">{p.name}</span>
                            {p.patientCustomId && (
                              <span className="text-[11px] text-clinic-text-secondary font-mono leading-none mt-0.5">{p.patientCustomId}</span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-clinic-text-secondary font-mono text-xs">{p.aadhaar || '—'}</td>
                      <td className="px-6 py-4 text-clinic-text-secondary">{p.phone}</td>
                      <td className="px-6 py-4 font-medium">{p.bloodGroup}</td>
                      <td className="px-6 py-4">
                        <Badge 
                          variant={
                            p.treatmentStatus === 'Active Treatment' 
                              ? 'success' 
                              : p.treatmentStatus === 'Maintenance'
                                ? 'warning'
                                : p.treatmentStatus === 'Completed'
                                  ? 'info'
                                  : 'neutral'
                          }
                        >
                          {p.treatmentStatus}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-clinic-text-secondary">{p.dateAdded}</td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-clinic-accent font-semibold flex items-center justify-end gap-1 text-xs">
                          Open Profile <ChevronRight className="h-3 w-3" />
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* New Patient Registration Drawer */}
        <AnimatePresence>
          {isRegistering && (
            <div className="fixed inset-0 z-50 flex justify-end">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/30 backdrop-blur-[1px]"
                onClick={() => setIsRegistering(false)}
              />
              <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-md bg-clinic-surface border-l border-clinic-border h-full p-6 shadow-2xl flex flex-col z-10"
              >
                <div className="flex justify-between items-center border-b border-clinic-border pb-4 mb-6">
                  <h2 className="text-lg font-bold text-clinic-text-primary">Register New Patient</h2>
                  <button onClick={() => setIsRegistering(false)} className="text-clinic-text-secondary hover:text-clinic-text-primary text-sm font-medium">Cancel</button>
                </div>
                
                <form onSubmit={handleSubmit(onSubmit, onFormValidationError)} className="flex-1 overflow-y-auto pr-1 flex flex-col gap-4">
                  {formSuccessMessage && (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-clinic-10 text-emerald-800 text-xs font-semibold flex items-center gap-1.5 shrink-0">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>{formSuccessMessage}</span>
                    </div>
                  )}

                  {formErrorMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-clinic-10 text-rose-800 text-xs font-semibold flex items-center gap-1.5 shrink-0">
                      <AlertCircle className="h-4 w-4 text-rose-600" />
                      <span>{formErrorMessage}</span>
                    </div>
                  )}

                  {aadhaarErrorMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-clinic-10 text-rose-800 text-xs font-semibold flex items-center gap-1.5 shrink-0">
                      <AlertCircle className="h-4 w-4 text-rose-600" />
                      <span>{aadhaarErrorMessage}</span>
                    </div>
                  )}

                  {/* Aadhaar Verification Row */}
                  <div className="flex gap-2 items-end">
                    <div className="flex-1">
                      <Input 
                        label="Aadhaar Number (12 digits)" 
                        placeholder="e.g. 123456789012" 
                        error={errors.aadhaar?.message} 
                        {...register('aadhaar', {
                          onChange: () => {
                            setAadhaarVerified(false);
                            setAadhaarCheckResult(null);
                            setAadhaarErrorMessage(null);
                          }
                        })}
                      />
                    </div>
                    <Button 
                      type="button" 
                      variant="secondary" 
                      onClick={handleAadhaarVerify}
                      isLoading={checkAadhaarMutation.isPending}
                      disabled={!cleanAadhaarVal || cleanAadhaarVal.length !== 12}
                      className="mb-1"
                    >
                      Verify
                    </Button>
                  </div>

                  {aadhaarCheckResult?.exists && (
                    <div className="p-3 bg-rose-50 border border-rose-100 rounded-clinic-10 text-rose-800 text-xs flex flex-col gap-2">
                      <div className="flex items-center gap-1.5 font-semibold">
                        <AlertCircle className="h-4 w-4 text-rose-600" />
                        <span>Patient already registered!</span>
                      </div>
                      <p>Name: <span className="font-semibold">{aadhaarCheckResult.patient?.fullName}</span></p>
                      <p>Custom ID: <span className="font-semibold font-mono">{aadhaarCheckResult.patient?.patientCustomId}</span></p>
                      <Button 
                        size="sm" 
                        type="button"
                        variant="secondary" 
                        onClick={() => {
                          setActivePatientId(aadhaarCheckResult.patient?.id);
                          setIsRegistering(false);
                          setAadhaarCheckResult(null);
                        }}
                        className="self-start mt-1 text-rose-800 border-rose-200 bg-rose-100/50 hover:bg-rose-100 font-bold"
                      >
                        Open Profile &rarr;
                      </Button>
                    </div>
                  )}

                  {aadhaarVerified && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-100 rounded-clinic-10 text-emerald-800 text-xs flex items-center gap-1.5">
                      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      <span>Aadhaar verified. You can proceed with registration.</span>
                    </div>
                  )}

                  <Input label="Full Name" placeholder="e.g. Jane Doe" error={errors.name?.message} {...register('name')} />
                  <Input label="Phone Number" placeholder="e.g. +1 (555) 000-0000" error={errors.phone?.message} {...register('phone')} />
                  <Input label="Email Address" type="email" placeholder="e.g. jane@example.com" error={errors.email?.message} {...register('email')} />
                  
<<<<<<< HEAD
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
=======
                  <div className="grid grid-cols-2 gap-4">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                    <Input label="Date of Birth" type="date" error={errors.dob?.message} {...register('dob')} />
                    <Select label="Gender" options={[{value: 'Female', label: 'Female'}, {value: 'Male', label: 'Male'}, {value: 'Other', label: 'Other'}]} error={errors.gender?.message} {...register('gender')} />
                  </div>

<<<<<<< HEAD
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
=======
                  <div className="grid grid-cols-2 gap-4">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                    <Input label="Blood Group" placeholder="e.g. O+" error={errors.bloodGroup?.message} {...register('bloodGroup')} />
                    <Select label="Treatment Status" options={[{value: 'Consultation', label: 'Consultation'}, {value: 'Active Treatment', label: 'Active Treatment'}, {value: 'Maintenance', label: 'Maintenance'}, {value: 'Completed', label: 'Completed'}]} error={errors.treatmentStatus?.message} {...register('treatmentStatus')} />
                  </div>

                  <Input label="Full Address" placeholder="e.g. 123 Main St, Springfield" error={errors.address?.message} {...register('address')} />
                  
                  <Input label="Allergies (comma-separated)" placeholder="e.g. Penicillin, Pollen" error={errors.allergies?.message} {...register('allergies')} />
                  <Input label="Medical Conditions (comma-separated)" placeholder="e.g. Asthma, Hypertension" error={errors.medicalConditions?.message} {...register('medicalConditions')} />
                  <Input label="Emergency Contact (Name: Phone)" placeholder="e.g. John Doe: 555-0100" error={errors.emergencyContact?.message} {...register('emergencyContact')} />
                  
                  <Button 
                    type="submit" 
                    isLoading={createPatientMutation.isPending} 
                    disabled={!aadhaarVerified}
                    className="w-full mt-6"
                  >
                    Save Patient Record
                  </Button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ----------------------------------------------------
  // FLAGSHIP PATIENT 360 WORKSPACE RENDER
  // ----------------------------------------------------
  if (detailLoading) {
    return <div className="h-[70vh] flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (detailError || !activePatient) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-4 text-center">
        <div className="p-4 bg-rose-50 text-rose-500 rounded-full">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h3 className="text-lg font-semibold text-clinic-text-primary">Error Loading Patient Profile</h3>
        <p className="text-sm text-clinic-text-secondary max-w-md">
          We encountered an error retrieving this patient's medical records or the patient does not exist.
        </p>
        <Button onClick={() => { setActivePatientId(null); setActiveTab('overview'); }} variant="secondary" size="sm">
          Return to Directory
        </Button>
      </div>
    );
  }

  const latestConsult = activeConsults[0];
  const latestLab = activeLabs.find(l => l.status === 'completed' || l.status === 'flagged');

  // Parser helper to parse string dates to timestamp
  const parseTimestamp = (dateVal: any) => {
    if (!dateVal) return 0;
    const parsed = Date.parse(dateVal);
    if (!isNaN(parsed)) return parsed;
    return new Date(dateVal).getTime() || 0;
  };

  const timelineEvents = (() => {
    const events: any[] = [];

    // 1. Patient Registration
    if (activePatient) {
      events.push({
        id: `reg-${activePatient.id}`,
        date: activePatient.createdAt || activePatient.dateAdded,
        title: 'Patient Registered',
        description: 'Patient demographic profile registered in ClinicOS.',
        details: `Custom ID: ${activePatient.patientCustomId || '—'} • Masked Aadhaar: ${activePatient.aadhaar || '—'}`,
        icon: Users,
        iconBg: 'bg-emerald-500 text-white',
      });
    }

    // 2. Visits & 3. Queue Tokens
    if (activePatient?.visits) {
      activePatient.visits.forEach((v: any) => {
        events.push({
          id: `visit-${v.id}`,
          date: v.createdAt,
          title: `Visit Created`,
          description: `Reason: ${v.reason || 'Consultation'}`,
          details: v.notes ? `Notes: ${v.notes}` : undefined,
          icon: CalendarDays,
          iconBg: 'bg-indigo-500 text-white',
        });

        if (v.token) {
          events.push({
            id: `token-${v.token.id}`,
            date: v.token.createdAt || v.createdAt,
            title: `Queue Token Generated: ${v.token.tokenNumber}`,
            description: `Priority: ${v.token.priority.toUpperCase()} • Check-in reason: ${v.token.visitReason}`,
            details: `Status: ${v.token.status} • Checked-in at: ${v.token.checkInTime}`,
            icon: Plus,
            iconBg: 'bg-indigo-600 text-white',
          });
        }
      });
    }

    // 4. Consultations & 5. Prescriptions
    activeConsults.forEach((c) => {
      events.push({
        id: `consult-${c.id}`,
        date: c.date,
        title: 'Consultation SOAP Note Signed',
        description: `Diagnosis: ${c.soapNotes.assessment || 'General Evaluation'}`,
        details: `Subjective: ${c.soapNotes.subjective} • Objective: ${c.soapNotes.objective} • Plan: ${c.soapNotes.plan}`,
        icon: FileText,
        iconBg: 'bg-clinic-accent text-white',
      });

      if (c.prescriptions && (c.prescriptions ?? []).length > 0) {
        events.push({
          id: `rx-${c.id}`,
          date: c.date,
          title: 'Prescription Issued',
          description: `Regimen Rx-${c.id.slice(-4)}`,
          details: (c.prescriptions ?? []).map(p => `${p.drugName} (${p.dosage} ${p.frequency} x ${p.duration})`).join(', '),
          icon: Check,
          iconBg: 'bg-emerald-500 text-white',
        });
      }
    });

    // 6. Lab Reports
    activeLabs.forEach((l) => {
      events.push({
        id: `lab-${l.id}`,
        date: l.testDate,
        title: `Lab Report Released: ${l.testName}`,
        description: `Status: ${l.status.toUpperCase()}`,
        details: l.results ? (l.results ?? []).map(r => `${r.parameter}: ${r.value}`).join(' • ') : '',
        icon: TestTube,
        iconBg: 'bg-blue-500 text-white',
      });
    });

    // 7. Follow-Ups
    if (activePatient?.followUps) {
      activePatient.followUps.forEach((f: any) => {
        events.push({
          id: `follow-${f.id}`,
          date: f.dueDate,
          title: `Follow-Up Recall Scheduled`,
          description: `Reason: ${f.reason || 'General progress check'}`,
          details: `Due date: ${f.dueDate} • Priority: ${f.priority} • Status: ${f.status}`,
          icon: Calendar,
          iconBg: 'bg-amber-500 text-white',
        });
      });
    }

    // 8. Documents
    activeDocs.forEach((d) => {
      events.push({
        id: `doc-${d.id}`,
        date: d.createdAt,
        title: `Document Uploaded: ${d.documentName}`,
        description: `Type: ${d.documentType} • Size: ${d.fileSize}`,
        details: `Uploaded by: ${d.uploadedBy || 'Staff'}`,
        icon: FileCheck,
        iconBg: 'bg-purple-500 text-white',
      });
    });

    // 9. Treatment Images
    if (activePatient?.clinicalPhotos) {
      activePatient.clinicalPhotos.forEach((p: any) => {
        events.push({
          id: `photo-${p.id}`,
          date: p.takenAt || p.createdAt,
          title: `Clinical Photo Saved (${p.photoType})`,
          description: `Body area: ${p.bodyArea}`,
          details: p.notes || 'No clinical notes added to photo.',
          imageUrl: p.photoUrl,
          icon: Sliders,
          iconBg: 'bg-rose-500 text-white',
        });
      });
    }

    // Sort events descending by date
    return events.sort((a, b) => parseTimestamp(b.date) - parseTimestamp(a.date));
  })();

  return (
    <div className="flex flex-col gap-6">
      {/* Top action breadcrumb row */}
      <div className="flex justify-between items-center pb-4 border-b border-clinic-border">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => { setActivePatientId(null); setActiveTab('overview'); }}
          className="flex items-center gap-2 text-xs font-semibold cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Directory</span>
        </Button>
        <Badge variant="neutral">{activePatient.id}</Badge>
      </div>

      {/* Patient Quick Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-clinic-surface border border-clinic-border p-4 rounded-clinic-14 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-clinic-text-secondary uppercase tracking-wider">Patient Quick Actions</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button 
            size="sm" 
            onClick={() => router.push('/consultations')}
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Consultation</span>
          </Button>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => router.push('/consultations')}
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>New Prescription</span>
          </Button>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={handleUploadReportClick}
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <UploadCloud className="h-3.5 w-3.5" />
            <span>Upload Report</span>
          </Button>
          <Button 
            size="sm" 
            variant="secondary"
            onClick={() => setIsSendingWhatsapp(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/20"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Send WhatsApp</span>
          </Button>
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => router.push('/calendar')}
            className="flex items-center gap-1.5 text-xs font-semibold"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Schedule Follow-Up</span>
          </Button>
        </div>
      </div>

      {/* Flagship 3-Column Layout */}
<<<<<<< HEAD
      <div className="grid grid-cols-1 2xl:grid-cols-[300px_minmax(0,1fr)_340px] gap-4 sm:gap-6 items-start max-w-[1800px] w-full min-w-0">
        
        {/* LEFT RAIL (320px): Demographic & Warnings */}
        <section className="bg-clinic-surface border border-clinic-border rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col gap-5 w-full 2xl:col-start-1">
=======
      <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr_360px] gap-8 items-start max-w-[1800px] w-full">
        
        {/* LEFT RAIL (320px): Demographic & Warnings */}
        <section className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-6 shadow-sm flex flex-col gap-6 w-full">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
          <div className="flex flex-col items-center text-center pb-6 border-b border-clinic-border">
            <Avatar name={activePatient.name} src={activePatient.avatarUrl} size="lg" className="shadow-md mb-4" />
            <h2 className="text-lg font-bold tracking-tight text-clinic-text-primary">{activePatient.name}</h2>
            <Badge variant="info" className="mt-2">{activePatient.treatmentStatus}</Badge>
          </div>

          <div className="flex flex-col gap-4 border-b border-clinic-border pb-6 text-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary">Patient Demographics</h3>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-clinic-text-secondary font-medium">Born</span>
                <span className="text-clinic-text-primary font-semibold">{activePatient.dob}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-clinic-text-secondary font-medium">Gender</span>
                <span className="text-clinic-text-primary font-semibold">{activePatient.gender}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-clinic-text-secondary font-medium">Blood Group</span>
                <span className="text-clinic-text-primary font-bold">{activePatient.bloodGroup}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-b border-clinic-border pb-6 text-sm">
            <h3 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary">Contact Details</h3>
            <div className="flex flex-col gap-3">
              <span className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-clinic-text-secondary shrink-0" />
                {activePatient.phone}
              </span>
              <span className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-clinic-text-secondary shrink-0" />
                <span className="truncate">{activePatient.email}</span>
              </span>
              <span className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-clinic-text-secondary shrink-0 mt-0.5" />
                <span>{activePatient.address}</span>
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary">Clinical Warnings</h3>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-clinic-text-secondary">Allergies:</span>
                {activePatient.allergies.length === 0 ? (
                  <span className="text-xs text-clinic-text-secondary italic">No known allergies</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {activePatient.allergies.map(all => (
                      <span key={all} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold bg-red-50 dark:bg-red-950/20 text-clinic-danger border border-red-200 dark:border-red-900/40">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        {all}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-1.5 mt-2">
                <span className="text-xs font-semibold text-clinic-text-secondary">Conditions:</span>
                {activePatient.medicalConditions.length === 0 ? (
                  <span className="text-xs text-clinic-text-secondary italic">No diagnosed conditions</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {activePatient.medicalConditions.map(cond => (
                      <span key={cond} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-clinic-text-primary border border-clinic-border">
                        {cond}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* CENTER WORKSPACE (Radix Tabs Content) */}
<<<<<<< HEAD
        <section className="min-w-0 2xl:col-start-2">
=======
        <section className="min-w-0">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
          <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="w-full flex flex-col gap-6">
            {/* Tabs List Navigation */}
            <Tabs.List className="flex gap-2 border-b border-clinic-border overflow-x-auto pb-px scrollbar-none">
              {[
                { label: 'Overview', value: 'overview' },
                { label: 'Timeline', value: 'timeline' },
                { label: 'Consultations', value: 'consultations' },
                { label: 'Prescriptions', value: 'prescriptions' },
                { label: 'Laboratory', value: 'laboratory' },
                { label: 'Medicines', value: 'medicines' },
                { label: 'Follow-Ups', value: 'followups' },
                { label: 'Documents', value: 'documents' },
                { label: 'Gallery', value: 'gallery' }
              ].map(tab => (
                <Tabs.Trigger
                  key={tab.value}
                  value={tab.value}
                  className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-clinic-text-secondary border-b-2 border-transparent data-[state=active]:border-clinic-accent data-[state=active]:text-clinic-accent hover:text-clinic-text-primary cursor-pointer transition-all shrink-0 focus:outline-none"
                >
                  {tab.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>

            {/* TAB 1: OVERVIEW */}
            <Tabs.Content value="overview" className="focus:outline-none flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Patient Snapshot & Status */}
                <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-5 shadow-sm flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary">Patient Snapshot</h3>
                  <div className="flex flex-col gap-2 text-sm text-clinic-text-primary">
                    <p>Current treatment stage: <Badge variant="success">{activePatient.treatmentStatus}</Badge></p>
                    <p>Date added: <span className="font-semibold">{activePatient.dateAdded}</span></p>
                    <p>Contact profile: <span className="font-semibold">{activePatient.phone}</span></p>
                  </div>
                </div>

                {/* Clinical Warnings */}
                <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-5 shadow-sm flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary">Clinical Warnings</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {activePatient.allergies.map(a => (
                      <Badge key={a} variant="danger">{a} (Allergy)</Badge>
                    ))}
                    {activePatient.medicalConditions.map(c => (
                      <Badge key={c} variant="neutral">{c}</Badge>
                    ))}
                    {activePatient.allergies.length === 0 && activePatient.medicalConditions.length === 0 && (
                      <span className="text-xs text-clinic-text-secondary italic">No alerts mapped.</span>
                    )}
                  </div>
                </div>

                {/* Latest Consultation Details */}
                <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-5 shadow-sm md:col-span-2 flex flex-col gap-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary border-b border-clinic-border pb-2">Latest Consultation Summary</h3>
                  {latestConsult ? (
                    <div className="flex flex-col gap-3 text-sm text-clinic-text-primary">
                      <div className="flex justify-between items-center text-xs text-clinic-text-secondary">
                        <span>Date: {latestConsult.date} • Token {latestConsult.tokenNumber}</span>
                        <Badge variant="neutral">Completed</Badge>
                      </div>
                      <p><strong className="text-xs font-bold text-clinic-text-secondary uppercase block mt-1">Diagnosis:</strong> {latestConsult.soapNotes.assessment}</p>
                      <p><strong className="text-xs font-bold text-clinic-text-secondary uppercase block mt-1">Treatment Plan:</strong> {latestConsult.soapNotes.plan}</p>
                      
                      {(latestConsult?.prescriptions ?? []).length > 0 && (
                        <div className="mt-3">
                          <strong className="text-xs font-bold text-clinic-text-secondary uppercase block mb-2">Prescribed Regimen</strong>
                          <div className="flex flex-col gap-1.5">
                            {(latestConsult?.prescriptions ?? []).map((p, i) => (
                              <div key={i} className="text-xs p-2 bg-clinic-bg border border-clinic-border rounded-clinic-6 flex justify-between">
                                <span><strong>{p.drugName}</strong> ({p.dosage})</span>
                                <span className="text-clinic-text-secondary">{p.frequency} • {p.duration}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-clinic-text-secondary italic">No consultations logged.</span>
                  )}
                </div>

                {/* Latest Lab Report & Upcoming Recalls */}
                <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-5 shadow-sm flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary">Latest Lab Report</h3>
                  {latestLab ? (
                    <div className="flex flex-col gap-1 text-xs text-clinic-text-primary">
                      <span className="font-bold">{latestLab.testName}</span>
                      <span className="text-clinic-text-secondary">Released {latestLab.testDate}</span>
                      <Badge variant={latestLab.status === 'flagged' ? 'danger' : 'success'} className="mt-2 w-max">
                        {latestLab.status}
                      </Badge>
                    </div>
                  ) : (
                    <span className="text-xs text-clinic-text-secondary italic">No lab reports completed.</span>
                  )}
                </div>

                <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-5 shadow-sm flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary">Upcoming Follow-Up</h3>
                  {latestConsult && latestConsult.followUpDate ? (
                    <div className="flex flex-col gap-1 text-xs text-clinic-text-primary">
                      <span className="font-bold flex items-center gap-1 text-clinic-warning">
                        <CalendarDays className="h-4 w-4" /> Progress Recall
                      </span>
                      <span className="text-clinic-text-secondary">Scheduled for {latestConsult.followUpDate}</span>
                    </div>
                  ) : (
                    <span className="text-xs text-clinic-text-secondary italic">No follow-ups scheduled.</span>
                  )}
                </div>

                {/* Recent Activity List */}
                <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-5 shadow-sm md:col-span-2 flex flex-col gap-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary border-b border-clinic-border pb-2">Recent Patient Activity</h3>
                  <div className="flex flex-col gap-2.5">
                    {latestConsult && (
                      <div className="text-xs flex justify-between items-center py-1">
                        <span className="text-clinic-text-primary font-medium">SOAP Consultation Note Saved</span>
                        <span className="text-clinic-text-secondary">{latestConsult.date}</span>
                      </div>
                    )}
                    {latestLab && (
                      <div className="text-xs flex justify-between items-center py-1">
                        <span className="text-clinic-text-primary font-medium">Lab Investigation Finished: {latestLab.testName}</span>
                        <span className="text-clinic-text-secondary">{latestLab.testDate}</span>
                      </div>
                    )}
                    {activeDocs.slice(0, 2).map(d => (
                      <div key={d.id} className="text-xs flex justify-between items-center py-1">
                        <span className="text-clinic-text-primary font-medium">Uploaded Document: {d.documentName}</span>
                        <span className="text-clinic-text-secondary">{d.createdAt}</span>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </Tabs.Content>

            {/* TAB 2: TIMELINE */}
            <Tabs.Content value="timeline" className="focus:outline-none flex flex-col gap-6">
              {timelineEvents.length === 0 ? (
                <div className="py-16 text-center text-clinic-text-secondary flex flex-col items-center gap-2 justify-center bg-clinic-surface border border-clinic-border rounded-clinic-14 shadow-sm">
                  <FileText className="h-10 w-10 text-clinic-border" />
                  <p className="text-sm font-semibold">No timeline events logged</p>
                </div>
              ) : (
                <div className="relative border-l-2 border-clinic-border pl-6 ml-4 space-y-8 py-2">
                  {timelineEvents.map((event) => {
                    const IconComponent = event.icon;
                    return (
                      <div key={event.id} className="relative">
                        {/* Timeline node icon */}
                        <div className={`absolute -left-[36px] top-1 ${event.iconBg} p-1.5 rounded-full border-2 border-clinic-bg shadow-sm flex items-center justify-center`}>
                          <IconComponent className="h-3.5 w-3.5" />
                        </div>
                        
                        {/* Card item */}
                        <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-2">
                          <div className="flex justify-between items-start">
                            <span className="text-[11px] font-bold text-clinic-text-secondary uppercase tracking-wider">
                              {new Date(event.date).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                            {event.imageUrl && (
                              <span className="text-xs px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-bold border border-rose-100">Image attached</span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-clinic-text-primary leading-snug">
                            {event.title}
                          </h4>
                          <p className="text-xs text-clinic-text-secondary leading-relaxed">
                            {event.description}
                          </p>
                          {event.details && (
                            <div className="text-[11px] text-clinic-text-secondary/80 bg-clinic-bg p-2 rounded-clinic-8 border border-clinic-border/60 mt-1 font-mono">
                              {event.details}
                            </div>
                          )}
                          {event.imageUrl && (
                            <div className="mt-2 rounded-clinic-10 overflow-hidden border border-clinic-border max-w-[200px]">
                              <img src={event.imageUrl} alt={event.title} className="object-cover w-full max-h-[140px] hover:scale-105 transition-transform duration-300" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Tabs.Content>

            {/* TAB 3: CONSULTATIONS */}
            <Tabs.Content value="consultations" className="focus:outline-none flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                {activeConsults.map((c) => (
                  <div key={c.id} className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-5 shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-center text-xs text-clinic-text-secondary border-b border-clinic-border pb-2">
                      <span>Date: {c.date} • Token {c.tokenNumber}</span>
                      <span>By: Dr. Adrian Vance</span>
                    </div>
<<<<<<< HEAD
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs mt-1">
=======
                    <div className="grid grid-cols-2 gap-4 text-xs mt-1">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                      <p><strong>Subjective:</strong> {c.soapNotes.subjective}</p>
                      <p><strong>Objective:</strong> {c.soapNotes.objective}</p>
                      <p><strong>Assessment:</strong> {c.soapNotes.assessment}</p>
                      <p><strong>Plan:</strong> {c.soapNotes.plan}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Tabs.Content>

            {/* TAB 4: PRESCRIPTIONS */}
            <Tabs.Content value="prescriptions" className="focus:outline-none flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                {activeConsults.map((c) => (
                  <div key={c.id} className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-5 shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-clinic-border pb-2 text-xs text-clinic-text-secondary">
                      <span>Prescribed on: {c.date}</span>
                      <Badge variant="neutral">Rx-{c.id.slice(-4)}</Badge>
                    </div>
                    {(c.prescriptions ?? []).map((rx, idx) => (
                      <div key={idx} className="text-xs p-2.5 bg-clinic-bg border border-clinic-border rounded-clinic-10 flex justify-between">
                        <span><strong>{rx.drugName}</strong> ({rx.dosage})</span>
                        <span className="text-clinic-text-secondary">{rx.frequency} ({rx.duration})</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </Tabs.Content>

            {/* TAB 5: LABORATORY */}
            <Tabs.Content value="laboratory" className="focus:outline-none flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                {activeLabs.map((l) => (
                  <div key={l.id} className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-5 shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-center border-b border-clinic-border pb-2 text-xs text-clinic-text-secondary">
                      <span>Released: {l.testDate}</span>
                      <Badge variant={l.status === 'flagged' ? 'danger' : 'success'}>{l.status}</Badge>
                    </div>
                    <h4 className="text-sm font-bold">{l.testName}</h4>
                    {(l.results ?? []).map((res, i) => (
                      <div key={i} className="text-xs p-2 bg-clinic-bg border border-clinic-border rounded-clinic-10 flex justify-between">
                        <span>{res.parameter}</span>
                        <span><strong>{res.value}</strong> ({res.range})</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </Tabs.Content>

            {/* TAB 6: MEDICINES (Derived History preserves *every* prescription event) */}
            <Tabs.Content value="medicines" className="focus:outline-none flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                {/* Active / Completed sub tabs switcher */}
                <div className="flex p-1 bg-clinic-bg border border-clinic-border rounded-clinic-14 text-xs font-semibold self-start">
                  <button
                    onClick={() => setMedHistoryTab('active')}
                    className={`px-3 py-1.5 rounded-clinic-10 cursor-pointer ${medHistoryTab === 'active' ? 'bg-clinic-surface text-clinic-text-primary shadow-sm' : 'text-clinic-text-secondary hover:text-clinic-text-primary'}`}
                  >
                    Active Medicines
                  </button>
                  <button
                    onClick={() => setMedHistoryTab('completed')}
                    className={`px-3 py-1.5 rounded-clinic-10 cursor-pointer ${medHistoryTab === 'completed' ? 'bg-clinic-surface text-clinic-text-primary shadow-sm' : 'text-clinic-text-secondary hover:text-clinic-text-primary'}`}
                  >
                    Completed Medicines
                  </button>
                </div>

                {/* List derived entries */}
                <div className="flex flex-col gap-3">
                  {derivedMedicines.filter(m => m.status === medHistoryTab).length === 0 ? (
                    <div className="py-12 bg-clinic-surface border border-clinic-border rounded-clinic-14 text-center text-clinic-text-secondary text-xs italic">
                      No {medHistoryTab} medicines recorded.
                    </div>
                  ) : (
                    derivedMedicines.filter(m => m.status === medHistoryTab).map((m) => (
                      <div key={m.id} className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-4 shadow-sm flex flex-col sm:flex-row justify-between gap-3 text-xs leading-relaxed">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-bold text-sm text-clinic-text-primary">{m.drugName}</span>
                          <span className="text-clinic-text-secondary">Dosage: {m.dosage} • Frequency: {m.frequency}</span>
                          <span className="text-[10px] text-clinic-text-secondary mt-1">Prescribed by {m.prescribingDoctor}</span>
                        </div>
                        <div className="text-left sm:text-right flex flex-col justify-center">
                          <span className="font-semibold text-clinic-text-primary">Duration: {m.duration}</span>
                          <span className="text-[10px] text-clinic-text-secondary mt-0.5">Started: {m.startDate} • Ending: {m.endDate}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </Tabs.Content>

            {/* TAB 7: FOLLOW-UPS (Linear Inbox Workflow) */}
            <Tabs.Content value="followups" className="focus:outline-none flex flex-col gap-6">
              <div className="flex flex-col gap-4">
                {/* Active list filters */}
                <div className="flex p-1 bg-clinic-bg border border-clinic-border rounded-clinic-14 text-xs font-semibold self-start">
                  {['all', 'pending', 'completed'].map((tabVal) => (
                    <button
                      key={tabVal}
                      onClick={() => setFollowupTab(tabVal as any)}
                      className={`px-3 py-1.5 rounded-clinic-10 cursor-pointer capitalize ${followupTab === tabVal ? 'bg-clinic-surface text-clinic-text-primary shadow-sm' : 'text-clinic-text-secondary hover:text-clinic-text-primary'}`}
                    >
                      {tabVal} Recalls
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-2.5">
                  {latestConsult && latestConsult.followUpDate ? (
                    <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-4 shadow-sm flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <div className="h-6 w-6 rounded-full bg-clinic-warning/10 text-clinic-warning flex items-center justify-center">
                          <CalendarDays className="h-4 w-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-clinic-text-primary">Progress Recall Assessment</span>
                          <span className="text-clinic-text-secondary mt-0.5">Recall due date: {latestConsult.followUpDate}</span>
                        </div>
                      </div>
                      <Badge variant="warning">Recalling</Badge>
                    </div>
                  ) : (
                    <div className="py-12 bg-clinic-surface border border-clinic-border rounded-clinic-14 text-center text-clinic-text-secondary text-xs italic">
                      No follow-ups logged.
                    </div>
                  )}
                </div>
              </div>
            </Tabs.Content>

            {/* TAB 8: DOCUMENT MANAGEMENT VAULT */}
            <Tabs.Content value="documents" className="focus:outline-none flex flex-col gap-6">
              <div className="flex flex-col gap-6">
                
                {/* Category selectors and search filters row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-clinic-surface border border-clinic-border p-4 rounded-clinic-14 shadow-sm">
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-clinic-text-secondary" />
                    <input
                      type="text"
                      placeholder="Search document name..."
                      value={docSearch}
                      onChange={(e) => setDocSearch(e.target.value)}
                      className="w-full pl-9 pr-3 py-1.5 text-sm bg-clinic-bg border border-clinic-border rounded-clinic-10 focus:outline-none focus:ring-1 focus:ring-clinic-accent text-clinic-text-primary"
                    />
                  </div>

                  <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                    {['all', 'Referral', 'Consent', 'Insurance', 'Miscellaneous'].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setDocCategory(cat)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-clinic-10 border cursor-pointer transition-all ${
                          docCategory === cat 
                            ? 'bg-clinic-accent text-white border-transparent' 
                            : 'bg-clinic-surface text-clinic-text-secondary border-clinic-border hover:bg-clinic-bg'
                        }`}
                      >
                        {cat === 'all' ? 'All categories' : cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Drag & Drop Dropzone */}
                {currentRole === 'receptionist' && (
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-clinic-14 p-8 text-center flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${
                      isDragging 
                        ? 'border-clinic-accent bg-clinic-accent/5' 
                        : 'border-clinic-border hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <UploadCloud className="h-8 w-8 text-clinic-text-secondary" />
                    <span className="text-sm font-semibold text-clinic-text-primary">Drag and drop file here, or click to browse</span>
                    <span className="text-xs text-clinic-text-secondary">PDF, PNG, JPG files up to 10 MB accepted</span>

                    {/* Progress indicators overlay */}
                    {uploadProgress !== null && (
                      <div className="w-full max-w-xs mt-3 flex flex-col gap-1.5">
                        <div className="w-full h-1.5 bg-clinic-bg rounded-full overflow-hidden">
                          <div className="h-full bg-clinic-accent transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                        </div>
                        <span className="text-[10px] text-clinic-text-secondary">Simulating secure virus scan & upload ({uploadProgress}%)</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Documents Grid Cards (Dropbox/Notion Feel) */}
                {docsLoading ? (
                  <div className="py-8 flex justify-center"><Spinner /></div>
                ) : filteredDocs.length === 0 ? (
                  <div className="py-12 text-center text-clinic-text-secondary text-xs italic bg-clinic-surface border border-clinic-border rounded-clinic-14 shadow-sm">
                    No files uploaded in this folder.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredDocs.map((doc) => (
                      <div 
                        key={doc.id}
                        className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-4 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative group"
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="p-2 bg-clinic-bg border border-clinic-border rounded-clinic-10 text-clinic-text-secondary shrink-0">
                            <FileCheck className="h-5 w-5 text-clinic-accent" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-bold text-clinic-text-primary truncate">{doc.documentName}</span>
                            <span className="text-[10px] text-clinic-text-secondary uppercase mt-0.5">{doc.documentType}</span>
                            <span className="text-[10px] text-clinic-text-secondary mt-1">Size: {doc.fileSize} • Uploaded: {doc.createdAt}</span>
                          </div>
                        </div>

                        {/* Card Hover Action panel */}
                        <div className="flex gap-2 border-t border-clinic-border pt-3 mt-4 justify-end">
                          <button
                            onClick={() => setSelectedDocId(doc.id)}
                            className="p-1.5 text-clinic-text-secondary hover:text-clinic-text-primary hover:bg-clinic-bg rounded-md border border-clinic-border cursor-pointer"
                            title="Preview file"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => handleDownloadDoc(doc.id, doc.documentName)}
                            className="p-1.5 text-clinic-text-secondary hover:text-clinic-text-primary hover:bg-clinic-bg rounded-md border border-clinic-border cursor-pointer"
                            title="Download file"
                          >
                            <FileDown className="h-3.5 w-3.5" />
                          </button>
                          {currentRole === 'receptionist' && (
                            <button
                              onClick={() => handleDeleteDoc(doc.id)}
                              className="p-1.5 text-clinic-text-secondary hover:text-clinic-danger hover:bg-red-50 dark:hover:bg-red-950/20 rounded-md border border-clinic-border cursor-pointer"
                              title="Delete file"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Tabs.Content>

<<<<<<< HEAD
            {/* TAB 9: BEFORE / AFTER GALLERY */}
            <Tabs.Content value="gallery" className="focus:outline-none flex flex-col gap-6">
              <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-5 shadow-sm flex flex-col gap-4">
                <div>
                  <h4 className="font-bold">Add treatment comparison</h4>
                  <p className="text-xs text-clinic-text-secondary mt-1">Upload a before and after image for this patient. JPEG, PNG, or WebP, up to 10 MB each.</p>
                </div>
                {(currentRole === 'doctor' || currentRole === 'super_admin') && (
                  <form onSubmit={handleGalleryUpload} className="grid gap-4 md:grid-cols-2">
                    <label className="flex flex-col gap-2 text-xs font-semibold">
                      Before image
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        required
                        onChange={(event) => setBeforePhotoFile(event.target.files?.[0] ?? null)}
                        className="w-full rounded-lg border border-clinic-border bg-clinic-bg p-2 text-xs file:mr-3 file:rounded-md file:border-0 file:bg-clinic-accent file:px-3 file:py-1.5 file:font-semibold file:text-white"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-xs font-semibold">
                      After image
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        required
                        onChange={(event) => setAfterPhotoFile(event.target.files?.[0] ?? null)}
                        className="w-full rounded-lg border border-clinic-border bg-clinic-bg p-2 text-xs file:mr-3 file:rounded-md file:border-0 file:bg-clinic-accent file:px-3 file:py-1.5 file:font-semibold file:text-white"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-xs font-semibold">
                      Body area
                      <input
                        value={galleryBodyArea}
                        onChange={(event) => setGalleryBodyArea(event.target.value)}
                        maxLength={100}
                        required
                        placeholder="Face, hands, etc."
                        className="rounded-lg border border-clinic-border bg-clinic-bg px-3 py-2 text-sm font-normal"
                      />
                    </label>
                    <label className="flex flex-col gap-2 text-xs font-semibold">
                      Notes <span className="font-normal text-clinic-text-secondary">(optional)</span>
                      <input
                        value={galleryNotes}
                        onChange={(event) => setGalleryNotes(event.target.value)}
                        maxLength={2000}
                        placeholder="Treatment or progress notes"
                        className="rounded-lg border border-clinic-border bg-clinic-bg px-3 py-2 text-sm font-normal"
                      />
                    </label>
                    <div className="md:col-span-2 flex flex-col items-end gap-2">
                      {galleryUploadError && <p role="alert" className="w-full text-xs text-clinic-danger">{galleryUploadError}</p>}
                      <Button type="submit" isLoading={uploadClinicalPhotoMutation.isPending} disabled={uploadClinicalPhotoMutation.isPending}>
                        <UploadCloud className="mr-2 h-4 w-4" /> Save before and after images
                      </Button>
                    </div>
                  </form>
                )}
              </div>

=======
            {/* TAB 9: GALLERY GALLERY SLIDER */}
            <Tabs.Content value="gallery" className="focus:outline-none flex flex-col gap-6">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
              {activeGallery.length === 0 ? (
                <div className="py-12 bg-clinic-surface border border-clinic-border rounded-clinic-14 text-center text-clinic-text-secondary text-xs italic">
                  No treatment comparison images logged.
                </div>
              ) : (
                <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-6 shadow-sm flex flex-col gap-6">
                  <div className="flex justify-between items-center border-b border-clinic-border pb-3">
                    <div className="flex flex-col">
                      <h4 className="font-bold">{activeGallery[0].title}</h4>
                      <span className="text-xs text-clinic-text-secondary">Released {activeGallery[0].date}</span>
                    </div>
                  </div>

                  <div className="relative w-full max-w-xl mx-auto h-[350px] border border-clinic-border rounded-clinic-14 overflow-hidden select-none shadow-md bg-zinc-950">
<<<<<<< HEAD
                    <img src={getClinicalPhotoUrl(activeGallery[0].beforeUrl)} alt="Before" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                    <div className="absolute left-4 top-4 z-10 bg-black/60 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider">Before</div>

                    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none" style={{ clipPath: `inset(0 0 0 ${sliderVal}%)` }}>
                      <img src={getClinicalPhotoUrl(activeGallery[0].afterUrl)} alt="After" className="absolute inset-0 w-full h-full object-cover" style={{ width: '100%', height: '100%' }} />
=======
                    <img src={activeGallery[0].beforeUrl} alt="Before" className="absolute inset-0 w-full h-full object-cover pointer-events-none" />
                    <div className="absolute left-4 top-4 z-10 bg-black/60 px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider">Before</div>

                    <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none" style={{ clipPath: `inset(0 0 0 ${sliderVal}%)` }}>
                      <img src={activeGallery[0].afterUrl} alt="After" className="absolute inset-0 w-full h-full object-cover" style={{ width: '100%', height: '100%' }} />
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                    </div>
                    <div className="absolute right-4 top-4 z-10 bg-clinic-accent px-2 py-0.5 rounded text-[10px] font-bold text-white uppercase tracking-wider">After</div>

                    <div className="absolute inset-y-0 w-0.5 bg-white z-20 pointer-events-none" style={{ left: `${sliderVal}%` }}>
                      <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-6 w-6 rounded-full bg-white border border-clinic-border shadow-md flex items-center justify-center pointer-events-auto">
                        <Sliders className="h-3 w-3 rotate-90 text-clinic-text-primary" />
                      </div>
                    </div>

                    <input type="range" min="0" max="100" value={sliderVal} onChange={(e) => setSliderVal(Number(e.target.value))} className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30" />
                  </div>
                </div>
              )}
            </Tabs.Content>
          </Tabs.Root>
        </section>

        {/* RIGHT RAIL (360px): Quick Summaries */}
<<<<<<< HEAD
        <section className="flex flex-col gap-4 sm:gap-6 w-full 2xl:col-start-3 2xl:row-start-1">
=======
        <section className="flex flex-col gap-6 w-full">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
          {/* Upcoming followups */}
          <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-5 shadow-sm flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary border-b border-clinic-border pb-2">Upcoming Recalls</h3>
            {latestConsult && latestConsult.followUpDate ? (
              <div className="flex items-center justify-between p-3 bg-clinic-bg border border-clinic-border rounded-clinic-10 text-xs">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-clinic-warning" />
                  <span>Due {latestConsult.followUpDate}</span>
                </div>
                <Badge variant="warning">Recalling</Badge>
              </div>
            ) : (
              <span className="text-xs text-clinic-text-secondary italic">No follow-ups.</span>
            )}
          </div>

          {/* Latest Rx prescription */}
          <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-5 shadow-sm flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary border-b border-clinic-border pb-2">Latest Prescription</h3>
            {latestConsult && (latestConsult?.prescriptions ?? []).length > 0 ? (
              <div className="flex flex-col gap-2">
                {(latestConsult?.prescriptions ?? []).map((rx, i) => (
                  <div key={i} className="text-xs p-2 bg-clinic-bg border border-clinic-border rounded-clinic-10">
                    <span className="font-bold text-clinic-text-primary">{rx.drugName}</span>
                    <span className="text-clinic-text-secondary block mt-0.5">{rx.dosage} • {rx.frequency}</span>
                  </div>
                ))}
              </div>
            ) : (
              <span className="text-xs text-clinic-text-secondary italic">No prescription sheets.</span>
            )}
          </div>

          {/* Latest lab report */}
          <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-5 shadow-sm flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary border-b border-clinic-border pb-2">Latest Lab Report</h3>
            {latestLab ? (
              <div className="text-xs p-3 bg-clinic-bg border border-clinic-border rounded-clinic-10 flex flex-col gap-1">
                <span className="font-bold text-clinic-text-primary">{latestLab.testName}</span>
                <span className="text-clinic-text-secondary">Uploaded: {latestLab.testDate}</span>
                <Badge variant={latestLab.status === 'flagged' ? 'danger' : 'success'} className="mt-1 w-max">{latestLab.status}</Badge>
              </div>
            ) : (
              <span className="text-xs text-clinic-text-secondary italic">No lab reports.</span>
            )}
          </div>

          {/* Recent documents list */}
          <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-5 shadow-sm flex flex-col gap-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary border-b border-clinic-border pb-2">Recent Documents</h3>
            {activeDocs.length === 0 ? (
              <span className="text-xs text-clinic-text-secondary italic">No documents.</span>
            ) : (
              <div className="flex flex-col gap-2">
                {activeDocs.slice(0, 3).map(d => (
                  <div 
                    key={d.id} 
                    onClick={() => setSelectedDocId(d.id)}
                    className="text-xs p-2.5 bg-clinic-bg hover:bg-clinic-accent/5 hover:border-clinic-accent/30 border border-clinic-border rounded-clinic-10 flex justify-between items-center cursor-pointer transition-colors"
                  >
                    <span className="font-semibold text-clinic-text-primary truncate pr-2">{d.documentName}</span>
                    <Badge variant="neutral">{d.fileSize}</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Treatment Progress */}
          <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-5 shadow-sm flex flex-col gap-3 text-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary border-b border-clinic-border pb-2">Treatment Progress</h3>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center font-bold text-clinic-text-primary">
                <span>Completed Consults</span>
                <span>{activeConsults.length} / 5</span>
              </div>
              <div className="w-full h-1.5 bg-clinic-bg rounded-full overflow-hidden">
                <div className="h-full bg-clinic-accent" style={{ width: `${Math.min((activeConsults.length / 5) * 100, 100)}%` }} />
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* DOCUMENT PREVIEW MODAL */}
      <AnimatePresence>
        {selectedDoc && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-[1px]"
              onClick={() => setSelectedDocId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-md bg-clinic-surface border border-clinic-border rounded-clinic-14 p-6 shadow-2xl flex flex-col z-10 text-xs"
            >
              <div className="flex justify-between items-center border-b border-clinic-border pb-3 mb-4">
                <h3 className="text-sm font-bold text-clinic-text-primary">File Inspector</h3>
                <button onClick={() => setSelectedDocId(null)} className="text-clinic-text-secondary hover:text-clinic-text-primary font-bold">×</button>
              </div>

              <div className="flex flex-col gap-3 leading-relaxed text-clinic-text-primary pb-4">
                <p><strong>Filename:</strong> <span className="font-semibold">{selectedDoc.documentName}</span></p>
                <p><strong>Category:</strong> <span className="font-semibold">{selectedDoc.documentType}</span></p>
                <p><strong>Size:</strong> <span className="font-semibold">{selectedDoc.fileSize}</span></p>
                <p><strong>Uploaded:</strong> <span className="font-semibold">{selectedDoc.createdAt}</span></p>
                <p><strong>Uploaded By:</strong> <span className="font-semibold">{selectedDoc.uploadedByName}</span></p>
              </div>

              <div className="flex gap-3 border-t border-clinic-border pt-4 justify-end">
                <Button 
                  variant="secondary" 
                  onClick={() => handleDownloadDoc(selectedDoc.id, selectedDoc.documentName)}
                  className="flex items-center gap-1 text-xs"
                >
                  <FileDown className="h-3.5 w-3.5" />
                  <span>Download</span>
                </Button>
                <Button variant="ghost" onClick={() => setSelectedDocId(null)} className="text-xs">Close</Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* WHATSAPP SEND MESSAGE MODAL */}
      <AnimatePresence>
        {isSendingWhatsapp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-[1px]"
              onClick={() => {
                setIsSendingWhatsapp(false);
                setWhatsappMessageText('');
              }}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-md bg-clinic-surface border border-clinic-border rounded-clinic-14 p-6 shadow-2xl flex flex-col z-10 text-xs animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex justify-between items-center border-b border-clinic-border pb-3 mb-4">
                <h3 className="text-sm font-bold text-clinic-text-primary flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-emerald-500" />
                  <span>Send WhatsApp Message</span>
                </h3>
                <button 
                  onClick={() => {
                    setIsSendingWhatsapp(false);
                    setWhatsappMessageText('');
                  }} 
                  className="text-clinic-text-secondary hover:text-clinic-text-primary font-bold text-base"
                >
                  ×
                </button>
              </div>

              <div className="flex flex-col gap-3 pb-4">
                <p className="text-clinic-text-secondary">
                  Sending custom message to <strong>{activePatient.name}</strong> ({activePatient.phone})
                </p>
                <textarea
                  id="whatsapp-message-textarea"
                  value={whatsappMessageText}
                  onChange={(e) => setWhatsappMessageText(e.target.value)}
                  placeholder="Type your custom message here..."
                  rows={5}
                  className="w-full p-3 text-xs bg-clinic-bg border border-clinic-border rounded-clinic-10 focus:outline-none focus:ring-1 focus:ring-clinic-accent focus:border-clinic-accent text-clinic-text-primary font-medium"
                />
              </div>

              <div className="flex gap-3 border-t border-clinic-border pt-4 justify-end">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setIsSendingWhatsapp(false);
                    setWhatsappMessageText('');
                  }}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={async () => {
                    if (!whatsappMessageText.trim()) return;
                    try {
                      await sendWhatsappMutation.mutateAsync({
                        patientId: activePatient.id,
                        message: whatsappMessageText,
                      });
                      setIsSendingWhatsapp(false);
                      setWhatsappMessageText('');
                      alert('WhatsApp message sent successfully!');
                    } catch (err) {
                      console.error(err);
                      alert('Failed to send WhatsApp message.');
                    }
                  }}
                  isLoading={sendWhatsappMutation.isPending}
                  disabled={!whatsappMessageText.trim()}
                  className="text-xs bg-clinic-success hover:bg-clinic-success/90"
                >
                  Send Message
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hidden file input for programmatically triggered uploads */}
      <input 
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
        accept=".pdf,.png,.jpg,.jpeg"
      />
    </div>
  );
}
