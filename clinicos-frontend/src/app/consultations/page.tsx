'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUiStore } from '@/shared/stores/uiStore';
import { 
  usePatient, useTokens, useCreateConsultation, useConsultations, useLabs, usePatientHistory, useCloseVisit 
} from '@/shared/hooks/useClinicApi';
import { 
  FileText, Plus, Trash2, Printer, CheckCircle, 
  ArrowLeft, AlertTriangle, ShieldAlert, Heart, Activity,
  Users, CheckSquare, Square
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/shared/components/ui/Button';
import { Input, Textarea } from '@/shared/components/ui/Input';
import Badge from '@/shared/components/ui/Badge';
import Avatar from '@/shared/components/ui/Avatar';
import Spinner from '@/shared/components/ui/Spinner';
import { PrescriptionItem } from '@/shared/types';

export default function ConsultationsPage() {
  const router = useRouter();
  const activePatientId = useUiStore((state) => state.activePatientId);
  const setActivePatientId = useUiStore((state) => state.setActivePatientId);

  // Fetch active doctor token
  const { data: tokens = [] } = useTokens();
  const activeToken = tokens.find(t => t.patientId === activePatientId && (t.status === 'started' || t.status === 'called'));

  // Patient queries
  const { data: patient, isLoading: patientLoading } = usePatient(activePatientId);
  const { data: consults = [] } = useConsultations(activePatientId || undefined);
  const { data: labs = [] } = useLabs(activePatientId || undefined);
  const { data: historyData } = usePatientHistory(activePatientId);

  // Mutations
  const createConsultMutation = useCreateConsultation();
  const closeVisitMutation = useCloseVisit();

  // SOAP state
  const [subjective, setSubjective] = useState('');
  const [objective, setObjective] = useState('');
  const [assessment, setAssessment] = useState('');
  const [plan, setPlan] = useState('');

  // Prescription builder state
  const [prescriptionItems, setPrescriptionItems] = useState<PrescriptionItem[]>([
    { drugName: 'Metronidazole 1% Cream', dosage: 'Apply thin layer', frequency: '0-0-1', duration: '14 days', instructions: 'Apply after washing face' }
  ]);

  // Lab orders state
  const [labOrders, setLabOrders] = useState<string[]>([]);
  const [newLabTest, setNewLabTest] = useState('');

  // Prescription print preview modal
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);

  // Autofill forms on mount with templates if blank
  useEffect(() => {
    if (patient) {
      setSubjective(`Patient reports back for progress review regarding ${patient.medicalConditions[0] || 'skin treatment'}.`);
      setObjective("Mild erythema noted. General texture is smooth. No signs of infection.");
      setAssessment(`${patient.medicalConditions[0] || 'Skin rash'} - responding well to current topical treatment.`);
      setPlan("Continue topical application. Schedule review in 14 days.");
    }
  }, [patient]);

  const handleAddMedication = () => {
    setPrescriptionItems([
      ...prescriptionItems,
      { drugName: '', dosage: '', frequency: '1-0-1', duration: '7 days', instructions: 'After food' }
    ]);
  };

  const handleRemoveMedication = (index: number) => {
    setPrescriptionItems(prescriptionItems.filter((_, i) => i !== index));
  };

  const handleMedicationChange = (index: number, key: keyof PrescriptionItem, value: string) => {
    const nextList = [...prescriptionItems];
    nextList[index][key] = value;
    setPrescriptionItems(nextList);
  };

  const handleAddLabTest = () => {
    if (newLabTest.trim()) {
      setLabOrders([...labOrders, newLabTest.trim()]);
      setNewLabTest('');
    }
  };

  const handleRemoveLabTest = (test: string) => {
    setLabOrders(labOrders.filter(t => t !== test));
  };

  const handleCompleteConsultation = () => {
    if (!activePatientId) return;

    const openVisit = historyData?.visits?.find((v: any) => v.status === 'OPEN');
    
    createConsultMutation.mutate({
      patientId: activePatientId,
      tokenNumber: activeToken?.tokenNumber || 'T-00',
      tokenId: activeToken?.id,
      symptoms: subjective,
      notes: assessment,
      soapNotes: {
        subjective,
        objective,
        assessment,
        plan
      },
      prescriptions: prescriptionItems.filter(item => item.drugName),
      labOrders,
      followUpDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 2 weeks follow up
    }, {
      onSuccess: () => {
        if (openVisit?.id) {
          closeVisitMutation.mutate(openVisit.id);
        }
        setActivePatientId(null);
        router.push('/dashboard');
      }
    });
  };

  if (patientLoading) {
    return <div className="py-20 flex justify-center"><Spinner size="lg" /></div>;
  }

  if (!patient) {
    return (
      <div className="h-[70vh] flex flex-col items-center justify-center gap-3 text-center">
        <Users className="h-10 w-10 text-clinic-border" />
        <h3 className="text-base font-bold text-clinic-text-primary">No active patient consultation session</h3>
        <p className="text-sm text-clinic-text-secondary max-w-sm">
          Please select a patient from the Queue Dashboard and call them to Room 1 to enter this consultation workspace.
        </p>
        <Button onClick={() => router.push('/dashboard')} className="mt-2">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header action bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-clinic-border gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => router.push('/dashboard')} className="p-1 cursor-pointer">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-clinic-text-primary">Active Consultation</h1>
              <Badge variant="success">In Session</Badge>
            </div>
            <span className="text-xs text-clinic-text-secondary">Token: {activeToken?.tokenNumber || 'T-00'} • Patient: {patient.name}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button 
            variant="secondary" 
            onClick={() => setPrintPreviewOpen(true)}
            className="flex items-center gap-2"
          >
            <Printer className="h-4 w-4" />
            <span>Print Rx Preview</span>
          </Button>
          <Button 
            onClick={handleCompleteConsultation}
            isLoading={createConsultMutation.isPending}
            className="flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Complete Consultation</span>
          </Button>
        </div>
      </div>

      {/* Horizontal Patient Profile Banner */}
      <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-4 shadow-sm flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={patient.name} src={patient.avatarUrl} size="md" className="shrink-0" />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-clinic-text-primary truncate">{patient.name}</span>
              <Badge variant="neutral">{patient.gender} • {patient.dob}</Badge>
              <Badge variant="info">Stage: {patient.treatmentStatus}</Badge>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-clinic-text-secondary mt-1">
              <span>Blood Group: <strong className="text-clinic-text-primary font-bold">{patient.bloodGroup}</strong></span>
              <span className="hidden sm:inline">•</span>
              <span>Phone: <strong className="text-clinic-text-primary font-medium">{patient.phone}</strong></span>
              <span className="hidden sm:inline">•</span>
              <span className="truncate">Address: <strong className="text-clinic-text-primary font-medium">{patient.address}</strong></span>
            </div>
          </div>
        </div>
        
        {/* Alerts / Conditions Badge List */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {patient.allergies.map(all => (
            <span key={all} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-bold bg-red-50 dark:bg-red-950/20 text-clinic-danger border border-red-200 dark:border-red-900/40 animate-pulse">
              <AlertTriangle className="h-3 w-3" />
              {all}
            </span>
          ))}
          {patient.medicalConditions.map(cond => (
            <span key={cond} className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-zinc-100 dark:bg-zinc-800 text-clinic-text-primary border border-clinic-border">
              {cond}
            </span>
          ))}
        </div>
      </div>

      {/* Split Layout: SOAP & Prescriptions Left (2 Columns width), References Right (1 Column) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start max-w-[1800px] w-full">
        
        {/* LEFT WORKSPACE (2 Columns width): SOAP Notes Form + Rx Builder */}
        <div className="xl:col-span-2 flex flex-col gap-8">
          
          {/* Section 1: SOAP Form */}
          <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-6 shadow-sm flex flex-col gap-6">
            <h2 className="text-base font-bold text-clinic-text-primary border-b border-clinic-border pb-3 flex items-center gap-2">
              <FileText className="h-4.5 w-4.5 text-clinic-accent" />
              <span>SOAP Clinical Examination Notes</span>
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Textarea 
                label="Subjective (S) - Patient Complaints" 
                placeholder="Describe symptoms, duration, history..."
                value={subjective}
                onChange={(e) => setSubjective(e.target.value)}
                rows={4}
              />
              <Textarea 
                label="Objective (O) - Vital Signs / Exam Notes" 
                placeholder="Describe general inspection, local lesion site status..."
                value={objective}
                onChange={(e) => setObjective(e.target.value)}
                rows={4}
              />
              <Textarea 
                label="Assessment (A) - Diagnosis" 
                placeholder="Enter diagnosis, differential diagnoses..."
                value={assessment}
                onChange={(e) => setAssessment(e.target.value)}
                rows={4}
              />
              <Textarea 
                label="Plan (P) - Treatment Plan" 
                placeholder="Describe medications, laser config settings, recalls..."
                value={plan}
                onChange={(e) => setPlan(e.target.value)}
                rows={4}
              />
            </div>
          </div>

          {/* Section 2: Prescription Builder */}
          <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-6 shadow-sm flex flex-col gap-6">
            <div className="flex justify-between items-center border-b border-clinic-border pb-3">
              <h2 className="text-base font-bold text-clinic-text-primary flex items-center gap-2">
                <Heart className="h-4.5 w-4.5 text-clinic-accent" />
                <span>Medication Prescription Builder</span>
              </h2>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={handleAddMedication}
                className="flex items-center gap-1 text-xs"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Medication</span>
              </Button>
            </div>

            <div className="flex flex-col gap-4">
              {prescriptionItems.map((item, index) => (
                <div 
                  key={index}
                  className="grid grid-cols-1 sm:grid-cols-5 gap-3 p-4 bg-clinic-bg border border-clinic-border rounded-clinic-10 items-end relative"
                >
                  <div className="sm:col-span-2">
                    <Input 
                      label="Drug Name" 
                      placeholder="e.g. Paracetamol 500mg"
                      value={item.drugName}
                      onChange={(e) => handleMedicationChange(index, 'drugName', e.target.value)}
                    />
                  </div>
                  <div>
                    <Input 
                      label="Dosage" 
                      placeholder="e.g. 1 tablet"
                      value={item.dosage}
                      onChange={(e) => handleMedicationChange(index, 'dosage', e.target.value)}
                    />
                  </div>
                  <div>
                    <Input 
                      label="Frequency" 
                      placeholder="e.g. 1-0-1"
                      value={item.frequency}
                      onChange={(e) => handleMedicationChange(index, 'frequency', e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="flex-1">
                      <Input 
                        label="Duration" 
                        placeholder="e.g. 5 days"
                        value={item.duration}
                        onChange={(e) => handleMedicationChange(index, 'duration', e.target.value)}
                      />
                    </div>
                    {prescriptionItems.length > 1 && (
                      <button 
                        type="button"
                        onClick={() => handleRemoveMedication(index)}
                        className="p-2 text-clinic-text-secondary hover:text-clinic-danger hover:bg-clinic-surface rounded-md border border-clinic-border mb-0.5 cursor-pointer"
                        title="Delete drug entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="sm:col-span-5">
                    <Input 
                      label="Instructions" 
                      placeholder="e.g. Take after meals with plenty of water"
                      value={item.instructions}
                      onChange={(e) => handleMedicationChange(index, 'instructions', e.target.value)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Lab Orders selection */}
          <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-6 shadow-sm flex flex-col gap-4">
            <h2 className="text-base font-bold text-clinic-text-primary border-b border-clinic-border pb-3">Lab Investigation Orders</h2>
            
            <div className="flex gap-3 max-w-md">
              <input
                type="text"
                placeholder="e.g. Complete Blood Count (CBC)"
                value={newLabTest}
                onChange={(e) => setNewLabTest(e.target.value)}
                className="flex-1 px-3 py-1.5 text-sm bg-clinic-bg border border-clinic-border rounded-clinic-10 focus:outline-none focus:ring-1 focus:ring-clinic-accent text-clinic-text-primary"
              />
              <Button type="button" size="sm" onClick={handleAddLabTest}>Add Order</Button>
            </div>

            {labOrders.length > 0 ? (
              <div className="flex flex-wrap gap-2 mt-2">
                {labOrders.map(test => (
                  <span key={test} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-clinic-bg border border-clinic-border text-clinic-text-primary">
                    {test}
                    <button onClick={() => handleRemoveLabTest(test)} className="text-clinic-text-secondary hover:text-clinic-danger font-bold cursor-pointer">×</button>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-clinic-text-secondary italic mt-1">No laboratory order sheets issued for this consult.</p>
            )}
          </div>

        </div>

        {/* RIGHT RAIL (30% width): Chronological Patient History & Clinical Timeline */}
        <div className="flex flex-col gap-6">
          <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-6 shadow-sm flex flex-col gap-5 max-h-[750px] overflow-y-auto">
            <h3 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary border-b border-clinic-border pb-3">
              Patient Clinical History ({consults.length} Past Visits)
            </h3>
            {consults.length === 0 ? (
              <p className="text-xs text-clinic-text-secondary italic">No past consult history.</p>
            ) : (
              <div className="flex flex-col gap-5">
                {consults.map((c) => (
                  <div key={c.id} className="text-xs border border-clinic-border rounded-clinic-10 p-4 bg-clinic-bg flex flex-col gap-2.5">
                    <div className="flex justify-between items-center border-b border-clinic-border/50 pb-1.5 mb-0.5">
                      <span className="font-bold text-clinic-text-primary">{c.date}</span>
                      <span className="text-[10px] text-clinic-text-secondary font-medium uppercase bg-clinic-surface border border-clinic-border px-1.5 py-0.5 rounded">
                        Token {c.tokenNumber}
                      </span>
                    </div>

                    <div className="flex flex-col gap-1.5 text-clinic-text-primary leading-relaxed">
                      {c.soapNotes?.subjective && (
                        <p><strong className="text-[10px] text-clinic-text-secondary font-semibold uppercase tracking-wider block">Subjective (S)</strong> {c.soapNotes.subjective}</p>
                      )}
                      {c.soapNotes?.objective && (
                        <p><strong className="text-[10px] text-clinic-text-secondary font-semibold uppercase tracking-wider block mt-1">Objective (O)</strong> {c.soapNotes.objective}</p>
                      )}
                      {c.soapNotes?.assessment && (
                        <p><strong className="text-[10px] text-clinic-text-secondary font-semibold uppercase tracking-wider block mt-1">Assessment (A)</strong> {c.soapNotes.assessment}</p>
                      )}
                      {c.soapNotes?.plan && (
                        <p><strong className="text-[10px] text-clinic-text-secondary font-semibold uppercase tracking-wider block mt-1">Plan (P)</strong> {c.soapNotes.plan}</p>
                      )}
                      {!c.soapNotes && <p>{c.notes}</p>}
                    </div>

                    {c.prescriptions && c.prescriptions.length > 0 && (
                      <div className="mt-1 border-t border-clinic-border/50 pt-2 flex flex-col gap-1">
                        <span className="font-semibold text-clinic-text-secondary uppercase text-[9px] tracking-wider mb-1">Prescribed Medicines:</span>
                        {c.prescriptions.map((rx, idx) => (
                          <div key={idx} className="flex justify-between bg-clinic-surface border border-clinic-border rounded p-1.5 text-[10px] leading-none">
                            <span className="font-semibold">{rx.drugName} ({rx.dosage})</span>
                            <span className="text-clinic-text-secondary">{rx.frequency} • {rx.duration}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* PRINT PREVIEW DIALOG CANVAS MODAL */}
      <AnimatePresence>
        {printPreviewOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-[1.5px]"
              onClick={() => setPrintPreviewOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-2xl bg-white text-zinc-900 rounded-clinic-14 shadow-2xl p-8 flex flex-col max-h-[85vh] z-10 overflow-y-auto"
            >
              {/* Modal control bar */}
              <div className="flex justify-between items-center border-b border-zinc-200 pb-4 mb-6 sticky top-0 bg-white z-10">
                <span className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Prescription Print Layout</span>
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 text-white rounded-md text-xs font-semibold hover:bg-zinc-800 cursor-pointer"
                  >
                    <Printer className="h-3.5 w-3.5" />
                    <span>Print Rx</span>
                  </button>
                  <button 
                    onClick={() => setPrintPreviewOpen(false)}
                    className="px-3 py-1.5 border border-zinc-200 rounded-md text-xs font-semibold hover:bg-zinc-50 cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* High fidelity Rx sheet layout (Clean white medical layout style) */}
              <div className="flex flex-col p-8 bg-white border border-zinc-200 rounded-md min-h-[500px]">
                {/* Header */}
                <div className="flex justify-between border-b-2 border-zinc-800 pb-6">
                  <div className="flex flex-col">
                    <span className="text-lg font-black tracking-tight uppercase text-zinc-900">Dr. Adrian Vance</span>
                    <span className="text-xs text-zinc-500 font-medium mt-0.5">MD, DM (Cardiology / Dermatology)</span>
                    <span className="text-[10px] text-zinc-400 mt-1">Registration No: MC-908123-A</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-base font-bold uppercase tracking-tight text-clinic-accent">ClinicOS Medical Care</span>
                    <span className="text-xs text-zinc-500 mt-0.5">742 Evergreen Plaza, Gotham</span>
                    <span className="text-[10px] text-zinc-400 mt-1">Tel: +1 (555) 019-9000</span>
                  </div>
                </div>

                {/* Patient metadata */}
                <div className="grid grid-cols-2 gap-4 py-6 border-b border-zinc-200 text-xs">
                  <div className="flex flex-col gap-1.5">
                    <span>Patient Name: <strong className="text-zinc-900 text-sm">{patient.name}</strong></span>
                    <span>Age / Gender: <strong className="text-zinc-900">{patient.dob} ({patient.gender})</strong></span>
                  </div>
                  <div className="flex flex-col gap-1.5 text-right">
                    <span>Date: <strong className="text-zinc-900">{new Date().toLocaleDateString()}</strong></span>
                    <span>Prescription Ref: <strong className="text-zinc-900">CO-{patient.id}-{Date.now().toString().slice(-4)}</strong></span>
                  </div>
                </div>

                {/* Rx Symbol */}
                <div className="text-3xl font-black italic text-zinc-900 py-4 select-none">
                  Rx
                </div>

                {/* Medications List */}
                <div className="flex-1 flex flex-col gap-4">
                  {prescriptionItems.filter(item => item.drugName).map((rx, idx) => (
                    <div key={idx} className="flex justify-between items-start text-sm py-2 border-b border-zinc-100 pl-4">
                      <div className="flex flex-col">
                        <span className="font-extrabold text-zinc-900">{idx + 1}. {rx.drugName}</span>
                        <span className="text-xs text-zinc-500 italic mt-1">{rx.instructions}</span>
                      </div>
                      <div className="text-right flex flex-col items-end">
                        <span className="font-bold text-zinc-900">{rx.dosage} • {rx.frequency}</span>
                        <span className="text-xs text-zinc-500 mt-1">Duration: {rx.duration}</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Signature Line */}
                <div className="mt-16 flex justify-end">
                  <div className="flex flex-col items-center border-t border-zinc-300 pt-2 w-48 text-center text-xs">
                    <span className="font-bold text-zinc-900">Dr. Adrian Vance</span>
                    <span className="text-zinc-400 mt-0.5">Authorised Signature</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
