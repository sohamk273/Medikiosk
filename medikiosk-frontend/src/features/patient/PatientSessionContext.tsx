import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export type Language = 'en' | 'hi' | 'mr';
export type IdentityMethod = 'abha' | 'opd' | 'new' | null;
export type VoiceInputMethod = 'voice' | 'touch';

export interface PatientProfile {
  id?: string;
  name: string;
  age: string;
  gender: 'Male' | 'Female' | 'Other';
  mobile: string;
  district?: string;
  state?: string;
}

export interface ConsentState {
  accepted: boolean;
  timestamp?: string;
}

export interface ChiefComplaintState {
  primaryComplaint: string;
}

// ─── Slice 4: Voice Intake ──────────────────────────────────────────────────

export interface VoiceResponse {
  questionId: string;
  question: string;
  questionHindi: string;
  inputMethod: VoiceInputMethod;
  transcript?: string;       // set when inputMethod === 'voice'
  selectedOption?: string;   // set when inputMethod === 'touch'
  confirmed: boolean;
  timestamp: string;
  isRedFlag: boolean;
}

export interface VoiceIntakeState {
  currentQuestionIndex: number;
  responses: VoiceResponse[];
  activeInputMethod?: VoiceInputMethod;
  activeTranscript?: string;
  activeSelectedOption?: string;
  pendingConfirmation: boolean;
  activeIsRedFlag: boolean;
  completed: boolean;
  redFlagTriggered: boolean;
  staffNotified: boolean;
}

const defaultVoiceIntake: VoiceIntakeState = {
  currentQuestionIndex: 0,
  responses: [],
  activeInputMethod: undefined,
  activeTranscript: undefined,
  activeSelectedOption: undefined,
  pendingConfirmation: false,
  activeIsRedFlag: false,
  completed: false,
  redFlagTriggered: false,
  staffNotified: false,
};

// ─── Slice 5: AYUSH, Medication, Allergy ─────────────────────────────────────

export interface AyushResponse {
  questionId: string;
  question: string;
  questionHindi: string;
  answer: string;
  answerHindi?: string;
  ayushField: string;
  timestamp: string;
}

export interface AyushIntakeState {
  currentQuestionIndex: number;
  responses: AyushResponse[];
  completed: boolean;
}

export interface MedicationHistory {
  takingMedicines: 'yes_daily' | 'yes_sometimes' | 'no' | 'not_sure' | null;
  medicines?: string;
  timestamp?: string;
}

export interface AllergyHistory {
  hasAllergy: 'yes' | 'no' | 'not_sure' | null;
  allergyType?: string;
  reaction?: string;
  breathingDifficulty?: boolean;
  timestamp?: string;
}

const defaultAyushIntake: AyushIntakeState = {
  currentQuestionIndex: 0,
  responses: [],
  completed: false,
};

const defaultMedicationHistory: MedicationHistory = {
  takingMedicines: null,
};

const defaultAllergyHistory: AllergyHistory = {
  hasAllergy: null,
};

// ─── Slice 6: Documents ──────────────────────────────────────────────────────

export type DocumentType =
  | 'prescription'
  | 'lab_report'
  | 'discharge_summary'
  | 'opd_slip'
  | 'other';

export interface PatientDocument {
  id: string;
  type: DocumentType;
  title: string;
  titleHindi: string;
  fileName?: string;
  status: 'scanned' | 'reviewed';
  timestamp: string;
  mockOcrText?: string;
}

export interface DocumentIntakeState {
  documents: PatientDocument[];
  currentDocumentType: DocumentType | null;
  completed: boolean;
}

const defaultDocumentIntake: DocumentIntakeState = {
  documents: [],
  currentDocumentType: null,
  completed: false,
};

// ─── Slice 7: Review ────────────────────────────────────────────────────────

export interface ReviewState {
  confirmed: boolean;
  confirmedAt?: string;
}

const defaultReviewState: ReviewState = {
  confirmed: false,
};

// ─── Full Session State ─────────────────────────────────────────────────────

export interface PatientSessionState {
  language: Language;
  identificationMethod: IdentityMethod;
  abhaId: string;
  patient: PatientProfile | null;
  audioEnabled: boolean;
  consent: ConsentState;
  chiefComplaint: ChiefComplaintState;
  voiceIntake: VoiceIntakeState;
  ayushIntake: AyushIntakeState;
  medicationHistory: MedicationHistory;
  allergyHistory: AllergyHistory;
  documentIntake: DocumentIntakeState;
  review: ReviewState;
}

export interface PatientSessionContextType extends PatientSessionState {
  // Slice 1-3 setters
  setLanguage: (lang: Language) => void;
  setIdentificationMethod: (method: IdentityMethod) => void;
  setAbhaId: (id: string) => void;
  setPatient: (patient: PatientProfile | null) => void;
  updatePatientField: (field: keyof PatientProfile, value: string) => void;
  setAudioEnabled: (enabled: boolean) => void;
  setConsent: (consent: ConsentState) => void;
  setChiefComplaint: (complaint: ChiefComplaintState) => void;
  clearSession: () => void;

