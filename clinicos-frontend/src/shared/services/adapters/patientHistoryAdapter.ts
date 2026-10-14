export interface NormalizedPatientHistory {
  patient: any;
  visits: any[];
  consultations: any[];
  prescriptions: any[];
  labReports: any[];
  followUps: any[];
  documents: any[];
  treatmentImages: any[];
  tokenHistory: any[];
}

export function adaptPatientHistoryResponse(response: any): NormalizedPatientHistory {
  if (!response) {
    return {
      patient: null,
      visits: [],
      consultations: [],
      prescriptions: [],
      labReports: [],
      followUps: [],
      documents: [],
      treatmentImages: [],
      tokenHistory: [],
    };
  }

  return {
    patient: response.patient ? {
      ...response.patient,
      allergies: response.patient.allergies ?? [],
      medicalConditions: response.patient.medicalConditions ?? [],
    } : null,
    visits: response.visits ?? [],
    consultations: response.consultations ?? [],
    prescriptions: response.prescriptions ?? [],
    labReports: response.labReports ?? [],
    followUps: response.followUps ?? [],
    documents: response.documents ?? [],
    treatmentImages: response.treatmentImages ?? [],
    tokenHistory: response.tokenHistory ?? [],
  };
}
