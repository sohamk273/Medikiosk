import type { Language } from '@/features/patient/PatientSessionContext';

/**
 * MockVoiceProvider
 *
 * Isolates all mock voice behavior from UI components.
 * Designed to be replaced by a real provider (Bhashini STT, etc.) in a future slice
 * without rewriting the patient UI.
 *
 * Architecture:
 *   Patient UI → VoiceProvider interface → MockVoiceProvider (now)
 *   Patient UI → VoiceProvider interface → Bhashini/approved provider (later)
 *
 * IMPORTANT:
 * - No microphone access
 * - No real STT/TTS
 * - No LLM calls
 * - All outputs are deterministic per (language, questionId)
 */

export interface VoiceMockResult {
  transcript: string;
  isRedFlag: boolean;
}

// ─── Mock Transcripts ────────────────────────────────────────────────────────
// Keyed by questionId. One natural-language response per language per question.
// These are clinically plausible but contain NO diagnosis or treatment.

type TranscriptMap = Record<string, Record<Language, string>>;

const MOCK_TRANSCRIPTS: TranscriptMap = {
  q1_location: {
    hi: 'मुझे मुख्य रूप से पेट के ऊपरी हिस्से में और छाती के नीचे जलन और भारीपन महसूस होता है।',
    en: 'I feel the pain mainly in my upper abdomen, just below my chest. It feels like burning and heaviness.',
    mr: 'मला मुख्यतः पोटाच्या वरच्या भागात आणि छातीच्या खाली जळजळ व जडपणा जाणवतो.',
  },
  q2_onset: {
    hi: 'यह समस्या लगभग पाँच दिन पहले से शुरू हुई है। पहले हल्का था, लेकिन अब ज़्यादा हो गया है।',
    en: 'This problem started about five days ago. It was mild at first but has gotten worse.',
    mr: 'ही समस्या साधारण पाच दिवसांपूर्वी सुरू झाली. आधी सौम्य होती, आता जास्त झाली आहे.',
  },
  q3_severity: {
    hi: 'दर्द काफी तेज है, खाना खाने के बाद और बढ़ जाता है। रात को भी नींद खराब होती है।',
    en: 'The pain is quite severe, especially after eating. It also disturbs my sleep at night.',
    mr: 'वेदना बरीच तीव्र आहे, जेवणानंतर आणखी वाढते. रात्री झोपही नीट होत नाही.',
  },
  q4_history: {
    hi: 'पहले एक बार ऐसी समस्या हुई थी, करीब दो साल पहले। तब डॉक्टर ने कुछ दवा दी थी।',
    en: 'I had a similar problem about two years ago. The doctor gave me some medicine at that time.',
    mr: 'साधारण दोन वर्षांपूर्वी असाच त्रास झाला होता. तेव्हा डॉक्टरांनी काही औषध दिले होते.',
  },
  q5_medications: {
    hi: 'हाँ, मैं उच्च रक्तचाप के लिए एक टेबलेट रोज़ सुबह लेता हूँ। बाकी कोई दवा नहीं।',
    en: 'Yes, I take one tablet daily in the morning for blood pressure. No other medicines.',
    mr: 'होय, मी रक्तदाबासाठी एक गोळी रोज सकाळी घेतो. इतर कोणतीही औषधे नाहीत.',
  },
};

// ─── Red Flag Configuration ──────────────────────────────────────────────────
// The provider — not the UI — determines if a scenario is a red flag.
// This prevents brittle keyword-matching in the UI layer.
// For the mock, Q3 voice response is NOT a red flag (touch "Very Severe" is handled by UI touch logic).
const RED_FLAG_QUESTIONS: Record<string, boolean> = {
  q1_location: false,
  q2_onset: false,
  q3_severity: false, // voice path: not red flag. Touch "Very Severe" triggers it via UI.
  q4_history: false,
  q5_medications: false,
};

export class MockVoiceProvider {
  /**
   * Returns the deterministic mock transcript for a given language and question.
   */
  static getMockTranscript(lang: Language, questionId: string): string {
    const questionMap = MOCK_TRANSCRIPTS[questionId];
    if (!questionMap) {
      return lang === 'hi'
        ? 'मुझे इस बारे में कुछ समस्या है।'
        : lang === 'mr'
          ? 'मला याबद्दल काही त्रास आहे.'
          : 'I have some discomfort regarding this.';
    }
    return questionMap[lang] ?? questionMap['en'];
  }

  /**
   * Returns the full mock result including the transcript and red-flag status.
   * The UI should use isRedFlag from this result, not perform its own text analysis.
   */
  static getMockResult(lang: Language, questionId: string): VoiceMockResult {
    return {
      transcript: MockVoiceProvider.getMockTranscript(lang, questionId),
      isRedFlag: RED_FLAG_QUESTIONS[questionId] ?? false,
    };
  }

  /**
   * Returns the deterministic processing duration in milliseconds.
   * Consistent across all calls — no randomness.
   */
  static getProcessingDuration(): number {
    return 1800;
  }

  /**
   * Returns a patient-friendly English translation of a regional transcript.
   * In the real implementation, this would call a translation service.
   * Here we return a fixed natural translation keyed by questionId.
   */
  static getEnglishTranslation(questionId: string): string {
    return MOCK_TRANSCRIPTS[questionId]?.['en'] ?? 'I have some discomfort regarding this.';
  }
}

