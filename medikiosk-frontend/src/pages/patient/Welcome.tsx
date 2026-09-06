import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 pt-12">
      <div className="bg-primary/5 p-6 rounded-3xl mb-8">
        <div className="w-24 h-24 bg-primary text-white rounded-2xl flex items-center justify-center font-bold text-4xl mx-auto shadow-lg">
          MK
        </div>
      </div>
      
      <h1 className="text-5xl font-bold text-primary mb-4 tracking-tight">
        Welcome to MediKiosk
      </h1>
      <h2 className="text-2xl text-slate-600 font-devanagari mb-6">
        मेडिकियोस्क में आपका स्वागत है
      </h2>
      
      <p className="text-lg text-slate-500 max-w-2xl mb-12">
        Complete your medical intake in 3 simple steps before meeting your doctor.
        <br />
        <span className="font-devanagari text-base">अपने डॉक्टर से मिलने से पहले 3 आसान चरणों में अपनी स्वास्थ्य जानकारी दर्ज करें।</span>
      </p>

      <button
        onClick={() => navigate('/patient/language')}
        className="bg-primary hover:bg-primary/90 text-white px-12 py-6 rounded-3xl text-3xl font-bold flex items-center gap-4 transition-all hover:scale-105 shadow-xl hover:shadow-2xl"
      >
        Start Registration
        <ArrowRight className="w-8 h-8" />
      </button>
      
      <p className="mt-8 text-slate-400 text-sm font-medium">
        Ministry of Ayush • Government of India • Ayushman Bharat Digital Mission (ABDM)
      </p>
    </div>
  );
}
