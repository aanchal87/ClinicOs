'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUiStore } from '@/shared/stores/uiStore';
import { 
  useTokens, useCreateToken, useUpdateTokenStatus, usePatients 
} from '@/shared/hooks/useClinicApi';
import { 
  Clock, Plus, Users, Play, AlertCircle, ChevronRight, 
  User, CheckCircle, HelpCircle, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Button from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';
import Select from '@/shared/components/ui/Select';
import Badge from '@/shared/components/ui/Badge';
import { TokenPriority } from '@/shared/types';

export default function QueuePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const currentRole = useUiStore((state) => state.currentRole);
  const tokenDrawerOpen = useUiStore((state) => state.tokenDrawerOpen);
  const setTokenDrawerOpen = useUiStore((state) => state.setTokenDrawerOpen);
  const setActivePatientId = useUiStore((state) => state.setActivePatientId);

  const { data: tokens = [], isLoading: tokensLoading } = useTokens();
  const { data: patients = [] } = usePatients();

  const createTokenMutation = useCreateToken();
  const updateTokenStatus = useUpdateTokenStatus();

  // Form states
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [visitReason, setVisitReason] = useState('');
  const [priority, setPriority] = useState<TokenPriority>('normal');

  useEffect(() => {
    if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId]);

  const handleIssueToken = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !visitReason) return;

    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) return;

    createTokenMutation.mutate({
      patientId: selectedPatientId,
      patientName: patient.name,
      priority,
      visitReason,
      doctorName: 'Dr. Adrian Vance'
    }, {
      onSuccess: () => {
        setTokenDrawerOpen(false);
        setVisitReason('');
        setPriority('normal');
      }
    });
  };

  const handleUpdateStatus = (tokenId: string, status: 'waiting' | 'called' | 'started' | 'completed' | 'missed') => {
    updateTokenStatus.mutate({ tokenId, status });
  };

  const handleViewPatient = (patientId: string) => {
    setActivePatientId(patientId);
    router.push('/patients');
  };

  // Filter queue records
  const activeQueue = tokens.filter(t => t.status !== 'completed');
  const completedQueue = tokens.filter(t => t.status === 'completed');

  return (
    <div className="flex flex-col gap-8 max-w-[1200px] mx-auto">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-clinic-border pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-clinic-text-primary">Lobby Queue Manager</h1>
          <p className="text-xs text-clinic-text-secondary mt-1">
            Real-time physical lobby queue tracker. Exposing calling actions for active rooms.
          </p>
        </div>
        
        {currentRole === 'receptionist' && (
          <Button
            onClick={() => setTokenDrawerOpen(true)}
            className="flex items-center gap-2 self-start cursor-pointer text-xs"
          >
            <Plus className="h-4 w-4" />
            <span>Generate Token</span>
          </Button>
        )}
      </div>

      {/* Structured Action List Panel */}
      <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 shadow-sm overflow-hidden flex flex-col gap-4 p-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary">
          Active Queue List ({activeQueue.length} Patients)
        </h2>

        {activeQueue.length === 0 ? (
          <div className="py-16 text-center text-clinic-text-secondary text-xs flex flex-col items-center gap-2 justify-center">
            <Check className="h-8 w-8 text-clinic-success" />
            <span className="font-semibold">Queue is clear!</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-clinic-border text-clinic-text-secondary font-semibold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Token</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Checked-In</th>
                  <th className="py-3 px-4">Wait Time</th>
                  <th className="py-3 px-4">Visit Reason</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-clinic-border text-clinic-text-primary">
                {activeQueue.map((t) => (
                  <tr key={t.id} className="hover:bg-clinic-bg/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-clinic-accent">{t.tokenNumber}</td>
                    <td className="py-3.5 px-4 font-semibold">{t.patientName}</td>
                    <td className="py-3.5 px-4 text-clinic-text-secondary">{t.checkInTime}</td>
                    <td className="py-3.5 px-4 text-clinic-text-secondary font-medium">15 min</td>
                    <td className="py-3.5 px-4 truncate max-w-xs">{t.visitReason}</td>
                    <td className="py-3.5 px-4">
                      <Badge 
                        variant={
                          t.status === 'started' 
                            ? 'success' 
                            : t.status === 'called' 
                              ? 'info' 
                              : t.status === 'missed' 
                                ? 'danger' 
                                : 'warning'
                        }
                      >
                        {t.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex gap-1.5 justify-end">
                        {t.status === 'waiting' && currentRole === 'doctor' && (
                          <Button 
                            size="sm"
                            onClick={() => handleUpdateStatus(t.id, 'called')}
                          >
                            Call
                          </Button>
                        )}
                        {t.status === 'called' && currentRole === 'doctor' && (
                          <Button 
                            size="sm"
                            onClick={() => handleUpdateStatus(t.id, 'started')}
                          >
                            Start Exam
                          </Button>
                        )}
                        {t.status === 'waiting' && (
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleUpdateStatus(t.id, 'missed')}
                            disabled={currentRole === 'receptionist'}
                          >
                            Skip
                          </Button>
                        )}
                        {t.status === 'missed' && (
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={() => handleUpdateStatus(t.id, 'waiting')}
                            disabled={currentRole === 'receptionist'}
                          >
                            Re-Queue
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleViewPatient(t.patientId)}
                        >
                          View Patient
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Slide-over Token Generation Drawer */}
      <AnimatePresence>
        {tokenDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-[1px]"
              onClick={() => setTokenDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md bg-clinic-surface border-l border-clinic-border h-full p-6 shadow-2xl flex flex-col z-10"
            >
              <div className="flex justify-between items-center border-b border-clinic-border pb-4 mb-6">
                <h2 className="text-lg font-bold text-clinic-text-primary">Generate Queue Token</h2>
                <button 
                  onClick={() => setTokenDrawerOpen(false)} 
                  className="text-clinic-text-secondary hover:text-clinic-text-primary text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {patients.length === 0 ? (
                <div className="text-center py-10 flex flex-col gap-2">
                  <span className="text-xs text-clinic-text-secondary">Register a patient first before queueing them.</span>
                </div>
              ) : (
                <form onSubmit={handleIssueToken} className="flex flex-col gap-5 flex-1 overflow-y-auto">
                  <Select
                    label="Select Patient"
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    options={patients.map(p => ({ value: p.id, label: `${p.name} (${p.phone})` }))}
                  />

                  <Input 
                    label="Visit Reason / Symptoms" 
                    placeholder="e.g. Laser Session 3 review, rash, follow-up"
                    value={visitReason}
                    onChange={(e) => setVisitReason(e.target.value)}
                    required
                  />

                  <Select
                    label="Queue Priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    options={[
                      { value: 'normal', label: 'Normal - Standard booking' },
                      { value: 'urgent', label: 'Urgent - Priority attention' },
                      { value: 'emergency', label: 'Emergency - Immediate care' }
                    ]}
                  />

                  <Button 
                    type="submit" 
                    isLoading={createTokenMutation.isPending}
                    className="w-full mt-6"
                  >
                    Issue Token & Broadcast
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
