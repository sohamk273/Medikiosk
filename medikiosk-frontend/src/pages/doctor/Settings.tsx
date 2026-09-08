import { useState, useEffect, useCallback } from 'react';
import { useBlocker } from 'react-router-dom';
import {
  Settings2, Building2, Stethoscope, Activity, Monitor,
  FileText, Bell, Shield, Cpu, Save, RefreshCw,
  CheckCircle2, AlertCircle, AlertTriangle,
  Phone, User, Wifi, Clock
} from 'lucide-react';
import {
  MockHospitalSettingsProvider,
  type HospitalSettings,
} from '@/services/doctor/MockHospitalSettingsProvider';

// ─── Validation ───────────────────────────────────────────────────────────────

interface ProfileErrors {
  hospitalName?: string;
  registrationNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  contactNumber?: string;
  email?: string;
}

interface OpdErrors {
  startEndTime?: string;
  maxDailyPatients?: string;
  averageConsultationMinutes?: string;
}

interface OcrErrors {
  reviewRequiredBelowConfidence?: string;
}

// ─── Small reusable components ────────────────────────────────────────────────

function SectionCard({
  title,
  titleHi,
  icon: Icon,
  children,
}: {
  title: string;
  titleHi: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-slate-100 bg-slate-50/50">
        <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center">
          <Icon className="w-4 h-4 text-teal-600" />
        </div>
        <div>
          <h2 className="text-sm font-bold text-slate-800">{title}</h2>
          <p className="text-xs text-slate-500">{titleHi}</p>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function FieldLabel({ htmlFor, label, required }: { htmlFor: string; label: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
      {label}
      {required && <span className="text-red-400 ml-1" aria-label="required">*</span>}
    </label>
  );
}

function FieldInput({
  id,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  readOnly,
}: {
  id: string;
  value: string | number;
  onChange?: (v: string) => void;
  type?: string;
  placeholder?: string;
  error?: string;
  readOnly?: boolean;
}) {
  return (
    <>
      <input
        id={id}
        type={type}
        value={value}
        readOnly={readOnly}
        placeholder={placeholder}
        onChange={e => onChange?.(e.target.value)}
        className={`w-full px-3 py-2 text-sm border rounded-lg transition-colors focus:outline-none ${
          readOnly
            ? 'bg-slate-50 text-slate-600 border-slate-200 cursor-default'
            : error
            ? 'border-red-300 bg-red-50 focus:border-red-400 focus:ring-1 focus:ring-red-300'
            : 'border-slate-200 text-slate-800 bg-white focus:border-teal-500 focus:ring-1 focus:ring-teal-200'
        }`}
      />
      {error && (
        <p className="text-xs text-red-600 mt-1 flex items-center gap-1" role="alert">
          <AlertCircle className="w-3 h-3 shrink-0" />{error}
        </p>
      )}
    </>
  );
}

function Toggle({
  id,
  checked,
  onChange,
  label,
  description,
  disabled,
}: {
  id: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
      <label htmlFor={id} className="flex-1 cursor-pointer pr-4 select-none">
        <p className={`text-sm font-semibold ${disabled ? 'text-slate-400' : 'text-slate-700'}`}>{label}</p>
        {description && <p className="text-xs text-slate-400 mt-0.5">{description}</p>}
      </label>
      <button
        id={id}
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-5 w-10 shrink-0 items-center rounded-full border-2 border-transparent transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 ${
          disabled ? 'cursor-not-allowed opacity-50 bg-slate-200' :
          checked ? 'bg-teal-500 cursor-pointer' : 'bg-slate-200 cursor-pointer'
        }`}
      >
        <span
          className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
            checked ? 'translate-x-5' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}

const ALL_AYUSH_SYSTEMS = ['Ayurveda', 'Yoga', 'Naturopathy', 'Unani', 'Siddha', 'Homeopathy'];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Settings() {
  // Draft mirrors what's in the UI; savedSettings mirrors what's persisted.
  const [draft, setDraft] = useState<HospitalSettings>(() => MockHospitalSettingsProvider.getSettings());
  const [savedSettings, setSavedSettings] = useState<HospitalSettings>(() => MockHospitalSettingsProvider.getSettings());
  const [isDirty, setIsDirty] = useState(false);

  // UI feedback
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [cancelFeedback, setCancelFeedback] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Validation errors per section
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});
  const [opdErrors, setOpdErrors] = useState<OpdErrors>({});
  const [ocrErrors, setOcrErrors] = useState<OcrErrors>({});

  // ── Dirty tracking ──────────────────────────────────────────────────────

  useEffect(() => {
    setIsDirty(JSON.stringify(draft) !== JSON.stringify(savedSettings));
  }, [draft, savedSettings]);

  // ── Navigation blocker ──────────────────────────────────────────────────

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state === 'blocked') setShowLeaveModal(true);
  }, [blocker.state]);

  // ── Draft updater ───────────────────────────────────────────────────────

  const patch = useCallback(<K extends keyof HospitalSettings>(
    section: K,
    update: Partial<HospitalSettings[K]>
  ) => {
    setDraft(prev => ({
      ...prev,
      [section]: { ...(prev[section] as object), ...update },
    }));
  }, []);

  // ── Validation ──────────────────────────────────────────────────────────

  const validateAll = (): boolean => {
    let ok = true;

    // Hospital profile
    const pErr: ProfileErrors = {};
    if (!draft.hospitalProfile.hospitalName.trim()) { pErr.hospitalName = 'Hospital name is required.'; ok = false; }
    if (!draft.hospitalProfile.registrationNumber.trim()) { pErr.registrationNumber = 'Registration number is required.'; ok = false; }
    if (!draft.hospitalProfile.address.trim()) { pErr.address = 'Address is required.'; ok = false; }
    if (!draft.hospitalProfile.city.trim()) { pErr.city = 'City is required.'; ok = false; }
    if (!draft.hospitalProfile.state.trim()) { pErr.state = 'State is required.'; ok = false; }
    if (draft.hospitalProfile.pincode && !/^\d{6}$/.test(draft.hospitalProfile.pincode)) { pErr.pincode = 'Enter a valid 6-digit PIN.'; ok = false; }
    if (draft.hospitalProfile.contactNumber && !/^[\d\s\-+()]{7,15}$/.test(draft.hospitalProfile.contactNumber)) { pErr.contactNumber = 'Enter a valid contact number.'; ok = false; }
    if (draft.hospitalProfile.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.hospitalProfile.email)) { pErr.email = 'Enter a valid email address.'; ok = false; }
    setProfileErrors(pErr);

    // OPD
    const oErr: OpdErrors = {};
    const [sh, sm] = draft.opdConfiguration.startTime.split(':').map(Number);
    const [eh, em] = draft.opdConfiguration.endTime.split(':').map(Number);
    if (sh * 60 + sm >= eh * 60 + em) { oErr.startEndTime = 'Opening time must be before closing time.'; ok = false; }
    if (draft.opdConfiguration.maxDailyPatients < 1) { oErr.maxDailyPatients = 'Must be at least 1.'; ok = false; }
    if (draft.opdConfiguration.averageConsultationMinutes < 1) { oErr.averageConsultationMinutes = 'Must be at least 1 minute.'; ok = false; }
    setOpdErrors(oErr);

    // OCR
    const cErr: OcrErrors = {};
    if (draft.documentOcr.reviewRequiredBelowConfidence < 0 || draft.documentOcr.reviewRequiredBelowConfidence > 100) {
      cErr.reviewRequiredBelowConfidence = 'Must be between 0 and 100.'; ok = false;
    }
    setOcrErrors(cErr);

    return ok;
  };

  // ── Save / Cancel ───────────────────────────────────────────────────────

  const handleSave = () => {
    if (!validateAll()) return;
    MockHospitalSettingsProvider.updateSettings(draft);
    setSavedSettings(MockHospitalSettingsProvider.getSettings());
    setIsDirty(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleCancel = () => {
    setDraft(MockHospitalSettingsProvider.getSettings());
    setSavedSettings(MockHospitalSettingsProvider.getSettings());
    setIsDirty(false);
    setProfileErrors({});
    setOpdErrors({});
    setOcrErrors({});
    setCancelFeedback(true);
    setTimeout(() => setCancelFeedback(false), 2500);
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    MockHospitalSettingsProvider.refreshSystemStatus();
    const fresh = MockHospitalSettingsProvider.getSettings();
    setDraft(fresh);
    setSavedSettings(fresh);
    setIsDirty(false);
    setTimeout(() => setIsRefreshing(false), 800);
  };

  const handleLeaveConfirm = () => {
    setShowLeaveModal(false);
    if (blocker.state === 'blocked') blocker.proceed();
  };

  const handleLeaveCancel = () => {
    setShowLeaveModal(false);
    if (blocker.state === 'blocked') blocker.reset();
  };

  const todayStr = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50">

      {/* ─ Header ─────────────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-start justify-between shrink-0 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-teal-600" />
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Hospital Settings</h1>
            {isDirty && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                <AlertCircle className="w-3 h-3" />Unsaved changes
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            अस्पताल सेटिंग्स &nbsp;·&nbsp; Manage hospital, OPD, kiosk, document and system configuration.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {saveSuccess && (
            <div className="flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
              <CheckCircle2 className="w-4 h-4" /> Settings saved
            </div>
          )}
          {cancelFeedback && (
            <div className="flex items-center gap-2 text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg">
              <RefreshCw className="w-4 h-4" /> Changes discarded
            </div>
          )}
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-full">
            <Clock className="w-3 h-3" />{todayStr}
          </div>
          <div className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1.5 rounded-full">OPD Room 4</div>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-full border border-emerald-200">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />EMR Connected
          </div>
          <button
            onClick={handleRefresh}
            aria-label="Refresh settings"
            className={`w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-all ${isRefreshing ? 'animate-spin text-teal-600' : ''}`}
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ─ Body ───────────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-6 pb-28">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* ═══════ LEFT COLUMN ═══════ */}

          {/* 1. Hospital Profile */}
          <SectionCard title="Hospital Profile" titleHi="अस्पताल प्रोफ़ाइल" icon={Building2}>
            <div className="bg-amber-50 border border-amber-100 text-amber-700 px-3 py-2 rounded-lg text-xs font-medium mb-4 flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Synthetic demo configuration — not connected to a real hospital system.
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <FieldLabel htmlFor="hp-name" label="Hospital Name" required />
                  <FieldInput id="hp-name" value={draft.hospitalProfile.hospitalName}
                    onChange={v => patch('hospitalProfile', { hospitalName: v })}
                    error={profileErrors.hospitalName} />
                </div>
                <div>
                  <FieldLabel htmlFor="hp-reg" label="Registration No." required />
                  <FieldInput id="hp-reg" value={draft.hospitalProfile.registrationNumber}
                    onChange={v => patch('hospitalProfile', { registrationNumber: v })}
                    error={profileErrors.registrationNumber} />
                </div>
                <div>
                  <FieldLabel htmlFor="hp-contact" label="Contact Number" />
                  <FieldInput id="hp-contact" value={draft.hospitalProfile.contactNumber}
                    onChange={v => patch('hospitalProfile', { contactNumber: v })}
                    error={profileErrors.contactNumber} />
                </div>
                <div className="col-span-2">
                  <FieldLabel htmlFor="hp-address" label="Address" required />
                  <FieldInput id="hp-address" value={draft.hospitalProfile.address}
                    onChange={v => patch('hospitalProfile', { address: v })}
                    error={profileErrors.address} />
                </div>
                <div>
                  <FieldLabel htmlFor="hp-city" label="City" required />
                  <FieldInput id="hp-city" value={draft.hospitalProfile.city}
                    onChange={v => patch('hospitalProfile', { city: v })}
                    error={profileErrors.city} />
                </div>
                <div>
                  <FieldLabel htmlFor="hp-state" label="State" required />
                  <FieldInput id="hp-state" value={draft.hospitalProfile.state}
                    onChange={v => patch('hospitalProfile', { state: v })}
                    error={profileErrors.state} />
                </div>
                <div>
                  <FieldLabel htmlFor="hp-pin" label="PIN Code" />
                  <FieldInput id="hp-pin" value={draft.hospitalProfile.pincode}
                    onChange={v => patch('hospitalProfile', { pincode: v })}
                    error={profileErrors.pincode} />
                </div>
                <div>
                  <FieldLabel htmlFor="hp-email" label="Email" />
                  <FieldInput id="hp-email" type="email" value={draft.hospitalProfile.email}
                    onChange={v => patch('hospitalProfile', { email: v })}
                    error={profileErrors.email} />
                </div>
              </div>
            </div>
          </SectionCard>

          {/* 2. OPD Configuration */}
          <SectionCard title="OPD Configuration" titleHi="ओपीडी कॉन्फ़िगरेशन" icon={Stethoscope}>
            <div className="space-y-4">
              <Toggle id="opd-enabled" checked={draft.opdConfiguration.opdEnabled}
                onChange={v => patch('opdConfiguration', { opdEnabled: v })}
                label="OPD Enabled"
                description="Allow patient registration and consultations." />
              <Toggle id="opd-token" checked={draft.opdConfiguration.tokenSystemEnabled}
                onChange={v => patch('opdConfiguration', { tokenSystemEnabled: v })}
                label="Token System Enabled"
                description="Assign sequential tokens to incoming patients." />
              {opdErrors.startEndTime && (
                <p className="text-xs text-red-600 flex items-center gap-1" role="alert">
                  <AlertCircle className="w-3 h-3" />{opdErrors.startEndTime}
                </p>
              )}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <FieldLabel htmlFor="opd-start" label="Opening Time" />
                  <input id="opd-start" type="time" value={draft.opdConfiguration.startTime}
                    onChange={e => patch('opdConfiguration', { startTime: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200" />
                </div>
                <div>
                  <FieldLabel htmlFor="opd-end" label="Closing Time" />
                  <input id="opd-end" type="time" value={draft.opdConfiguration.endTime}
                    onChange={e => patch('opdConfiguration', { endTime: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200" />
                </div>
                <div>
                  <FieldLabel htmlFor="opd-max" label="Max Daily Patients" />
                  <input id="opd-max" type="number" min={1} max={500}
                    value={draft.opdConfiguration.maxDailyPatients}
                    onChange={e => patch('opdConfiguration', { maxDailyPatients: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200" />
                  {opdErrors.maxDailyPatients && <p className="text-xs text-red-600 mt-1" role="alert">{opdErrors.maxDailyPatients}</p>}
                </div>
                <div>
                  <FieldLabel htmlFor="opd-duration" label="Avg. Consultation (min)" />
                  <input id="opd-duration" type="number" min={1} max={120}
                    value={draft.opdConfiguration.averageConsultationMinutes}
                    onChange={e => patch('opdConfiguration', { averageConsultationMinutes: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-200" />
                  {opdErrors.averageConsultationMinutes && <p className="text-xs text-red-600 mt-1" role="alert">{opdErrors.averageConsultationMinutes}</p>}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* 3. Patient Kiosk */}
          <SectionCard title="Patient Kiosk" titleHi="पेशेंट कियोस्क" icon={Monitor}>
            {/* Status banner */}
            <div className={`flex items-center gap-3 rounded-xl px-4 py-3 mb-4 border ${draft.patientKiosk.kioskEnabled ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
              <div className={`w-2 h-2 rounded-full ${draft.patientKiosk.kioskEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
              <div>
                <p className={`text-sm font-black uppercase tracking-wider ${draft.patientKiosk.kioskEnabled ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {draft.patientKiosk.kioskEnabled ? 'KIOSK ONLINE' : 'KIOSK DISABLED'}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {draft.patientKiosk.kioskEnabled ? 'Patient intake services are available.' : 'Patient intake is currently unavailable.'}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-400 italic mb-3">These controls are configuration demonstrations only.</p>
            <div>
              <Toggle id="kiosk-enabled" checked={draft.patientKiosk.kioskEnabled}
                onChange={v => patch('patientKiosk', { kioskEnabled: v })}
                label="Kiosk Enabled" />
              <Toggle id="kiosk-voice" checked={draft.patientKiosk.voiceCaseTakingEnabled}
                onChange={v => patch('patientKiosk', { voiceCaseTakingEnabled: v })}
                label="Voice Case Taking"
                description="Record symptoms via voice input." />
              <Toggle id="kiosk-docs" checked={draft.patientKiosk.documentScanningEnabled}
                onChange={v => patch('patientKiosk', { documentScanningEnabled: v })}
                label="Document Scanning"
                description="Allow patients to upload medical documents." />
              <Toggle id="kiosk-bilingual" checked={draft.patientKiosk.bilingualModeEnabled}
                onChange={v => patch('patientKiosk', { bilingualModeEnabled: v })}
                label="Bilingual Mode (Hindi/English)"
                description="Display kiosk UI in both languages." />
              <Toggle id="kiosk-autosubmit" checked={draft.patientKiosk.autoSubmitEnabled}
                onChange={v => patch('patientKiosk', { autoSubmitEnabled: v })}
                label="Automatic Submission"
                description="Auto-submit after idle timeout." />
            </div>
          </SectionCard>

          {/* 4. Notifications */}
          <SectionCard title="Notifications" titleHi="सूचनाएँ" icon={Bell}>
            <div>
              <Toggle id="notif-appt" checked={draft.notifications.appointmentNotifications}
                onChange={v => patch('notifications', { appointmentNotifications: v })}
                label="Appointment Notifications"
                description="Alerts when patients are registered." />
              <Toggle id="notif-queue" checked={draft.notifications.queueNotifications}
                onChange={v => patch('notifications', { queueNotifications: v })}
                label="Queue Notifications"
                description="Alerts for queue updates and status changes." />
              <Toggle id="notif-safety" checked={draft.notifications.safetyAlertNotifications}
                onChange={v => patch('notifications', { safetyAlertNotifications: v })}
                label="Safety Alert Notifications"
                description="Critical patient safety flags. Keep enabled." />
              <Toggle id="notif-draft" checked={draft.notifications.draftReminderNotifications}
                onChange={v => patch('notifications', { draftReminderNotifications: v })}
                label="Draft Reminder Notifications"
                description="Reminders for incomplete consultations." />
              <Toggle id="notif-a11y" checked={draft.notifications.accessibilityAnnouncements}
                onChange={v => patch('notifications', { accessibilityAnnouncements: v })}
                label="Accessibility Announcements"
                description="Screen reader–friendly status announcements." />
            </div>
            {!draft.notifications.safetyAlertNotifications && (
              <div className="mt-3 bg-red-50 border border-red-100 text-red-700 px-3 py-2 rounded-lg text-xs flex items-start gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                Safety alerts are disabled. This may delay response to critical patient conditions.
              </div>
            )}
          </SectionCard>

          {/* ═══════ RIGHT COLUMN ═══════ */}

          {/* 5. Practitioner (read-only) */}
          <SectionCard title="Practitioner" titleHi="चिकित्सक" icon={User}>
            <div className="flex items-center gap-4 p-4 bg-teal-50 border border-teal-100 rounded-xl mb-4">
              <div className="w-14 h-14 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-black text-lg shrink-0 select-none">
                PS
              </div>
              <div>
                <p className="font-black text-slate-800 text-base">{draft.practitioner.name}</p>
                <p className="text-sm text-slate-600 font-medium">{draft.practitioner.role}</p>
                <p className="text-xs text-slate-500 mt-0.5">{draft.practitioner.room}</p>
              </div>
              <div className="ml-auto">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase border ${
                  draft.practitioner.status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${draft.practitioner.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  {draft.practitioner.status}
                </span>
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-100 text-blue-700 px-3 py-2 rounded-lg text-xs flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Practitioner identity is read-only synthetic demo data. This section does not affect authentication or real-world credentials.
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ['Name', draft.practitioner.name],
                ['Role', draft.practitioner.role],
                ['Room', draft.practitioner.room],
                ['Status', draft.practitioner.status.toUpperCase()],
              ].map(([lbl, val]) => (
                <div key={lbl} className="bg-slate-50 rounded-lg px-3 py-2.5 border border-slate-100">
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{lbl}</p>
                  <p className="text-sm font-bold text-slate-700 mt-0.5 truncate">{val}</p>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* 6. AYUSH */}
          <SectionCard title="AYUSH Configuration" titleHi="आयुष कॉन्फ़िगरेशन" icon={Activity}>
            <div className="mb-4">
              <Toggle id="ayush-enabled" checked={draft.ayush.moduleEnabled}
                onChange={v => patch('ayush', { moduleEnabled: v })}
                label="AYUSH Module Enabled"
                description="Enable AYUSH intake and practitioner assessment." />
              <Toggle id="ayush-assessment" checked={draft.ayush.assessmentEnabled}
                onChange={v => patch('ayush', { assessmentEnabled: v })}
                label="Practitioner Assessment Enabled" disabled={!draft.ayush.moduleEnabled}
                description="Include AYUSH practitioner review step in case workflow." />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Supported Systems</p>
              <div className="flex flex-wrap gap-2">
                {ALL_AYUSH_SYSTEMS.map(sys => {
                  const active = draft.ayush.supportedSystems.includes(sys);
                  return (
                    <button
                      key={sys}
                      disabled={!draft.ayush.moduleEnabled}
                      onClick={() => {
                        const next = active
                          ? draft.ayush.supportedSystems.filter(s => s !== sys)
                          : [...draft.ayush.supportedSystems, sys];
                        patch('ayush', { supportedSystems: next });
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                        !draft.ayush.moduleEnabled
                          ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200'
                          : active
                          ? 'bg-teal-500 text-white border-teal-500'
                          : 'bg-white text-slate-600 border-slate-200 hover:border-teal-300 cursor-pointer'
                      }`}
                    >
                      {sys}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="mt-4 bg-amber-50 border border-amber-100 text-amber-700 px-3 py-2 rounded-lg text-xs flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              These settings never modify existing AYUSH assessment records.
            </div>
          </SectionCard>

          {/* 7. Documents & OCR */}
          <SectionCard title="Documents & OCR" titleHi="दस्तावेज़ और OCR" icon={FileText}>
            <div className="mb-4">
              <Toggle id="ocr-enabled" checked={draft.documentOcr.ocrEnabled}
                onChange={v => patch('documentOcr', { ocrEnabled: v })}
                label="OCR Enabled"
                description="Enable optical character recognition on uploaded documents." />
              <Toggle id="ocr-auto" checked={draft.documentOcr.autoProcessingEnabled}
                onChange={v => patch('documentOcr', { autoProcessingEnabled: v })}
                label="Automatic OCR Processing" disabled={!draft.documentOcr.ocrEnabled}
                description="Start OCR automatically when a document is received." />
              <Toggle id="ocr-preview" checked={draft.documentOcr.documentPreviewEnabled}
                onChange={v => patch('documentOcr', { documentPreviewEnabled: v })}
                label="Document Preview Enabled"
                description="Allow practitioners to view synthetic document previews." />
            </div>
            <div>
              <label htmlFor="ocr-confidence" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Review Required Below Confidence (%)
              </label>
              <div className="flex items-center gap-3">
                <input
                  id="ocr-confidence"
                  type="range" min={0} max={100} step={5}
                  value={draft.documentOcr.reviewRequiredBelowConfidence}
                  onChange={e => patch('documentOcr', { reviewRequiredBelowConfidence: Number(e.target.value) })}
                  className="flex-1 accent-teal-500"
                  aria-label="Review required below confidence percentage"
                />
                <span className="w-14 text-center text-sm font-bold text-slate-700 bg-slate-100 rounded-lg py-1">
                  {draft.documentOcr.reviewRequiredBelowConfidence}%
                </span>
              </div>
              {ocrErrors.reviewRequiredBelowConfidence && (
                <p className="text-xs text-red-600 mt-1" role="alert">{ocrErrors.reviewRequiredBelowConfidence}</p>
              )}
              <p className="text-xs text-slate-400 mt-2">
                Documents below this confidence threshold require practitioner review.
              </p>
            </div>
            <div className="mt-3 bg-blue-50 border border-blue-100 text-blue-700 px-3 py-2 rounded-lg text-xs flex items-start gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              OCR settings do not modify existing DocumentRecord objects.
            </div>
          </SectionCard>

          {/* 8. Privacy & Security */}
          <SectionCard title="Privacy & Security" titleHi="गोपनीयता और सुरक्षा" icon={Shield}>
            {/* Masking preview */}
            <div className="bg-slate-800 text-white rounded-xl p-4 mb-4">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Privacy Preview</p>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <User className="w-3 h-3" />Patient
                  </span>
                  <span className="text-sm font-bold text-white">Soham Kumar</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3 h-3" />Mobile
                  </span>
                  <span className="text-sm font-black text-white font-mono tracking-wider">
                    {draft.privacySecurity.maskMobile ? '98••••9011' : '9876549011'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Shield className="w-3 h-3" />ABHA
                  </span>
                  <span className="text-sm font-black text-white font-mono tracking-wider">
                    {draft.privacySecurity.maskAbha ? 'XXXX XXXX 1049' : '1234 5678 1049'}
                  </span>
                </div>
              </div>
            </div>
            <div className="mb-4">
              <Toggle id="priv-mobile" checked={draft.privacySecurity.maskMobile}
                onChange={v => patch('privacySecurity', { maskMobile: v })}
                label="Mask Mobile Numbers"
                description="Show mobile as 98••••9011 in operational views." />
              <Toggle id="priv-abha" checked={draft.privacySecurity.maskAbha}
                onChange={v => patch('privacySecurity', { maskAbha: v })}
                label="Mask ABHA IDs"
                description="Show ABHA as XXXX XXXX 1049 in operational views." />
              <Toggle id="priv-warnings" checked={draft.privacySecurity.showPrivacyWarnings}
                onChange={v => patch('privacySecurity', { showPrivacyWarnings: v })}
                label="Show Privacy Warnings"
                description="Display data-sensitivity notices on patient screens." />
              <Toggle id="priv-lock" checked={draft.privacySecurity.autoLockEnabled}
                onChange={v => patch('privacySecurity', { autoLockEnabled: v })}
                label="Auto Lock"
                description="Lock EMR after period of inactivity." />
            </div>
            <div>
              <label htmlFor="priv-lock-min" className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                Auto Lock Duration
              </label>
              <select
                id="priv-lock-min"
                value={draft.privacySecurity.autoLockMinutes}
                disabled={!draft.privacySecurity.autoLockEnabled}
                onChange={e => patch('privacySecurity', { autoLockMinutes: Number(e.target.value) })}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-teal-500 disabled:bg-slate-50 disabled:text-slate-400"
              >
                <option value={5}>5 minutes</option>
                <option value={10}>10 minutes</option>
                <option value={15}>15 minutes</option>
                <option value={30}>30 minutes</option>
              </select>
            </div>
            <div className="mt-3 bg-yellow-50 border border-yellow-100 text-yellow-800 px-3 py-2 rounded-lg text-xs flex items-start gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              Changing these settings does not alter masking behaviour in existing Case Detail, Patient Record, or Consultation screens.
            </div>
          </SectionCard>

          {/* 9. System Status (full-width) */}
          <div className="lg:col-span-2">
            <SectionCard title="System Status" titleHi="सिस्टम स्थिति" icon={Cpu}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-xs text-slate-500">Last synchronized</p>
                  <p className="text-sm font-bold text-slate-700 mt-0.5">{new Date(draft.systemStatus.lastSync).toLocaleString()}</p>
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-teal-600' : ''}`} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh Status'}
                </button>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { label: 'EMR Connection',      key: 'emrConnection'      as const, display: 'CONNECTED',    icon: Wifi },
                  { label: 'OPD Queue',            key: 'opdQueue'           as const, display: 'OPERATIONAL', icon: Activity },
                  { label: 'Patient Kiosk',        key: 'patientKiosk'       as const, display: 'ONLINE',      icon: Monitor },
                  { label: 'Document Processing',  key: 'documentProcessing' as const, display: 'OPERATIONAL', icon: FileText },
                  { label: 'OCR Service',          key: 'ocrService'         as const, display: 'AVAILABLE',   icon: Cpu },
                  { label: 'Clinical Reports',     key: 'clinicalReports'    as const, display: 'AVAILABLE',   icon: CheckCircle2 },
                ].map(({ label, key: _k, display, icon: Icon }) => (
                  <div key={label} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-md bg-white border border-slate-200 flex items-center justify-center shrink-0">
                        <Icon className="w-3.5 h-3.5 text-slate-500" />
                      </div>
                      <p className="text-xs font-bold text-slate-700 truncate">{label}</p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold uppercase shrink-0 ml-2 ${
                      display === 'CONNECTED'   ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      display === 'OPERATIONAL' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      display === 'ONLINE'      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      display === 'AVAILABLE'   ? 'bg-teal-50 text-teal-700 border border-teal-200' :
                                                  'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        display === 'CONNECTED' || display === 'ONLINE' ? 'bg-emerald-500' :
                        display === 'OPERATIONAL' ? 'bg-blue-500 animate-pulse' :
                        display === 'AVAILABLE' ? 'bg-teal-500 animate-pulse' :
                        'bg-slate-400'
                      }`} />
                      {display}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-400 italic mt-3">
                Status indicators are deterministic prototype values and do not reflect real service health.
              </p>
            </SectionCard>
          </div>

        </div>{/* /grid */}
      </div>{/* /body */}

      {/* ─ Sticky Save/Cancel Bar ─────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-64 right-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between z-40 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.08)]">
        <div className="text-sm text-slate-500 font-medium">
          {isDirty
            ? <span className="flex items-center gap-1.5 text-amber-700 font-bold"><AlertCircle className="w-4 h-4" />You have unsaved changes</span>
            : <span className="flex items-center gap-1.5 text-slate-500"><CheckCircle2 className="w-4 h-4 text-emerald-500" />All changes saved</span>
          }
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCancel}
            disabled={!isDirty}
            className="px-5 py-2 text-sm font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isDirty}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg transition-colors shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      {/* ─ Unsaved Changes Leave Modal ─────────────────────────────────────── */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label="Unsaved changes warning">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl p-6">
            <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-black text-slate-800 text-center mb-1">UNSAVED CHANGES</h3>
            <p className="text-sm text-slate-600 text-center mb-6">
              You have unsaved settings changes. If you leave, your changes will be lost.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleLeaveCancel}
                autoFocus
                className="flex-1 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Stay
              </button>
              <button
                onClick={handleLeaveConfirm}
                className="flex-1 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
              >
                Discard &amp; Leave
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
