import { Volume2, RefreshCw } from 'lucide-react';
import { usePatientSession } from '@/features/patient/PatientSessionContext';

interface AudioGuidanceBannerProps {
  englishText: string;
  regionalText?: string;
  onReplay?: () => void;
}

export function AudioGuidanceBanner({ englishText, regionalText, onReplay }: AudioGuidanceBannerProps) {
  const { audioEnabled } = usePatientSession();

  if (!audioEnabled) return null;

  return (
    <div className="w-full bg-[#34D399] rounded-2xl p-4 flex items-center justify-between shadow-sm mb-6">
      <div className="flex items-center gap-4 text-primary">
        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
          <Volume2 className="w-6 h-6 text-[#10B981]" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg">{regionalText || englishText}</span>
          {regionalText && (
            <span className="text-sm font-medium opacity-90">{englishText}</span>
          )}
        </div>
      </div>
      
      <button 
        onClick={onReplay}
        className="bg-white text-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-slate-50 transition-colors shadow-sm"
      >
        <RefreshCw className="w-5 h-5" />
        Replay Prompt
      </button>
    </div>
  );
}
