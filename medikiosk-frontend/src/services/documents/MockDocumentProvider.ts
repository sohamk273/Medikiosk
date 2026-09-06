import type { DocumentType, PatientDocument } from '@/features/patient/PatientSessionContext';

export class MockDocumentProvider {
  /**
   * Returns a deterministic mock document for the given type.
   */
  static getMockDocument(type: DocumentType): PatientDocument {
    const timestamp = new Date().toISOString();
    
    switch (type) {
      case 'prescription':
        return {
          id: `demo-prescription-${Date.now()}`,
          type,
          title: 'Previous Prescription',
          titleHindi: 'पिछली दवाई की पर्ची',
          fileName: 'previous-prescription-demo.pdf',
          status: 'scanned',
          timestamp,
          mockOcrText: 'DEMO PRESCRIPTION\nPatient: Rameshwar Patil\nDate: Demo Date\nMedicines: Paracetamol 500mg, Amoxicillin 250mg',
        };
      case 'lab_report':
        return {
          id: `demo-lab-report-${Date.now()}`,
          type,
          title: 'Blood Test Report',
          titleHindi: 'रक्त जांच रिपोर्ट',
          fileName: 'blood-test-report-demo.pdf',
          status: 'scanned',
          timestamp,
          mockOcrText: 'DEMO LAB REPORT\nPatient: Rameshwar Patil\nTest: Complete Blood Count\nResult: Normal',
        };
      case 'discharge_summary':
        return {
          id: `demo-discharge-${Date.now()}`,
          type,
          title: 'Discharge Summary',
          titleHindi: 'डिस्चार्ज सारांश',
          fileName: 'discharge-summary-demo.pdf',
          status: 'scanned',
          timestamp,
          mockOcrText: 'DEMO DISCHARGE SUMMARY\nPatient: Rameshwar Patil\nAdmission Reason: Fever\nStatus: Recovered',
        };
      case 'opd_slip':
        return {
          id: `demo-opd-${Date.now()}`,
          type,
          title: 'Previous OPD Slip',
          titleHindi: 'पिछली ओपीडी पर्ची',
          fileName: 'previous-opd-demo.pdf',
          status: 'scanned',
          timestamp,
          mockOcrText: 'DEMO OPD SLIP\nPatient: Rameshwar Patil\nDoctor: Dr. Sharma\nDiagnosis: Viral Infection',
        };
      case 'other':
      default:
        return {
          id: `demo-other-${Date.now()}`,
          type: 'other',
          title: 'Medical Document',
          titleHindi: 'चिकित्सा दस्तावेज़',
          fileName: 'medical-document-demo.pdf',
          status: 'scanned',
          timestamp,
          mockOcrText: 'DEMO DOCUMENT\nPatient: Rameshwar Patil\nDetails: Routine Checkup',
        };
    }
  }

  /**
   * Returns deterministic processing duration in milliseconds.
   */
  static getProcessingDuration(): number {
    return 1800; // 1.8 seconds for mock scanning
  }
}
