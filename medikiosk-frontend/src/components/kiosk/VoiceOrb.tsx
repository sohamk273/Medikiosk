import { Mic, Loader2 } from 'lucide-react';

export type VoiceOrbState = 'idle' | 'listening' | 'processing';

interface VoiceOrbProps {
  state: VoiceOrbState;
  onClick?: () => void;
}

/**
 * VoiceOrb — the central microphone interaction element.
 *
 * Visual states:
 *   idle       — large mic, subtle ring, tap-to-start affordance
 *   listening  — active mic, animated concentric rings, pulsing glow
 *   processing — spinning loader, non-interactive
 */
export function VoiceOrb({ state, onClick }: VoiceOrbProps) {
  const isIdle = state === 'idle';
  const isListening = state === 'listening';
  const isProcessing = state === 'processing';
  const isInteractive = isIdle;

  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={isInteractive ? onClick : undefined}
      disabled={Component === 'button' ? !isInteractive : undefined}
      aria-label={
        isIdle ? 'Tap to speak / बोलने के लिए टैप करें' :
        isListening ? 'Listening... / सुन रहे हैं...' :
        'Processing... / समझ रहे हैं...'
      }
      className={`relative flex items-center justify-center focus:outline-none
        ${isInteractive ? 'cursor-pointer' : 'cursor-default'}`}
      style={{ width: 220, height: 220 }}
    >
      {/* Outermost ring — only visible while listening */}
      {isListening && (
        <span className="absolute inset-0 rounded-full bg-[#0D9488]/10 animate-ping" />
      )}

      {/* Outer decorative ring */}
      <span
        className={`absolute rounded-full transition-all duration-500
          ${isListening
            ? 'inset-4 bg-[#B2F5E0]/50 animate-[pulse_1.4s_ease-in-out_infinite]'
            : isProcessing
              ? 'inset-4 bg-[#DBEAFE]/50'
              : 'inset-6 bg-[#E6FAF5]'
          }`}
      />

      {/* Middle ring */}
      <span
        className={`absolute rounded-full transition-all duration-500
          ${isListening
            ? 'inset-10 bg-[#5EEAD4]/40 animate-[pulse_1.2s_ease-in-out_0.2s_infinite]'
            : isProcessing
              ? 'inset-10 bg-[#BFDBFE]/50'
              : 'inset-12 bg-[#CCFBF1]'
          }`}
      />

      {/* Core orb */}
      <span
        className={`relative z-10 flex items-center justify-center rounded-full shadow-lg transition-all duration-300
          ${isListening
            ? 'w-24 h-24 bg-[#0D9488] shadow-[0_0_32px_rgba(13,148,136,0.5)]'
            : isProcessing
              ? 'w-20 h-20 bg-[#2563EB]'
              : 'w-20 h-20 bg-primary hover:scale-105 transition-transform'
          }`}
      >
        {isProcessing ? (
          <Loader2 className="w-10 h-10 text-white animate-spin" />
        ) : (
          <Mic className={`text-white transition-all duration-300 ${isListening ? 'w-12 h-12' : 'w-10 h-10'}`} />
        )}
      </span>
    </Component>
  );
}
