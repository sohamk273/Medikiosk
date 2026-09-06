import { Clock, Globe, Volume2, AlertCircle, User } from 'lucide-react';

export function KioskHeader() {
  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-4">
        {/* Placeholder for Logo */}
        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center text-primary font-bold">
          MK
        </div>
        <div>
          <h1 className="text-xl font-bold text-primary">MediKiosk AYUSH</h1>
          <p className="text-xs text-slate-500 font-medium">Ministry of Ayush, Govt. of India</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
          <Clock className="w-4 h-4 text-slate-600" />
          <span className="text-sm font-semibold text-slate-700">10:42 AM • OPD Kiosk #02</span>
        </div>

        <button className="flex items-center gap-2 bg-secondary text-primary px-4 py-2 rounded-lg font-semibold hover:bg-secondary/80 transition-colors">
          <Globe className="w-4 h-4" />
          <span className="text-sm font-devanagari">हिन्दी / EN</span>
        </button>

        <button className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-primary/90 transition-colors">
          <Volume2 className="w-4 h-4" />
          <span className="text-sm">Audio ON</span>
        </button>

        <button className="flex items-center gap-2 bg-destructive text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:bg-destructive/90 transition-colors">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">Emergency Help</span>
        </button>

        <button className="w-10 h-10 bg-slate-800 text-white rounded-full flex items-center justify-center hover:bg-slate-700 transition-colors">
          <User className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
