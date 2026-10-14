import { PatientHistoryService } from './patient-history.service';
export declare class PatientHistoryController {
    private patientHistoryService;
    constructor(patientHistoryService: PatientHistoryService);
    getHistory(id: string, req: any): Promise<{
        patient: any;
        visits: ({
            appointment: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                deletedAt: Date | null;
<<<<<<< HEAD
                clinicId: string;
                patientId: string;
                doctorId: string;
                notes: string | null;
                status: string;
=======
                doctorId: string;
                clinicId: string;
                notes: string | null;
                status: string;
                patientId: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                date: string;
                time: string;
                type: string;
            } | null;
            token: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                deletedAt: Date | null;
<<<<<<< HEAD
                clinicId: string | null;
                patientId: string;
                startTime: string | null;
                endTime: string | null;
                status: string;
=======
                startTime: string | null;
                endTime: string | null;
                clinicId: string | null;
                status: string;
                patientId: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                tokenNumber: string;
                patientName: string;
                priority: string;
                visitReason: string;
                doctorName: string;
                checkInTime: string;
            } | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
            clinicId: string | null;
<<<<<<< HEAD
            patientId: string;
=======
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            reason: string | null;
            notes: string | null;
            status: string;
            closedAt: Date | null;
<<<<<<< HEAD
=======
            patientId: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            appointmentId: string | null;
            tokenId: string | null;
        })[];
        consultations: ({
            labReports: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                deletedAt: Date | null;
                clinicId: string | null;
<<<<<<< HEAD
                patientId: string | null;
                status: string;
=======
                status: string;
                patientId: string | null;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                medicalRecordId: string | null;
                testName: string;
                testDate: string;
                results: string;
                filePath: string | null;
                reviewNotes: string | null;
                reviewedBy: string | null;
                reviewedAt: Date | null;
            }[];
            appointment: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                deletedAt: Date | null;
<<<<<<< HEAD
                clinicId: string;
                patientId: string;
                doctorId: string;
                notes: string | null;
                status: string;
=======
                doctorId: string;
                clinicId: string;
                notes: string | null;
                status: string;
                patientId: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                date: string;
                time: string;
                type: string;
            } | null;
            photos: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                deletedAt: Date | null;
                clinicId: string;
<<<<<<< HEAD
                patientId: string;
                notes: string | null;
=======
                notes: string | null;
                patientId: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                bodyArea: string | null;
                medicalRecordId: string | null;
                takenAt: Date;
                photoUrl: string;
                thumbnailUrl: string | null;
                photoType: string;
            }[];
            prescription: ({
                items: {
                    id: string;
                    createdAt: Date;
                    updatedAt: Date;
                    createdBy: string | null;
                    deletedAt: Date | null;
                    prescriptionId: string;
                    drugName: string;
                    drugCategory: string;
                    strength: string | null;
                    dosageForm: string | null;
                    dose: string;
                    frequency: string;
                    duration: string;
                    instructions: string | null;
                }[];
            } & {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                deletedAt: Date | null;
<<<<<<< HEAD
                clinicId: string;
                patientId: string;
                doctorId: string;
=======
                doctorId: string;
                clinicId: string;
                patientId: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
                advice: string | null;
                medicalRecordId: string | null;
            }) | null;
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
<<<<<<< HEAD
            clinicId: string;
            patientId: string;
            doctorId: string;
=======
            doctorId: string;
            clinicId: string;
            patientId: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            appointmentId: string | null;
            chiefComplaint: string;
            historyOfPresent: string | null;
            examinationFindings: string | null;
            diagnosis: string;
            treatmentPlan: string;
            skinType: string | null;
            lesionType: string | null;
            bodyArea: string | null;
            visitId: string | null;
        })[];
        prescriptions: ({
            items: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                createdBy: string | null;
                deletedAt: Date | null;
                prescriptionId: string;
                drugName: string;
                drugCategory: string;
                strength: string | null;
                dosageForm: string | null;
                dose: string;
                frequency: string;
                duration: string;
                instructions: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
<<<<<<< HEAD
            clinicId: string;
            patientId: string;
            doctorId: string;
=======
            doctorId: string;
            clinicId: string;
            patientId: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            advice: string | null;
            medicalRecordId: string | null;
        })[];
        labReports: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
            clinicId: string | null;
<<<<<<< HEAD
            patientId: string | null;
            status: string;
=======
            status: string;
            patientId: string | null;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            medicalRecordId: string | null;
            testName: string;
            testDate: string;
            results: string;
            filePath: string | null;
            reviewNotes: string | null;
            reviewedBy: string | null;
            reviewedAt: Date | null;
        }[];
        followUps: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
<<<<<<< HEAD
            clinicId: string;
            patientId: string;
            doctorId: string;
            reason: string | null;
            notes: string | null;
            status: string;
=======
            doctorId: string;
            clinicId: string;
            reason: string | null;
            notes: string | null;
            status: string;
            patientId: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            appointmentId: string | null;
            priority: string;
            dueDate: string;
            reminderCount: number;
            lastRemindedAt: Date | null;
        }[];
        documents: {
            id: string;
            createdAt: string;
            createdBy: string | null;
            deletedAt: Date | null;
            clinicId: string | null;
            patientId: string;
            filePath: string | null;
            documentName: string;
            documentType: string;
            fileSize: string;
            uploadedBy: string;
            uploadedAt: Date;
            createdAtDb: Date;
            updatedAtDb: Date;
        }[];
        treatmentImages: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
            clinicId: string;
<<<<<<< HEAD
            patientId: string;
            notes: string | null;
=======
            notes: string | null;
            patientId: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            bodyArea: string | null;
            medicalRecordId: string | null;
            takenAt: Date;
            photoUrl: string;
            thumbnailUrl: string | null;
            photoType: string;
        }[];
        tokenHistory: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            createdBy: string | null;
            deletedAt: Date | null;
<<<<<<< HEAD
            clinicId: string | null;
            patientId: string;
            startTime: string | null;
            endTime: string | null;
            status: string;
=======
            startTime: string | null;
            endTime: string | null;
            clinicId: string | null;
            status: string;
            patientId: string;
>>>>>>> acc950f8d764e6f4fab215397359f05c19cca2ec
            tokenNumber: string;
            patientName: string;
            priority: string;
            visitReason: string;
            doctorName: string;
            checkInTime: string;
        }[];
    }>;
}
