import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { io } from 'socket.io-client';
import apiClient from '../services/apiClient';
import documentService from '../services/documentService';
import { adaptPatientHistoryResponse } from '../services/adapters/patientHistoryAdapter';
import { 
  Patient, QueueToken, Appointment, Consultation, 
  LabReport, TreatmentGalleryItem, TokenStatus, 
  PatientDocument, PatientDocumentType 
} from '../types';

// Initialize WebSocket client connection to NestJS server
export const socket = typeof window !== 'undefined'
  ? io(process.env.NEXT_PUBLIC_WS_URL || '')
  : null;

export function useQueueSocketSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!socket) return;

    const handleEvent = (data: any) => {
      // console.log('Received real-time queue update from server:', data);
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    };

    socket.on('token_created', handleEvent);
    socket.on('token_called', handleEvent);
    socket.on('consultation_started', handleEvent);
    socket.on('consultation_completed', handleEvent);
    socket.on('token_missed', handleEvent);
    socket.on('token_skipped', handleEvent);
    socket.on('token_cancelled', handleEvent);
    socket.on('token_recalled', handleEvent);

    return () => {
      socket?.off('token_created', handleEvent);
      socket?.off('token_called', handleEvent);
      socket?.off('consultation_started', handleEvent);
      socket?.off('consultation_completed', handleEvent);
      socket?.off('token_missed', handleEvent);
      socket?.off('token_skipped', handleEvent);
      socket?.off('token_cancelled', handleEvent);
      socket?.off('token_recalled', handleEvent);
    };
  }, [queryClient]);
}

// ----------------------------------------------------
// PATIENTS HOOKS
// ----------------------------------------------------
export function usePatients() {
  return useQuery<Patient[]>({
    queryKey: ['patients'],
    queryFn: async () => {
      const response = await apiClient.get<Patient[]>('/patients');
      return response.data ?? [];
    },
    select: (data) => data ?? [],
    placeholderData: []
  });
}

export function usePatient(id: string | null) {
  return useQuery<Patient | null>({
    queryKey: ['patients', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await apiClient.get<Patient>(`/patients/${id}`);
      return response.data ?? null;
    },
    enabled: !!id,
    select: (data) => data ?? null,
    placeholderData: null
  });
}

export function usePatientHistory(id: string | null) {
  return useQuery<any>({
    queryKey: ['patients', id, 'history'],
    queryFn: async () => {
      if (!id) return null;
      const response = await apiClient.get<any>(`/patients/${id}/history`);
      return response.data;
    },
    enabled: !!id,
    select: (data) => adaptPatientHistoryResponse(data),
    placeholderData: adaptPatientHistoryResponse(null)
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newPatient: Omit<Patient, 'id' | 'dateAdded'>) => {
      const response = await apiClient.post<Patient>('/patients', newPatient);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    }
  });
}

export function useAadhaarCheck() {
  return useMutation({
    mutationFn: async (aadhaar: string) => {
      const response = await apiClient.post<{ exists: boolean; patient?: any }>('/patients/aadhaar-check', { aadhaar });
      return response.data;
    }
  });
}

// ----------------------------------------------------
// QUEUE TOKENS HOOKS
// ----------------------------------------------------
export function useTokens() {
  return useQuery<QueueToken[]>({
    queryKey: ['tokens'],
    queryFn: async () => {
      const response = await apiClient.get<QueueToken[]>('/queue');
      return response.data ?? [];
    },
    select: (data) => data ?? [],
    placeholderData: []
  });
}

export function useCreateToken() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (tokenData: Omit<QueueToken, 'id' | 'tokenNumber' | 'status' | 'checkInTime'>) => {
      const response = await apiClient.post<QueueToken>('/queue', tokenData);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
    }
  });
}

