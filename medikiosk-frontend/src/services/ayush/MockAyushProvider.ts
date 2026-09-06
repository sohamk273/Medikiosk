import type { Language } from '@/features/patient/PatientSessionContext';

export interface TouchOption {
  id: string;
  label: string;
  labelHindi: string;
  labelMarathi?: string;
}

export interface AyushQuestion {
  id: string;
  internalField: string;
  question: string;
  questionHindi: string;
  questionMarathi?: string;
  touchOptions: TouchOption[];
}

const MOCK_TRANSCRIPTS: Record<string, Record<Language, string>> = {
  q1_appetite: {
    hi: 'मेरी भूख बिल्कुल सामान्य है।',
    en: 'My appetite is completely normal.',
    mr: 'माझी भूक पूर्णपणे सामान्य आहे.',
  },
  q2_digestion: {
    hi: 'पाचन ठीक रहता है, कभी-कभी हल्का भारीपन लगता है।',
    en: 'Digestion is fine, sometimes I feel a bit heavy.',
    mr: 'पचन ठीक असते, कधीकधी थोडं जड वाटतं.',
  },
  q3_thirst: {
    hi: 'मुझे दिन में कई बार प्यास लगती है।',
    en: 'I feel thirsty multiple times a day.',
    mr: 'मला दिवसातून अनेक वेळा तहान लागते.',
  },
  q4_sleep: {
    hi: 'मेरी नींद अच्छी है, रात भर आराम से सोता हूँ।',
    en: 'My sleep is good, I sleep comfortably through the night.',
    mr: 'माझी झोप चांगली आहे, रात्रभर आरामात झोपतो.',
  },
  q5_energy: {
    hi: 'मैं दिन भर सामान्य और सक्रिय महसूस करता हूँ।',
    en: 'I feel normal and active throughout the day.',
    mr: 'मी दिवसभर सामान्य आणि सक्रिय अनुभवतो.',
  },
  q6_temperature: {
    hi: 'मुझे दोनों मौसम ठीक लगते हैं, पर ज़्यादा गर्मी से परेशानी होती है।',
    en: 'I am comfortable in both, but extreme heat bothers me.',
    mr: 'मला दोन्ही ऋतू ठीक वाटतात, पण जास्त उकाड्याचा त्रास होतो.',
  },
  q7_bowel: {
    hi: 'मेरा पेट रोज़ साफ होता है।',
    en: 'My bowel movements are regular every day.',
    mr: 'माझे पोट रोज साफ होते.',
  },
  q8_bloating: {
    hi: 'खाना खाने के बाद कभी-कभी पेट भारी हो जाता है।',
    en: 'Sometimes my stomach feels heavy after eating.',
    mr: 'जेवणानंतर कधीकधी पोट जड होतं.',
  },
  q9_vitality: {
    hi: 'मेरी ऊर्जा सामान्य है, मैं अपना सारा काम कर लेता हूँ।',
    en: 'My energy is normal, I can manage all my work.',
    mr: 'माझी ऊर्जा सामान्य आहे, मी माझं सगळं काम करू शकतो.',
  },
  q10_routine: {
    hi: 'मेरी दिनचर्या अधिकतर नियमित ही रहती है।',
    en: 'My routine is mostly regular.',
    mr: 'माझी दिनचर्या बहुतांशी नियमित असते.',
  },
};

export class MockAyushProvider {
  /**
   * Returns a deterministic mock answer transcript for the selected question and language.
   */
  static getMockAnswer(lang: Language, questionId: string): string {
    const questionMap = MOCK_TRANSCRIPTS[questionId];
    if (!questionMap) {
      return lang === 'hi' ? 'यह सामान्य है।' : lang === 'mr' ? 'हे सामान्य आहे.' : 'This is normal.';
    }
    return questionMap[lang] ?? questionMap['en'];
  }

  /**
   * Returns deterministic processing duration in milliseconds.
   */
  static getProcessingDuration(): number {
    return 1800;
  }
}

