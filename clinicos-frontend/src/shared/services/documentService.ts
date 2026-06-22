import apiClient from './apiClient';
import { PatientDocument, PatientDocumentType } from '../types';

class DocumentService {
  async getDocuments(patientId: string): Promise<PatientDocument[]> {
    const response = await apiClient.get<any[]>(`/documents/patient/${patientId}`);
    const apiBase = apiClient.defaults.baseURL || '';
    return response.data.map(d => ({
      id: d.id,
      patientId: d.patientId,
      documentName: d.documentName,
      documentType: d.documentType as PatientDocumentType,
      fileUrl: d.filePath ? `${apiBase.replace(/\/api$/, '')}/${d.filePath.replace(/^\//, '')}` : '/mock_files/placeholder.pdf',
      fileSize: d.fileSize,
      uploadedBy: d.uploadedBy,
      uploadedByName: d.uploadedBy,
      createdAt: d.createdAt
    }));
  }

  async uploadDocument(
    patientId: string, 
    file: File, 
    type: PatientDocumentType,
    uploadedByName: string
  ): Promise<PatientDocument> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('documentType', type);
    formData.append('uploadedBy', uploadedByName);

    const response = await apiClient.post(`/documents/patient/${patientId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    const d = response.data;
    const apiBase = apiClient.defaults.baseURL || '';
    return {
      id: d.id,
      patientId: d.patientId,
      documentName: d.documentName,
      documentType: d.documentType as PatientDocumentType,
      fileUrl: d.filePath ? `${apiBase.replace(/\/api$/, '')}/${d.filePath.replace(/^\//, '')}` : '/mock_files/placeholder.pdf',
      fileSize: d.fileSize,
      uploadedBy: d.uploadedBy,
      uploadedByName: d.uploadedBy,
      createdAt: d.createdAt
    };
  }

  async deleteDocument(documentId: string): Promise<void> {
    await apiClient.delete(`/documents/${documentId}`);
  }

  async downloadDocument(documentId: string): Promise<Blob> {
    const response = await apiClient.get(`/documents/${documentId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  }
}

export const documentService = new DocumentService();
export default documentService;