export function useUpdateTokenStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ tokenId, status }: { tokenId: string; status: TokenStatus }) => {
      const response = await apiClient.put<QueueToken>(`/queue/${tokenId}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
    }
  });
}

// ----------------------------------------------------
// CALENDAR APPOINTMENTS HOOKS
// ----------------------------------------------------
export function useAppointments(date: string) {
  return useQuery<Appointment[]>({
    queryKey: ['appointments', date],
    queryFn: async () => {
      const response = await apiClient.get<any[]>('/appointments', {
        params: { date }
      });
      const bookedApps = response.data ?? [];
      
      const slots: Appointment[] = Array.from({ length: 12 }, (_, i) => ({
        id: `a-${date}-${i + 1}`,
        date,
        timeSlot: i + 1,
        status: i === 5 ? 'holiday' : 'available',
        notes: i === 5 ? 'Doctor Lunch Break' : undefined
      }));
      
      bookedApps.forEach((app) => {
        let slotNum = parseInt(app.time, 10);
        if (isNaN(slotNum)) {
          if (app.time.startsWith('09:00')) slotNum = 1;
          else if (app.time.startsWith('09:45')) slotNum = 2;
          else if (app.time.startsWith('10:30') || app.time.startsWith('10:00')) slotNum = 3;
          else if (app.time.startsWith('11:15')) slotNum = 4;
          else if (app.time.startsWith('12:00')) slotNum = 5;
          else if (app.time.startsWith('12:45')) slotNum = 6;
          else if (app.time.startsWith('01:30') || app.time.startsWith('01:00')) slotNum = 7;
          else if (app.time.startsWith('02:15')) slotNum = 8;
          else if (app.time.startsWith('03:00')) slotNum = 9;
          else if (app.time.startsWith('03:45')) slotNum = 10;
          else if (app.time.startsWith('04:30') || app.time.startsWith('04:00')) slotNum = 11;
          else if (app.time.startsWith('05:15') || app.time.startsWith('05:00')) slotNum = 12;
          else slotNum = 1;
        }
        
        if (slotNum >= 1 && slotNum <= 12) {
          slots[slotNum - 1] = {
            id: app.id,
            patientId: app.patientId,
            patientName: app.patient?.fullName || app.patientName || 'Patient',
            date: app.date,
            timeSlot: slotNum,
            status: app.status.toLowerCase() === 'completed'
              ? 'available'
              : app.status.toLowerCase() === 'cancelled'
                ? 'available'
                : app.status.toLowerCase() === 'followup'
                  ? 'followup'
                  : 'booked',
            type: app.type ? app.type.toLowerCase() as any : 'consultation',
            notes: app.notes || undefined
          };
        }
      });
      
      return slots;
    },
    select: (data) => data ?? [],
    placeholderData: []
  });
}

export function useBookAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (apptData: any) => {
      const response = await apiClient.post('/appointments/book', {
        date: apptData.date,
        time: String(apptData.timeSlot),
        type: apptData.type,
        notes: apptData.notes,
        status: apptData.status?.toUpperCase() || 'CONFIRMED',
        patientId: apptData.patientId,
        fullName: apptData.patientName,
        phone: apptData.phone || '555-0199'
      });
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['appointments', data.date] });
    }
  });
}

export function useCheckInAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await apiClient.post(`/appointments/${appointmentId}/checkin`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
    }
  });
}

// ----------------------------------------------------
// CONSULTATIONS HOOKS
// ----------------------------------------------------
function mapConsultation(record: any): Consultation {
  return {
    id: record.id,
    tokenNumber: record.appointment?.tokenNumber || 'T-01',
    patientId: record.patientId,
    date: record.createdAt ? new Date(record.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    symptoms: record.chiefComplaint || '',
    notes: record.historyOfPresent || '',
    soapNotes: {
      subjective: record.chiefComplaint || '',
      objective: record.examinationFindings || '',
      assessment: record.diagnosis || '',
      plan: record.treatmentPlan || '',
    },
    prescriptions: record.prescription?.items?.map((item: any) => ({
      drugName: item.drugName,
      dosage: item.strength || item.dose || '1 tablet',
      frequency: item.frequency || 'Once daily',
      duration: item.duration || '7 days',
      instructions: item.instructions || '',
    })) || [],
    labOrders: record.labReports?.map((r: any) => r.testName) || [],
    followUpDate: record.followUpDate || undefined,
  };
}

export function useConsultations(patientId?: string) {
  return useQuery<Consultation[]>({
    queryKey: ['consultations', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const response = await apiClient.get<any>(`/patients/${patientId}/history`);
      const records = response?.data?.medicalRecords ?? [];
      return records.map(mapConsultation);
    },
    enabled: !!patientId,
    select: (data) => data ?? [],
    placeholderData: []
  });
}

export function useCreateConsultation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (consultData: any) => {
      const recordResponse = await apiClient.post(`/patients/${consultData.patientId}/records`, {
        chiefComplaint: consultData.soapNotes?.subjective || consultData.symptoms,
        historyOfPresent: consultData.notes,
        examinationFindings: consultData.soapNotes?.objective,
        diagnosis: consultData.soapNotes?.assessment,
        treatmentPlan: consultData.soapNotes?.plan,
        appointmentId: consultData.appointmentId || null,
        clinicId: 'default-clinic-id',
        doctorId: 'mock-doc-1'
      });
      
      const record = recordResponse.data;
      
      if (consultData.prescriptions && consultData.prescriptions.length > 0) {
        await apiClient.post('/prescriptions', {
          medicalRecordId: record.id,
          clinicId: 'default-clinic-id',
          doctorId: 'mock-doc-1',
          patientId: consultData.patientId,
          advice: '',
          items: consultData.prescriptions.map((item: any) => ({
            drugName: item.drugName,
            drugCategory: item.drugCategory || 'Oral',
            strength: item.dosage,
            dosageForm: item.dosageForm || 'Tablet',
            dose: item.dosage,
            frequency: item.frequency,
            duration: item.duration,
            instructions: item.instructions || ''
          }))
        });
      }
      
      if (consultData.labOrders && consultData.labOrders.length > 0) {
        for (const testName of consultData.labOrders) {
          await apiClient.post('/laboratory', {
            medicalRecordId: record.id,
            testName,
            testDate: new Date().toISOString().split('T')[0],
            status: 'completed',
            results: []
          });
        }
      }
      
      if (consultData.followUpDate) {
        await apiClient.post('/followups', {
          patientId: consultData.patientId,
          dueDate: consultData.followUpDate,
          reason: 'Post-consultation follow-up',
          priority: 'ROUTINE'
        });
      }

      if (consultData.tokenId) {
        await apiClient.put(`/queue/${consultData.tokenId}/status`, { status: 'completed' });
      }
      
      return record;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['tokens'] });
      queryClient.invalidateQueries({ queryKey: ['labs'] });
      queryClient.invalidateQueries({ queryKey: ['followups'] });
    }
  });
}

// ----------------------------------------------------
// LABORATORY REPORTS HOOKS
// ----------------------------------------------------
export function useLabs(patientId?: string) {
  return useQuery<LabReport[]>({
    queryKey: ['labs', patientId],
    queryFn: async () => {
      const url = patientId ? `/laboratory/patient/${patientId}` : '/laboratory';
      const response = await apiClient.get<any[]>(url);
      const apiBase = apiClient.defaults.baseURL || '';
      return (response?.data ?? []).map((r: any) => ({
        id: r.id,
        patientId: patientId || r.patientId || '',
        patientName: r.patientName || 'Patient',
        testName: r.testName,
        testDate: r.testDate,
        status: r.status as any,
        results: typeof r.results === 'string' ? JSON.parse(r.results) : (r.results ?? []),
        fileUrl: r.filePath ? `${apiBase.replace(/\/api$/, '')}/${r.filePath.replace(/^\//, '')}` : undefined,
        filePath: r.filePath || undefined,
        reviewNotes: r.reviewNotes || undefined,
        reviewedBy: r.reviewedBy || undefined,
        reviewedAt: r.reviewedAt || undefined,
      }));
    },
    select: (data) => data ?? [],
    placeholderData: []
  });
}

