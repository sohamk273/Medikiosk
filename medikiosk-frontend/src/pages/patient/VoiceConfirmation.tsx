import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, MicOff, AlertTriangle, BellRing, Phone, ArrowRight } from 'lucide-react';
import { usePatientSession } from '@/features/patient/PatientSessionContext';
import { MockVoiceProvider, VOICE_QUESTIONS } from '@/services/voice/MockVoiceProvider';
import { TranscriptCard } from '@/components/kiosk/TranscriptCard';
import { StepProgressIndicator } from '@/components/ui/StepProgressIndicator';
import { AudioGuidanceBanner } from '@/components/kiosk/AudioGuidanceBanner';

const VOICE_STEP_BASE = 9;
const TOTAL_QUESTIONS = VOICE_QUESTIONS.length;

export default function VoiceConfirmation() {
  const navigate = useNavigate();
  const {
    language,
    voiceIntake,
    addVoiceResponse,
    advanceVoiceQuestion,
    setVoiceIntakeCompleted,
    setRedFlagTriggered,
    setStaffNotified,
    resetActiveVoiceResponse,
  } = usePatientSession();

  const [confirming, setConfirming] = useState(false);
  const [staffCalled, setStaffCalled] = useState(false);

  const currentIndex = voiceIntake.currentQuestionIndex;
  const question = VOICE_QUESTIONS[currentIndex];
  const globalStep = VOICE_STEP_BASE + currentIndex;

  const {
    activeInputMethod,
    activeTranscript,
    activeSelectedOption,
    activeIsRedFlag,
    pendingConfirmation,
  } = voiceIntake;

  // Safety: if no pending confirmation data, redirect back to voice
  if (!pendingConfirmation || (!activeTranscript && !activeSelectedOption) || !question) {
    return (
      <div className="w-full max-w-7xl mx-auto pt-12 px-4 text-center">
        <p className="text-xl text-slate-500 mb-6">
          {language === 'hi' ? 'कोई उत्तर नहीं मिला।' : 'No response found.'}
        </p>
        <button
          onClick={() => navigate('/patient/voice', { replace: true })}
          className="bg-primary text-white px-8 py-4 rounded-2xl font-bold text-lg"
        >
          {language === 'hi' ? 'वापस जाएं' : 'Go Back'}
        </button>
      </div>
    );
  }

  const isVoice = activeInputMethod === 'voice';
  const englishTranslation = isVoice && question
    ? MockVoiceProvider.getEnglishTranslation(question.id)
    : undefined;

  // ─── Handlers ─────────────────────────────────────────────────────────────

  const handleConfirm = () => {
    if (confirming) return; // guard against double-tap
    setConfirming(true);

    if (!question) return;

    const response = {
      questionId: question.id,
      question: question.question,
      questionHindi: question.questionHindi,
      inputMethod: activeInputMethod ?? 'touch',
      transcript: isVoice ? activeTranscript : undefined,
      selectedOption: !isVoice ? activeSelectedOption : undefined,
      confirmed: true,
      timestamp: new Date().toISOString(),
      isRedFlag: activeIsRedFlag,
    };

    addVoiceResponse(response);

    if (activeIsRedFlag) {
      setRedFlagTriggered(true);
      // Stay on this page to show Code Yellow — do not advance
      setConfirming(false);
      return;
    }

    const isLastQuestion = currentIndex >= TOTAL_QUESTIONS - 1;

    if (isLastQuestion) {
      setVoiceIntakeCompleted(true);
      navigate('/patient/ayush', { replace: true });
    } else {
      advanceVoiceQuestion();
      navigate('/patient/voice', { replace: true });
    }
  };

  const handleSpeakAgain = () => {
    resetActiveVoiceResponse();
    navigate('/patient/voice', { replace: true });
  };

  const handleCallSahayak = () => {
    setStaffCalled(true);
    setStaffNotified(true);
  };

  const handleContinueAfterRedFlag = () => {
    // Red flag is recorded. Allow continuing — it remains in context.
    const isLastQuestion = currentIndex >= TOTAL_QUESTIONS - 1;
    if (isLastQuestion) {
      setVoiceIntakeCompleted(true);
      navigate('/patient/ayush', { replace: true });
    } else {
      advanceVoiceQuestion();
      navigate('/patient/voice', { replace: true });
    }
  };

  // ─── Code Yellow screen ───────────────────────────────────────────────────
  if (activeIsRedFlag && voiceIntake.redFlagTriggered) {
    return (
      <div className="w-full">
        <StepProgressIndicator
          current={globalStep}
          total={24}
          title="CLINICAL SAFETY ALERT • आपातकालीन सहायता प्राथमिकता"
          badge={`Step ${globalStep} / 24`}
        />
        <div className="max-w-7xl mx-auto px-6 pt-6 pb-32">
          {/* Alert banner */}
          <div className="flex items-center justify-center mb-6">
            <div className="bg-destructive text-white rounded-full px-6 py-2 flex items-center gap-2 font-bold text-sm shadow-lg">
              <AlertTriangle className="w-5 h-5" />
              CLINICAL SAFETY ALERT • आपातकालीन सहायता प्राथमिकता
            </div>
          </div>

          {/* Main headline */}
          <div className="text-center mb-6">
            <h2 className="text-4xl font-bold text-destructive mb-2 leading-tight">
              Immediate Attention Needed / <span className="font-devanagari">कृपया यहीं रुकें, सहायता आ रही है</span>
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              {language === 'hi'
                ? 'आपका उत्तर दर्शाता है कि आपको तुरंत सहायता की आवश्यकता हो सकती है। कृपया यहाँ प्रतीक्षा करें।'
                : 'Your answer indicates you may need immediate assistance. Please stay here and wait for staff.'
              }
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* LEFT: Staff alert card */}
            <div className="bg-red-50 border-2 border-destructive rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-destructive font-bold">
                  <span className="text-sm uppercase tracking-wider">ESCORT & DIRECT ASSISTANCE</span>
                </div>
                <span className="bg-destructive text-white text-xs font-bold px-3 py-1 rounded-full">
                  CODE YELLOW
                </span>
              </div>

              <div className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-red-200">
                <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
                  <span className="text-2xl">🏥</span>
                </div>
                <div>
                  <p className="font-bold text-primary">Consultation Room 1B</p>
                  <p className="text-slate-500 text-sm">Emergency Triage • ECG Kiosk</p>
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-700">
                <p className="font-devanagari">
                  आपकी सुरक्षा के लिए, अस्पताल सहायक आपको सीधे परामर्श कक्ष ले जाने आ रहे हैं।
                </p>
                <p className="text-slate-600">
                  For your safety, hospital staff are on their way to assist you to the consultation room directly.
                </p>
              </div>

              {/* Staff heartbeat line */}
              <div className="bg-white border border-red-200 rounded-2xl p-3 flex items-center gap-3">
                <span className="text-destructive text-lg">📟</span>
                <div>
                  <p className="font-bold text-sm text-primary">Staff Alert Active</p>
                  <p className="text-slate-500 text-xs">सहायक को सूचित किया गया है • Duty Sahayak notified</p>
                </div>
                <span className="ml-auto text-[#0D9488] text-xs font-bold animate-pulse">● ACTIVE</span>
              </div>
            </div>

            {/* RIGHT: Info + actions */}
            <div className="space-y-4">
              {/* Audio guidance */}
              <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-4 flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0D9488] flex items-center justify-center shrink-0">
                  <span className="text-white text-lg">🔊</span>
                </div>
                <div>
                  <p className="font-bold text-primary text-sm">AUDIO GUIDANCE PLAYING (हिन्दी / ENGLISH)</p>
                  <p className="text-slate-600 text-sm font-devanagari mt-1">
                    "कृपया शांत रहें। सहायक आपकी सहायता के लिए आ रहे हैं।"
                  </p>
                  <p className="text-slate-500 text-xs mt-1 italic">"Please stay calm. Staff are coming to assist you."</p>
                </div>
              </div>

              {/* Feeling worse notice */}
              <div className="bg-[#EFF6FF] rounded-2xl p-4 border border-[#BFDBFE]">
                <p className="font-bold text-[#1E40AF] text-sm mb-1">
                  {language === 'hi' ? 'अगर आप बहुत बेचैन या सांस में तकलीफ महसूस करें:' : 'Feeling very unwell or breathless?'}
                </p>
                <p className="text-slate-600 text-sm font-devanagari">
                  {language === 'hi'
                    ? 'ऊपर दाईं ओर दिए गए लाल "Help / सहायता" बटन को दबाएं या तुरंत बैठ जाएं।'
                    : 'Press the red "Help / Sahayata" button at the top right, or sit down immediately.'
                  }
                </p>
              </div>

              {/* Action buttons */}
              {!staffCalled ? (
                <button
                  onClick={handleCallSahayak}
                  className="w-full bg-destructive text-white rounded-2xl py-5 flex items-center justify-center gap-3 font-bold text-xl hover:bg-destructive/90 transition-colors shadow-lg"
                >
                  <Phone className="w-6 h-6" />
                  {language === 'hi' ? 'सहायक को अभी बुलाएं / Call Sahayak Now' : 'Call Sahayak Now / सहायक को अभी बुलाएं'}
                </button>
              ) : (
                <div className="w-full bg-[#F0FDF4] border-2 border-[#0D9488] rounded-2xl py-5 flex items-center justify-center gap-3 font-bold text-xl text-[#0D9488]">
                  <BellRing className="w-6 h-6" />
                  {language === 'hi' ? 'सहायक को सूचित किया गया है।' : 'Staff has been notified.'}
                </div>
              )}

              <button
                onClick={handleContinueAfterRedFlag}
                className="w-full bg-slate-100 text-slate-700 rounded-2xl py-4 flex items-center justify-center gap-2 font-bold text-base hover:bg-slate-200 transition-colors border border-slate-200"
              >
                <ArrowRight className="w-5 h-5" />
                {language === 'hi' ? 'पंजीकरण जारी रखें' : 'Continue with intake'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Normal confirmation screen ───────────────────────────────────────────
  return (
    <div className="w-full">
      <StepProgressIndicator
        current={globalStep}
        total={24}
        title={language === 'hi' ? 'उत्तर की पुष्टि' : language === 'mr' ? 'उत्तर पुष्टी' : 'CONFIRM RESPONSE'}
        badge={`${Math.round((globalStep / 24) * 100)}% Completed • Intake Triage`}
      />

      <div className="max-w-7xl mx-auto px-6 pt-6 pb-32">
        {/* Page heading */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-[#E6FAF5] flex items-center justify-center shrink-0">
            <span className="text-2xl">🔁</span>
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-primary">
              {language === 'hi'
                ? 'कृपया अपने उत्तर की पुष्टि करें'
                : language === 'mr'
                  ? 'कृपया तुमचे उत्तर तपासा'
                  : 'Please Confirm What We Heard / '
              }
              <span className="font-devanagari text-xl font-normal text-slate-600 ml-1">
                {language === 'en' ? 'कृपया अपने उत्तर की पुष्टि करें' : ''}
              </span>
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {language === 'hi'
                ? 'जाँचें कि क्या आपकी बोली हुई बात सही दर्ज हुई है।'
                : language === 'mr'
                  ? 'तपासा की कियोस्कने तुमचे उत्तर बरोबर नोंदवले आहे का.'
                  : 'Check if the kiosk accurately captured your response before moving ahead.'
              }
            </p>
          </div>
          <div className="shrink-0 flex items-center gap-1 text-[#0D9488] text-sm font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>{isVoice ? 'Voice Captured' : 'Touch Selected'}</span>
          </div>
        </div>

        <AudioGuidanceBanner
          englishText="Review your answer below. Tap 'Looks Correct' if it is right, or 'Speak Again' to redo it."
          regionalText={
            language === 'hi'
              ? 'नीचे अपना उत्तर देखें। सही हो तो "सही है" दबाएं, या दोबारा बोलने के लिए "फिर से बोलें" दबाएं।'
              : language === 'mr'
                ? 'खाली तुमचे उत्तर पाहा. बरोबर असल्यास "सही आहे" दाबा किंवा पुन्हा सांगण्यासाठी "पुन्हा सांगा" दाबा.'
                : undefined
          }
        />

        {/* Question context */}
        <div className="bg-slate-50 rounded-2xl px-5 py-3 border border-slate-100 mb-4 flex items-center gap-3">
          <span className="text-slate-400 text-sm font-bold uppercase tracking-wider">Q{currentIndex + 1} of {TOTAL_QUESTIONS}</span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600 font-medium">
            {language === 'hi' ? question.questionHindi : language === 'mr' ? question.questionMarathi : question.question}
          </span>
        </div>

        {/* Transcript / response card */}
        <TranscriptCard
          inputMethod={activeInputMethod ?? 'voice'}
          transcript={activeTranscript}
          selectedOption={activeSelectedOption}
          englishTranslation={englishTranslation}
          isRedFlag={activeIsRedFlag}
        />

        {/* Action buttons */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {/* Speak Again */}
          <button
            onClick={handleSpeakAgain}
            className="flex flex-col items-center gap-2 bg-white border-2 border-slate-200 rounded-2xl py-5 px-4 hover:border-slate-300 hover:bg-slate-50 transition-colors"
          >
            <MicOff className="w-7 h-7 text-slate-500" />
            <span className="font-bold text-slate-700 text-base">Speak Again</span>
            <span className="text-slate-400 text-sm font-devanagari">फिर से बोलें</span>
            <span className="text-slate-400 text-xs">Wrong words recorded?</span>
          </button>

          {/* Edit on Screen — simple visual, no complex text editor */}
          <button
            onClick={handleSpeakAgain}
            className="flex flex-col items-center gap-2 bg-white border-2 border-slate-200 rounded-2xl py-5 px-4 hover:border-slate-300 hover:bg-slate-50 transition-colors"
          >
            <span className="text-slate-500 text-3xl">✏️</span>
            <span className="font-bold text-slate-700 text-base">Edit on Screen</span>
            <span className="text-slate-400 text-sm font-devanagari">स्क्रीन पर बदलें</span>
            <span className="text-slate-400 text-xs">Select from touch options</span>
          </button>

          {/* Looks Correct — primary CTA */}
          <button
            id="voice-confirm-btn"
            onClick={handleConfirm}
            disabled={confirming}
            className={`flex flex-col items-center gap-2 rounded-2xl py-5 px-4 transition-colors font-bold shadow-md border-2 ${
              confirming
                ? 'bg-slate-300 border-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-primary border-primary text-white hover:bg-primary/90'
            }`}
          >
            <CheckCircle2 className={`w-7 h-7 ${confirming ? 'text-slate-400' : 'text-white'}`} />
            <span className="text-xl">Looks Correct</span>
            <span className="font-devanagari text-lg">सही है / बरोबर आहे</span>
            <span className="text-primary-foreground/80 text-xs">
              {confirming ? 'Saving...' : 'Save & proceed to next step'}
            </span>
          </button>
        </div>

        {/* Progress footer */}
        <div className="mt-6 bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl px-5 py-3 flex items-center gap-3">
          <span className="text-[#059669] text-sm">ℹ</span>
          <p className="text-slate-600 text-sm">
            {language === 'hi'
              ? `प्रश्न ${currentIndex + 1} / ${TOTAL_QUESTIONS} — सब कुछ सही हो तो "सही है" या नीचे "आगे बढ़ें" दबाएं।`
              : `Question ${currentIndex + 1} of ${TOTAL_QUESTIONS} — Tap "Looks Correct" or "Continue" below to save and proceed.`
            }
          </p>
          <span className="ml-auto text-[#059669] text-xs font-bold">AYUSH OPD Form 4A</span>
        </div>
      </div>
    </div>
  );
}
