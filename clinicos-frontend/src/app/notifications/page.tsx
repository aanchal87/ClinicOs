'use client';

import React, { useState, useMemo } from 'react';
import { 
  useWhatsappOutbox, 
  useResendNotification,
  usePatients,
  useSendManualWhatsapp
} from '@/shared/hooks/useClinicApi';
import { 
  Search, RotateCw, Eye, FileText, Calendar, X, 
  MessageSquare, CheckCircle2, Clock, AlertTriangle 
} from 'lucide-react';
import Button from '@/shared/components/ui/Button';
import Skeleton from '@/shared/components/ui/Skeleton';
import apiClient from '@/shared/services/apiClient';
import { AnimatePresence, motion } from 'framer-motion';

export default function WhatsAppOutboxPage() {
  const { data: notifications = [], isLoading, refetch } = useWhatsappOutbox();
  const resendMutation = useResendNotification();
  const { data: patients = [] } = usePatients();
  const sendWhatsappMutation = useSendManualWhatsapp();

  // Custom Message State
  const [isSendingWhatsapp, setIsSendingWhatsapp] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [whatsappMessageText, setWhatsappMessageText] = useState('');

  // Filters State
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SENT' | 'PENDING' | 'FAILED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Selected Notification for Detail Modal
  const [selectedNotif, setSelectedNotif] = useState<any>(null);
  const [pdfLoadingId, setPdfLoadingId] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);

  // Stats calculation
  const stats = useMemo(() => {
    let total = notifications.length;
    let sent = notifications.filter(n => n.status === 'SENT').length;
    let pending = notifications.filter(n => n.status === 'PENDING').length;
    let failed = notifications.filter(n => n.status === 'FAILED').length;
    return { total, sent, pending, failed };
  }, [notifications]);

  // Filtered Notifications List
  const filteredNotifications = useMemo(() => {
    return notifications.filter((notif) => {
      // 1. Status Filter
      if (statusFilter !== 'ALL' && notif.status !== statusFilter) {
        return false;
      }

      // 2. Search Query (Patient Name or Phone Number)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const patientName = notif.patient?.fullName?.toLowerCase() || '';
        const phone = notif.phone || '';
        if (!patientName.includes(query) && !phone.includes(query)) {
          return false;
        }
      }

      // 3. Date Range Filter
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const createdAt = new Date(notif.createdAt);
        if (createdAt < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        const createdAt = new Date(notif.createdAt);
        if (createdAt > end) return false;
      }

      return true;
    });
  }, [notifications, statusFilter, searchQuery, startDate, endDate]);

  // Handle Resend Notification
  const handleResend = async (id: string) => {
    try {
      await resendMutation.mutateAsync(id);
      refetch();
    } catch (err) {
      console.error('Failed to resend notification:', err);
    }
  };

  // Handle View PDF dynamic prescription mapping
  const handleViewPdf = async (notif: any) => {
    setPdfLoadingId(notif.id);
    setPdfError(null);
    try {
      // Retrieve prescriptions list for the patient
      const res = await apiClient.get(`/prescriptions/patient/${notif.patientId}`);
      const prescriptions = res.data ?? [];
      
      if (prescriptions.length === 0) {
        setPdfError('No prescription PDF exists for this patient record.');
        setTimeout(() => setPdfError(null), 3000);
        return;
      }

      // Find the prescription closest in time to the notification
      const notifTime = new Date(notif.createdAt).getTime();
      let bestMatch = prescriptions[0];
      let minDiff = Math.abs(new Date(bestMatch.createdAt).getTime() - notifTime);

      for (const rx of prescriptions) {
        const diff = Math.abs(new Date(rx.createdAt).getTime() - notifTime);
        if (diff < minDiff) {
          minDiff = diff;
          bestMatch = rx;
        }
      }

      const pdfUrl = `http://localhost:3001/uploads/prescriptions/prescription-${bestMatch.id}.pdf`;
      window.open(pdfUrl, '_blank');
    } catch (err: any) {
      console.error('Failed to locate prescription PDF:', err);
      setPdfError('Error locating prescription PDF file.');
      setTimeout(() => setPdfError(null), 3000);
    } finally {
      setPdfLoadingId(null);
    }
  };

  // Helper to format Notification Type beautifully
  const formatNotificationType = (type: string) => {
    return type
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="flex flex-col gap-8 max-w-[1400px]">
      {/* Page Title & Refresh */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-clinic-text-primary">WhatsApp Communication Center</h1>
          <p className="text-sm text-clinic-text-secondary mt-1">
            Monitor and resend outbound clinical WhatsApp messages sent across the patient lifecycle.
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            id="send-manual-message-btn"
            onClick={() => setIsSendingWhatsapp(true)}
            className="flex items-center gap-2 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Send Custom Message</span>
          </Button>
          <Button 
            id="refresh-outbox-btn"
            variant="secondary"
            onClick={() => refetch()}
            className="flex items-center gap-2 text-xs font-semibold"
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>Refresh outbox</span>
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Card */}
        <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-5 shadow-sm flex items-center gap-4 transition-all hover:scale-[1.01]">
          <div className="bg-clinic-accent/10 p-3 rounded-clinic-10 text-clinic-accent">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-clinic-text-secondary uppercase tracking-wider">Total Outbox</p>
            <p className="text-xl font-bold text-clinic-text-primary mt-0.5">{stats.total}</p>
          </div>
        </div>

        {/* Sent Card */}
        <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-5 shadow-sm flex items-center gap-4 transition-all hover:scale-[1.01]">
          <div className="bg-clinic-success/10 p-3 rounded-clinic-10 text-clinic-success">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-clinic-text-secondary uppercase tracking-wider">Sent</p>
            <p className="text-xl font-bold text-clinic-text-primary mt-0.5">{stats.sent}</p>
          </div>
        </div>

        {/* Pending Card */}
        <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-5 shadow-sm flex items-center gap-4 transition-all hover:scale-[1.01]">
          <div className="bg-clinic-warning/10 p-3 rounded-clinic-10 text-clinic-warning">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-clinic-text-secondary uppercase tracking-wider">Pending</p>
            <p className="text-xl font-bold text-clinic-text-primary mt-0.5">{stats.pending}</p>
          </div>
        </div>

        {/* Failed Card */}
        <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-5 shadow-sm flex items-center gap-4 transition-all hover:scale-[1.01]">
          <div className="bg-clinic-danger/10 p-3 rounded-clinic-10 text-clinic-danger">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-clinic-text-secondary uppercase tracking-wider">Failed</p>
            <p className="text-xl font-bold text-clinic-text-primary mt-0.5">{stats.failed}</p>
          </div>
        </div>
      </div>

      {/* Filters and Search Bar Card */}
      <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 p-5 shadow-sm flex flex-col gap-4">
        {/* Row 1: Search & Date Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Patient Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-clinic-text-secondary" />
            <input
              id="patient-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by Patient Name or Phone..."
              className="pl-9 pr-4 py-2 w-full text-xs bg-clinic-bg border border-clinic-border rounded-clinic-10 focus:outline-none focus:ring-1 focus:ring-clinic-accent text-clinic-text-primary"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-clinic-text-secondary hover:text-clinic-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Start Date */}
          <div className="flex items-center gap-2">
            <label htmlFor="start-date-input" className="text-xs font-semibold text-clinic-text-secondary w-20 shrink-0">Start Date:</label>
            <input
              id="start-date-input"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 w-full text-xs bg-clinic-bg border border-clinic-border rounded-clinic-10 focus:outline-none focus:ring-1 focus:ring-clinic-accent text-clinic-text-primary"
            />
          </div>

          {/* End Date */}
          <div className="flex items-center gap-2">
            <label htmlFor="end-date-input" className="text-xs font-semibold text-clinic-text-secondary w-20 shrink-0">End Date:</label>
            <input
              id="end-date-input"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 w-full text-xs bg-clinic-bg border border-clinic-border rounded-clinic-10 focus:outline-none focus:ring-1 focus:ring-clinic-accent text-clinic-text-primary"
            />
          </div>
        </div>

        {/* Row 2: Status Tabs / Reset */}
        <div className="flex justify-between items-center border-t border-clinic-border/50 pt-3">
          <div className="flex gap-2">
            {(['ALL', 'SENT', 'PENDING', 'FAILED'] as const).map((status) => (
              <button
                key={status}
                id={`status-tab-${status.toLowerCase()}`}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 text-xs font-semibold rounded-clinic-8 transition-colors ${
                  statusFilter === status 
                    ? 'bg-clinic-accent text-white' 
                    : 'bg-clinic-bg border border-clinic-border text-clinic-text-secondary hover:text-clinic-text-primary'
                }`}
              >
                {status === 'ALL' ? 'All Logs' : status}
              </button>
            ))}
          </div>

          {/* Clear Filters */}
          {(searchQuery || startDate || endDate || statusFilter !== 'ALL') && (
            <button
              id="clear-filters-btn"
              onClick={() => {
                setStatusFilter('ALL');
                setSearchQuery('');
                setStartDate('');
                setEndDate('');
              }}
              className="text-xs text-clinic-accent hover:underline font-semibold flex items-center gap-1"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* PDF Error toast overlay if any */}
      {pdfError && (
        <div className="bg-clinic-danger/10 border border-clinic-danger text-clinic-danger text-xs font-semibold px-4 py-2.5 rounded-clinic-10 animate-bounce">
          ⚠️ {pdfError}
        </div>
      )}

      {/* Outbox Table Card */}
      <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 shadow-sm overflow-hidden">
        {isLoading ? (
          /* Loading Skeletons */
          <div className="p-6 flex flex-col gap-4">
            <Skeleton className="h-8 w-1/4 rounded-clinic-8" />
            <Skeleton className="h-64 w-full rounded-clinic-10" />
          </div>
        ) : filteredNotifications.length === 0 ? (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <MessageSquare className="h-12 w-12 text-clinic-text-secondary/35 mb-4" />
            <h3 className="text-base font-bold text-clinic-text-primary">No notifications available</h3>
            <p className="text-xs text-clinic-text-secondary mt-1 max-w-sm">
              There are no messages matching your search filter conditions or logs recorded in the outbox index.
            </p>
          </div>
        ) : (
          /* Table View */
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-clinic-border bg-clinic-bg/40 text-[10px] font-bold uppercase tracking-wider text-clinic-text-secondary">
                  <th className="py-3.5 px-5">Date</th>
                  <th className="py-3.5 px-5">Patient Name</th>
                  <th className="py-3.5 px-5">Phone Number</th>
                  <th className="py-3.5 px-5">Notification Type</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5">Message Preview</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs text-clinic-text-primary divide-y divide-clinic-border/50">
                {filteredNotifications.map((notif) => {
                  const isConsultation = notif.type === 'CONSULTATION_COMPLETED';
                  const showPdfButton = isConsultation && notif.status === 'SENT';

                  return (
                    <tr key={notif.id} className="hover:bg-clinic-bg/25 transition-colors">
                      <td className="py-3.5 px-5 font-medium whitespace-nowrap text-clinic-text-secondary">
                        {new Date(notif.createdAt).toLocaleString(undefined, {
                          dateStyle: 'short',
                          timeStyle: 'short'
                        })}
                      </td>
                      <td className="py-3.5 px-5 font-bold">
                        {notif.patient?.fullName || 'N/A'}
                      </td>
                      <td className="py-3.5 px-5 font-medium text-clinic-text-secondary whitespace-nowrap">
                        {notif.phone}
                      </td>
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <span className="bg-clinic-bg px-2 py-0.5 border border-clinic-border rounded-clinic-6 font-semibold">
                          {formatNotificationType(notif.type)}
                        </span>
                      </td>
                      <td className="py-3.5 px-5">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          notif.status === 'SENT' 
                            ? 'bg-clinic-success/15 text-clinic-success' 
                            : notif.status === 'PENDING'
                            ? 'bg-clinic-warning/15 text-clinic-warning animate-pulse'
                            : 'bg-clinic-danger/15 text-clinic-danger'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            notif.status === 'SENT' 
                              ? 'bg-clinic-success' 
                              : notif.status === 'PENDING'
                              ? 'bg-clinic-warning'
                              : 'bg-clinic-danger'
                          }`} />
                          {notif.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 max-w-[240px] truncate text-clinic-text-secondary italic">
                        {notif.message}
                      </td>
                      <td className="py-3.5 px-5 text-right whitespace-nowrap">
                        <div className="inline-flex gap-1.5">
                          {/* View Message Modal Trigger */}
                          <button
                            id={`view-btn-${notif.id}`}
                            onClick={() => setSelectedNotif(notif)}
                            className="p-1.5 bg-clinic-bg border border-clinic-border rounded-clinic-8 text-clinic-text-secondary hover:text-clinic-text-primary hover:bg-clinic-border/20 transition-all"
                            title="View Full Message"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>

                          {/* View PDF */}
                          {showPdfButton && (
                            <button
                              id={`pdf-btn-${notif.id}`}
                              onClick={() => handleViewPdf(notif)}
                              disabled={pdfLoadingId === notif.id}
                              className={`p-1.5 bg-clinic-bg border border-clinic-border rounded-clinic-8 text-clinic-accent hover:bg-clinic-accent/15 transition-all ${
                                pdfLoadingId === notif.id ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              title="Open Prescription PDF"
                            >
                              <FileText className="h-3.5 w-3.5" />
                            </button>
                          )}

                          {/* Resend Action */}
                          <button
                            id={`resend-btn-${notif.id}`}
                            onClick={() => handleResend(notif.id)}
                            disabled={resendMutation.isPending && resendMutation.variables === notif.id}
                            className={`p-1.5 bg-clinic-bg border border-clinic-border rounded-clinic-8 text-clinic-success hover:bg-clinic-success/15 transition-all ${
                              resendMutation.isPending && resendMutation.variables === notif.id ? 'animate-spin' : ''
                            }`}
                            title="Resend WhatsApp Message"
                          >
                            <RotateCw className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Message Copy Details Modal */}
      {selectedNotif && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-clinic-surface border border-clinic-border rounded-clinic-14 max-w-lg w-full shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-clinic-border">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4.5 w-4.5 text-clinic-accent" />
                <span className="text-sm font-bold text-clinic-text-primary">WhatsApp Outbox Message Logs</span>
              </div>
              <button
                onClick={() => setSelectedNotif(null)}
                className="p-1 rounded-lg text-clinic-text-secondary hover:text-clinic-text-primary hover:bg-clinic-bg"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Body Info */}
            <div className="p-6 flex flex-col gap-4 overflow-y-auto max-h-[70vh]">
              {/* Patient Detail Row */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-clinic-text-secondary">Patient Name</span>
                  <span className="text-clinic-text-primary font-semibold mt-0.5 block">{selectedNotif.patient?.fullName || 'N/A'}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-clinic-text-secondary">Phone Number</span>
                  <span className="text-clinic-text-primary font-semibold mt-0.5 block">{selectedNotif.phone}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-clinic-text-secondary">Notification Event</span>
                  <span className="text-clinic-text-primary font-semibold mt-0.5 block">{formatNotificationType(selectedNotif.type)}</span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-clinic-text-secondary">Delivery Status</span>
                  <span className="text-clinic-text-primary font-semibold mt-0.5 block capitalize">{selectedNotif.status}</span>
                </div>
              </div>

              {/* Message Content */}
              <div className="flex flex-col gap-1.5 border-t border-clinic-border/50 pt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-clinic-text-secondary">Full Message Copy</span>
                <div className="bg-clinic-bg border border-clinic-border rounded-clinic-10 p-4 text-xs font-medium text-clinic-text-primary whitespace-pre-wrap leading-relaxed">
                  {selectedNotif.message}
                </div>
              </div>

              {/* Error log if failed */}
              {selectedNotif.error && (
                <div className="flex flex-col gap-1.5 border-t border-clinic-border/50 pt-3 text-clinic-danger">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-clinic-text-secondary">Transmission Errors</span>
                  <div className="bg-clinic-danger/5 border border-clinic-danger/25 rounded-clinic-10 p-3 text-xs font-semibold">
                    {selectedNotif.error}
                  </div>
                </div>
              )}
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-2 px-6 py-4 border-t border-clinic-border bg-clinic-bg/40">
              <Button
                variant="secondary"
                onClick={() => setSelectedNotif(null)}
                className="text-xs"
              >
                Close details
              </Button>
              <Button
                onClick={() => {
                  handleResend(selectedNotif.id);
                  setSelectedNotif(null);
                }}
                isLoading={resendMutation.isPending && resendMutation.variables === selectedNotif.id}
                className="text-xs flex items-center gap-1.5 bg-clinic-success hover:bg-clinic-success/90"
              >
                <RotateCw className="h-3 w-3" />
                <span>Resend message</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL WHATSAPP SEND MESSAGE MODAL */}
      <AnimatePresence>
        {isSendingWhatsapp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="relative w-full max-w-md bg-clinic-surface border border-clinic-border rounded-clinic-14 p-6 shadow-2xl flex flex-col z-10 text-xs animate-in fade-in zoom-in-95 duration-150"
            >
              <div className="flex justify-between items-center border-b border-clinic-border pb-3 mb-4">
                <h3 className="text-sm font-bold text-clinic-text-primary flex items-center gap-1.5">
                  <MessageSquare className="h-4 w-4 text-emerald-500" />
                  <span>Send Custom WhatsApp Message</span>
                </h3>
                <button 
                  onClick={() => {
                    setIsSendingWhatsapp(false);
                    setSelectedPatientId('');
                    setWhatsappMessageText('');
                  }} 
                  className="text-clinic-text-secondary hover:text-clinic-text-primary font-bold text-base"
                >
                  ×
                </button>
              </div>

              <div className="flex flex-col gap-4 pb-4">
                {/* Patient Selector */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="patient-select" className="text-[10px] font-bold uppercase tracking-wider text-clinic-text-secondary">Select Patient</label>
                  <select
                    id="patient-select"
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="w-full p-2 text-xs bg-clinic-bg border border-clinic-border rounded-clinic-10 focus:outline-none focus:ring-1 focus:ring-clinic-accent text-clinic-text-primary font-medium"
                  >
                    <option value="">-- Choose a patient --</option>
                    {patients.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.phone})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message Textarea */}
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="message-textarea" className="text-[10px] font-bold uppercase tracking-wider text-clinic-text-secondary">Message Text</label>
                  <textarea
                    id="message-textarea"
                    value={whatsappMessageText}
                    onChange={(e) => setWhatsappMessageText(e.target.value)}
                    placeholder="Type your custom message here..."
                    rows={5}
                    className="w-full p-3 text-xs bg-clinic-bg border border-clinic-border rounded-clinic-10 focus:outline-none focus:ring-1 focus:ring-clinic-accent focus:border-clinic-accent text-clinic-text-primary font-medium"
                  />
                </div>
              </div>

              <div className="flex gap-3 border-t border-clinic-border pt-4 justify-end">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setIsSendingWhatsapp(false);
                    setSelectedPatientId('');
                    setWhatsappMessageText('');
                  }}
                  className="text-xs"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={async () => {
                    if (!selectedPatientId || !whatsappMessageText.trim()) return;
                    try {
                      await sendWhatsappMutation.mutateAsync({
                        patientId: selectedPatientId,
                        message: whatsappMessageText,
                      });
                      setIsSendingWhatsapp(false);
                      setSelectedPatientId('');
                      setWhatsappMessageText('');
                      refetch();
                      alert('WhatsApp message sent successfully!');
                    } catch (err) {
                      console.error(err);
                      alert('Failed to send WhatsApp message.');
                    }
                  }}
                  isLoading={sendWhatsappMutation.isPending}
                  disabled={!selectedPatientId || !whatsappMessageText.trim()}
                  className="text-xs bg-clinic-success hover:bg-clinic-success/90"
                >
                  Send Message
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
