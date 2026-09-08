import { MockDoctorCaseProvider, type DoctorCase } from './MockDoctorCaseProvider';
import type { 
  AyushResponse,
  AyushDoctorAssessment,
  ConsultationState,
  PatientDocument
} from '@/features/patient/PatientSessionContext';

export interface AyushAssessmentRecord {
  assessmentId: string;
  caseId: string;
  patientId: string;
  patientName: string;
  age: number | string;
  gender: string;
  maskedMobile: string;
  maskedAbhaId: string;
  chiefComplaint: string;
  caseStatus: 'waiting' | 'in-consultation' | 'completed' | 'closed';
  ayushStatus: 'pending' | 'in-progress' | 'draft' | 'completed';
  redFlagTriggered: boolean;
  patientAyushResponses: AyushResponse[];
  practitionerAyushAssessment?: AyushDoctorAssessment;
  lastUpdated: string;
  documents: PatientDocument[];
}

export class MockAyushAssessmentProvider {
  /**
   * Helper to determine AYUSH status based on consultation state if missing.
   */
  private static deriveAyushStatus(c: DoctorCase): 'pending' | 'in-progress' | 'draft' | 'completed' {
    if (c.consultation?.ayushStatus) {
      return c.consultation.ayushStatus;
    }
    
    // Fallback logic if ayushStatus isn't explicitly set yet
    const asmt = c.consultation?.ayushAssessment;
    if (asmt && (asmt.prakriti || asmt.agni || asmt.koshtha || asmt.dosha || asmt.notes)) {
      return 'in-progress';
    }
    return 'pending';
  }

  /**
   * Map a DoctorCase to an AyushAssessmentRecord
   */
  private static mapToRecord(c: DoctorCase): AyushAssessmentRecord {
    // Determine a stable patient ID
    let patientId = `PAT-GEN-${c.patientName}-${c.age}`.replace(/\s+/g, '-').toUpperCase();
    if (c.abhaId) patientId = `PAT-ABHA-${c.abhaId.replace(/[^a-zA-Z0-9]/g, '')}`;
    else if (c.mobile) patientId = `PAT-MOB-${c.mobile}-${c.patientName.substring(0, 3).toUpperCase()}`;

    // Masking
    const maskMobile = (m?: string) => m && m.length >= 10 ? `${m.slice(0, 2)}••••${m.slice(-4)}` : 'N/A';
    const maskAbha = (a?: string) => {
      if (!a) return 'N/A';
      const clean = a.replace(/[^a-zA-Z0-9]/g, '');
      return clean.length === 14 ? `XXXX XXXX ${clean.slice(-4)}` : a;
    };

    return {
      assessmentId: `AYU-${c.caseId}`,
      caseId: c.caseId,
      patientId,
      patientName: c.patientName,
      age: c.age,
      gender: c.gender,
      maskedMobile: maskMobile(c.mobile),
      maskedAbhaId: maskAbha(c.abhaId),
      chiefComplaint: c.chiefComplaint || 'No chief complaint recorded',
      caseStatus: c.status,
      ayushStatus: this.deriveAyushStatus(c),
      redFlagTriggered: c.redFlagTriggered,
      patientAyushResponses: c.ayushResponses || [],
      practitionerAyushAssessment: c.consultation?.ayushAssessment,
      lastUpdated: c.consultation?.ayushFinalizedAt || c.consultation?.updatedAt || c.submittedAt,
      documents: c.documents || []
    };
  }

  static getAssessments(): AyushAssessmentRecord[] {
    const cases = MockDoctorCaseProvider.getCases();
    // Sort by latest submitted
    return cases.map(c => this.mapToRecord(c))
      .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());
  }

  static getAssessmentByCaseId(caseId: string): AyushAssessmentRecord | undefined {
    const cases = MockDoctorCaseProvider.getCases();
    const c = cases.find(x => x.caseId === caseId);
    if (!c) return undefined;
    return this.mapToRecord(c);
  }

  static getAssessmentById(assessmentId: string): AyushAssessmentRecord | undefined {
    // ID is derived as AYU-caseId
    const caseId = assessmentId.replace('AYU-', '');
    return this.getAssessmentByCaseId(caseId);
  }

  static searchAssessments(query: string): AyushAssessmentRecord[] {
    const records = this.getAssessments();
    if (!query || query.trim() === '') return records;
    
    const lowerQuery = query.toLowerCase().trim();
    
    return records.filter(r => {
      const matchName = r.patientName.toLowerCase().includes(lowerQuery);
      const matchCaseId = r.caseId.toLowerCase().includes(lowerQuery);
      const matchAbha = r.maskedAbhaId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase().includes(lowerQuery.replace(/[^a-zA-Z0-9]/g, ''));
      const matchMobile = r.maskedMobile.toLowerCase().includes(lowerQuery);
      return matchName || matchCaseId || matchAbha || matchMobile;
    });
  }

  static getPendingAssessments(): AyushAssessmentRecord[] {
    return this.getAssessments().filter(a => a.ayushStatus === 'pending');
  }

  static getInProgressAssessments(): AyushAssessmentRecord[] {
    return this.getAssessments().filter(a => a.ayushStatus === 'in-progress' || a.ayushStatus === 'draft');
  }

  static getCompletedAssessments(): AyushAssessmentRecord[] {
    return this.getAssessments().filter(a => a.ayushStatus === 'completed');
  }

  static getAttentionAssessments(): AyushAssessmentRecord[] {
    return this.getAssessments().filter(a => a.redFlagTriggered);
  }

  /**
   * Persist changes back through MockDoctorCaseProvider
   */
  static updateAssessment(caseId: string, assessment: AyushDoctorAssessment, status: 'pending' | 'in-progress' | 'draft' | 'completed') {
    const docCase = MockDoctorCaseProvider.getCaseById(caseId);
    if (!docCase) throw new Error(`Case ${caseId} not found`);

    const now = new Date().toISOString();
    
    // Ensure consultation exists
    const currentCons = docCase.consultation || {
      status: 'idle',
      ayushStatus: 'pending',
      clinicalAssessment: { findings: '', assessment: '', diagnosis: '', notes: '' },
      ayushAssessment: { prakriti: '', agni: '', koshtha: '', dosha: '', notes: '' },
      prescription: { items: [] },
      followUp: { required: false, timeframe: '', instructions: '' },
      startedAt: now
    };

    const updatedCons: ConsultationState = {
      ...currentCons,
      ayushAssessment: assessment,
      ayushStatus: status,
      updatedAt: now,
      ayushFinalizedAt: status === 'completed' ? now : currentCons.ayushFinalizedAt
    };

    // Update through MockDoctorCaseProvider
    MockDoctorCaseProvider.saveConsultation(caseId, updatedCons);
  }

  static saveAssessmentDraft(caseId: string, assessment: AyushDoctorAssessment) {
    this.updateAssessment(caseId, assessment, 'draft');
  }

  static finalizeAssessment(caseId: string, assessment: AyushDoctorAssessment) {
    this.updateAssessment(caseId, assessment, 'completed');
  }
}