export function useUploadLabReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ file, patientId, testName, testDate, status }: { file?: File; patientId: string; testName: string; testDate?: string; status?: string }) => {
      const formData = new FormData();
      if (file) {
        formData.append('file', file);
      }
      formData.append('patientId', patientId);
      formData.append('testName', testName);
      formData.append('testDate', testDate || new Date().toISOString().split('T')[0]);
      formData.append('status', status || 'Uploaded');

      const response = await apiClient.post('/laboratory/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labs'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    }
  });
}

export function useDeleteLabReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.delete(`/laboratory/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labs'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    }
  });
}

export function useReviewLabReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, reviewedBy, reviewNotes }: { id: string; reviewedBy: string; reviewNotes: string }) => {
      const response = await apiClient.patch(`/laboratory/${id}/review`, { reviewedBy, reviewNotes });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labs'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    }
  });
}

export function useUpdateLabStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiClient.patch(`/laboratory/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labs'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
    }
  });
}

// ----------------------------------------------------
// GALLERY HOOKS
// ----------------------------------------------------
export function useGallery(patientId?: string) {
  return useQuery<TreatmentGalleryItem[]>({
    queryKey: ['gallery', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const response = await apiClient.get<any>(`/patients/${patientId}/history`);
      const photos = response?.data?.clinicalPhotos ?? [];
      
      const galleryItems: TreatmentGalleryItem[] = [];
      const befores = photos.filter((p: any) => p.photoType === 'BEFORE');
      const afters = photos.filter((p: any) => p.photoType === 'AFTER');
      
      afters.forEach((after: any) => {
        const before = befores.find((b: any) => b.bodyArea === after.bodyArea || b.medicalRecordId === after.medicalRecordId) || after;
        galleryItems.push({
          id: after.id,
          patientId: after.patientId,
          patientName: response?.data?.name ?? 'Patient',
          title: `${after.bodyArea || 'Skin'} Treatment Comparison`,
          date: after.takenAt ? after.takenAt.split('T')[0] : new Date().toISOString().split('T')[0],
          beforeUrl: before.photoUrl,
          afterUrl: after.photoUrl,
          notes: after.notes || '',
        });
      });
      
      photos.forEach((p: any) => {
        if (p.photoType !== 'BEFORE' && p.photoType !== 'AFTER') {
          galleryItems.push({
            id: p.id,
            patientId: p.patientId,
            patientName: response?.data?.name ?? 'Patient',
            title: `${p.bodyArea || 'Clinical'} Photo`,
            date: p.takenAt ? p.takenAt.split('T')[0] : new Date().toISOString().split('T')[0],
            beforeUrl: p.photoUrl,
            afterUrl: p.photoUrl,
            notes: p.notes || '',
          });
        }
      });
      
      return galleryItems;
    },
    enabled: !!patientId,
    select: (data) => data ?? [],
    placeholderData: []
  });
}