  // Slice 4: Voice Intake setters
  setActiveVoiceInput: (method: VoiceInputMethod) => void;
  setActiveTranscript: (transcript: string, isRedFlag: boolean) => void;
  setActiveSelectedOption: (option: string, isRedFlag: boolean) => void;
  setPendingConfirmation: (pending: boolean) => void;
  addVoiceResponse: (response: VoiceResponse) => void;
  advanceVoiceQuestion: () => void;
  resetActiveVoiceResponse: () => void;
  setRedFlagTriggered: (triggered: boolean) => void;
  setStaffNotified: (notified: boolean) => void;
  setVoiceIntakeCompleted: (completed: boolean) => void;

  // Slice 5: AYUSH setters
  setAyushIntake: (state: AyushIntakeState) => void;
  addAyushResponse: (response: AyushResponse) => void;
  advanceAyushQuestion: (index: number) => void;
  setMedicationHistory: (history: MedicationHistory) => void;
  setAllergyHistory: (history: AllergyHistory) => void;

  // Slice 6: Document setters
  addDocument: (doc: PatientDocument) => void;
  removeDocument: (id: string) => void;
  updateDocument: (id: string, updates: Partial<PatientDocument>) => void;
  setCurrentDocumentType: (type: DocumentType | null) => void;
  setDocumentIntake: (state: DocumentIntakeState) => void;
  completeDocumentIntake: (completed: boolean) => void;

  // Slice 7: Review setters
  setReviewConfirmed: (confirmed: boolean) => void;
}

const defaultState: PatientSessionState = {
  language: 'en',
  identificationMethod: null,
  abhaId: '',
  patient: null,
  audioEnabled: true,
  consent: { accepted: false },
  chiefComplaint: { primaryComplaint: '' },
  voiceIntake: defaultVoiceIntake,
  ayushIntake: defaultAyushIntake,
  medicationHistory: defaultMedicationHistory,
  allergyHistory: defaultAllergyHistory,
  documentIntake: defaultDocumentIntake,
  review: defaultReviewState,
};

const PatientSessionContext = createContext<PatientSessionContextType | undefined>(undefined);

