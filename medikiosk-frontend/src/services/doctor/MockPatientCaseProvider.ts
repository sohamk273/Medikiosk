import { MockDoctorCaseProvider } from './MockDoctorCaseProvider';
import type { DoctorCase } from './MockDoctorCaseProvider';
import type { 
  PatientDocument,
  VoiceResponse,
  AyushResponse,
  MedicationHistory,
  AllergyHistory,
  ConsultationState
} from '@/features/patient/PatientSessionContext';

export interface PatientEncounter {
  caseId: string;
  date: string;
  status: 'waiting' | 'in-consultation' | 'completed' | 'closed';
  chiefComplaint?: string;
  diagnosis?: string;
  assessment?: string;
  prescriptionCount?: number;
  consultationFinalized: boolean;
  redFlagTriggered: boolean;
  
  // Historical context to render read-only records
  consultation?: ConsultationState;
  voiceResponses?: VoiceResponse[];
  ayushResponses?: AyushResponse[];
  medicationHistory?: MedicationHistory;
  allergyHistory?: AllergyHistory;
  documents?: PatientDocument[];
}

export interface PatientRecord {
  patientId: string;
  name: string;
  age: number | string;
  gender: string;
  mobile?: string;
  abhaId?: string;
  
  firstVisit: string;
  latestVisit: string;
  totalVisits: number;
  
  activeCaseId?: string;
  currentStatus?: 'waiting' | 'in-consultation' | 'completed' | 'closed';
  latestConcern?: string;
  attentionRequired: boolean;
  
  encounters: PatientEncounter[];
}

export class MockPatientCaseProvider {
  /**
   * Generates a stable patient ID based on the best available identifiers.
   */
  private static generatePatientId(c: DoctorCase): string {
    if (c.abhaId) return `PAT-ABHA-${c.abhaId.replace(/[^a-zA-Z0-9]/g, '')}`;
    if (c.mobile) return `PAT-MOB-${c.mobile}-${c.patientName.substring(0, 3).toUpperCase()}`;
    // Fallback if no ABHA or Mobile: Name + Age + Gender hash
    const hash = `${c.patientName}-${c.age}-${c.gender}`.replace(/\s+/g, '-').toUpperCase();
    return `PAT-GEN-${hash}`;
  }

  /**
   * Extracts a single encounter object from a case.
   */
  private static createEncounterFromCase(c: DoctorCase): PatientEncounter {
    const isFinalized = c.consultation?.status === 'finalized';
    return {
      caseId: c.caseId,
      date: c.submittedAt,
      status: c.status,
      chiefComplaint: c.chiefComplaint,
      diagnosis: isFinalized ? c.consultation?.clinicalAssessment.diagnosis : undefined,
      assessment: isFinalized ? c.consultation?.clinicalAssessment.assessment : undefined,
      prescriptionCount: isFinalized ? c.consultation?.prescription.items.length : 0,
      consultationFinalized: isFinalized,
      redFlagTriggered: c.redFlagTriggered,
      consultation: c.consultation,
      voiceResponses: c.voiceResponses,
      ayushResponses: c.ayushResponses,
      medicationHistory: c.medicationHistory,
      allergyHistory: c.allergyHistory,
      documents: c.documents
    };
  }

  /**
   * Dynamically derives the list of PatientRecords from the current MockDoctorCaseProvider state.
   */
  static getPatientRecords(): PatientRecord[] {
    const cases = MockDoctorCaseProvider.getCases();
    const patientMap = new Map<string, PatientRecord>();

    for (const c of cases) {
      const patientId = this.generatePatientId(c);
      const encounter = this.createEncounterFromCase(c);

      if (!patientMap.has(patientId)) {
        patientMap.set(patientId, {
          patientId,
          name: c.patientName,
          age: c.age,
          gender: c.gender,
          mobile: c.mobile,
          abhaId: c.abhaId,
          firstVisit: c.submittedAt,
          latestVisit: c.submittedAt,
          totalVisits: 1,
          attentionRequired: c.redFlagTriggered && c.status !== 'completed' && c.status !== 'closed',
          activeCaseId: (c.status !== 'completed' && c.status !== 'closed') ? c.caseId : undefined,
          currentStatus: c.status,
          latestConcern: c.chiefComplaint,
          encounters: [encounter]
        });
      } else {
        const record = patientMap.get(patientId)!;
        record.encounters.push(encounter);
        record.totalVisits += 1;
        
        // Update latest visit info if this case is newer
        if (new Date(c.submittedAt) > new Date(record.latestVisit)) {
          record.latestVisit = c.submittedAt;
          record.latestConcern = c.chiefComplaint;
          record.currentStatus = c.status;
          
          if (c.status !== 'completed' && c.status !== 'closed') {
            record.activeCaseId = c.caseId;
            record.attentionRequired = c.redFlagTriggered;
          } else {
            record.activeCaseId = undefined;
            // Clear attention required flag if the newest case is resolved.
            // In a real EMR, active cases might exist alongside completed ones, but we assume 1 active case per patient.
            record.attentionRequired = false;
          }
          
          record.age = c.age;
          if (c.mobile) record.mobile = c.mobile;
          if (c.abhaId) record.abhaId = c.abhaId;
        } else if (c.status !== 'completed' && c.status !== 'closed') {
           // Handle case where an older case is still active (unlikely but possible in mock data)
           record.activeCaseId = c.caseId;
           record.currentStatus = c.status;
           record.attentionRequired = record.attentionRequired || c.redFlagTriggered;
        }
      }
    }

    const records = Array.from(patientMap.values());
    records.forEach(r => {
      r.encounters.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    });

    return records.sort((a, b) => new Date(b.latestVisit).getTime() - new Date(a.latestVisit).getTime());
  }

  /**
   * Retrieves a specific longitudinal patient record.
   */
  static getPatientRecordById(patientId: string): PatientRecord | undefined {
    const records = this.getPatientRecords();
    return records.find(r => r.patientId === patientId);
  }

  /**
   * Searches patient records using case-insensitive matching.
   */
  static searchPatientRecords(query: string): PatientRecord[] {
    const records = this.getPatientRecords();
    if (!query || query.trim() === '') return records;
    
    const lowerQuery = query.toLowerCase().trim();
    
    return records.filter(r => {
      const matchName = r.name.toLowerCase().includes(lowerQuery);
      const matchPatientId = r.patientId.toLowerCase().includes(lowerQuery);
      const matchAbha = r.abhaId?.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().includes(lowerQuery.replace(/[^a-zA-Z0-9]/g, ''));
      const matchMobile = r.mobile?.toLowerCase().includes(lowerQuery);
      const matchConcern = r.latestConcern?.toLowerCase().includes(lowerQuery);
      const matchCaseId = r.encounters.some(e => e.caseId.toLowerCase().includes(lowerQuery));
      
      return matchName || matchPatientId || matchAbha || matchMobile || matchConcern || matchCaseId;
    });
  }
}
