import { MockDoctorCaseProvider, type DoctorCase } from './MockDoctorCaseProvider';
import type { PatientDocument } from '@/features/patient/PatientSessionContext';

export interface DocumentRecord {
  id: string;
  patientId: string;
  caseId: string;
  patientName: string;
  fileName: string;
  documentType: string;
  maskedMobile: string;
  maskedAbhaId: string;
  uploadedAt: string;
  fileSize: string;
  status: 'uploaded' | 'processing' | 'processed' | 'review-required' | 'reviewed' | 'archived';
  ocrStatus: 'not-started' | 'processing' | 'completed' | 'failed' | 'reviewed';
  ocrConfidence?: number;
  extractedData?: Record<string, string>;
  reviewedAt?: string;
  archivedAt?: string;
  mockOcrText?: string;
}

let MOCK_DOCS: Record<string, DocumentRecord> = {};

export class MockDocumentProvider {
  /**
   * Generates a stable patient ID.
   */
  private static derivePatientId(c: DoctorCase): string {
    if (c.abhaId) return `PAT-ABHA-${c.abhaId.replace(/[^a-zA-Z0-9]/g, '')}`;
    if (c.mobile) return `PAT-MOB-${c.mobile}-${c.patientName.substring(0, 3).toUpperCase()}`;
    return `PAT-GEN-${c.patientName}-${c.age}`.replace(/\s+/g, '-').toUpperCase();
  }

  private static maskMobile(m?: string): string {
    return m && m.length >= 10 ? `${m.slice(0, 2)}••••${m.slice(-4)}` : 'N/A';
  }

  private static maskAbha(a?: string): string {
    if (!a) return 'N/A';
    const clean = a.replace(/[^a-zA-Z0-9]/g, '');
    return clean.length === 14 ? `XXXX XXXX ${clean.slice(-4)}` : a;
  }

  /**
   * Synthesize dummy OCR data based on document type
   */
  private static generateMockExtraction(type: string, patientName: string): Record<string, string> {
    const t = type.toLowerCase();
    if (t.includes('lab') || t.includes('diagnostic')) {
      return {
        'Patient Name': patientName,
        'Test Name': 'Complete Blood Count (CBC)',
        'Report Date': new Date().toLocaleDateString(),
        'Hemoglobin': '12.8 g/dL',
        'Reference Range': '13-17 g/dL',
        'Laboratory': 'City Diagnostics'
      };
    }
    if (t.includes('prescription')) {
      return {
        'Patient Name': patientName,
        'Medicine': 'Paracetamol 500mg',
        'Dosage': '1 tablet',
        'Frequency': 'Twice a day',
        'Duration': '5 days',
        'Instructions': 'After meals'
      };
    }
    return {
      'Patient Name': patientName,
      'Document Date': new Date().toLocaleDateString(),
      'Summary': 'Standard review completed.',
      'Institution': 'MediKiosk Default Health Center'
    };
  }

  /**
   * Syncs documents from the main MockDoctorCaseProvider into the standalone DocumentProvider state.
   */
  private static syncCasesToDocs() {
    const cases = MockDoctorCaseProvider.getCases();
    
    cases.forEach(c => {
      if (!c.documents) return;
      
      c.documents.forEach((doc: PatientDocument) => {
        const docId = `DOC-${c.caseId}-${doc.id}`;
        
        if (!MOCK_DOCS[docId]) {
          const confidence = Math.floor(Math.random() * (99 - 70 + 1) + 70); // 70 to 99
          MOCK_DOCS[docId] = {
            id: docId,
            patientId: this.derivePatientId(c),
            caseId: c.caseId,
            patientName: c.patientName,
            fileName: doc.fileName || `${doc.title}.pdf`,
            documentType: doc.type || 'Other',
            maskedMobile: this.maskMobile(c.mobile),
            maskedAbhaId: this.maskAbha(c.abhaId),
            uploadedAt: doc.timestamp || new Date().toISOString(),
            fileSize: `${Math.floor(Math.random() * 500) + 100} KB`,
            status: 'uploaded',
            ocrStatus: 'not-started',
            ocrConfidence: confidence,
            extractedData: this.generateMockExtraction(doc.type || 'Other', c.patientName),
            mockOcrText: doc.mockOcrText
          };
        }
      });
    });
  }