export const AYUSH_QUESTIONS: AyushQuestion[] = [
  {
    id: 'q1_appetite',
    internalField: 'ahara_shakti',
    question: 'How is your appetite these days?',
    questionHindi: 'इन दिनों आपकी भूख कैसी रहती है?',
    touchOptions: [
      { id: 'opt_very_good', label: 'Very Good', labelHindi: 'बहुत अच्छी' },
      { id: 'opt_normal', label: 'Normal', labelHindi: 'सामान्य' },
      { id: 'opt_low', label: 'Low', labelHindi: 'कम' },
      { id: 'opt_very_low', label: 'Very Low', labelHindi: 'बहुत कम' },
    ],
  },
  {
    id: 'q2_digestion',
    internalField: 'agni',
    question: 'How is your digestion after meals?',
    questionHindi: 'खाना खाने के बाद आपका पाचन कैसा रहता है?',
    touchOptions: [
      { id: 'opt_comfortable', label: 'Comfortable', labelHindi: 'आराम से' },
      { id: 'opt_sometimes_heavy', label: 'Sometimes Heavy', labelHindi: 'कभी-कभी भारी' },
      { id: 'opt_often_heavy', label: 'Often Heavy', labelHindi: 'अक्सर भारी' },
      { id: 'opt_very_difficult', label: 'Very Difficult', labelHindi: 'बहुत कठिन' },
    ],
  },
  {
    id: 'q3_thirst',
    internalField: 'trishna',
    question: 'How often do you feel thirsty?',
    questionHindi: 'आपको कितनी बार प्यास लगती है?',
    touchOptions: [
      { id: 'opt_normal', label: 'Normal', labelHindi: 'सामान्य' },
      { id: 'opt_more_often', label: 'More Often', labelHindi: 'अधिक' },
      { id: 'opt_very_often', label: 'Very Often', labelHindi: 'बहुत अधिक' },
      { id: 'opt_rarely', label: 'Rarely', labelHindi: 'बहुत कम' },
    ],
  },
  {
    id: 'q4_sleep',
    internalField: 'nidra',
    question: 'How is your sleep?',
    questionHindi: 'आपकी नींद कैसी रहती है?',
    touchOptions: [
      { id: 'opt_good', label: 'Good', labelHindi: 'अच्छी' },
      { id: 'opt_light', label: 'Light', labelHindi: 'हल्की' },
      { id: 'opt_interrupted', label: 'Interrupted', labelHindi: 'बार-बार टूटती है' },
      { id: 'opt_very_poor', label: 'Very Poor', labelHindi: 'बहुत खराब' },
    ],
  },
  {
    id: 'q5_energy',
    internalField: 'bala',
    question: 'How do you usually feel during the day?',
    questionHindi: 'दिन में आप आमतौर पर कैसा महसूस करते हैं?',
    touchOptions: [
      { id: 'opt_energetic', label: 'Energetic', labelHindi: 'ऊर्जावान' },
      { id: 'opt_normal', label: 'Normal', labelHindi: 'सामान्य' },
      { id: 'opt_tired', label: 'Tired', labelHindi: 'थका हुआ' },
      { id: 'opt_very_weak', label: 'Very Weak', labelHindi: 'बहुत कमजोरी' },
    ],
  },
  {
    id: 'q6_temperature',
    internalField: 'temperature_tolerance',
    question: 'How do you usually feel in hot or cold weather?',
    questionHindi: 'गर्मी या ठंड के मौसम में आपको कैसा महसूस होता है?',
    touchOptions: [
      { id: 'opt_comfortable_both', label: 'Comfortable in both', labelHindi: 'दोनों में आरामदायक' },
      { id: 'opt_prefer_warm', label: 'Prefer Warm', labelHindi: 'गर्मी पसंद' },
      { id: 'opt_prefer_cool', label: 'Prefer Cool', labelHindi: 'ठंडक पसंद' },
      { id: 'opt_sensitive_both', label: 'Sensitive to both', labelHindi: 'दोनों से परेशानी' },
    ],
  },
  {
    id: 'q7_bowel',
    internalField: 'koshta',
    question: 'How is your bowel movement usually?',
    questionHindi: 'आपका मल त्याग आमतौर पर कैसा रहता है?',
    touchOptions: [
      { id: 'opt_regular', label: 'Regular', labelHindi: 'नियमित' },
      { id: 'opt_sometimes_constipated', label: 'Sometimes Constipated', labelHindi: 'कभी-कभी कब्ज' },
      { id: 'opt_often_constipated', label: 'Often Constipated', labelHindi: 'अक्सर कब्ज' },
      { id: 'opt_loose', label: 'Loose', labelHindi: 'ढीला' },
    ],
  },
  {
    id: 'q8_bloating',
    internalField: 'ahara_vihara',
    question: 'Do you feel bloating or heaviness after eating?',
    questionHindi: 'क्या खाना खाने के बाद पेट फूलना या भारीपन महसूस होता है?',
    touchOptions: [
      { id: 'opt_never', label: 'Never', labelHindi: 'कभी नहीं' },
      { id: 'opt_sometimes', label: 'Sometimes', labelHindi: 'कभी-कभी' },
      { id: 'opt_often', label: 'Often', labelHindi: 'अक्सर' },
      { id: 'opt_almost_always', label: 'Almost Always', labelHindi: 'लगभग हमेशा' },
    ],
  },
  {
    id: 'q9_vitality',
    internalField: 'vitality',
    question: 'How would you describe your usual energy and activity?',
    questionHindi: 'आप अपनी सामान्य ऊर्जा और सक्रियता को कैसे बताएंगे?',
    touchOptions: [
      { id: 'opt_high', label: 'High', labelHindi: 'अधिक' },
      { id: 'opt_normal', label: 'Normal', labelHindi: 'सामान्य' },
      { id: 'opt_low', label: 'Low', labelHindi: 'कम' },
      { id: 'opt_very_low', label: 'Very Low', labelHindi: 'बहुत कम' },
    ],
  },
  {
    id: 'q10_routine',
    internalField: 'dinacharya',
    question: 'How would you describe your overall daily routine?',
    questionHindi: 'आप अपनी रोज़ की दिनचर्या को कैसे बताएंगे?',
    touchOptions: [
      { id: 'opt_regular', label: 'Regular', labelHindi: 'नियमित' },
      { id: 'opt_mostly_regular', label: 'Mostly Regular', labelHindi: 'अधिकतर नियमित' },
      { id: 'opt_irregular', label: 'Irregular', labelHindi: 'अनियमित' },
      { id: 'opt_very_irregular', label: 'Very Irregular', labelHindi: 'बहुत अनियमित' },
    ],
  },
];
