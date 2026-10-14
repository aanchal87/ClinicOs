'use client';

import React, { useState, useEffect } from 'react';
import { 
  useAppointments, useBookAppointment, usePatients, useCheckInAppointment 
} from '@/shared/hooks/useClinicApi';
import { 
  Calendar as CalendarIcon, Clock, User, Plus, 
  ChevronLeft, ChevronRight, Check, X, ShieldAlert, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/shared/components/ui/Button';
import Select from '@/shared/components/ui/Select';
import Input from '@/shared/components/ui/Input';
import Badge from '@/shared/components/ui/Badge';
import Spinner from '@/shared/components/ui/Spinner';

export default function CalendarPage() {
  const [activeView, setActiveView] = useState<'day' | 'week' | 'month'>('day');
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  
  // Slot booking drawer state
  const [bookingSlot, setBookingSlot] = useState<number | null>(null);
  
  // Form states
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [apptType, setApptType] = useState<'consultation' | 'followup' | 'procedure'>('consultation');
  const [apptNotes, setApptNotes] = useState('');

  // API Queries
  const { data: appointments = [], isLoading: appointmentsLoading } = useAppointments(selectedDate);
  const { data: patients = [] } = usePatients();

  const bookApptMutation = useBookAppointment();
  const checkInMutation = useCheckInAppointment();

  const handleCheckIn = (appointmentId: string) => {
    checkInMutation.mutate(appointmentId, {
      onSuccess: () => {
        alert("Patient checked in successfully! Visit log created and Queue token generated.");
      },
      onError: (err: any) => {
        alert(err?.response?.data?.message || "Check-in failed. Please try again.");
      }
    });
  };

  // Set default patient
  useEffect(() => {
    if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId]);

  const SLOT_TIMINGS = [
    '09:00 AM - 09:45 AM',
    '09:45 AM - 10:30 AM',
    '10:30 AM - 11:15 AM',
    '11:15 AM - 12:00 PM',
    '12:00 PM - 12:45 PM',
    '12:45 PM - 01:30 PM', // Slot 6 (Lunch)
    '01:30 PM - 02:15 PM',
    '02:15 PM - 03:00 PM',
    '03:00 PM - 03:45 PM',
    '03:45 PM - 04:30 PM',
    '04:30 PM - 05:15 PM',
    '05:15 PM - 06:00 PM'
  ];

  const handleBookSlot = (e: React.FormEvent) => {
    e.preventDefault();
    if (bookingSlot === null || !selectedPatientId) return;

    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) return;

    bookApptMutation.mutate({
      patientId: selectedPatientId,
      patientName: patient.name,
      date: selectedDate,
      timeSlot: bookingSlot,
      status: apptType === 'followup' ? 'followup' : 'booked',
      type: apptType,
      notes: apptNotes
    }, {
      onSuccess: () => {
        setBookingSlot(null);
        setApptNotes('');
      }
    });
  };

  const handleNextDate = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const handlePrevDate = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  return (
<<<<<<< HEAD
    <div className="flex flex-col gap-5 sm:gap-7">
      {/* Title + Views Switcher row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-clinic-accent mb-2">Appointments</p>
          <h1 className="text-2xl sm:text-[28px] font-semibold tracking-tight text-clinic-text-primary">Schedule</h1>
          <p className="text-sm text-clinic-text-secondary mt-1.5">
            Find a visit by day, week, or month.
=======
    <div className="flex flex-col gap-8">
      {/* Title + Views Switcher row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-clinic-text-primary">Appointment Calendar</h1>
          <p className="text-sm text-clinic-text-secondary mt-1">
            Day, week, and month visual appointment slot tracking system.
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex p-1 bg-clinic-surface border border-clinic-border rounded-clinic-14 text-xs font-semibold self-start sm:self-center">
          {(['day', 'week', 'month'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setActiveView(v)}
              className={`px-4 py-2 rounded-clinic-10 text-center transition-all cursor-pointer capitalize ${
                activeView === v
                  ? 'bg-clinic-accent text-white shadow-sm'
                  : 'text-clinic-text-secondary hover:text-clinic-text-primary'
              }`}
            >
              {v} View
            </button>
          ))}
        </div>
      </div>

      {/* Date Navigator Banner */}
<<<<<<< HEAD
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 bg-clinic-surface border border-clinic-border rounded-2xl shadow-sm">
        <div className="flex items-center justify-between gap-2 min-w-0">
=======
      <div className="flex items-center justify-between p-4 bg-clinic-surface border border-clinic-border rounded-clinic-14 shadow-sm">
        <div className="flex items-center gap-3">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
          <button 
            onClick={handlePrevDate}
            className="p-2 border border-clinic-border text-clinic-text-secondary hover:text-clinic-text-primary hover:bg-clinic-bg rounded-clinic-10 cursor-pointer"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
<<<<<<< HEAD
          <span className="text-xs sm:text-sm font-bold text-clinic-text-primary text-center truncate">
            {new Date(selectedDate).toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}
=======
          <span className="text-sm font-bold text-clinic-text-primary">
            {new Date(selectedDate).toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
          </span>
          <button 
            onClick={handleNextDate}
            className="p-2 border border-clinic-border text-clinic-text-secondary hover:text-clinic-text-primary hover:bg-clinic-bg rounded-clinic-10 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        
<<<<<<< HEAD
        <div className="flex items-center gap-2 text-[11px] sm:text-xs text-clinic-text-secondary pl-1">
=======
        <div className="flex items-center gap-2 text-xs text-clinic-text-secondary">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
          <CalendarIcon className="h-4 w-4" />
          <span>Clinic hours: 09:00 AM - 06:00 PM</span>
        </div>
      </div>

      {/* VIEW PANEL RENDERS */}
<<<<<<< HEAD
      <div className="bg-clinic-surface border border-clinic-border rounded-2xl shadow-sm overflow-hidden p-3 sm:p-5 lg:p-6">
=======
      <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 shadow-sm overflow-hidden p-6">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
        
        {/* DAY VIEW (The standard 12 slots core workflow) */}
        {activeView === 'day' && (
          appointmentsLoading ? (
            <div className="py-20 flex justify-center"><Spinner /></div>
          ) : (
            <div className="flex flex-col divide-y divide-clinic-border">
              {appointments.map((slot) => {
                const timeStr = SLOT_TIMINGS[slot.timeSlot - 1];
                const isLunch = slot.timeSlot === 6;

                return (
                  <div 
                    key={slot.id}
<<<<<<< HEAD
                    className={`flex flex-col lg:flex-row lg:items-center justify-between py-4 gap-3 lg:gap-4 ${
=======
                    className={`flex flex-col sm:flex-row sm:items-center justify-between py-4 gap-4 ${
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                      isLunch ? 'bg-zinc-50/50 dark:bg-zinc-900/10' : ''
                    }`}
                  >
                    {/* Time details */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="p-2 bg-clinic-bg border border-clinic-border text-clinic-text-secondary rounded-clinic-10 flex items-center justify-center">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-clinic-text-secondary">Slot #{slot.timeSlot}</span>
                        <span className="text-sm font-bold text-clinic-text-primary">{timeStr}</span>
                      </div>
                    </div>

                    {/* Booking metadata */}
                    <div className="flex-1 px-0 sm:px-6">
                      {slot.status === 'available' ? (
                        <span className="text-xs text-clinic-text-secondary font-medium italic">
                          No bookings scheduled. Slot is available.
                        </span>
                      ) : slot.status === 'holiday' ? (
                        <span className="text-xs text-clinic-text-secondary flex items-center gap-1.5 italic">
                          <ShieldAlert className="h-3.5 w-3.5 text-clinic-text-secondary" />
                          {slot.notes || 'Clinic holiday'}
                        </span>
                      ) : (
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
                          <div className="flex items-center gap-2">
                            <div className="h-7 w-7 rounded-full bg-clinic-accent/10 text-clinic-accent flex items-center justify-center font-bold text-xs">
                              {slot.patientName?.slice(0,2).toUpperCase()}
                            </div>
                            <span className="text-sm font-bold text-clinic-text-primary">{slot.patientName}</span>
                          </div>
                          {slot.notes && (
                            <span className="text-xs text-clinic-text-secondary">({slot.notes})</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action button */}
                    <div className="shrink-0 flex items-center gap-3">
                      <Badge 
                        variant={
                          slot.status === 'booked' 
                            ? 'info' 
                            : slot.status === 'followup' 
                              ? 'warning' 
                              : slot.status === 'holiday'
                                ? 'neutral'
                                : 'success'
                        }
                      >
                        {slot.status === 'booked' ? 'Booked' : slot.status === 'followup' ? 'Follow Up' : slot.status === 'holiday' ? 'Closed' : 'Available'}
                      </Badge>

                      {slot.status === 'available' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setBookingSlot(slot.timeSlot)}
                          className="flex items-center gap-1 text-xs"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          <span>Schedule</span>
                        </Button>
                      )}

                      {(slot.status === 'booked' || slot.status === 'followup') && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleCheckIn(slot.id)}
                          isLoading={checkInMutation.isPending && checkInMutation.variables === slot.id}
                          className="flex items-center gap-1 text-xs text-clinic-accent border-clinic-accent/30 bg-clinic-accent/10 hover:bg-clinic-accent/20"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Check In</span>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* WEEK VIEW (MOCK MULTI-COLUMN WEEK GRID) */}
        {activeView === 'week' && (
<<<<<<< HEAD
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3 text-center">
=======
          <div className="grid grid-cols-7 gap-4 text-center">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
              const count = idx === 0 ? 5 : idx === 3 ? 6 : idx === 5 ? 2 : idx === 6 ? 0 : 4;
              return (
                <div key={day} className="flex flex-col bg-clinic-bg/40 border border-clinic-border rounded-clinic-14 p-4 gap-4">
                  <span className="text-xs font-bold text-clinic-text-secondary uppercase">{day}</span>
                  <div className="text-2xl font-bold text-clinic-text-primary">{count} slots</div>
                  <span className="text-[10px] text-clinic-text-secondary uppercase font-semibold">Scheduled visits</span>
                  <div className="flex flex-col gap-1.5 mt-2">
                    {Array.from({ length: Math.min(count, 3) }).map((_, i) => (
                      <div key={i} className="text-[10px] bg-clinic-surface border border-clinic-border p-1.5 rounded-clinic-6 font-semibold truncate text-clinic-accent">
                        Patient #{i+1}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* MONTH VIEW (MOCK CALENDAR DAYS MATRIX) */}
        {activeView === 'month' && (
<<<<<<< HEAD
            <div className="flex flex-col gap-3">
            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs font-bold text-clinic-text-secondary uppercase">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
            <div className="grid grid-cols-7 gap-1 sm:gap-2 min-h-[16rem] sm:h-72">
=======
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-clinic-text-secondary uppercase">
              <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
            </div>
            <div className="grid grid-cols-7 gap-2 h-72">
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
              {Array.from({ length: 31 }).map((_, i) => {
                const dayNum = i + 1;
                const hasVisits = dayNum % 4 === 0;
                return (
<<<<<<< HEAD
                  <div key={i} className="bg-clinic-bg border border-clinic-border/60 rounded-lg sm:rounded-xl p-1.5 sm:p-2 flex flex-col justify-between hover:bg-clinic-bg/85 cursor-pointer min-h-9">
                    <span className="text-[10px] sm:text-xs font-bold text-clinic-text-secondary">{dayNum}</span>
=======
                  <div key={i} className="bg-clinic-bg border border-clinic-border/60 rounded-clinic-10 p-2 flex flex-col justify-between hover:bg-clinic-bg/85 cursor-pointer">
                    <span className="text-xs font-bold text-clinic-text-secondary">{dayNum}</span>
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                    {hasVisits && (
                      <div className="h-1.5 w-1.5 rounded-full bg-clinic-accent mx-auto" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>

      {/* Booking Slot Drawer Panel */}
      <AnimatePresence>
        {bookingSlot !== null && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-[1px]"
              onClick={() => setBookingSlot(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md bg-clinic-surface border-l border-clinic-border h-full p-6 shadow-2xl flex flex-col z-10"
            >
              <div className="flex justify-between items-center border-b border-clinic-border pb-4 mb-6">
                <div className="flex flex-col">
                  <h2 className="text-lg font-bold text-clinic-text-primary">Schedule Appointment</h2>
                  <span className="text-xs text-clinic-text-secondary mt-1">
                    Slot #{bookingSlot} ({SLOT_TIMINGS[bookingSlot - 1]})
                  </span>
                </div>
                <button 
                  onClick={() => setBookingSlot(null)} 
                  className="text-clinic-text-secondary hover:text-clinic-text-primary text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {patients.length === 0 ? (
                <div className="text-center py-10 flex flex-col gap-2">
                  <span className="text-xs text-clinic-text-secondary">Register a patient first before scheduling them.</span>
                </div>
              ) : (
                <form onSubmit={handleBookSlot} className="flex flex-col gap-5 flex-1 overflow-y-auto">
                  <Select
                    label="Select Patient"
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    options={patients.map(p => ({ value: p.id, label: `${p.name} (${p.phone})` }))}
                  />

                  <Select
                    label="Appointment Type"
                    value={apptType}
                    onChange={(e) => setApptType(e.target.value as any)}
                    options={[
                      { value: 'consultation', label: 'Clinical Consultation' },
                      { value: 'followup', label: 'Progress Follow-Up' },
                      { value: 'procedure', label: 'Laser / Treatment Procedure' }
                    ]}
                  />

                  <Input 
                    label="Schedules Notes" 
                    placeholder="e.g. Skin laser session 3, post treatment check"
                    value={apptNotes}
                    onChange={(e) => setApptNotes(e.target.value)}
                    required
                  />

                  <Button 
                    type="submit" 
                    isLoading={bookApptMutation.isPending}
                    className="w-full mt-6"
                  >
                    Confirm Booking
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
