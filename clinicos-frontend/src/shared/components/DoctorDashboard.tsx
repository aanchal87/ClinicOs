'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { 
  useDoctorStats, 
  useDoctorQueue, 
  useDoctorAppointmentsList, 
  useDoctorRecentActivity, 
  useUpdateTokenStatus 
} from '@/shared/hooks/useClinicApi';
import { useUiStore } from '@/shared/stores/uiStore';
import { 
  Activity, Users, Calendar, Clock, Play, 
  AlertCircle, FileText, Check, CheckCircle2,
  CalendarDays, Heart, ShieldAlert, CheckCircle,
  ClipboardList, ArrowRight, DollarSign, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '@/shared/components/ui/Button';
import Badge from '@/shared/components/ui/Badge';
import Skeleton from '@/shared/components/ui/Skeleton';

export default function DoctorDashboard() {
  const router = useRouter();
  const setActivePatientId = useUiStore((state) => state.setActivePatientId);
  
  const currentRole = useUiStore((state) => state.currentRole);
  const isDoctor = currentRole === 'doctor';

  const { data: stats, isLoading: isLoadingStats, error: statsError, refetch: refetchStats, isFetching: isFetchingStats } = useDoctorStats(isDoctor);
  const { data: queueData, isLoading: isLoadingQueue, error: queueError, refetch: refetchQueue, isFetching: isFetchingQueue } = useDoctorQueue(isDoctor);
  const { data: appointments = [], isLoading: isLoadingAppts, error: apptsError, refetch: refetchAppts, isFetching: isFetchingAppts } = useDoctorAppointmentsList(isDoctor);
  const { data: recentActivity = [], isLoading: isLoadingActivity, error: activityError, refetch: refetchActivity, isFetching: isFetchingActivity } = useDoctorRecentActivity(isDoctor);

  const updateTokenStatus = useUpdateTokenStatus();

  const isFetching = isFetchingStats || isFetchingQueue || isFetchingAppts || isFetchingActivity;

  const refetch = () => {
    refetchStats();
    refetchQueue();
    refetchAppts();
    refetchActivity();
  };

  const handleUpdateStatus = (tokenId: string, status: 'called' | 'started' | 'completed' | 'missed') => {
    updateTokenStatus.mutate({ tokenId, status }, {
      onSuccess: () => {
        refetchQueue();
        refetchStats();
      }
    });
  };

  const handleOpenConsultation = (tokenId: string, patientId: string) => {
    setActivePatientId(patientId);
    handleUpdateStatus(tokenId, 'started');
    router.push('/consultations');
  };

  const handleViewHistory = (patientId: string) => {
    setActivePatientId(patientId);
    router.push('/patients');
  };

  const handleGeneratePrescription = (patientId: string, tokenId: string) => {
    setActivePatientId(patientId);
    handleUpdateStatus(tokenId, 'started');
    router.push('/consultations');
  };

  const { currentPatient, nextTokens = [] } = queueData || {};

  const waitingTokens = nextTokens.filter((t: any) => t.status === 'waiting');
  const calledTokens = nextTokens.filter((t: any) => t.status === 'called');

  return (
<<<<<<< HEAD
    <div className="flex flex-col gap-5 sm:gap-6 max-w-[1200px] mx-auto relative">
      {/* Header title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-clinic-accent mb-2">Doctor workspace</p>
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-clinic-text-primary flex items-center gap-2">
            <span>Today’s care</span>
          </h1>
          <p className="text-sm text-clinic-text-secondary mt-1.5">
            Your active consultation, waiting patients, and clinical reviews.
=======
    <div className="flex flex-col gap-8 max-w-[1200px] mx-auto relative p-4">
      {/* Header title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-clinic-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-clinic-text-primary flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-clinic-accent" />
            <span>Clinical Command Center</span>
          </h1>
          <p className="text-xs text-clinic-text-secondary mt-1">
            Real-time telemetry and operational workflow for active clinical consultations.
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => refetch()}
            className="flex items-center gap-1.5 text-xs text-clinic-text-secondary hover:text-clinic-text-primary"
            disabled={isFetching}
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
<<<<<<< HEAD
            <span>{isFetching ? 'Syncing...' : 'Refresh today'}</span>
=======
            <span>{isFetching ? 'Syncing...' : 'Sync Telemetry'}</span>
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
          </Button>
        </div>
      </div>

      {/* STATS SECTION */}
<<<<<<< HEAD
      <section aria-label="Clinical overview" className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {isLoadingStats ? (
          Array.from({ length: 4 }).map((_, i) => (
=======
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {isLoadingStats ? (
          Array.from({ length: 6 }).map((_, i) => (
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            <div key={i} className="bg-clinic-surface border border-clinic-border rounded-clinic-12 p-4 shadow-sm h-[92px] flex flex-col justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-6 w-12 mt-2" />
            </div>
          ))
        ) : statsError ? (
          <div className="col-span-full p-4 text-center text-clinic-danger bg-clinic-danger/5 border border-clinic-danger/10 rounded-xl text-xs">
            Failed to load clinical stats telemetry.
          </div>
        ) : (
          [
<<<<<<< HEAD
            { label: "Appointments", value: stats?.todaysAppointments ?? 0, icon: CalendarDays, color: "text-clinic-accent bg-clinic-accent/10" },
            { label: "Active Patients", value: stats?.activePatients ?? 0, icon: Users, color: "text-clinic-success bg-clinic-success/10" },
            { label: "Follow-Ups Due", value: stats?.followUpsDue ?? 0, icon: Clock, color: "text-clinic-warning bg-clinic-warning/10" },
            { label: "Lab Reviews", value: stats?.pendingLabReviews ?? 0, icon: Activity, color: "text-rose-500 bg-rose-500/10" }
=======
            { label: "Today's Appointments", value: stats?.todaysAppointments ?? 0, icon: CalendarDays, color: "text-clinic-accent bg-clinic-accent/10" },
            { label: "Active Patients", value: stats?.activePatients ?? 0, icon: Users, color: "text-clinic-success bg-clinic-success/10" },
            { label: "Follow-Ups Due", value: stats?.followUpsDue ?? 0, icon: Clock, color: "text-clinic-warning bg-clinic-warning/10" },
            { label: "Pending Lab Reviews", value: stats?.pendingLabReviews ?? 0, icon: Activity, color: "text-rose-500 bg-rose-500/10" },
            { label: "Completed Consults", value: stats?.completedConsultations ?? 0, icon: CheckCircle, color: "text-emerald-500 bg-emerald-500/10" },
            { label: "Today's Revenue", value: `₹${stats?.revenue ?? 0}`, icon: DollarSign, color: "text-clinic-accent bg-clinic-accent/10" }
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
<<<<<<< HEAD
              className="bg-clinic-surface border border-clinic-border/80 rounded-2xl p-4 sm:p-5 shadow-sm shadow-[#123b37]/[0.025] flex flex-col justify-between min-h-[108px]"
=======
              className="bg-clinic-surface border border-clinic-border rounded-clinic-12 p-4 shadow-sm flex flex-col justify-between"
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            >
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-semibold text-clinic-text-secondary uppercase tracking-wider line-clamp-2">
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

      {/* PRIORITY 1: ACTIVE PATIENT */}
      <section className="bg-clinic-surface border border-clinic-border/80 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-clinic-border pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-clinic-accent" />
            <span>Current consultation</span>
=======
      </div>

      {/* PRIORITY 1: ACTIVE PATIENT */}
      <section className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-6 shadow-sm flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-clinic-border pb-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary flex items-center gap-1.5">
            <Activity className="h-3.5 w-3.5 text-clinic-accent animate-pulse" />
            <span>Priority 1: Current Active Patient</span>
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
          </h2>
          {!isLoadingQueue && currentPatient && (
            <Badge variant="success">
              In Consultation
            </Badge>
          )}
        </div>

        {isLoadingQueue ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-1 w-full">
              <div className="flex items-center gap-2.5">
                <Skeleton className="h-6 w-20 rounded" />
                <Skeleton className="h-6 w-48 rounded" />
              </div>
              <Skeleton className="h-4 w-64 mt-2 rounded" />
              <Skeleton className="h-3 w-40 mt-1 rounded" />
            </div>
            <div className="flex flex-wrap gap-2 pt-2 border-t border-clinic-border/50">
              <Skeleton className="h-8 w-32 rounded animate-pulse" />
              <Skeleton className="h-8 w-32 rounded animate-pulse" />
            </div>
          </div>
        ) : queueError ? (
          <div className="py-6 text-center text-clinic-danger bg-clinic-danger/5 border border-clinic-danger/10 rounded-xl text-xs">
            Failed to load queue telemetry.
          </div>
        ) : currentPatient ? (
          <div className="flex flex-col gap-5">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div className="flex flex-col gap-1 min-w-0">
                <div className="flex items-center gap-2.5">
                  <span className="text-sm font-bold text-clinic-accent bg-clinic-bg border border-clinic-border px-2.5 py-0.5 rounded-md shadow-sm">
                    Token {currentPatient.tokenNumber}
                  </span>
                  <span className="text-base font-bold text-clinic-text-primary truncate">{currentPatient.patientName}</span>
                </div>
                <p className="text-xs text-clinic-text-secondary mt-2">
                  Visit Reason: <strong className="text-clinic-text-primary font-semibold">{currentPatient.visitReason}</strong>
                </p>
                <p className="text-[10px] text-clinic-text-secondary mt-0.5">
                  Priority: <span className="capitalize font-semibold text-clinic-accent">{currentPatient.priority}</span>
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-2 pt-2 border-t border-clinic-border/50">
              <Button 
                onClick={() => handleOpenConsultation(currentPatient.id, currentPatient.patientId)}
                className="flex items-center gap-1.5 text-xs bg-clinic-accent text-white"
              >
                <Play className="h-3.5 w-3.5" fill="currentColor" />
                <span>Open SOAP / Consult</span>
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => handleViewHistory(currentPatient.patientId)}
                className="flex items-center gap-1.5 text-xs border-clinic-border text-clinic-text-primary bg-clinic-surface hover:bg-clinic-bg"
              >
                <FileText className="h-3.5 w-3.5" />
                <span>View Patient History</span>
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => handleGeneratePrescription(currentPatient.patientId, currentPatient.id)}
                className="flex items-center gap-1.5 text-xs border-clinic-border text-clinic-text-primary bg-clinic-surface hover:bg-clinic-bg"
              >
                <Heart className="h-3.5 w-3.5" />
                <span>Add Prescription</span>
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => handleUpdateStatus(currentPatient.id, 'completed')}
                className="flex items-center gap-1.5 text-xs text-clinic-success hover:bg-clinic-success/10"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Mark Completed</span>
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => handleUpdateStatus(currentPatient.id, 'missed')}
                className="flex items-center gap-1.5 text-xs text-clinic-danger hover:bg-clinic-danger/10"
              >
                <AlertCircle className="h-3.5 w-3.5" />
                <span>Mark Missed</span>
              </Button>
            </div>
          </div>
        ) : (
<<<<<<< HEAD
          <div className="min-h-32 text-clinic-text-secondary text-xs flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
            <div className="h-10 w-10 rounded-xl bg-clinic-bg flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-clinic-accent" />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-semibold text-clinic-text-primary">Ready for the next patient</p>
              <p className="text-[11px] text-clinic-text-secondary mt-1">The waiting queue is listed below.</p>
=======
          <div className="py-8 text-center text-clinic-text-secondary text-xs flex flex-col items-center justify-center gap-3">
            <Clock className="h-8 w-8 text-clinic-border" />
            <div>
              <p className="font-semibold text-clinic-text-primary">No active patient called to room</p>
              <p className="text-[10px] text-clinic-text-secondary mt-0.5">Call the next patient from the waiting queue below.</p>
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            </div>
            {waitingTokens.length > 0 && (
              <Button 
                size="sm"
                onClick={() => handleUpdateStatus(waitingTokens[0].id, 'called')}
                className="mt-1"
              >
                Call Next Patient ({waitingTokens[0].tokenNumber})
              </Button>
            )}
          </div>
        )}
      </section>

      {/* Grid splits */}
<<<<<<< HEAD
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-5 items-start">
        {/* WAITING QUEUE */}
        <section className="bg-clinic-surface border border-clinic-border/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col gap-4 min-w-0">
=======
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* WAITING QUEUE */}
        <section className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-6 shadow-sm flex flex-col gap-4 min-h-[350px]">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
          <div className="flex justify-between items-center border-b border-clinic-border pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary">
              Lobby Queue
            </h2>
            {!isLoadingQueue && !queueError && (
              <Badge variant={waitingTokens.length > 0 ? "warning" : "success"}>
                {waitingTokens.length} waiting
              </Badge>
            )}
          </div>

          <div className="flex flex-col gap-3">
            {isLoadingQueue ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex flex-col p-3.5 bg-clinic-bg border border-clinic-border rounded-clinic-10 gap-2.5">
                  <Skeleton className="h-4 w-32 rounded" />
                  <Skeleton className="h-3 w-48 mt-1 rounded" />
                  <div className="flex items-center gap-2 pt-2 border-t border-clinic-border/50 mt-1">
                    <Skeleton className="h-7 w-20 rounded" />
                    <Skeleton className="h-7 w-12 rounded" />
                  </div>
                </div>
              ))
            ) : queueError ? (
              <div className="py-8 text-center text-clinic-danger bg-clinic-danger/5 border border-clinic-danger/10 rounded-xl text-xs">
                Failed to load queue.
              </div>
            ) : waitingTokens.length === 0 ? (
<<<<<<< HEAD
              <div className="min-h-32 text-center text-clinic-text-secondary text-xs flex flex-col items-center justify-center gap-2">
                <div className="h-10 w-10 rounded-xl bg-clinic-bg flex items-center justify-center"><Users className="h-5 w-5 text-clinic-accent" /></div>
                <span className="font-semibold text-clinic-text-primary">No one is waiting</span>
=======
              <div className="py-16 text-center text-clinic-text-secondary text-xs flex flex-col items-center justify-center gap-2">
                <Users className="h-8 w-8 text-clinic-border" />
                <span className="font-semibold text-clinic-text-primary">Lobby queue is clear</span>
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
              </div>
            ) : (
              waitingTokens.map((tok: any) => (
                <div 
                  key={tok.id} 
                  className="flex flex-col p-3.5 bg-clinic-bg border border-clinic-border rounded-clinic-10 gap-2.5"
                >
                  <div className="flex justify-between items-start">
                    <div className="min-w-0 flex flex-col">
                      <span className="text-xs font-bold text-clinic-text-primary truncate">{tok.patientName}</span>
                      <span className="text-[10px] text-clinic-text-secondary mt-0.5">
                        Token: <strong className="text-clinic-accent">{tok.tokenNumber}</strong> • Reason: {tok.visitReason}
                      </span>
                    </div>
                    <Badge variant={tok.priority === 'emergency' ? 'danger' : tok.priority === 'urgent' ? 'warning' : 'neutral'}>
                      {tok.priority}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 border-t border-clinic-border/50 pt-2">
                    <Button 
                      size="sm"
                      onClick={() => handleUpdateStatus(tok.id, 'called')}
                      disabled={!!currentPatient}
                      title={currentPatient ? "Finish current consultation first" : "Call to room"}
                    >
                      Call to Room
                    </Button>
                    <Button 
                      size="sm"
                      variant="ghost"
                      onClick={() => handleUpdateStatus(tok.id, 'missed')}
                    >
                      Skip
                    </Button>
                    <Button 
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewHistory(tok.patientId)}
                    >
                      History
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* TODAY'S APPOINTMENTS */}
<<<<<<< HEAD
        <section className="bg-clinic-surface border border-clinic-border/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col gap-4 min-w-0">
=======
        <section className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-6 shadow-sm flex flex-col gap-4 min-h-[350px]">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
          <div className="flex justify-between items-center border-b border-clinic-border pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary">
              Today's Appointments
            </h2>
            {!isLoadingAppts && !apptsError && <Badge variant="neutral">{appointments.length} total</Badge>}
          </div>

          <div className="flex flex-col gap-3">
            {isLoadingAppts ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-clinic-bg border border-clinic-border rounded-clinic-10 h-[58px]">
                  <div className="flex flex-col gap-1.5 w-full">
                    <Skeleton className="h-4 w-36 rounded" />
                    <Skeleton className="h-3 w-48 rounded" />
                  </div>
                </div>
              ))
            ) : apptsError ? (
              <div className="py-8 text-center text-clinic-danger bg-clinic-danger/5 border border-clinic-danger/10 rounded-xl text-xs">
                Failed to load appointments.
              </div>
            ) : appointments.length === 0 ? (
              <div className="py-16 text-center text-clinic-text-secondary text-xs flex flex-col items-center justify-center gap-2">
                <Calendar className="h-8 w-8 text-clinic-border" />
                <span className="font-semibold text-clinic-text-primary">No appointments scheduled</span>
              </div>
            ) : (
              appointments.map((appt: any) => (
                <div 
                  key={appt.id} 
                  className="flex items-center justify-between p-3 bg-clinic-bg border border-clinic-border rounded-clinic-10"
                >
                  <div className="min-w-0 flex flex-col">
                    <span className="text-xs font-bold text-clinic-text-primary truncate">{appt.patient?.fullName || appt.patientName}</span>
                    <span className="text-[10px] text-clinic-text-secondary truncate mt-0.5">
<<<<<<< HEAD
                      Time: {appt.time} • Status: <span className="capitalize font-semibold text-clinic-accent">{(appt.status || 'scheduled').toLowerCase()}</span>
=======
                      Time: {appt.time} • Status: <span className="capitalize font-semibold text-clinic-accent">{appt.status.toLowerCase()}</span>
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleViewHistory(appt.patientId)}
                    className="text-xs font-semibold text-clinic-accent hover:underline flex items-center gap-1"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="h-3 w-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* AUDIT LOG / RECENT CLINIC ACTIVITY */}
<<<<<<< HEAD
        <section className="bg-clinic-surface border border-clinic-border/80 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col gap-4">
=======
        <section className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-6 shadow-sm flex flex-col gap-4 min-h-[350px]">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
          <div className="flex justify-between items-center border-b border-clinic-border pb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary">
              Recent Clinic Activity
            </h2>
            <Badge variant="neutral">Live log</Badge>
          </div>

          <div className="flex flex-col gap-3.5 max-h-[350px] overflow-y-auto pr-1">
            {isLoadingActivity ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex gap-2.5 items-start text-xs border-b border-clinic-border/40 pb-2.5 last:border-b-0 w-full">
                  <Skeleton className="h-5 w-5 rounded-full shrink-0" />
                  <div className="flex flex-col gap-1.5 w-full">
                    <Skeleton className="h-3.5 w-48 rounded" />
                    <Skeleton className="h-3 w-36 mt-1 rounded" />
                  </div>
                </div>
              ))
            ) : activityError ? (
              <div className="py-8 text-center text-clinic-danger bg-clinic-danger/5 border border-clinic-danger/10 rounded-xl text-xs">
                Failed to load activities.
              </div>
            ) : recentActivity.length === 0 ? (
<<<<<<< HEAD
              <div className="min-h-32 text-center text-clinic-text-secondary text-xs italic flex items-center justify-center">
=======
              <div className="py-16 text-center text-clinic-text-secondary text-xs italic">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                No recent clinic actions logged.
              </div>
            ) : (
              recentActivity.map((log: any) => {
                const date = new Date(log.timestamp);
                const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                return (
                  <div key={log.id} className="flex gap-2.5 items-start text-xs border-b border-clinic-border/40 pb-2.5 last:border-b-0">
                    <div className="bg-clinic-accent/10 text-clinic-accent rounded-full p-1 mt-0.5 shrink-0">
                      <Activity className="h-3 w-3" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-clinic-text-primary text-[11px] leading-tight">
                        {log.action}
                      </span>
                      <span className="text-[10px] text-clinic-text-secondary mt-0.5">
                        By {log.user?.email || 'System'} ({log.role}) • {timeStr}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
