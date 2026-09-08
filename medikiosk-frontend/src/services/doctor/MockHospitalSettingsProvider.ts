// MockHospitalSettingsProvider.ts
// Slice 18 — Hospital Settings & Administration
// Module-level in-memory settings store.
// CRITICAL: This layer NEVER mutates PatientSessionContext, DoctorCase,
// AYUSH records, DocumentRecord, OCR records, or ClinicalReport records.

// ─── Interfaces ────────────────────────────────────────────────────────────────

export interface HospitalProfileSettings {
  hospitalName: string;
  registrationNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  contactNumber: string;
  email: string;
}

export interface OpdConfigurationSettings {
  opdEnabled: boolean;
  startTime: string;
  endTime: string;
  tokenSystemEnabled: boolean;
  maxDailyPatients: number;
  averageConsultationMinutes: number;
}

export interface PractitionerSettings {
  name: string;
  role: string;
  room: string;
  status: 'active' | 'inactive';
}

export interface AyushSettings {
  moduleEnabled: boolean;
  assessmentEnabled: boolean;
  supportedSystems: string[];
}

export interface PatientKioskSettings {
  kioskEnabled: boolean;
  voiceCaseTakingEnabled: boolean;
  documentScanningEnabled: boolean;
  bilingualModeEnabled: boolean;
  autoSubmitEnabled: boolean;
}

export interface DocumentOcrSettings {
  ocrEnabled: boolean;
  autoProcessingEnabled: boolean;
  documentPreviewEnabled: boolean;
  reviewRequiredBelowConfidence: number; // 0–100
}

export interface NotificationSettings {
  appointmentNotifications: boolean;
  queueNotifications: boolean;
  safetyAlertNotifications: boolean;
  draftReminderNotifications: boolean;
  accessibilityAnnouncements: boolean;
}

export interface PrivacySecuritySettings {
  maskMobile: boolean;
  maskAbha: boolean;
  showPrivacyWarnings: boolean;
  autoLockEnabled: boolean;
  autoLockMinutes: number;
}

export interface SystemStatusSettings {
  emrConnection: 'connected' | 'operational' | 'online' | 'available' | 'degraded' | 'offline';
  opdQueue: 'connected' | 'operational' | 'online' | 'available' | 'degraded' | 'offline';
  patientKiosk: 'connected' | 'operational' | 'online' | 'available' | 'degraded' | 'offline';
  documentProcessing: 'connected' | 'operational' | 'online' | 'available' | 'degraded' | 'offline';
  ocrService: 'connected' | 'operational' | 'online' | 'available' | 'degraded' | 'offline';
  clinicalReports: 'connected' | 'operational' | 'online' | 'available' | 'degraded' | 'offline';
  lastSync: string;
}

export interface HospitalSettings {
  hospitalProfile: HospitalProfileSettings;
  opdConfiguration: OpdConfigurationSettings;
  practitioner: PractitionerSettings;
  ayush: AyushSettings;
  patientKiosk: PatientKioskSettings;
  documentOcr: DocumentOcrSettings;
  notifications: NotificationSettings;
  privacySecurity: PrivacySecuritySettings;
  systemStatus: SystemStatusSettings;
}

// ─── Defaults ──────────────────────────────────────────────────────────────────

const DEFAULT_SETTINGS: HospitalSettings = {
  hospitalProfile: {
    hospitalName: 'MediKiosk Integrative Care Centre',
    registrationNumber: 'MH-OPD-2026-0042',
    address: 'Andheri East',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '400069',
    contactNumber: '022-26830000',
    email: 'opd@medikiosk.gov.in',
  },
  opdConfiguration: {
    opdEnabled: true,
    startTime: '09:00',
    endTime: '17:00',
    tokenSystemEnabled: true,
    maxDailyPatients: 100,
    averageConsultationMinutes: 15,
  },
  practitioner: {
    name: 'Dr. Priya Sharma',
    role: 'AYUSH Practitioner',
    room: 'OPD Room 4',
    status: 'active',
  },
  ayush: {
    moduleEnabled: true,
    assessmentEnabled: true,
    supportedSystems: ['Ayurveda', 'Yoga', 'Naturopathy', 'Unani'],
  },
  patientKiosk: {
    kioskEnabled: true,
    voiceCaseTakingEnabled: true,
    documentScanningEnabled: true,
    bilingualModeEnabled: true,
    autoSubmitEnabled: false,
  },
  documentOcr: {
    ocrEnabled: true,
    autoProcessingEnabled: true,
    documentPreviewEnabled: true,
    reviewRequiredBelowConfidence: 80,
  },
  notifications: {
    appointmentNotifications: true,
    queueNotifications: true,
    safetyAlertNotifications: true,
    draftReminderNotifications: true,
    accessibilityAnnouncements: false,
  },
  privacySecurity: {
    maskMobile: true,
    maskAbha: true,
    showPrivacyWarnings: true,
    autoLockEnabled: true,
    autoLockMinutes: 15,
  },
  systemStatus: {
    emrConnection: 'connected',
    opdQueue: 'operational',
    patientKiosk: 'online',
    documentProcessing: 'operational',
    ocrService: 'available',
    clinicalReports: 'available',
    lastSync: new Date().toISOString(),
  },
};

// ─── Module-level state (session-persistent, never externally mutated) ─────────

let _settings: HospitalSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));

// ─── Provider ─────────────────────────────────────────────────────────────────

export class MockHospitalSettingsProvider {
  /** Returns a deep-copy of current settings to prevent accidental mutation. */
  static getSettings(): HospitalSettings {
    return JSON.parse(JSON.stringify(_settings));
  }

  /** Returns a deep-copy of factory defaults. */
  static getDefaultSettings(): HospitalSettings {
    return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  }

  /** Saves a complete settings snapshot. Receives already-validated data. */
  static updateSettings(settings: HospitalSettings): void {
    _settings = JSON.parse(JSON.stringify(settings));
  }

  /** Resets all settings to factory defaults. */
  static resetSettings(): void {
    _settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  }

  /** Refreshes the lastSync timestamp only (for the System Status panel). */
  static refreshSystemStatus(): void {
    _settings = {
      ..._settings,
      systemStatus: { ..._settings.systemStatus, lastSync: new Date().toISOString() },
    };
  }
}
