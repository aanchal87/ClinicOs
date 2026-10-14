'use client';

import React, { useState, useEffect } from 'react';
import { useUiStore } from '@/shared/stores/uiStore';
import { 
  useLabs, 
  useUploadLabReport, 
  usePatients, 
  useDeleteLabReport, 
  useReviewLabReport, 
  useUpdateLabStatus 
} from '@/shared/hooks/useClinicApi';
import { 
  TestTube, Search, Plus, FileText, ChevronRight, 
  AlertTriangle, CheckCircle, ExternalLink, Calendar,
  User, Check, Trash2, Download, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '@/shared/components/ui/Button';
import Input from '@/shared/components/ui/Input';
import Select from '@/shared/components/ui/Select';
import Badge from '@/shared/components/ui/Badge';
import Spinner from '@/shared/components/ui/Spinner';

export default function LaboratoryPage() {
  const currentRole = useUiStore((state) => state.currentRole);

  const { data: labs = [], isLoading: labsLoading } = useLabs();
  const { data: patients = [] } = usePatients();

  const uploadLabMutation = useUploadLabReport();
  const deleteLabMutation = useDeleteLabReport();
  const reviewLabMutation = useReviewLabReport();
  const updateLabStatusMutation = useUpdateLabStatus();

  // Search/Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Selected report for report viewer modal
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Uploader drawer state
  const [uploadDrawerOpen, setUploadDrawerOpen] = useState(false);

  // Form states
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [testName, setTestName] = useState('');
  const [status, setStatus] = useState<string>('Ordered');
  const [file, setFile] = useState<File | null>(null);

  // Doctor Review state
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewedBy, setReviewedBy] = useState('Dr. Dermatology');

  // Set default patient
  useEffect(() => {
    if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].id);
    }
  }, [patients, selectedPatientId]);

  const handleUploadReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatientId || !testName) return;

    const patient = patients.find(p => p.id === selectedPatientId);
    if (!patient) return;

    uploadLabMutation.mutate({
      file: file || undefined,
      patientId: selectedPatientId,
      testName,
      status,
    }, {
      onSuccess: () => {
        setUploadDrawerOpen(false);
        setTestName('');
        setFile(null);
        setStatus('Ordered');
      }
    });
  };

  const handleReviewSubmit = (reportId: string) => {
    if (!reviewedBy || !reviewNotes) return;
    reviewLabMutation.mutate({
      id: reportId,
      reviewedBy,
      reviewNotes
    }, {
      onSuccess: () => {
        setReviewNotes('');
      }
    });
  };

  const handleStatusChange = (reportId: string, nextStatus: string) => {
    updateLabStatusMutation.mutate({
      id: reportId,
      status: nextStatus
    });
  };

  // Filter labs list
  const filteredLabs = labs.filter(l => {
    const matchesSearch = l.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          l.testName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === 'all' || l.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const activeReport = labs.find(l => l.id === selectedReportId);

  const getBadgeVariant = (st: string) => {
    switch (st) {
      case 'Reviewed':
        return 'success';
      case 'Uploaded':
        return 'info';
      case 'Processing':
        return 'info';
      case 'Sample Collected':
        return 'warning';
      case 'Ordered':
      default:
        return 'neutral';
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-clinic-text-primary">Laboratory Diagnostics</h1>
          <p className="text-sm text-clinic-text-secondary mt-1">
            Check-in diagnostics reports, track pending clearances, and view raw lab parameters.
          </p>
        </div>
        
        {(currentRole === 'receptionist' || currentRole === 'doctor') && (
          <Button 
            onClick={() => setUploadDrawerOpen(true)}
            className="flex items-center gap-2 self-start cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Upload Lab Report</span>
          </Button>
        )}
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-clinic-surface border border-clinic-border p-4 rounded-clinic-14 shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-clinic-text-secondary" />
          <input
            type="text"
            placeholder="Search by test name, patient..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-clinic-bg border border-clinic-border rounded-clinic-10 focus:outline-none focus:ring-1 focus:ring-clinic-accent focus:border-clinic-accent text-clinic-text-primary"
          />
        </div>

        <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {['all', 'Ordered', 'Sample Collected', 'Processing', 'Uploaded', 'Reviewed'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-clinic-10 cursor-pointer border transition-all whitespace-nowrap ${
                filterStatus === st 
                  ? 'bg-clinic-accent text-white border-transparent' 
                  : 'bg-clinic-surface text-clinic-text-secondary border-clinic-border hover:bg-clinic-bg hover:text-clinic-text-primary'
              }`}
            >
              {st === 'all' ? 'All Reports' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Lab reports database directory table */}
      <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 shadow-sm overflow-hidden">
        {labsLoading ? (
          <div className="py-20 flex justify-center"><Spinner /></div>
        ) : filteredLabs.length === 0 ? (
          <div className="py-20 text-center text-clinic-text-secondary flex flex-col items-center gap-2">
            <TestTube className="h-10 w-10 text-clinic-border" />
            <p className="text-sm font-semibold">No lab records matched search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-clinic-border bg-clinic-bg/50 text-clinic-text-secondary font-semibold uppercase tracking-wider text-xs">
                  <th className="px-6 py-4">Patient Name</th>
                  <th className="px-6 py-4">Investigation Test</th>
                  <th className="px-6 py-4">Release Date</th>
                  <th className="px-6 py-4">Investigation Status</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-clinic-border text-clinic-text-primary">
                {filteredLabs.map((l) => (
                  <tr 
                    key={l.id}
                    onClick={() => setSelectedReportId(l.id)}
                    className="hover:bg-clinic-bg/40 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 flex items-center gap-2">
                      <User className="h-4 w-4 text-clinic-text-secondary" />
                      <span className="font-semibold">{l.patientName}</span>
                    </td>
                    <td className="px-6 py-4 font-medium">{l.testName}</td>
                    <td className="px-6 py-4 text-clinic-text-secondary">{l.testDate}</td>
                    <td className="px-6 py-4">
                      <Badge variant={getBadgeVariant(l.status)}>
                        {l.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-clinic-accent font-semibold flex items-center justify-end gap-1 text-xs">
                        Open Report <ChevronRight className="h-3 w-3" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* REPORT VIEWER DIALOG OVERLAY */}
      <AnimatePresence>
        {activeReport && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-[1.5px]"
              onClick={() => setSelectedReportId(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-4xl bg-clinic-surface border border-clinic-border rounded-clinic-14 shadow-2xl p-6 flex flex-col max-h-[85vh] z-10"
            >
              <div className="flex justify-between items-center border-b border-clinic-border pb-4 mb-6">
                <div className="flex flex-col">
                  <h2 className="text-lg font-bold text-clinic-text-primary">{activeReport.testName}</h2>
                  <span className="text-xs text-clinic-text-secondary">Patient: {activeReport.patientName} • Released: {activeReport.testDate}</span>
                </div>
                <div className="flex gap-2 items-center">
                  <button 
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this report?")) {
                        deleteLabMutation.mutate(activeReport.id, {
                          onSuccess: () => {
                            setSelectedReportId(null);
                          }
                        });
                      }
                    }}
                    className="px-3 py-1.5 border border-red-200 text-red-600 rounded-clinic-10 text-xs font-semibold hover:bg-red-50 flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                  <button 
                    onClick={() => setSelectedReportId(null)}
                    className="px-3 py-1.5 border border-clinic-border rounded-clinic-10 text-xs font-semibold hover:bg-clinic-bg text-clinic-text-primary cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* Split screen Viewer Layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto flex-1 pr-1 pb-4">
                
                {/* Panel 1: Document File Preview / Details */}
                <div className="bg-clinic-bg border border-clinic-border rounded-clinic-14 p-4 flex flex-col gap-4 shadow-inner min-h-[350px]">
                  {activeReport.fileUrl ? (
                    <div className="flex-1 flex flex-col gap-2">
                      <span className="font-semibold text-clinic-text-primary text-xs flex items-center gap-1">
                        <FileText className="h-4 w-4 text-clinic-accent" /> Uploaded Document Preview
                      </span>
                      <iframe 
                        src={activeReport.fileUrl} 
                        className="w-full flex-1 border border-clinic-border rounded-clinic-10 bg-white"
                        title="Lab Report File Preview"
                      />
                      <div className="flex gap-2 justify-end mt-2">
                        <a 
                          href={activeReport.fileUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="px-3 py-1.5 bg-clinic-accent/10 text-clinic-accent rounded-clinic-10 text-xs font-semibold hover:bg-clinic-accent/20 flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="h-3.5 w-3.5" /> Preview
                        </a>
                        <a 
                          href={activeReport.fileUrl} 
                          download
                          className="px-3 py-1.5 bg-clinic-accent text-white rounded-clinic-10 text-xs font-semibold hover:bg-clinic-accent-hover flex items-center gap-1 cursor-pointer"
                        >
                          <Download className="h-3.5 w-3.5" /> Download
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-clinic-text-secondary italic">
                      <FileText className="h-12 w-12 text-clinic-border mb-2" />
                      <p className="text-xs">No scanned document file uploaded for this report.</p>
                      <p className="text-[10px] text-clinic-text-secondary mt-1">Status: {activeReport.status}</p>
                    </div>
                  )}
                </div>

                {/* Panel 2: Clinical Parsed Parameters and doctor notes */}
                <div className="flex flex-col gap-6 justify-between">
                  <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-clinic-text-secondary">Status Details</h3>
                      <Badge variant={getBadgeVariant(activeReport.status)}>
                        {activeReport.status}
                      </Badge>
                    </div>

                    {/* Status updater for receptionist/doctor */}
                    <div className="bg-clinic-bg/40 p-4 border border-clinic-border rounded-clinic-14 flex flex-col gap-3">
                      <span className="text-xs font-bold text-clinic-text-secondary uppercase">Update Lifecycle Status</span>
                      <div className="grid grid-cols-2 gap-2">
                        {['Ordered', 'Sample Collected', 'Processing', 'Uploaded'].map((st) => (
                          <button
                            key={st}
                            disabled={activeReport.status === 'Reviewed'}
                            onClick={() => handleStatusChange(activeReport.id, st)}
                            className={`px-2 py-1.5 text-xs rounded-clinic-8 border cursor-pointer text-center font-medium ${
                              activeReport.status === st
                                ? 'bg-clinic-accent text-white border-transparent'
                                : 'bg-clinic-surface text-clinic-text-secondary border-clinic-border hover:bg-clinic-bg'
                            }`}
                          >
                            {st}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Review Notes Box */}
                    {activeReport.status === 'Reviewed' ? (
                      <div className="bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 p-4 rounded-clinic-14 flex flex-col gap-2">
                        <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wider flex items-center gap-1">
                          <CheckCircle className="h-4 w-4" /> Signed Off & Verified
                        </span>
                        <p className="text-xs text-clinic-text-primary leading-relaxed font-semibold italic">
                          "{activeReport.reviewNotes || 'Values reviewed.'}"
                        </p>
                        <div className="text-[10px] text-clinic-text-secondary mt-2 flex flex-col">
                          <span>Reviewed By: {activeReport.reviewedBy}</span>
                          <span>Reviewed At: {activeReport.reviewedAt ? new Date(activeReport.reviewedAt).toLocaleString() : 'N/A'}</span>
                        </div>
                      </div>
                    ) : (
                      currentRole === 'doctor' && (
                        <div className="bg-clinic-bg p-4 border border-clinic-border rounded-clinic-14 flex flex-col gap-3">
                          <span className="text-xs font-bold text-clinic-text-secondary uppercase tracking-wider">Clinician Review Sign-Off</span>
                          
                          <div className="flex flex-col gap-2">
                            <Input 
                              label="Reviewed By" 
                              value={reviewedBy} 
                              onChange={(e) => setReviewedBy(e.target.value)} 
                              required
                            />
                            <div className="flex flex-col gap-1">
                              <label className="text-xs font-bold text-clinic-text-secondary">Review Notes Comments</label>
                              <textarea
                                placeholder="Enter clinical assessment review notes..."
                                value={reviewNotes}
                                onChange={(e) => setReviewNotes(e.target.value)}
                                className="w-full text-xs p-2 bg-clinic-surface border border-clinic-border rounded-clinic-10 focus:outline-none focus:ring-1 focus:ring-clinic-accent text-clinic-text-primary"
                                rows={3}
                                required
                              />
                            </div>
                            <Button 
                              type="button" 
                              size="sm" 
                              onClick={() => handleReviewSubmit(activeReport.id)}
                              className="mt-2 w-full"
                              isLoading={reviewLabMutation.isPending}
                            >
                              Sign Off & Verify Report
                            </Button>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* COMPILER UPLOADER DRAWER */}
      <AnimatePresence>
        {uploadDrawerOpen && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 backdrop-blur-[1px]"
              onClick={() => setUploadDrawerOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-md bg-clinic-surface border-l border-clinic-border h-full p-6 shadow-2xl flex flex-col z-10"
            >
              <div className="flex justify-between items-center border-b border-clinic-border pb-4 mb-6">
                <h2 className="text-lg font-bold text-clinic-text-primary">Check-In Laboratory Report</h2>
                <button 
                  onClick={() => setUploadDrawerOpen(false)} 
                  className="text-clinic-text-secondary hover:text-clinic-text-primary text-sm font-medium cursor-pointer"
                >
                  Cancel
                </button>
              </div>

              {patients.length === 0 ? (
                <p className="text-xs text-clinic-text-secondary italic">No patients available.</p>
              ) : (
                <form onSubmit={handleUploadReport} className="flex flex-col gap-5 flex-1 overflow-y-auto pr-1">
                  <Select
                    label="Patient Record"
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    options={patients.map(p => ({ value: p.id, label: p.name }))}
                  />

                  <Input 
                    label="Investigation Panel Name"
                    placeholder="e.g. Thyroid Panel (T3, T4, TSH)"
                    value={testName}
                    onChange={(e) => setTestName(e.target.value)}
                    required
                  />

                  <Select
                    label="Initial Status"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    options={[
                      { value: 'Ordered', label: 'Ordered' },
                      { value: 'Sample Collected', label: 'Sample Collected' },
                      { value: 'Processing', label: 'Processing' },
                      { value: 'Uploaded', label: 'Uploaded' }
                    ]}
                  />

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-clinic-text-secondary">Attachment Report File</label>
                    <input 
                      type="file" 
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="text-xs text-clinic-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-clinic-8 file:border-0 file:text-xs file:font-semibold file:bg-clinic-accent/10 file:text-clinic-accent file:cursor-pointer hover:file:bg-clinic-accent/20 cursor-pointer w-full"
                      accept=".pdf,image/*"
                    />
                  </div>

                  <Button 
                    type="submit" 
                    isLoading={uploadLabMutation.isPending}
                    className="w-full mt-6"
                  >
                    Compile Lab Report
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