export function useAddGalleryItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (newItem: any) => {
      if (newItem.beforeUrl) {
        await apiClient.post(`/patients/${newItem.patientId}/photos`, {
          photoUrl: newItem.beforeUrl,
          bodyArea: newItem.title.replace(' Treatment Comparison', ''),
          photoType: 'BEFORE',
          notes: newItem.notes
        });
      }
      
      const response = await apiClient.post(`/patients/${newItem.patientId}/photos`, {
        photoUrl: newItem.afterUrl,
        bodyArea: newItem.title.replace(' Treatment Comparison', ''),
        photoType: 'AFTER',
        notes: newItem.notes
      });
      
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gallery'] });
    }
  });
}

// ----------------------------------------------------
// DOCUMENT HOOKS
// ----------------------------------------------------
export function useDocuments(patientId: string | null) {
  return useQuery<PatientDocument[]>({
    queryKey: ['documents', patientId],
    queryFn: async () => {
      if (!patientId) return [];
      const res = await documentService.getDocuments(patientId);
      return res ?? [];
    },
    enabled: !!patientId,
    select: (data) => data ?? [],
    placeholderData: []
  });
}

export function useUploadDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ patientId, file, type, uploadedByName }: { patientId: string; file: File; type: PatientDocumentType; uploadedByName: string }) => {
      return documentService.uploadDocument(patientId, file, type, uploadedByName);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents', variables.patientId] });
      queryClient.invalidateQueries({ queryKey: ['patients', variables.patientId, 'history'] });
    }
  });
}

