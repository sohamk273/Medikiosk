import { Mic, Hand, AlertCircle } from 'lucide-react';
import type { VoiceInputMethod } from '@/features/patient/PatientSessionContext';
import { VoiceWaveform } from './VoiceWaveform';

interface TranscriptCardProps {
  inputMethod: VoiceInputMethod;
  transcript?: string;
  selectedOption?: string;
  englishTranslation?: string;
  isRedFlag: boolean;
}

/**
 * TranscriptCard — displays what the system captured from the patient.
 *
 * Provenance is explicit:
 *   Voice input  → PATIENT-PROVIDED (voice)
 *   Touch input  → PATIENT-PROVIDED (touch)
 *   Translation  → AI-ASSISTED DRAFT (clearly labelled)
 *
 * Never presents AI output as verified or clinical fact.
 */
export function TranscriptCard({
  inputMethod,
  transcript,
  selectedOption,
  englishTranslation,
  isRedFlag,
}: TranscriptCardProps) {
  const isVoice = inputMethod === 'voice';

  return (
    <div className={`rounded-3xl border-2 p-6 space-y-4 ${
      isRedFlag ? 'border-destructive bg-red-50' : 'border-slate-200 bg-white'
    }`}>
      {/* Provenance header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isVoice
            ? <Mic className="w-5 h-5 text-[#0D9488]" />
            : <Hand className="w-5 h-5 text-[#2563EB]" />
          }
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            {isVoice
              ? 'PATIENT VOICE INPUT / मरीज़ द्वारा बोला गया विवरण'
              : 'PATIENT TOUCH SELECTION / मरीज़ द्वारा चुना गया विकल्प'}
          </span>
          <span className="bg-[#CCFBF1] text-[#0D9488] text-xs font-bold px-2 py-0.5 rounded-full">
            NOT A CLINICAL DIAGNOSIS
          </span>
        </div>
        {isRedFlag && (
          <span className="flex items-center gap-1 bg-destructive text-white text-xs font-bold px-3 py-1 rounded-full">
            <AlertCircle className="w-3.5 h-3.5" />
            NEEDS ATTENTION
          </span>
        )}
      </div>

      {/* Main captured content */}
      {isVoice && transcript ? (
        <div className="space-y-3">
          {/* Original spoken text */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">
              Original Spoken Dialect / मूल नोंदवलेली भाषा
            </p>
            <p className="text-xl font-bold text-primary leading-relaxed">
              "{transcript}"
            </p>
          </div>

          {/* English translation — clearly marked as AI-assisted */}
          {englishTranslation && englishTranslation !== transcript && (
            <div className="bg-[#EFF6FF] rounded-2xl p-4 border border-[#BFDBFE]">
              <p className="text-xs text-blue-600 font-semibold uppercase tracking-wider mb-2">
                English Translation (AI Assisted) — Verify Below
              </p>
              <p className="text-lg text-slate-700 leading-relaxed italic">
                "{englishTranslation}"
              </p>
            </div>
          )}

          {/* Static waveform playback visual */}
          <div className="flex items-center gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
              <span className="text-white text-lg">▶</span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-primary">Listen to Your Recording / आवाज़ सुनें</p>
              <p className="text-xs text-slate-500">Tap play to review the captured response</p>
            </div>
            <VoiceWaveform active={false} />
            <span className="text-slate-400 text-sm font-mono">00:04</span>
          </div>
        </div>
      ) : (
        /* Touch selection display */
        <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center shrink-0">
            <Hand className="w-7 h-7 text-white" />
          </div>
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">
              You Selected / आपने चुना
            </p>
            <p className="text-2xl font-bold text-primary">{selectedOption}</p>
          </div>
        </div>
      )}
    </div>
  );
}
