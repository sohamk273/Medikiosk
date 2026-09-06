import { Globe2 } from 'lucide-react';

import { usePatientSession } from '@/features/patient/PatientSessionContext';
import { SelectionCard } from '@/components/kiosk/SelectionCard';

export default function Language() {
  const { language, setLanguage } = usePatientSession();

  return (
    <div className="w-full max-w-5xl mx-auto pt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
          1
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Select Language / भाषा का चयन करें / भाषा निवडा
        </h2>
        <span className="ml-auto text-sm text-slate-500 font-medium">Tap any card to set interface</span>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <SelectionCard
          icon={<Globe2 className="w-6 h-6" />}
          title="English"
          subtitle="Continue in English for intake"
          badge="STANDARD"
          selected={language === 'en'}
          onClick={() => {
            setLanguage('en');
          }}
        />
        <SelectionCard
          icon={<Globe2 className="w-6 h-6" />}
          title="Hindi"
          regionalTitle="हिन्दी"
          subtitle="आसान बोलचाल की भाषा में जानकारी भरें"
          badge="प्राथमिक / RECOMMENDED"
          selected={language === 'hi'}
          onClick={() => {
            setLanguage('hi');
          }}
        />
        <SelectionCard
          icon={<Globe2 className="w-6 h-6" />}
          title="Marathi"
          regionalTitle="मराठी"
          subtitle="मराठी भाषेत जलद नोंदणी करा"
          badge="स्थानिक / REGIONAL"
          selected={language === 'mr'}
          onClick={() => {
            setLanguage('mr');
          }}
        />
      </div>

      <div className="bg-slate-50 rounded-2xl p-4 flex items-center justify-between border border-slate-100">
        <div className="flex items-center gap-2 text-slate-600 font-medium text-sm">
          <Globe2 className="w-4 h-4" />
          Other National Languages / अन्य भाषाएँ:
        </div>
        <div className="flex gap-2">
          {['বাংলা (Bengali)', 'தமிழ் (Tamil)', 'తెలుగు (Telugu)', 'ગુજરાતી (Gujarati)', 'ಕನ್ನಡ (Kannada)'].map((lang) => (
            <button key={lang} className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors shadow-sm">
              {lang}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