// ----------------------------------------------------
// FOLLOWUPS RECALLS HOOKS
// ----------------------------------------------------
export function useFollowUps() {
  return useQuery<any[]>({
    queryKey: ['followups'],
    queryFn: async () => {
      const response = await apiClient.get<any[]>('/followups');
      return response.data ?? [];
    },
    select: (data) => data ?? [],
    placeholderData: []
  });
}

export function useUpdateFollowUpStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const response = await apiClient.put(`/followups/${id}/status`, { status });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followups'] });
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });
}

export function useDeleteDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ documentId, patientId }: { documentId: string; patientId: string }) => {
      return documentService.deleteDocument(documentId);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents', variables.patientId] });
      queryClient.invalidateQueries({ queryKey: ['patients', variables.patientId, 'history'] });
    }
  });
}

// ----------------------------------------------------
// REPORTS HOOK
// ----------------------------------------------------
export function useReports(clinicId?: string) {
  return useQuery<any>({
    queryKey: ['reports', clinicId],
    queryFn: async () => {
      const response = await apiClient.get<any>('/reports', {
        params: { clinicId }
      });
      return response.data;
    }
  });
}

export function useCloseVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (visitId: string) => {
      const response = await apiClient.patch(`/visits/${visitId}/close`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['patients'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    }
  });
}

// ----------------------------------------------------
// DASHBOARD HOOKS
// ----------------------------------------------------
export function useDoctorDashboard() {
  return useQuery<any>({
    queryKey: ['doctorDashboard'],
    queryFn: async () => {
      const response = await apiClient.get<any>('/dashboard/doctor');
      return response.data;
    },
    refetchInterval: 10000,
  });
}

export function useDoctorStats(enabled = true) {
  return useQuery<any>({
    queryKey: ['doctorStats'],
    queryFn: async () => {
      const response = await apiClient.get<any>('/dashboard/doctor/stats');
      return response.data;
    },
    refetchInterval: 10000,
    enabled,
  });
}

export function useDoctorQueue(enabled = true) {
  return useQuery<any>({
    queryKey: ['doctorQueue'],
    queryFn: async () => {
      const response = await apiClient.get<any>('/dashboard/doctor/queue');
      return response.data;
    },
    refetchInterval: 10000,
    enabled,
  });
}

export function useDoctorAppointmentsList(enabled = true) {
  return useQuery<any[]>({
    queryKey: ['doctorAppointmentsList'],
    queryFn: async () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const response = await apiClient.get<any[]>('/appointments', {
        params: { date: todayStr }
      });
      return response.data ?? [];
    },
    refetchInterval: 10000,
    enabled,
  });
}

export function useDoctorRecentActivity(enabled = true) {
  return useQuery<any[]>({
    queryKey: ['doctorRecentActivity'],
    queryFn: async () => {
      const response = await apiClient.get<any[]>('/dashboard/doctor/recent-activity');
      return response.data ?? [];
    },
    refetchInterval: 10000,
    enabled,
  });
}

