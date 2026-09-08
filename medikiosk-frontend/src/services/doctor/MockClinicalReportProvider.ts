import { MockDoctorCaseProvider, type DoctorCase } from './MockDoctorCaseProvider';

export type ClinicalReportType =
  | 'consultation-summary'
  | 'prescription'
  | 'ayush-assessment'
  | 'patient-history'
  | 'case-summary';

export type ClinicalReportStatus =
  | 'draft'
  | 'generating'
  | 'generated'
  | 'reviewed'
  | 'archived';

export interface ClinicalReport {
  id: string;
  caseId: string;
  patientId: string;
  patientName: string;
  maskedMobile: string;
  maskedAbhaId: string;
  reportType: ClinicalReportType;
  title: string;
  status: ClinicalReportStatus;
  generatedAt: string;
  updatedAt?: string;
  reviewedAt?: string;
  archivedAt?: string;
  doctorName: string;
  department: string;
  diagnosis?: string;
  chiefComplaint?: string;
  consultationId?: string;
  redFlagTriggered?: boolean;

  content: {
    patientInformation?: Record<string, string>;
    clinicalAssessment?: Record<string, string>;
    ayushAssessment?: Record<string, string>;
    prescriptions?: Array<{
      medicineName: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions: string;
    }>;
    followUp?: {
      required: boolean;
      timeframe?: string;
      instructions?: string;
    };
    patientHistory?: Record<string, string>;
    documents?: Array<{
      id: string;
      fileName: string;
      type: string;
    }>;
  };
}

let MOCK_REPORTS: Record<string, ClinicalReport> = {};
let reportCounter = 40;

export class MockClinicalReportProvider {
  private static generateReportId(): string {
    reportCounter++;
    return `RPT-2026-${String(reportCounter).padStart(5, '0')}`;
  }

  private static maskMobile(m?: string): string {
    return m && m.length >= 10 ? `${m.slice(0, 2)}••••${m.slice(-4)}` : 'N/A';
  }

  private static maskAbha(a?: string): string {
    if (!a) return 'N/A';
    const clean = a.replace(/[^a-zA-Z0-9]/g, '');
    return clean.length === 14 ? `XXXX XXXX ${clean.slice(-4)}` : a;
  }

  static getReports(): ClinicalReport[] {
    return Object.values(MOCK_REPORTS)
      .filter(r => r.status !== 'archived')
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
  }

  static getArchivedReports(): ClinicalReport[] {
    return Object.values(MOCK_REPORTS)
      .filter(r => r.status === 'archived')
      .sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
  }

  static getReportById(reportId: string): ClinicalReport | undefined {
    return MOCK_REPORTS[reportId];
  }

  static getReportsByCaseId(caseId: string): ClinicalReport[] {
    return Object.values(MOCK_REPORTS).filter(r => r.caseId === caseId && r.status !== 'archived');
  }

  static getReportsByPatientId(patientId: string): ClinicalReport[] {
    return Object.values(MOCK_REPORTS).filter(r => r.patientId === patientId && r.status !== 'archived');
  }

  static searchReports(query: string, includeArchived = false): ClinicalReport[] {
    let reports = includeArchived ? Object.values(MOCK_REPORTS) : this.getReports();
    if (!query || query.trim() === '') return reports;
    
    const q = query.toLowerCase().trim();
    return reports.filter(r => 
      r.patientName.toLowerCase().includes(q) ||
      r.id.toLowerCase().includes(q) ||
      r.caseId.toLowerCase().includes(q) ||
      (r.diagnosis && r.diagnosis.toLowerCase().includes(q)) ||
      (r.chiefComplaint && r.chiefComplaint.toLowerCase().includes(q)) ||
      r.doctorName.toLowerCase().includes(q)
    );
  }

  static filterReports(type?: ClinicalReportType | 'All', status?: ClinicalReportStatus | 'All'): ClinicalReport[] {
    let reports = Object.values(MOCK_REPORTS);
    
    if (type && type !== 'All') {
      reports = reports.filter(r => r.reportType === type);
    }
    
    if (status && status !== 'All') {
      reports = reports.filter(r => r.status === status);
    } else if (status !== 'All') {
      reports = reports.filter(r => r.status !== 'archived');
    }
    
    return reports.sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
  }

