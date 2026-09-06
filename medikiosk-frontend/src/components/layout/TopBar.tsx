import { Search, Bell, RefreshCw, User } from 'lucide-react';

export function TopBar() {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex-1 max-w-2xl">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search ABHA ID, Token #, or Patient Name (Press / to search)..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4 ml-4">
        <div className="bg-secondary/50 text-primary px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 border border-secondary">
          <span className="w-4 h-4 bg-primary/20 rounded-sm flex items-center justify-center">🏢</span>
          OPD Room 4 - Dr. Priya Sharma, MD (Ayu)
        </div>

        <div className="flex items-center gap-2 ml-2">
          <button className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 relative transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-destructive rounded-full border border-white"></span>
          </button>
          
          <button className="w-10 h-10 rounded-full hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>

          <button className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-white ml-2 shadow-sm">
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
