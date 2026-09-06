import { FileScan } from 'lucide-react';
import { AudioGuidanceBanner } from '@/components/kiosk/AudioGuidanceBanner';

export default function OpdSlip() {
  return (
    <div className="w-full max-w-5xl mx-auto pt-16 px-4 flex flex-col items-center">
      <div className="w-24 h-24 bg-mint text-primary rounded-3xl flex items-center justify-center mb-8 shadow-sm">
        <FileScan className="w-12 h-12" />
      </div>
      
      <h2 className="text-4xl font-bold text-primary mb-4 text-center">
        OPD Slip / पर्ची स्कैन करें
      </h2>
      
      <p className="text-xl text-slate-600 mb-12 text-center max-w-2xl">
        Scan or upload your existing OPD slip. <br/>
        This workflow will be implemented in the Documents/OCR slice.
      </p>
      
      <div className="w-full max-w-3xl">
        <AudioGuidanceBanner 
          englishText="Audio prompt: Please hold your OPD slip under the scanner."
          regionalText="कृपया अपनी पर्ची को स्कैनर के नीचे रखें।"
        />
      </div>
    </div>
  );
}