// ─── Question Definitions ────────────────────────────────────────────────────

export interface TouchOption {
  id: string;
  label: string;
  labelHindi: string;
  labelMarathi: string;
  isRedFlag: boolean;
}

export interface VoiceQuestion {
  id: string;
  question: string;
  questionHindi: string;
  questionMarathi: string;
  touchOptions: TouchOption[];
}

export const VOICE_QUESTIONS: VoiceQuestion[] = [
  {
    id: 'q1_location',
    question: 'Where exactly do you feel the pain?',
    questionHindi: 'आपको दर्द या तकलीफ कहाँ महसूस हो रही है?',
    questionMarathi: 'तुम्हाला वेदना किंवा त्रास नक्की कुठे जाणवतो?',
    touchOptions: [
      { id: 'chest', label: 'Chest', labelHindi: 'छाती', labelMarathi: 'छाती', isRedFlag: false },
      { id: 'upper_abdomen', label: 'Upper Abdomen', labelHindi: 'पेट का ऊपरी हिस्सा', labelMarathi: 'पोटाचा वरचा भाग', isRedFlag: false },
      { id: 'lower_abdomen', label: 'Lower Abdomen', labelHindi: 'पेट का निचला हिस्सा', labelMarathi: 'पोटाचा खालचा भाग', isRedFlag: false },
      { id: 'back_spine', label: 'Back & Spine', labelHindi: 'पीठ और रीढ़', labelMarathi: 'पाठ व पाठीचा कणा', isRedFlag: false },
      { id: 'joints_limbs', label: 'Joints & Limbs', labelHindi: 'जोड़ और हाथ-पैर', labelMarathi: 'सांधे व हात-पाय', isRedFlag: false },
      { id: 'other_location', label: 'Other', labelHindi: 'अन्य स्थान', labelMarathi: 'इतर ठिकाण', isRedFlag: false },
    ],
  },
  {
    id: 'q2_onset',
    question: 'When did this problem start?',
    questionHindi: 'यह समस्या कब से है?',
    questionMarathi: 'ही समस्या कधीपासून आहे?',
    touchOptions: [
      { id: 'today', label: 'Today', labelHindi: 'आज से', labelMarathi: 'आजपासून', isRedFlag: false },
      { id: '2_3_days', label: '2–3 Days', labelHindi: '2–3 दिन से', labelMarathi: '2–3 दिवसांपासून', isRedFlag: false },
      { id: '1_week', label: '1 Week', labelHindi: '1 हफ़्ते से', labelMarathi: '1 आठवड्यापासून', isRedFlag: false },
      { id: '1_month_plus', label: '1 Month+', labelHindi: '1 महीने से ज़्यादा', labelMarathi: '1 महिन्यापेक्षा जास्त', isRedFlag: false },
      { id: 'dont_know', label: "Don't Know", labelHindi: 'पता नहीं', labelMarathi: 'माहीत नाही', isRedFlag: false },
    ],
  },
  {
    id: 'q3_severity',
    question: 'How severe is the discomfort?',
    questionHindi: 'दर्द कितना तेज है?',
    questionMarathi: 'त्रास किती तीव्र आहे?',
    touchOptions: [
      { id: 'mild', label: 'Mild', labelHindi: 'हल्का', labelMarathi: 'सौम्य', isRedFlag: false },
      { id: 'moderate', label: 'Moderate', labelHindi: 'मध्यम', labelMarathi: 'मध्यम', isRedFlag: false },
      { id: 'severe', label: 'Severe', labelHindi: 'तेज', labelMarathi: 'तीव्र', isRedFlag: false },
      { id: 'very_severe', label: 'Very Severe', labelHindi: 'बहुत तेज', labelMarathi: 'अतिशय तीव्र', isRedFlag: true },
    ],
  },
  {
    id: 'q4_history',
    question: 'Have you had this before?',
    questionHindi: 'क्या पहले भी ऐसी समस्या हुई है?',
    questionMarathi: 'यापूर्वी असा त्रास झाला होता का?',
    touchOptions: [
      { id: 'yes_before', label: 'Yes', labelHindi: 'हाँ', labelMarathi: 'होय', isRedFlag: false },
      { id: 'no_before', label: 'No', labelHindi: 'नहीं', labelMarathi: 'नाही', isRedFlag: false },
      { id: 'not_sure', label: 'Not Sure', labelHindi: 'निश्चित नहीं', labelMarathi: 'नक्की नाही', isRedFlag: false },
    ],
  },
  {
    id: 'q5_medications',
    question: 'Are you currently taking any medicines?',
    questionHindi: 'क्या आप कोई दवाई ले रहे हैं?',
    questionMarathi: 'तुम्ही सध्या कोणती औषधे घेत आहात का?',
    touchOptions: [
      { id: 'yes_daily', label: 'Yes (daily)', labelHindi: 'हाँ (रोज़ाना)', labelMarathi: 'होय (दररोज)', isRedFlag: false },
      { id: 'no_meds', label: 'No', labelHindi: 'नहीं', labelMarathi: 'नाही', isRedFlag: false },
      { id: 'not_sure_meds', label: 'Not Sure', labelHindi: 'निश्चित नहीं', labelMarathi: 'नक्की नाही', isRedFlag: false },
    ],
  },
];