  static generateReport(caseId: string, reportType: ClinicalReportType): Promise<string> {
    return new Promise((resolve, reject) => {
      const docCase = MockDoctorCaseProvider.getCaseById(caseId);
      if (!docCase) {
        reject(new Error('Case not found'));
        return;
      }

      const id = this.generateReportId();
      
      const report: ClinicalReport = {
        id,
        caseId: docCase.caseId,
        patientId: `PAT-GEN-${docCase.patientName}-${docCase.age}`.replace(/\s+/g, '-').toUpperCase(),
        patientName: docCase.patientName,
        maskedMobile: this.maskMobile(docCase.mobile),
        maskedAbhaId: this.maskAbha(docCase.abhaId),
        reportType,
        title: this.getReportTitle(reportType),
        status: 'generating',
        generatedAt: new Date().toISOString(),
        doctorName: 'Dr. Sharma (AYUSH)',
        department: 'General OPD / AYUSH',
        diagnosis: docCase.consultation?.clinicalAssessment?.diagnosis || 'Not provided',
        chiefComplaint: docCase.chiefComplaint || 'Not provided',
        redFlagTriggered: docCase.redFlagTriggered,
        content: this.buildReportContent(docCase, reportType)
      };

      MOCK_REPORTS[id] = report;

      setTimeout(() => {
        if (MOCK_REPORTS[id]) {
          MOCK_REPORTS[id].status = 'generated';
        }
        resolve(id);
      }, 1800);
    });
  }

  private static getReportTitle(type: ClinicalReportType): string {
    switch (type) {
      case 'consultation-summary': return 'Consultation Summary';
      case 'prescription': return 'Prescription';
      case 'ayush-assessment': return 'AYUSH Assessment Report';
      case 'patient-history': return 'Longitudinal Patient History';
      case 'case-summary': return 'Complete Case Summary';
      default: return 'Clinical Report';
    }
  }

  private static buildReportContent(docCase: DoctorCase, type: ClinicalReportType): ClinicalReport['content'] {
    const content: ClinicalReport['content'] = {};
    const cons = docCase.consultation;

    content.patientInformation = {
      'Name': docCase.patientName,
      'Age/Gender': `${docCase.age} / ${docCase.gender}`,
      'Mobile': this.maskMobile(docCase.mobile),
      'ABHA ID': this.maskAbha(docCase.abhaId),
      'Case ID': docCase.caseId
    };

    if (type === 'consultation-summary' || type === 'case-summary') {
      content.clinicalAssessment = cons ? {
        'Findings': cons.clinicalAssessment.findings || 'Not provided',
        'Assessment': cons.clinicalAssessment.assessment || 'Not provided',
        'Diagnosis': cons.clinicalAssessment.diagnosis || 'Not provided',
        'Clinical Notes': cons.clinicalAssessment.notes || 'Not provided'
      } : {};
      
      content.prescriptions = cons?.prescription?.items || [];
      content.followUp = cons?.followUp;
    }

    if (type === 'prescription' || type === 'case-summary') {
      content.prescriptions = cons?.prescription?.items || [];
    }

    if (type === 'ayush-assessment' || type === 'consultation-summary' || type === 'case-summary') {
      content.ayushAssessment = cons?.ayushAssessment ? {
        'Prakriti': cons.ayushAssessment.prakriti || 'Not provided',
        'Agni': cons.ayushAssessment.agni || 'Not provided',
        'Koshtha': cons.ayushAssessment.koshtha || 'Not provided',
        'Dosha': cons.ayushAssessment.dosha || 'Not provided',
        'Notes': cons.ayushAssessment.notes || 'Not provided'
      } : {};
    }

    if (type === 'patient-history') {
      // Basic history extraction for mock purposes
      content.patientHistory = {
        'First Visit': docCase.submittedAt ? new Date(docCase.submittedAt).toLocaleDateString() : 'N/A',
        'Total Encounters': '1',
        'Allergies': docCase.allergyHistory?.hasAllergy === 'yes' ? docCase.allergyHistory.allergyType || 'Yes' : 'None reported',
        'Current Medications': docCase.medicationHistory?.takingMedicines === 'yes_daily' || docCase.medicationHistory?.takingMedicines === 'yes_sometimes' ? docCase.medicationHistory.medicines || 'Yes' : 'None reported'
      };
    }

    if (docCase.documents) {
      content.documents = docCase.documents.map(d => ({
        id: d.id,
        fileName: d.fileName || `${d.title}.pdf`,
        type: d.type
      }));
    }

    return content;
  }

  static markReportReviewed(reportId: string): void {
    if (MOCK_REPORTS[reportId]) {
      MOCK_REPORTS[reportId].status = 'reviewed';
      MOCK_REPORTS[reportId].reviewedAt = new Date().toISOString();
    }
  }

  static archiveReport(reportId: string): void {
    if (MOCK_REPORTS[reportId]) {
      MOCK_REPORTS[reportId].status = 'archived';
      MOCK_REPORTS[reportId].archivedAt = new Date().toISOString();
    }
  }
}
