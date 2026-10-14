'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  useReceptionistStats, useReceptionistAppointments, useReceptionistQueueStatus,
  useCheckInAppointment, useUpdateTokenStatus,
  usePatients, useAadhaarCheck, useCreatePatient, useBookAppointment, useCreateToken
} from '@/shared/hooks/useClinicApi';
import { useUiStore } from '@/shared/stores/uiStore';
import { 
  Activity, Users, Calendar, Clock, Play, 
  AlertCircle, FileText, Check, CheckCircle2,
  CalendarDays, Heart, PlusCircle, ShieldAlert,
  Plus, X, PhoneCall, RefreshCw, DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/shared/components/ui/Button';
import Badge from '@/shared/components/ui/Badge';
import Skeleton from '@/shared/components/ui/Skeleton';
import Input from '@/shared/components/ui/Input';
import Select from '@/shared/components/ui/Select';

const SLOT_OPTIONS = [
  { value: '1', label: '09:00 AM - 09:45 AM' },
  { value: '2', label: '09:45 AM - 10:30 AM' },
  { value: '3', label: '10:30 AM - 11:15 AM' },
  { value: '4', label: '11:15 AM - 12:00 PM' },
  { value: '5', label: '12:00 PM - 12:45 PM' },
  { value: '6', label: '12:45 PM - 01:30 PM (Break)' },
  { value: '7', label: '01:30 PM - 02:15 PM' },
  { value: '8', label: '02:15 PM - 03:00 PM' },
  { value: '9', label: '03:00 PM - 03:45 PM' },
  { value: '10', label: '03:45 PM - 04:30 PM' },
  { value: '11', label: '04:30 PM - 05:15 PM' },
  { value: '12', label: '05:15 PM - 06:00 PM' }
];

export default function ReceptionDashboard() {
  const router = useRouter();
  const setActivePatientId = useUiStore((state) => state.setActivePatientId);

  const currentRole = useUiStore((state) => state.currentRole);
  const isReceptionist = currentRole === 'receptionist';

  const { data: stats, isLoading: isLoadingStats, error: statsError, refetch: refetchStats, isFetching: isFetchingStats } = useReceptionistStats(isReceptionist);
  const { data: appointments = [], isLoading: isLoadingAppts, error: apptsError, refetch: refetchAppts, isFetching: isFetchingAppts } = useReceptionistAppointments(isReceptionist);
  const { data: queueStatus = [], isLoading: isLoadingQueue, error: queueError, refetch: refetchQueue, isFetching: isFetchingQueue } = useReceptionistQueueStatus(isReceptionist);

  const isFetching = isFetchingStats || isFetchingAppts || isFetchingQueue;

  const refetch = () => {
    refetchStats();
    refetchAppts();
    refetchQueue();
  };
  const { data: patients = [] } = usePatients();

  const checkInMutation = useCheckInAppointment();
  const updateTokenStatus = useUpdateTokenStatus();
  const checkAadhaarMutation = useAadhaarCheck();
  const createPatientMutation = useCreatePatient();
  const bookApptMutation = useBookAppointment();
  const createTokenMutation = useCreateToken();

  // Quick Actions Drawer State
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'register' | 'appointment' | 'token'>('register');
  const [drawerStep, setDrawerStep] = useState<1 | 2 | 3 | 4>(1);

  // Aadhaar Check State
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [aadhaarError, setAadhaarError] = useState<string | null>(null);
  const [aadhaarLoading, setAadhaarLoading] = useState(false);
  const [aadhaarCheckResult, setAadhaarCheckResult] = useState<{ exists: boolean; patient?: any } | null>(null);

  // New Patient Form State
  const [patientForm, setPatientForm] = useState({
    name: '',
    phone: '',
    email: '',
    dob: '',
    gender: 'Female' as 'Male' | 'Female' | 'Other',
    address: '',
    bloodGroup: 'O+',
    allergies: '',
    medicalConditions: '',
    emergencyContact: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);
  const [registeredPatient, setRegisteredPatient] = useState<any | null>(null);

  // Appointment Form State
  const [apptPatientId, setApptPatientId] = useState('');
  const [apptDoctorId, setApptDoctorId] = useState('mock-doc-1');
  const [apptDate, setApptDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [apptTimeSlot, setApptTimeSlot] = useState('1');
  const [apptReason, setApptReason] = useState('');
  const [apptLoading, setApptLoading] = useState(false);

  // Token Form State
  const [tokenPatientId, setTokenPatientId] = useState('');
  const [tokenReason, setTokenReason] = useState('');
  const [tokenPriority, setTokenPriority] = useState<'normal' | 'urgent' | 'emergency'>('normal');
  const [tokenLoading, setTokenLoading] = useState(false);

  useEffect(() => {
    if (patients.length > 0) {
      if (!apptPatientId) setApptPatientId(patients[0].id);
      if (!tokenPatientId) setTokenPatientId(patients[0].id);
    }
  }, [patients]);

  const handleOpenDrawer = (mode: 'register' | 'appointment' | 'token') => {
    setDrawerMode(mode);
    setDrawerOpen(true);
    setDrawerStep(1);
    setAadhaarInput('');
    setAadhaarError(null);
    setAadhaarCheckResult(null);
    setFormError(null);
    setFormSuccess(null);
    setRegisteredPatient(null);
    setPatientForm({
      name: '',
      phone: '',
      email: '',
      dob: '',
      gender: 'Female',
      address: '',
      bloodGroup: 'O+',
      allergies: '',
      medicalConditions: '',
      emergencyContact: '',
    });
    if (patients.length > 0) {
      setApptPatientId(patients[0].id);
      setTokenPatientId(patients[0].id);
    }
    setApptReason('');
    setTokenReason('');
    setTokenPriority('normal');
  };

  const handleVerifyAadhaar = () => {
    setAadhaarError(null);
    setAadhaarCheckResult(null);
    const clean = aadhaarInput.replace(/[^0-9]/g, '');
    if (!clean || clean.length !== 12) {
      setAadhaarError('Aadhaar must be exactly 12 digits');
      return;
    }

    setAadhaarLoading(true);
    checkAadhaarMutation.mutate(clean, {
      onSuccess: (res) => {
        setAadhaarLoading(false);
        setAadhaarCheckResult(res);
        if (!res.exists) {
          setDrawerStep(2);
        }
      },
      onError: (err: any) => {
        setAadhaarLoading(false);
        setAadhaarError(err.response?.data?.message || err.message || 'Failed to check Aadhaar');
      }
    });
  };

  const handleSaveNewPatient = () => {
    setFormError(null);
    setFormSuccess(null);

    if (!patientForm.name || !patientForm.phone || !patientForm.dob || !patientForm.address) {
      setFormError('Please fill all required fields (*)');
      return;
    }

    const cleanAadhaar = aadhaarInput.replace(/[^0-9]/g, '');
    const allergiesList = patientForm.allergies ? patientForm.allergies.split(',').map(a => a.trim()).filter(Boolean) : [];
    const conditionsList = patientForm.medicalConditions ? patientForm.medicalConditions.split(',').map(c => c.trim()).filter(Boolean) : [];

    createPatientMutation.mutate({
      name: patientForm.name,
      phone: patientForm.phone,
      email: patientForm.email || undefined,
      dob: patientForm.dob,
      gender: patientForm.gender,
      bloodGroup: patientForm.bloodGroup,
      address: patientForm.address,
      allergies: allergiesList,
      medicalConditions: conditionsList,
      aadhaar: cleanAadhaar,
      emergencyContact: patientForm.emergencyContact,
      treatmentStatus: 'Consultation'
    }, {
      onSuccess: (res) => {
        setFormSuccess('Patient Registered Successfully');
        setRegisteredPatient(res);
        setDrawerStep(4);
        refetch();
      },
      onError: (err: any) => {
        setFormError(err.response?.data?.message || err.message || 'Failed to create patient');
      }
    });
  };

  const handleBookAppointmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!apptPatientId) return;

    const patient = patients.find(p => p.id === apptPatientId);
    if (!patient) return;

    setApptLoading(true);
    bookApptMutation.mutate({
      patientId: apptPatientId,
      patientName: patient.name,
      phone: patient.phone,
      date: apptDate,
      timeSlot: parseInt(apptTimeSlot, 10),
      type: 'consultation',
      notes: apptReason
    }, {
      onSuccess: () => {
        setApptLoading(false);
        setDrawerOpen(false);
        alert('Appointment booked successfully!');
        setApptReason('');
        refetch();
      },
      onError: (err: any) => {
        setApptLoading(false);
        alert(err.response?.data?.message || err.message || 'Failed to book appointment');
      }
    });
  };

  const handleGenerateTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenPatientId) return;

    const patient = patients.find(p => p.id === tokenPatientId);
    if (!patient) return;

    setTokenLoading(true);
    createTokenMutation.mutate({
      patientId: tokenPatientId,
      patientName: patient.name,
      priority: tokenPriority,
      visitReason: tokenReason || 'Consultation',
      doctorName: 'Dr. Adrian Vance'
    }, {
      onSuccess: () => {
        setTokenLoading(false);
        setDrawerOpen(false);
        alert('Token generated successfully!');
        setTokenReason('');
        setTokenPriority('normal');
        refetch();
      },
      onError: (err: any) => {
        setTokenLoading(false);
        alert(err.response?.data?.message || err.message || 'Failed to generate token');
      }
    });
  };

  const handleCheckIn = (appointmentId: string) => {
    checkInMutation.mutate(appointmentId, {
      onSuccess: () => {
        alert("Patient checked in successfully! Visit created and Queue token generated.");
        refetchAppts();
        refetchQueue();
        refetchStats();
      },
      onError: (err: any) => {
        alert(err?.response?.data?.message || "Check-in failed. Please try again.");
      }
    });
  };

  const handleUpdateStatus = (tokenId: string, status: 'called' | 'started' | 'completed' | 'missed') => {
    updateTokenStatus.mutate({ tokenId, status }, {
      onSuccess: () => {
        refetchQueue();
        refetchStats();
      }
    });
  };

  const handleViewHistory = (patientId: string) => {
    setActivePatientId(patientId);
    router.push('/patients');
  };

  // Removed page-level error check to allow independent card rendering

  return (
<<<<<<< HEAD
    <div className="flex flex-col gap-5 sm:gap-6 max-w-[1200px] mx-auto relative">
      {/* Header title */}
      <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 pb-1">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-clinic-accent mb-2">Front desk workspace</p>
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-clinic-text-primary flex items-center gap-2">
            <span>Today at reception</span>
          </h1>
          <p className="text-xs text-clinic-text-secondary mt-1">
            Start with check-ins. Book visits or add walk-ins when needed.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3 shrink-0">
          <Button
            onClick={() => handleOpenDrawer('register')}
            className="flex-1 sm:flex-none flex items-center gap-1.5 text-xs font-semibold bg-clinic-accent text-white hover:bg-clinic-accent/90"
=======
    <div className="flex flex-col gap-8 max-w-[1200px] mx-auto relative p-4">
      {/* Header title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-clinic-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-clinic-text-primary flex items-center gap-2">
            <Users className="h-5 w-5 text-clinic-accent" />
            <span>Reception Dashboard</span>
          </h1>
          <p className="text-xs text-clinic-text-secondary mt-1">
            Check-ins, appointments, and token management workflow console.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            variant="ghost"
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-xs text-clinic-text-secondary hover:text-clinic-text-primary mr-2"
            disabled={isFetching}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </Button>

          <Button
            onClick={() => handleOpenDrawer('register')}
            className="flex items-center gap-1.5 text-xs font-semibold bg-clinic-accent text-white hover:bg-clinic-accent/90"
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
          >
            <PlusCircle className="h-4 w-4" />
            <span>Register Patient</span>
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleOpenDrawer('appointment')}
<<<<<<< HEAD
            className="flex-1 sm:flex-none flex items-center gap-1.5 text-xs font-semibold border-clinic-border text-clinic-text-primary bg-clinic-surface hover:bg-clinic-bg"
=======
            className="flex items-center gap-1.5 text-xs font-semibold border-clinic-border text-clinic-text-primary bg-clinic-surface hover:bg-clinic-bg"
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
          >
            <CalendarDays className="h-4 w-4" />
            <span>Book Appointment</span>
          </Button>
          <Button
            variant="secondary"
            onClick={() => handleOpenDrawer('token')}
<<<<<<< HEAD
            className="flex-1 sm:flex-none flex items-center gap-1.5 text-xs font-semibold border-clinic-border text-clinic-text-primary bg-clinic-surface hover:bg-clinic-bg"
=======
            className="flex items-center gap-1.5 text-xs font-semibold border-clinic-border text-clinic-text-primary bg-clinic-surface hover:bg-clinic-bg"
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
          >
            <Activity className="h-4 w-4" />
            <span>Generate Token</span>
          </Button>
        </div>
      </div>

      {/* STATS SECTION */}
<<<<<<< HEAD
      <section aria-label="Front desk overview" className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {isLoadingStats ? (
          Array.from({ length: 4 }).map((_, i) => (
=======
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {isLoadingStats ? (
          Array.from({ length: 8 }).map((_, i) => (
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            <div key={i} className="bg-clinic-surface border border-clinic-border rounded-clinic-12 p-4 shadow-sm h-[92px] flex flex-col justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-12 mt-2" />
            </div>
          ))
        ) : statsError ? (
          <div className="col-span-full p-4 text-center text-clinic-danger bg-clinic-danger/5 border border-clinic-danger/10 rounded-xl text-xs">
            Failed to load front desk stats telemetry.
          </div>
        ) : (
          [
            { label: "Today's Appointments", value: stats?.todaysAppointments ?? 0, icon: CalendarDays, color: "text-clinic-accent bg-clinic-accent/10" },
            { label: "Checked In Today", value: stats?.checkedInToday ?? 0, icon: CheckCircle2, color: "text-clinic-success bg-clinic-success/10" },
<<<<<<< HEAD
            { label: "Waiting Patients", value: stats?.waitingPatients ?? 0, icon: Clock, color: "text-clinic-warning bg-clinic-warning/10" },
            { label: "Follow-Up Calls", value: stats?.followUpCalls ?? 0, icon: PhoneCall, color: "text-indigo-500 bg-indigo-500/10" }
=======
            { label: "New Registrations Today", value: stats?.newRegistrations ?? 0, icon: Users, color: "text-emerald-500 bg-emerald-500/10" },
            { label: "Waiting Patients", value: stats?.waitingPatients ?? 0, icon: Clock, color: "text-clinic-warning bg-clinic-warning/10" },
            { label: "Missed Appointments Today", value: stats?.missedAppointments ?? 0, icon: AlertCircle, color: "text-rose-500 bg-rose-500/10" },
            { label: "Follow Up Calls Due", value: stats?.followUpCalls ?? 0, icon: PhoneCall, color: "text-indigo-500 bg-indigo-500/10" },
            { label: "Payments Pending", value: stats?.paymentsPending ?? 0, icon: DollarSign, color: "text-amber-500 bg-amber-500/10" },
            { label: "Total Registered Patients", value: patients.length, icon: FileText, color: "text-clinic-accent bg-clinic-accent/10" }
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
<<<<<<< HEAD
              className="bg-clinic-surface border border-clinic-border/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col justify-between min-h-[108px]"
=======
              className="bg-clinic-surface border border-clinic-border rounded-clinic-12 p-4 shadow-sm flex flex-col justify-between"
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-semibold text-clinic-text-secondary uppercase tracking-wider">
                  {item.label}
                </span>
                <div className={`p-1.5 rounded-lg shrink-0 ${item.color}`}>
                  <item.icon className="h-4 w-4" />
                </div>
              </div>
              <div className="text-xl font-bold mt-2 text-clinic-text-primary">
                {item.value}
              </div>
            </motion.div>
          ))
        )}
<<<<<<< HEAD
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5 items-start">
        {/* TODAY'S APPOINTMENTS & SLOT CHECK-IN */}
        <section className="bg-clinic-surface border border-clinic-border/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col gap-4 min-w-0">
=======
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* TODAY'S APPOINTMENTS & SLOT CHECK-IN */}
        <section className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-6 shadow-sm flex flex-col gap-4 min-h-[350px]">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
          <div className="flex justify-between items-center border-b border-clinic-border pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary">
              Scheduled Slots & Patient Check-In
            </h2>
            <Badge variant="neutral">Today</Badge>
          </div>

          <div className="flex flex-col gap-3">
            {isLoadingAppts ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 bg-clinic-bg border border-clinic-border rounded-clinic-10 h-[72px]">
                  <div className="flex flex-col gap-1.5 w-full">
                    <Skeleton className="h-4 w-36 rounded" />
                    <Skeleton className="h-3 w-48 rounded" />
                  </div>
                </div>
              ))
            ) : apptsError ? (
              <div className="py-8 text-center text-clinic-danger bg-clinic-danger/5 border border-clinic-danger/10 rounded-xl text-xs">
                Failed to load today's appointments.
              </div>
            ) : appointments.length === 0 ? (
<<<<<<< HEAD
              <div className="min-h-32 text-center text-clinic-text-secondary text-xs flex flex-col items-center justify-center gap-2">
=======
              <div className="py-16 text-center text-clinic-text-secondary text-xs flex flex-col items-center justify-center gap-2">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                <Calendar className="h-8 w-8 text-clinic-border" />
                <span className="font-semibold text-clinic-text-primary">No appointments scheduled today</span>
              </div>
            ) : (
              appointments.map((appt: any) => (
                <div 
                  key={appt.id} 
                  className="flex items-center justify-between p-3.5 bg-clinic-bg border border-clinic-border rounded-clinic-10"
                >
                  <div className="min-w-0 flex flex-col">
                    <span className="text-xs font-bold text-clinic-text-primary truncate">{appt.patient?.fullName || appt.patientName}</span>
                    <span className="text-[10px] text-clinic-text-secondary truncate mt-0.5">
                      Slot: {appt.time} • Phone: {appt.patient?.phone || appt.phone}
                    </span>
                    <span className="text-[10px] text-clinic-text-secondary mt-0.5">
<<<<<<< HEAD
                      Status: <strong className="text-clinic-accent capitalize">{(appt.status || 'scheduled').toLowerCase()}</strong>
=======
                      Status: <strong className="text-clinic-accent capitalize">{appt.status.toLowerCase()}</strong>
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                    </span>
                  </div>

                  {appt.status === 'BOOKED' || appt.status === 'CONFIRMED' ? (
                    <Button
                      size="sm"
                      onClick={() => handleCheckIn(appt.id)}
                      isLoading={checkInMutation.isPending && checkInMutation.variables === appt.id}
                      className="flex items-center gap-1 text-xs text-clinic-success border-clinic-success/30 bg-clinic-success/10 hover:bg-clinic-success/20 shrink-0"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Check In</span>
                    </Button>
                  ) : (
                    <Badge variant={appt.status === 'COMPLETED' ? 'success' : 'neutral'} className="shrink-0">
                      {appt.status}
                    </Badge>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* QUEUE STATUS LIST */}
<<<<<<< HEAD
        <section className="bg-clinic-surface border border-clinic-border/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col gap-4 min-w-0">
=======
        <section className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-6 shadow-sm flex flex-col gap-4 min-h-[350px]">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
          <div className="flex justify-between items-center border-b border-clinic-border pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary">
              Today's Lobby Queue Tokens
            </h2>
            <Badge variant="neutral">Status List</Badge>
          </div>

          <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
            {isLoadingQueue ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3.5 bg-clinic-bg border border-clinic-border rounded-clinic-10 h-[64px]">
                  <div className="flex flex-col gap-1.5 w-full">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-3 w-48 rounded" />
                  </div>
                </div>
              ))
            ) : queueError ? (
              <div className="py-8 text-center text-clinic-danger bg-clinic-danger/5 border border-clinic-danger/10 rounded-xl text-xs">
                Failed to load lobby queue tokens.
              </div>
            ) : queueStatus.length === 0 ? (
<<<<<<< HEAD
              <div className="min-h-32 text-center text-clinic-text-secondary text-xs flex flex-col items-center justify-center gap-2">
=======
              <div className="py-16 text-center text-clinic-text-secondary text-xs flex flex-col items-center justify-center gap-2">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                <Clock className="h-8 w-8 text-clinic-border" />
                <span className="font-semibold text-clinic-text-primary">No queue tokens generated today</span>
              </div>
            ) : (
              queueStatus.map((tok: any) => (
                <div 
                  key={tok.id} 
                  className="flex items-center justify-between p-3.5 bg-clinic-bg border border-clinic-border rounded-clinic-10"
                >
                  <div className="min-w-0 flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-clinic-accent bg-clinic-surface border border-clinic-border px-1.5 py-0.5 rounded shadow-sm">
                        {tok.tokenNumber}
                      </span>
                      <span className="text-xs font-bold text-clinic-text-primary truncate">{tok.patientName}</span>
                    </div>
                    <span className="text-[10px] text-clinic-text-secondary truncate mt-1">
                      Reason: {tok.visitReason} • Doctor: {tok.doctorName || 'Dr. Vance'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge variant={tok.status === 'completed' ? 'success' : tok.status === 'started' ? 'info' : tok.status === 'called' ? 'warning' : tok.status === 'missed' ? 'danger' : 'neutral'}>
                      {tok.status}
                    </Badge>
                    {tok.status === 'called' && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleUpdateStatus(tok.id, 'missed')}
                        className="text-[10px] py-1 px-2 text-clinic-danger hover:bg-clinic-danger/10"
                      >
                        Skip
                      </Button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {/* Slide-over Action Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
              onClick={() => setDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
<<<<<<< HEAD
              className="relative w-full max-w-[600px] bg-clinic-surface border-l border-clinic-border h-full p-4 sm:p-6 pt-[max(1rem,env(safe-area-inset-top))] pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl flex flex-col z-10 overflow-y-auto"
=======
              className="relative w-full max-w-[600px] bg-clinic-surface border-l border-clinic-border h-full p-6 shadow-2xl flex flex-col z-10 overflow-y-auto"
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            >
              {/* Header */}
              <div className="flex justify-between items-center border-b border-clinic-border pb-4 mb-6">
                <h2 className="text-lg font-bold text-clinic-text-primary">
                  {drawerMode === 'register' && `Register New Patient (Step ${drawerStep}/4)`}
                  {drawerMode === 'appointment' && 'Book New Appointment'}
                  {drawerMode === 'token' && 'Generate Queue Token'}
                </h2>
                <button 
                  onClick={() => setDrawerOpen(false)} 
                  className="text-clinic-text-secondary hover:text-clinic-text-primary"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mode-specific content */}
              {drawerMode === 'register' && (
                <div className="flex flex-col gap-6">
                  {drawerStep === 1 && (
                    <div className="flex flex-col gap-5">
                      <h3 className="text-sm font-bold text-clinic-text-primary">Verify Aadhaar</h3>
                      <p className="text-xs text-clinic-text-secondary">
                        Enter the patient's 12-digit Aadhaar number to verify if they are already registered in our system.
                      </p>

                      <div className="flex flex-col gap-2">
                        <Input 
                          label="Aadhaar Number" 
                          placeholder="e.g. 1234 5678 9012"
                          value={aadhaarInput}
                          onChange={(e) => setAadhaarInput(e.target.value)}
                        />
                        {aadhaarError && (
                          <span className="text-clinic-danger text-[11px] font-semibold flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            <span>{aadhaarError}</span>
                          </span>
                        )}
                      </div>

                      <Button
                        onClick={handleVerifyAadhaar}
                        isLoading={aadhaarLoading}
                        className="w-full bg-clinic-accent hover:bg-clinic-accent/90"
                      >
                        Verify Aadhaar
                      </Button>

                      {aadhaarCheckResult?.exists && (
                        <div className="bg-clinic-accent/5 border border-clinic-accent/20 rounded-clinic-10 p-5 flex flex-col gap-4 mt-2">
                          <div className="flex items-center gap-2 text-clinic-accent font-bold text-sm">
                            <CheckCircle2 className="h-5 w-5 text-clinic-accent" />
                            <span>Existing Patient Found</span>
                          </div>
                          <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                            <div className="text-clinic-text-secondary">Full Name:</div>
                            <div className="text-clinic-text-primary font-semibold">{aadhaarCheckResult.patient.fullName}</div>
                            <div className="text-clinic-text-secondary">Patient ID:</div>
                            <div className="text-clinic-text-primary font-mono font-semibold">{aadhaarCheckResult.patient.patientCustomId}</div>
                            <div className="text-clinic-text-secondary">Phone Number:</div>
                            <div className="text-clinic-text-primary font-semibold">{aadhaarCheckResult.patient.phone}</div>
                          </div>
                          <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-clinic-border/50">
                            <Button 
                              onClick={() => {
                                handleViewHistory(aadhaarCheckResult.patient.id);
                                setDrawerOpen(false);
                              }}
                              className="w-full text-xs font-semibold"
                            >
                              Open Profile
                            </Button>
                            <div className="grid grid-cols-2 gap-2">
                              <Button 
                                variant="secondary"
                                onClick={() => {
                                  setApptPatientId(aadhaarCheckResult.patient.id);
                                  setDrawerMode('appointment');
                                }}
                                className="text-xs font-semibold"
                              >
                                Book Appointment
                              </Button>
                              <Button 
                                variant="secondary"
                                onClick={() => {
                                  setTokenPatientId(aadhaarCheckResult.patient.id);
                                  setDrawerMode('token');
                                }}
                                className="text-xs font-semibold"
                              >
                                Generate Token
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {drawerStep === 2 && (
                    <form onSubmit={(e) => { e.preventDefault(); handleSaveNewPatient(); }} className="flex flex-col gap-5">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary border-b border-clinic-border pb-1">
                        Personal Information
                      </h3>
                      
<<<<<<< HEAD
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
=======
                      <div className="grid grid-cols-2 gap-4">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                        <Input 
                          label="Full Name *" 
                          placeholder="e.g. Jane Doe"
                          value={patientForm.name}
                          onChange={(e) => setPatientForm({ ...patientForm, name: e.target.value })}
                          required
                        />
                        <Input 
                          label="Mobile Number *" 
                          placeholder="e.g. 9991112222"
                          value={patientForm.phone}
                          onChange={(e) => setPatientForm({ ...patientForm, phone: e.target.value })}
                          required
                        />
                      </div>

<<<<<<< HEAD
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
=======
                      <div className="grid grid-cols-2 gap-4">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                        <Input 
                          label="Email" 
                          type="email"
                          placeholder="e.g. jane.doe@example.com"
                          value={patientForm.email}
                          onChange={(e) => setPatientForm({ ...patientForm, email: e.target.value })}
                        />
                        <Input 
                          label="Date of Birth *" 
                          type="date"
                          value={patientForm.dob}
                          onChange={(e) => setPatientForm({ ...patientForm, dob: e.target.value })}
                          required
                        />
                      </div>

<<<<<<< HEAD
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
=======
                      <div className="grid grid-cols-2 gap-4">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                        <Select
                          label="Gender"
                          value={patientForm.gender}
                          onChange={(e) => setPatientForm({ ...patientForm, gender: e.target.value as any })}
                          options={[
                            { value: 'Male', label: 'Male' },
                            { value: 'Female', label: 'Female' },
                            { value: 'Other', label: 'Other' }
                          ]}
                        />
                        <Select
                          label="Blood Group"
                          value={patientForm.bloodGroup}
                          onChange={(e) => setPatientForm({ ...patientForm, bloodGroup: e.target.value })}
                          options={[
                            { value: 'A+', label: 'A+' },
                            { value: 'A-', label: 'A-' },
                            { value: 'B+', label: 'B+' },
                            { value: 'B-', label: 'B-' },
                            { value: 'AB+', label: 'AB+' },
                            { value: 'AB-', label: 'AB-' },
                            { value: 'O+', label: 'O+' },
                            { value: 'O-', label: 'O-' }
                          ]}
                        />
                      </div>

                      <Input 
                        label="Address *" 
                        placeholder="e.g. 456 Galleria Mall Rd, Mumbai"
                        value={patientForm.address}
                        onChange={(e) => setPatientForm({ ...patientForm, address: e.target.value })}
                        required
                      />

                      <h3 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary border-b border-clinic-border pb-1 mt-2">
                        Medical Information
                      </h3>

<<<<<<< HEAD
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
=======
                      <div className="grid grid-cols-2 gap-4">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                        <Input 
                          label="Allergies (comma separated)" 
                          placeholder="e.g. Peanuts, Penicillin"
                          value={patientForm.allergies}
                          onChange={(e) => setPatientForm({ ...patientForm, allergies: e.target.value })}
                        />
                        <Input 
                          label="Conditions (comma separated)" 
                          placeholder="e.g. Migraine, Asthma"
                          value={patientForm.medicalConditions}
                          onChange={(e) => setPatientForm({ ...patientForm, medicalConditions: e.target.value })}
                        />
                      </div>

                      <Input 
                        label="Emergency Contact" 
                        placeholder="e.g. John Doe: 9991112223"
                        value={patientForm.emergencyContact}
                        onChange={(e) => setPatientForm({ ...patientForm, emergencyContact: e.target.value })}
                      />

                      {formError && (
                        <div className="text-clinic-danger text-xs font-semibold bg-clinic-danger/10 border border-clinic-danger/25 p-3 rounded-md flex items-center gap-2">
                          <ShieldAlert className="h-4 w-4" />
                          <span>{formError}</span>
                        </div>
                      )}

                      <Button 
                        type="submit" 
                        isLoading={createPatientMutation.isPending}
                        className="w-full mt-4 bg-clinic-accent hover:bg-clinic-accent/90"
                      >
                        Register Patient (Step 3/4)
                      </Button>
                    </form>
                  )}

                  {drawerStep === 4 && (
                    <div className="flex flex-col gap-6 items-center text-center py-6">
                      <div className="h-12 w-12 bg-clinic-success/15 rounded-full flex items-center justify-center text-clinic-success">
                        <Check className="h-6 w-6" strokeWidth={3} />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-clinic-text-primary">Patient Registered Successfully!</h3>
                        <p className="text-xs text-clinic-text-secondary mt-1">
                          Generated ID: <strong className="text-clinic-text-primary font-mono">{registeredPatient?.patientCustomId}</strong>
                        </p>
                      </div>

                      <div className="w-full border-t border-clinic-border/50 my-2 pt-6">
                        <span className="text-xs font-semibold text-clinic-text-secondary uppercase tracking-wider block mb-4">
                          What would you like to do next?
                        </span>

                        <div className="flex flex-col gap-3 w-full">
                          <Button
                            onClick={() => {
                              if (registeredPatient) {
                                setApptPatientId(registeredPatient.id);
                                setDrawerMode('appointment');
                              }
                            }}
                            className="w-full text-xs font-bold bg-clinic-accent text-white hover:bg-clinic-accent/90"
                          >
                            Book Appointment
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => {
                              if (registeredPatient) {
                                setTokenPatientId(registeredPatient.id);
                                setDrawerMode('token');
                              }
                            }}
                            className="w-full text-xs font-bold border-clinic-border text-clinic-text-primary bg-clinic-surface hover:bg-clinic-bg"
                          >
                            Generate Token
                          </Button>
                          <Button
                            variant="ghost"
                            onClick={() => {
                              if (registeredPatient) {
                                handleViewHistory(registeredPatient.id);
                                setDrawerOpen(false);
                              }
                            }}
                            className="w-full text-xs font-bold text-clinic-text-secondary hover:text-clinic-text-primary hover:bg-clinic-bg"
                          >
                            Open Patient Profile
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {drawerMode === 'appointment' && (
                <form onSubmit={handleBookAppointmentSubmit} className="flex flex-col gap-5">
                  <Select
                    label="Patient"
                    value={apptPatientId}
                    onChange={(e) => setApptPatientId(e.target.value)}
                    options={patients.map(p => ({ value: p.id, label: `${p.name} (${p.phone})` }))}
                  />

                  <Select
                    label="Doctor"
                    value={apptDoctorId}
                    onChange={(e) => setApptDoctorId(e.target.value)}
                    options={[
                      { value: 'mock-doc-1', label: 'Dr. Adrian Vance (Dermatology)' }
                    ]}
                  />

<<<<<<< HEAD
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
=======
                  <div className="grid grid-cols-2 gap-4">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                    <Input 
                      label="Date" 
                      type="date"
                      value={apptDate}
                      onChange={(e) => setApptDate(e.target.value)}
                      required
                    />
                    <Select
                      label="Time Slot"
                      value={apptTimeSlot}
                      onChange={(e) => setApptTimeSlot(e.target.value)}
                      options={SLOT_OPTIONS}
                    />
                  </div>

                  <Input 
                    label="Visit Reason" 
                    placeholder="e.g. Acne consultation, follow-up scan"
                    value={apptReason}
                    onChange={(e) => setApptReason(e.target.value)}
                    required
                  />

                  <Button 
                    type="submit" 
                    isLoading={apptLoading}
                    className="w-full mt-4 bg-clinic-accent hover:bg-clinic-accent/90"
                  >
                    Save Appointment
                  </Button>
                </form>
              )}

              {drawerMode === 'token' && (
                <form onSubmit={handleGenerateTokenSubmit} className="flex flex-col gap-5">
                  <Select
                    label="Patient"
                    value={tokenPatientId}
                    onChange={(e) => setTokenPatientId(e.target.value)}
                    options={patients.map(p => ({ value: p.id, label: `${p.name} (${p.phone})` }))}
                  />

                  <Input 
                    label="Visit Reason / Symptoms" 
                    placeholder="e.g. Acne consultation, review skin"
                    value={tokenReason}
                    onChange={(e) => setTokenReason(e.target.value)}
                    required
                  />

                  <Select
                    label="Priority Level"
                    value={tokenPriority}
                    onChange={(e) => setTokenPriority(e.target.value as any)}
                    options={[
                      { value: 'normal', label: 'Normal' },
                      { value: 'urgent', label: 'Urgent' },
                      { value: 'emergency', label: 'Emergency' }
                    ]}
                  />

                  <Button 
                    type="submit" 
                    isLoading={tokenLoading}
                    className="w-full mt-4 bg-clinic-accent hover:bg-clinic-accent/90"
                  >
                    Generate Token
                  </Button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