export function PatientSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PatientSessionState>(defaultState);

  // ─── Slice 1-3 setters ──────────────────────────────────────────────────
  const setLanguage = (language: Language) =>
    setState(s => ({ ...s, language }));

  const setIdentificationMethod = (identificationMethod: IdentityMethod) =>
    setState(s => ({ ...s, identificationMethod }));

  const setAbhaId = (abhaId: string) =>
    setState(s => ({ ...s, abhaId }));

  const setPatient = (patient: PatientProfile | null) =>
    setState(s => ({ ...s, patient }));

  const updatePatientField = (field: keyof PatientProfile, value: string) =>
    setState(s => ({
      ...s,
      patient: s.patient
        ? { ...s.patient, [field]: value }
        : { id: '', name: '', age: '', gender: 'Male', mobile: '', [field]: value },
    }));

  const setAudioEnabled = (audioEnabled: boolean) =>
    setState(s => ({ ...s, audioEnabled }));

  const setConsent = (consent: ConsentState) =>
    setState(s => ({ ...s, consent }));

  const setChiefComplaint = (chiefComplaint: ChiefComplaintState) =>
    setState(s => ({ ...s, chiefComplaint }));

  const clearSession = () => setState(defaultState);

  // ─── Slice 4: Voice Intake setters ──────────────────────────────────────

  const setActiveVoiceInput = (method: VoiceInputMethod) =>
    setState(s => ({
      ...s,
      voiceIntake: { ...s.voiceIntake, activeInputMethod: method },
    }));

  const setActiveTranscript = (transcript: string, isRedFlag: boolean) =>
    setState(s => ({
      ...s,
      voiceIntake: {
        ...s.voiceIntake,
        activeTranscript: transcript,
        activeIsRedFlag: isRedFlag,
        pendingConfirmation: true,
      },
    }));

  const setActiveSelectedOption = (option: string, isRedFlag: boolean) =>
    setState(s => ({
      ...s,
      voiceIntake: {
        ...s.voiceIntake,
        activeSelectedOption: option,
        activeIsRedFlag: isRedFlag,
        pendingConfirmation: true,
      },
    }));

  const setPendingConfirmation = (pending: boolean) =>
    setState(s => ({
      ...s,
      voiceIntake: { ...s.voiceIntake, pendingConfirmation: pending },
    }));

  const addVoiceResponse = (response: VoiceResponse) =>
    setState(s => ({
      ...s,
      voiceIntake: {
        ...s.voiceIntake,
        responses: [
          // Replace any existing unconfirmed response for this question
          ...s.voiceIntake.responses.filter(r => r.questionId !== response.questionId),
          response,
        ],
        redFlagTriggered: s.voiceIntake.redFlagTriggered || response.isRedFlag,
      },
    }));

  const advanceVoiceQuestion = () =>
    setState(s => ({
      ...s,
      voiceIntake: {
        ...s.voiceIntake,
        currentQuestionIndex: s.voiceIntake.currentQuestionIndex + 1,
        activeInputMethod: undefined,
        activeTranscript: undefined,
        activeSelectedOption: undefined,
        pendingConfirmation: false,
        activeIsRedFlag: false,
      },
    }));

  const resetActiveVoiceResponse = () =>
    setState(s => ({
      ...s,
      voiceIntake: {
        ...s.voiceIntake,
        activeInputMethod: undefined,
        activeTranscript: undefined,
        activeSelectedOption: undefined,
        pendingConfirmation: false,
        activeIsRedFlag: false,
      },
    }));

  const setRedFlagTriggered = (triggered: boolean) =>
    setState(s => ({
      ...s,
      voiceIntake: { ...s.voiceIntake, redFlagTriggered: triggered },
    }));

  const setStaffNotified = (notified: boolean) =>
    setState(s => ({
      ...s,
      voiceIntake: { ...s.voiceIntake, staffNotified: notified },
    }));

  const setVoiceIntakeCompleted = (completed: boolean) =>
    setState(s => ({
      ...s,
      voiceIntake: { ...s.voiceIntake, completed },
    }));

  // ─── Slice 5: AYUSH setters ───────────────────────────────────────────────

  const setAyushIntake = (ayushIntake: AyushIntakeState) =>
    setState(s => ({ ...s, ayushIntake }));

  const addAyushResponse = (response: AyushResponse) =>
    setState(s => {
      // Avoid duplicates for the same question
      const existing = s.ayushIntake.responses.filter(r => r.questionId !== response.questionId);
      return {
        ...s,
        ayushIntake: {
          ...s.ayushIntake,
          responses: [...existing, response],
        },
      };
    });

  const advanceAyushQuestion = (index: number) =>
    setState(s => ({
      ...s,
      ayushIntake: { ...s.ayushIntake, currentQuestionIndex: index },
    }));

  const setMedicationHistory = (medicationHistory: MedicationHistory) =>
    setState(s => ({ ...s, medicationHistory }));

  const setAllergyHistory = (allergyHistory: AllergyHistory) =>
    setState(s => ({ ...s, allergyHistory }));

  // ─── Slice 6: Document setters ───────────────────────────────────────────

  const addDocument = (doc: PatientDocument) =>
    setState(s => ({
      ...s,
      documentIntake: {
        ...s.documentIntake,
        documents: [...s.documentIntake.documents, doc],
      }
    }));

  const removeDocument = (id: string) =>
    setState(s => ({
      ...s,
      documentIntake: {
        ...s.documentIntake,
        documents: s.documentIntake.documents.filter(d => d.id !== id),
      }
    }));

  const updateDocument = (id: string, updates: Partial<PatientDocument>) =>
    setState(s => ({
      ...s,
      documentIntake: {
        ...s.documentIntake,
        documents: s.documentIntake.documents.map(d => 
          d.id === id ? { ...d, ...updates } : d
        ),
      }
    }));

  const setCurrentDocumentType = (type: DocumentType | null) =>
    setState(s => ({
      ...s,
      documentIntake: { ...s.documentIntake, currentDocumentType: type },
    }));

  const setDocumentIntake = (documentIntake: DocumentIntakeState) =>
    setState(s => ({ ...s, documentIntake }));

  const completeDocumentIntake = (completed: boolean) =>
    setState(s => ({
      ...s,
      documentIntake: { ...s.documentIntake, completed },
    }));

  // ─── Slice 7: Review setters ─────────────────────────────────────────────

  const setReviewConfirmed = (confirmed: boolean) =>
    setState(s => ({
      ...s,
      review: {
        confirmed,
        confirmedAt: confirmed ? new Date().toISOString() : undefined,
      }
    }));

  return (
    <PatientSessionContext.Provider value={{
      ...state,
      setLanguage,
      setIdentificationMethod,
      setAbhaId,
      setPatient,
      updatePatientField,
      setAudioEnabled,
      setConsent,
      setChiefComplaint,
      clearSession,
      setActiveVoiceInput,
      setActiveTranscript,
      setActiveSelectedOption,
      setPendingConfirmation,
      addVoiceResponse,
      advanceVoiceQuestion,
      resetActiveVoiceResponse,
      setRedFlagTriggered,
      setStaffNotified,
      setVoiceIntakeCompleted,
      setAyushIntake,
      addAyushResponse,
      advanceAyushQuestion,
      setMedicationHistory,
      setAllergyHistory,
      addDocument,
      removeDocument,
      updateDocument,
      setCurrentDocumentType,
      setDocumentIntake,
      completeDocumentIntake,
      setReviewConfirmed,
    }}>
      {children}
    </PatientSessionContext.Provider>
  );
}

export function usePatientSession() {
  const context = useContext(PatientSessionContext);
  if (context === undefined) {
    throw new Error('usePatientSession must be used within a PatientSessionProvider');
  }
  return context;
}