export function useReceptionistDashboard() {
  return useQuery<any>({
    queryKey: ['receptionistDashboard'],
    queryFn: async () => {
      const response = await apiClient.get<any>('/dashboard/receptionist');
      return response.data;
    },
    refetchInterval: 10000,
  });
}

export function useReceptionistStats(enabled = true) {
  return useQuery<any>({
    queryKey: ['receptionistStats'],
    queryFn: async () => {
      const response = await apiClient.get<any>('/dashboard/receptionist/stats');
      return response.data;
    },
    refetchInterval: 10000,
    enabled,
  });
}

export function useReceptionistAppointments(enabled = true) {
  return useQuery<any[]>({
    queryKey: ['receptionistAppointments'],
    queryFn: async () => {
      const todayStr = new Date().toISOString().split('T')[0];
      const response = await apiClient.get<any[]>('/appointments', {
        params: { date: todayStr }
      });
      return response.data ?? [];
    },
    refetchInterval: 10000,
    enabled,
  });
}

export function useReceptionistQueueStatus(enabled = true) {
  return useQuery<any[]>({
    queryKey: ['receptionistQueueStatus'],
    queryFn: async () => {
      const response = await apiClient.get<any[]>('/queue');
      return response.data ?? [];
    },
    refetchInterval: 10000,
    enabled,
  });
}

export function useSuperAdminDashboard() {
  return useQuery<any>({
    queryKey: ['superAdminDashboard'],
    queryFn: async () => {
      const response = await apiClient.get<any>('/dashboard/superadmin');
      return response.data;
    },
    refetchInterval: 15000,
  });
}

export function useSuperAdminHealth(enabled = true) {
  return useQuery<any>({
    queryKey: ['superAdminHealth'],
    queryFn: async () => {
      const response = await apiClient.get<any>('/dashboard/superadmin/health');
      return response.data;
    },
    refetchInterval: 15000,
    enabled,
  });
}

export function useSuperAdminStats(enabled = true) {
  return useQuery<any>({
    queryKey: ['superAdminStats'],
    queryFn: async () => {
      const response = await apiClient.get<any>('/dashboard/superadmin/stats');
      return response.data;
    },
    refetchInterval: 15000,
    enabled,
  });
}

export function useSuperAdminAuditLogs(enabled = true) {
  return useQuery<any[]>({
    queryKey: ['superAdminAuditLogs'],
    queryFn: async () => {
      const response = await apiClient.get<any[]>('/dashboard/superadmin/audit-logs');
      return response.data ?? [];
    },
    refetchInterval: 15000,
    enabled,
  });
}

export function useSuperAdminUsersList(enabled = true) {
  return useQuery<any[]>({
    queryKey: ['superAdminUsersList'],
    queryFn: async () => {
      const response = await apiClient.get<any[]>('/dashboard/superadmin/users');
      return response.data ?? [];
    },
    refetchInterval: 15000,
    enabled,
  });
}

export function useSuperAdminClinicsList(enabled = true) {
  return useQuery<any[]>({
    queryKey: ['superAdminClinicsList'],
    queryFn: async () => {
      const response = await apiClient.get<any[]>('/dashboard/superadmin/clinics');
      return response.data ?? [];
    },
    refetchInterval: 15000,
    enabled,
  });
}

export function useWhatsappOutbox() {
  return useQuery<any[]>({
    queryKey: ['whatsappOutbox'],
    queryFn: async () => {
      const response = await apiClient.get<any[]>('/notifications/whatsapp-outbox');
      return response.data ?? [];
    },
    refetchInterval: 10000,
  });
}

export function useResendNotification() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await apiClient.post<any>(`/notifications/${id}/resend`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsappOutbox'] });
    }
  });
}

export function useSendManualWhatsapp() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { patientId: string; message: string; clinicId?: string }) => {
      const response = await apiClient.post<any>('/notifications/send-manual', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['whatsappOutbox'] });
    }
  });
}
