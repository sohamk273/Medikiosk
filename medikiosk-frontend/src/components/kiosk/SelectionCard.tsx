import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface SelectionCardProps {
  icon: React.ReactNode;
  title: string;
  regionalTitle?: string;
  subtitle?: string;
  badge?: string;
  selected: boolean;
  onClick: () => void;
  className?: string;
}

export function SelectionCard({
  icon,
  title,
  regionalTitle,
  subtitle,
  badge,
  selected,
  onClick,
  className = ''
}: SelectionCardProps) {
  return (
    <button
      onClick={onClick}
      className={`relative w-full text-left p-6 rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
        selected 
          ? 'border-primary bg-primary text-white shadow-md' 
          : 'border-slate-200 bg-white hover:border-primary/30 hover:bg-slate-50 hover:shadow-sm text-foreground'
      } ${className}`}
    >
      <div className="flex flex-col h-full gap-4">
        <div className="flex justify-between items-start">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            selected ? 'bg-white/20 text-white' : 'bg-secondary/50 text-primary'
          }`}>
            {icon}
          </div>
          
          {badge && (
            <div className={`px-3 py-1 rounded-full text-xs font-bold ${
              selected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>
              {badge}
            </div>
          )}
        </div>

        <div className="mt-2">
          {regionalTitle ? (
            <div className="flex flex-col gap-1">
              <span className={`text-2xl font-bold font-devanagari ${selected ? 'text-white' : 'text-primary'}`}>
                {regionalTitle} <span className="opacity-80">({title})</span>
              </span>
            </div>
          ) : (
            <span className={`text-2xl font-bold ${selected ? 'text-white' : 'text-primary'}`}>
              {title}
            </span>
          )}
          
          {subtitle && (
            <p className={`mt-2 text-sm leading-relaxed ${selected ? 'text-white/90' : 'text-slate-500'}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {selected && (
        <div className="absolute top-4 right-4 text-[#34D399] bg-white rounded-full">
          <CheckCircle2 className="w-8 h-8" />
        </div>
      )}
    </button>
  );
}