  static getDocuments(): DocumentRecord[] {
    this.syncCasesToDocs();
    return Object.values(MOCK_DOCS)
      .filter(d => d.status !== 'archived')
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  static getArchivedDocuments(): DocumentRecord[] {
    this.syncCasesToDocs();
    return Object.values(MOCK_DOCS)
      .filter(d => d.status === 'archived')
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }

  static getDocumentById(id: string): DocumentRecord | undefined {
    this.syncCasesToDocs();
    return MOCK_DOCS[id];
  }

  static searchDocuments(query: string, includeArchived = false): DocumentRecord[] {
    let docs = includeArchived ? Object.values(MOCK_DOCS) : this.getDocuments();
    if (!query || query.trim() === '') return docs;
    
    const q = query.toLowerCase().trim();
    return docs.filter(d => 
      d.patientName.toLowerCase().includes(q) ||
      d.id.toLowerCase().includes(q) ||
      d.caseId.toLowerCase().includes(q) ||
      d.documentType.toLowerCase().includes(q)
    );
  }

  static startOcr(documentId: string): Promise<void> {
    return new Promise((resolve) => {
      if (MOCK_DOCS[documentId]) {
        MOCK_DOCS[documentId].ocrStatus = 'processing';
        MOCK_DOCS[documentId].status = 'processing';
      }
      setTimeout(() => {
        if (MOCK_DOCS[documentId]) {
          MOCK_DOCS[documentId].ocrStatus = 'completed';
          const conf = MOCK_DOCS[documentId].ocrConfidence || 85;
          if (conf < 80) {
            MOCK_DOCS[documentId].status = 'review-required';
          } else {
            MOCK_DOCS[documentId].status = 'processed';
          }
        }
        resolve();
      }, 1500);
    });
  }

  static saveOcrReview(documentId: string, extractedData: Record<string, string>): void {
    if (MOCK_DOCS[documentId]) {
      MOCK_DOCS[documentId].extractedData = extractedData;
      MOCK_DOCS[documentId].ocrStatus = 'reviewed';
      MOCK_DOCS[documentId].status = 'reviewed';
      MOCK_DOCS[documentId].reviewedAt = new Date().toISOString();
    }
  }

  static uploadMockDocument(patientId: string, caseId: string, patientName: string, documentType: string, file: File | null): void {
    const docId = `DOC-UP-${Date.now()}`;
    const targetCase = MockDoctorCaseProvider.getCaseById(caseId);
    
    MOCK_DOCS[docId] = {
      id: docId,
      patientId: patientId,
      caseId: caseId,
      patientName: patientName,
      fileName: file ? file.name : `Synthetic_${documentType.replace(/\s+/g, '_')}.pdf`,
      documentType: documentType,
      maskedMobile: targetCase ? this.maskMobile(targetCase.mobile) : 'N/A',
      maskedAbhaId: targetCase ? this.maskAbha(targetCase.abhaId) : 'N/A',
      uploadedAt: new Date().toISOString(),
      fileSize: file ? `${(file.size / 1024).toFixed(1)} KB` : `${Math.floor(Math.random() * 500) + 100} KB`,
      status: 'uploaded',
      ocrStatus: 'not-started',
      ocrConfidence: Math.floor(Math.random() * (99 - 70 + 1) + 70),
      extractedData: this.generateMockExtraction(documentType, patientName),
      mockOcrText: 'Synthetic OCR representation of ' + documentType
    };
  }

  static archiveDocument(documentId: string): void {
    if (MOCK_DOCS[documentId]) {
      MOCK_DOCS[documentId].status = 'archived';
      MOCK_DOCS[documentId].archivedAt = new Date().toISOString();
    }
  }

  static getDocumentsByCase(caseId: string): DocumentRecord[] {
    this.syncCasesToDocs();
    return Object.values(MOCK_DOCS).filter(d => d.caseId === caseId && d.status !== 'archived');
  }

  static getDocumentsByPatient(patientId: string): DocumentRecord[] {
    this.syncCasesToDocs();
    return Object.values(MOCK_DOCS).filter(d => d.patientId === patientId && d.status !== 'archived');
  }
}
