import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Loader2, Circle } from 'lucide-react';
import { usePatientSession } from '@/features/patient/PatientSessionContext';
import { MockVoiceProvider, VOICE_QUESTIONS } from '@/services/voice/MockVoiceProvider';
import { VoiceWaveform } from '@/components/kiosk/VoiceWaveform';
import { StepProgressIndicator } from '@/components/ui/StepProgressIndicator';

type PipelineStage = 'audio_captured' | 'understanding' | 'preparing' | 'done';

const STAGE_DURATIONS = {
  audio_captured: 400,
  understanding: 900,
  preparing: 500,
} as const;

const VOICE_STEP_BASE = 9;

export default function VoiceProcessing() {
  const navigate = useNavigate();
  const {
    language,
    voiceIntake,
    setActiveTranscript,
  } = usePatientSession();

  const [stage, setStage] = useState<PipelineStage>('audio_captured');

  const currentIndex = voiceIntake.currentQuestionIndex;
  const question = VOICE_QUESTIONS[currentIndex];
  const globalStep = VOICE_STEP_BASE + currentIndex + 0.5; // halfway through

  useEffect(() => {
    // Safety: if no active voice input, redirect back
    if (voiceIntake.activeInputMethod !== 'voice') {
      navigate('/patient/voice', { replace: true });
      return;
    }

    // Deterministic pipeline: resolve mock transcript, then advance stages
    const result = MockVoiceProvider.getMockResult(language, question?.id ?? 'q1_location');

    const t1 = setTimeout(() => setStage('understanding'), STAGE_DURATIONS.audio_captured);
    const t2 = setTimeout(() => setStage('preparing'), STAGE_DURATIONS.audio_captured + STAGE_DURATIONS.understanding);
    const t3 = setTimeout(() => {
      setStage('done');
      // Persist the result into context before navigating
      setActiveTranscript(result.transcript, result.isRedFlag);
    }, STAGE_DURATIONS.audio_captured + STAGE_DURATIONS.understanding + STAGE_DURATIONS.preparing);
    const t4 = setTimeout(() => {
      navigate('/patient/voice-confirmation', { replace: true });
    }, MockVoiceProvider.getProcessingDuration());

    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isComplete = (s: PipelineStage, current: PipelineStage) => {
    const order: PipelineStage[] = ['audio_captured', 'understanding', 'preparing', 'done'];
    return order.indexOf(current) > order.indexOf(s);
  };
  const isActive = (s: PipelineStage, current: PipelineStage) => s === current;

  const stages = [
    {
      id: 'audio_captured' as PipelineStage,
      label: language === 'hi' ? 'आवाज़ रिकॉर्ड की गई' : language === 'mr' ? 'आवाज रेकॉर्ड झाली' : 'Audio Captured',
      sublabel: language === 'hi' ? 'ध्वनि दर्ज की गई' : 'Your response was recorded',
    },
    {
      id: 'understanding' as PipelineStage,
      label: language === 'hi' ? 'आपका उत्तर समझ रहे हैं' : language === 'mr' ? 'तुमचे उत्तर समजत आहोत' : 'Understanding Your Response',
      sublabel: language === 'hi' ? 'भाषा पहचान व रूपांतरण जारी है...' : 'Recognising spoken language...',
    },
    {
      id: 'preparing' as PipelineStage,
      label: language === 'hi' ? 'उत्तर तैयार हो रहा है' : language === 'mr' ? 'उत्तर तयार होत आहे' : 'Preparing Your Answer',
      sublabel: language === 'hi' ? 'लक्षण एवं विवरण वर्गीकरण' : 'Organising your response...',
    },
  ];

  return (
    <div className="w-full">
      <StepProgressIndicator
        current={Math.floor(globalStep)}
        total={24}
        title={language === 'hi' ? 'उत्तर का विश्लेषण' : language === 'mr' ? 'उत्तर विश्लेषण' : 'VOICE PROCESSING'}
        badge={`${Math.round(((VOICE_STEP_BASE + currentIndex) / 24) * 100)}% Complete`}
      />

      <div className="max-w-7xl mx-auto px-6 pt-6 pb-32">
        {/* Question context card */}
        {question && (
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm mb-6 flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <span className="text-white text-lg">🎙</span>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider font-bold mb-1">
                ACTIVE PATIENT SYMPTOM INTAKE • मुख्य लक्षण विवरण
              </p>
              <p className="text-lg font-bold text-primary">
                {language === 'hi' ? question.questionHindi : language === 'mr' ? question.questionMarathi : question.question}
              </p>
              <p className="text-slate-500 text-sm">
                {language !== 'en' ? question.question : question.questionHindi}
              </p>
            </div>
            <div className="ml-auto shrink-0 flex items-center gap-1 text-[#0D9488] text-sm font-bold">
              <span>🎙</span>
              <span>4.2s Captured</span>
            </div>
          </div>
        )}

        {/* Two-column layout */}
        <div className="grid grid-cols-2 gap-6">

          {/* LEFT: Processing animation */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 flex flex-col items-center justify-center gap-6 min-h-[360px]">
            {/* Spinning orb */}
            <div className="relative flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-[#E6FAF5] flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-[#CCFBF1] flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-[#0D9488] flex items-center justify-center">
                    {stage === 'done'
                      ? <CheckCircle2 className="w-8 h-8 text-white" />
                      : <Loader2 className="w-8 h-8 text-white animate-spin" />
                    }
                  </div>
                </div>
              </div>
              {/* Dashed rotating ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-[#0D9488]/30 animate-spin" style={{ animationDuration: '3s' }} />
            </div>

            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {language === 'hi' ? 'आपके उत्तर को समझा जा रहा है...' : language === 'mr' ? 'तुमचे उत्तर समजत आहोत...' : 'Processing your answer...'}
              </p>
              <p className="text-slate-500 mt-2 font-devanagari">
                {language !== 'hi' ? 'आपकी बात समझ रहे हैं...' : 'Understanding your response...'}
              </p>
            </div>

            {/* Patient instruction */}
            <div className="bg-[#EFF6FF] rounded-2xl px-5 py-3 text-center border border-[#BFDBFE]">
              <p className="text-[#1E40AF] font-bold text-sm">
                {language === 'hi'
                  ? 'कृपया एक पल प्रतीक्षा करें। स्क्रीन को न छुएं।'
                  : language === 'mr'
                    ? 'कृपया एक क्षण थांबा. स्क्रीनला स्पर्श करू नका.'
                    : 'Please wait a moment. Do not touch the screen.'
                }
              </p>
            </div>
          </div>

          {/* RIGHT: Pipeline stages */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {language === 'hi' ? 'विश्लेषण चरण' : 'PROCESSING STEPS'}
              </p>
            </div>

            {stages.map((s) => {
              const done = isComplete(s.id, stage);
              const active = isActive(s.id, stage);
              return (
                <div key={s.id} className={`rounded-2xl p-5 border-2 flex items-center gap-4 transition-all duration-500 ${
                  done
                    ? 'border-[#0D9488] bg-[#F0FDF9]'
                    : active
                      ? 'border-[#2563EB] bg-[#EFF6FF]'
                      : 'border-slate-100 bg-slate-50'
                }`}>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    done ? 'bg-[#0D9488]' : active ? 'bg-[#2563EB]' : 'bg-slate-200'
                  }`}>
                    {done
                      ? <CheckCircle2 className="w-6 h-6 text-white" />
                      : active
                        ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                        : <Circle className="w-6 h-6 text-slate-400" />
                    }
                  </div>
                  <div>
                    <p className={`font-bold text-base ${done ? 'text-[#0D9488]' : active ? 'text-[#1E40AF]' : 'text-slate-400'}`}>
                      {s.label}
                    </p>
                    <p className={`text-sm ${done || active ? 'text-slate-600' : 'text-slate-300'}`}>
                      {s.sublabel}
                    </p>
                  </div>
                  <div className="ml-auto text-xs font-bold">
                    {done && <span className="text-[#0D9488]">Complete</span>}
                    {active && <span className="text-[#2563EB]">Active</span>}
                    {!done && !active && <span className="text-slate-300">Pending</span>}
                  </div>
                </div>
              );
            })}

            {/* Waveform audio sample */}
            <div className="rounded-2xl p-4 border border-slate-200 bg-white flex items-center gap-4 mt-4">
              <span className="text-[#0D9488] text-xl">♪</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-700">
                  {language === 'hi' ? 'आवाज़ का नमूना' : 'Audio Sample'} • 4.2s
                </p>
              </div>
              <VoiceWaveform active={stage === 'understanding'} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
