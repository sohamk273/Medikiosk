import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Square } from 'lucide-react';
import { usePatientSession } from '@/features/patient/PatientSessionContext';
import { VOICE_QUESTIONS } from '@/services/voice/MockVoiceProvider';
import { VoiceOrb } from '@/components/kiosk/VoiceOrb';
import { VoiceWaveform } from '@/components/kiosk/VoiceWaveform';
import { AudioGuidanceBanner } from '@/components/kiosk/AudioGuidanceBanner';
import { StepProgressIndicator } from '@/components/ui/StepProgressIndicator';

type VoicePageState = 'idle' | 'listening';

// Global base step offset within the 24-step kiosk flow
const VOICE_STEP_BASE = 9; // Step 9 of 24 onward

export default function Voice() {
  const navigate = useNavigate();
  const {
    language,
    voiceIntake,
    setActiveVoiceInput,
    setActiveSelectedOption,
    resetActiveVoiceResponse,
  } = usePatientSession();

  const [pageState, setPageState] = useState<VoicePageState>('idle');
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [selectedTouchOption, setSelectedTouchOption] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const currentIndex = voiceIntake.currentQuestionIndex;
  const question = VOICE_QUESTIONS[currentIndex];
  const TOTAL_QUESTIONS = VOICE_QUESTIONS.length;
  const globalStep = VOICE_STEP_BASE + currentIndex;

  // Clear any running timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  if (!question) {
    // Safety fallback — should not normally occur
    return (
      <div className="w-full max-w-7xl mx-auto pt-12 px-4 text-center">
        <p className="text-xl text-slate-500">Voice intake complete.</p>
      </div>
    );
  }

  // ─── Question text according to selected language ─────────────────────────
  const questionPrimary =
    language === 'hi' ? question.questionHindi :
    language === 'mr' ? question.questionMarathi :
    question.question;
  const questionSecondary =
    language === 'hi' ? question.question :
    language === 'mr' ? question.question :
    question.questionHindi;

  // ─── Timer logic ──────────────────────────────────────────────────────────
  const startTimer = () => {
    setTimerSeconds(0);
    timerRef.current = setInterval(() => {
      setTimerSeconds(s => s + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60).toString().padStart(2, '0');
    const secs = (s % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  // ─── Interaction handlers ─────────────────────────────────────────────────
  const handleStartListening = () => {
    setSelectedTouchOption(null);
    setActiveVoiceInput('voice');
    setPageState('listening');
    startTimer();
  };

  const handleStopListening = () => {
    stopTimer();
    setPageState('idle');
    // Navigate to processing — context already has activeInputMethod = 'voice'
    navigate('/patient/voice-processing');
  };

  const handleTouchSelect = (optionId: string) => {
    // If already listening, ignore touch
    if (pageState === 'listening') return;
    setSelectedTouchOption(optionId);
  };

  const handleTouchContinue = () => {
    if (!selectedTouchOption) return;
    const option = question.touchOptions.find(o => o.id === selectedTouchOption);
    if (!option) return;

    const label =
      language === 'hi' ? option.labelHindi :
      language === 'mr' ? option.labelMarathi :
      option.label;

    setActiveVoiceInput('touch');
    setActiveSelectedOption(label, option.isRedFlag);
    navigate('/patient/voice-confirmation');
  };

  const handleBack = () => {
    if (pageState === 'listening') {
      stopTimer();
      setPageState('idle');
      resetActiveVoiceResponse();
      return;
    }
    navigate('/patient/chief-complaint');
  };

  // ─── Touch option label helper ────────────────────────────────────────────
  const getOptionLabel = (option: typeof question.touchOptions[0]) =>
    language === 'hi' ? `${option.labelHindi}` :
    language === 'mr' ? `${option.labelMarathi}` :
    option.label;

  const getOptionSubLabel = (option: typeof question.touchOptions[0]) =>
    language === 'hi' ? option.label :
    language === 'mr' ? option.label :
    option.labelHindi;

  return (
    <div className="w-full">
      {/* Step progress bar */}
      <StepProgressIndicator
        current={globalStep}
        total={24}
        title={language === 'hi' ? 'आवाज़ से बातचीत' : language === 'mr' ? 'आवाज बातचीत' : 'VOICE INTAKE'}
        badge={
          pageState === 'listening'
            ? '● MIC LIVE / माइक चालू'
            : `Question ${currentIndex + 1} of ${TOTAL_QUESTIONS}`
        }
      />

      <div className="max-w-7xl mx-auto px-6 pt-6 pb-32">
        {/* Question header */}
        <div className="mb-4 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <span className="text-white text-2xl">🎧</span>
          </div>
          <div className="flex-1">
            <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">
              {language === 'hi' ? 'मुख्य लक्षण विवरण' : language === 'mr' ? 'मुख्य लक्षण' : 'PRIMARY SYMPTOM INTAKE'}
            </p>
            <h2 className="text-2xl font-bold text-primary leading-tight mb-1">
              {questionPrimary}
            </h2>
            <p className="text-slate-500 text-base">{questionSecondary}</p>
            {pageState === 'idle' && (
              <p className="text-slate-400 text-sm mt-2 flex items-center gap-1">
                <span className="text-[#0D9488]">ℹ</span>
                {language === 'hi'
                  ? 'माइक टैप करें या नीचे विकल्प चुनें।'
                  : language === 'mr'
                    ? 'मायक्रोफोन टॅप करा किंवा खालील पर्याय निवडा.'
                    : 'Tap the microphone to speak, or select a touch option below.'
                }
              </p>
            )}
          </div>
          {/* Listen prompt button */}
          <button className="shrink-0 flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-slate-600 font-semibold text-sm hover:bg-slate-100 transition-colors">
            <span>🔊</span>
            {language === 'hi' ? 'सवाल सुनें' : language === 'mr' ? 'प्रश्न ऐका' : 'Listen Prompt'}
          </button>
        </div>

        {/* Audio guidance (idle only) */}
        {pageState === 'idle' && (
          <AudioGuidanceBanner
            englishText="Tap the microphone to speak your answer, or select a touch option below."
            regionalText={
              language === 'hi'
                ? 'माइक टैप करें और अपनी समस्या बताएं, या नीचे विकल्प चुनें।'
                : language === 'mr'
                  ? 'मायक्रोफोन टॅप करा आणि तुमची समस्या सांगा, किंवा खालील पर्याय निवडा.'
                  : undefined
            }
          />
        )}

        {/* Main two-column layout */}
        <div className="grid grid-cols-[280px_1fr] gap-6 mt-2">

          {/* LEFT: Voice orb panel */}
          {pageState === 'idle' ? (
            <button
              onClick={handleStartListening}
              className="rounded-3xl flex flex-col items-center justify-between p-6 min-h-[380px] border transition-all duration-300 bg-[#E6FAF5] border-[#A7F3D0] hover:bg-[#D1F4E8] hover:border-[#0D9488] cursor-pointer w-full focus:outline-none focus:ring-4 focus:ring-[#0D9488]/30 text-left shadow-sm hover:shadow-md"
              aria-label={language === 'hi' ? 'माइक टैप करें और बताएं' : language === 'mr' ? 'मायक्रोफोन टॅप करा' : 'Tap to Speak Your Answer'}
            >
              {/* Voice AI badge */}
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-white text-primary border border-slate-200 shadow-sm">
                  VOICE AI MODE
                </span>
                <span className="text-slate-400 text-sm">𝑨</span>
              </div>

              {/* Orb */}
              <div className="flex flex-col items-center gap-4 w-full">
                <VoiceOrb state="idle" />

                <div className="text-center">
                  <p className="text-2xl font-bold text-primary">
                    {language === 'hi' ? 'बोलकर बताएं' : language === 'mr' ? 'बोलून सांगा' : 'Tap to Speak'}
                  </p>
                  <p className="text-slate-500 text-sm">
                    {language === 'hi' ? 'माइक टैप करें और बताएं' : language === 'mr' ? 'मायक्रोफोन टॅप करा' : 'Tap to Speak Your Answer'}
                  </p>
                </div>
              </div>

              {/* Language hint */}
              <div className="w-full bg-white/70 rounded-2xl p-3 border border-[#A7F3D0] mt-2">
                <p className="text-slate-500 text-xs flex items-center gap-2">
                  <span className="text-[#0D9488]">ℹ</span>
                  Hindi • Marathi • English
                </p>
                <p className="text-slate-600 text-xs font-devanagari mt-1">
                  {language === 'hi'
                    ? '"जैसे: मुझे 3 दिन से पेट में दर्द है।"'
                    : language === 'mr'
                      ? '"उदा: मला 3 दिवसांपासून पोटात दुखत आहे."'
                      : '"E.g. I have had stomach pain for 3 days."'
                  }
                </p>
              </div>
            </button>
          ) : (
            <div className="rounded-3xl flex flex-col items-center justify-between p-6 min-h-[380px] border transition-all duration-500 bg-[#F0FDF9] border-[#0D9488] shadow-sm">
              {/* Voice AI badge */}
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#0D9488] text-white">
                  ● RECORDING / रिकॉर्डिंग चालू है
                </span>
                <span className="text-slate-400 text-sm">𝑨</span>
              </div>

              {/* Orb */}
              <div className="flex flex-col items-center gap-4 w-full">
                <VoiceOrb state="listening" />

                <div className="text-center">
                  <p className="text-2xl font-bold text-[#0D9488]">
                    {language === 'hi' ? 'सुन रहे हैं...' : language === 'mr' ? 'ऐकत आहोत...' : 'Listening...'}
                  </p>
                  <p className="text-slate-600 text-sm font-devanagari">
                    {language === 'hi' ? 'अपनी समस्या बताइए' : language === 'mr' ? 'तुमची समस्या सांगा' : 'Please speak naturally'}
                  </p>
                  <p className="text-3xl font-mono font-bold text-primary mt-2">
                    {formatTimer(timerSeconds)}
                  </p>
                </div>
              </div>

              {/* Waveform and stop button */}
              <div className="w-full flex flex-col items-center gap-4 mt-2">
                <VoiceWaveform active={true} />
                <button
                  onClick={handleStopListening}
                  className="w-full bg-[#0D9488] text-white rounded-2xl py-4 flex items-center justify-center gap-3 font-bold text-lg hover:bg-[#0B8070] transition-colors shadow-md"
                >
                  <Square className="w-6 h-6 fill-white" />
                  {language === 'hi' ? 'रोकें / Stop' : language === 'mr' ? 'थांबा / Stop' : 'Done Speaking / Stop'}
                </button>
              </div>
            </div>
          )}

          {/* RIGHT: Touch option grid */}
          <div>
            {pageState !== 'listening' && (
              <>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-slate-500 text-sm font-semibold uppercase tracking-wider flex items-center gap-2">
                    <span className="w-px h-4 bg-slate-300" />
                    {language === 'hi' ? 'OR TAP YOUR ANSWER / या नीचे स्पर्श करें' : language === 'mr' ? 'OR TAP YOUR ANSWER / किंवा खाली स्पर्श करा' : 'OR TAP YOUR ANSWER / या नीचे स्पर्श करें'}
                  </p>
                </div>

                <div className={`grid gap-3 ${question.touchOptions.length <= 4 ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {question.touchOptions.map(option => {
                    const isSelected = selectedTouchOption === option.id;
                    return (
                      <button
                        key={option.id}
                        onClick={() => handleTouchSelect(option.id)}
                        className={`rounded-2xl p-5 text-left border-2 transition-all duration-150 flex items-center gap-4 min-h-[80px] ${
                          isSelected
                            ? 'border-primary bg-secondary shadow-md'
                            : option.isRedFlag
                              ? 'border-slate-200 bg-white hover:border-red-300 hover:bg-red-50'
                              : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-primary text-white' : option.isRedFlag ? 'bg-red-50 text-destructive' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isSelected ? '✓' : option.isRedFlag ? '⚠' : '+'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-bold text-base leading-tight ${isSelected ? 'text-primary' : 'text-slate-800'}`}>
                            {getOptionLabel(option)}
                          </p>
                          <p className="text-slate-400 text-sm mt-0.5 truncate">{getOptionSubLabel(option)}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Touch continue button */}
                {selectedTouchOption && (
                  <div className="mt-4">
                    <button
                      onClick={handleTouchContinue}
                      className="w-full bg-primary text-white rounded-2xl py-4 flex items-center justify-center gap-3 font-bold text-lg hover:bg-primary/90 transition-colors shadow-md"
                    >
                      {language === 'hi' ? 'इस विकल्प की पुष्टि करें →' : language === 'mr' ? 'हा पर्याय निवडा →' : 'Confirm this selection →'}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Listening state — right panel message */}
            {pageState === 'listening' && (
              <div className="h-full flex items-center justify-center">
                <div className="bg-[#F0FDF9] border-2 border-[#A7F3D0] rounded-3xl p-8 text-center max-w-sm">
                  <p className="text-[#0D9488] font-bold text-2xl mb-2">
                    {language === 'hi' ? 'सुन रहे हैं...' : language === 'mr' ? 'ऐकत आहोत...' : 'Listening...'}
                  </p>
                  <p className="text-slate-600">
                    {language === 'hi'
                      ? 'कृपया शांत रहकर स्वाभाविक रूप से बोलें।'
                      : language === 'mr'
                        ? 'कृपया शांत राहून नैसर्गिकपणे बोला.'
                        : 'Please speak naturally into the kiosk microphone.'
                    }
                  </p>
                  <p className="text-slate-400 text-sm mt-3 font-devanagari">
                    {language === 'hi'
                      ? 'अपनी पसंदीदा भाषा में स्पष्ट रूप से बोलें।'
                      : 'Hindi • Marathi • English'
                    }
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden handlers — exposed for KioskBottomBar */}
      <button
        id="voice-back-btn"
        className="hidden"
        onClick={handleBack}
        aria-hidden="true"
      />
      {pageState === 'idle' ? (
        <button
          id="voice-action-btn"
          className="hidden"
          onClick={handleStartListening}
          aria-hidden="true"
        />
      ) : (
        <button
          id="voice-action-btn"
          className="hidden"
          onClick={handleStopListening}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
