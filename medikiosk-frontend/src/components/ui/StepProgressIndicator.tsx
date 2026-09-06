import React from 'react';

interface StepProgressIndicatorProps {
  current: number;
  total: number;
  title: React.ReactNode;
  badge?: React.ReactNode;
}

export function StepProgressIndicator({ current, total, title, badge }: StepProgressIndicatorProps) {
  const percentage = Math.round((current / total) * 100);
  
  return (
    <div className="w-full flex flex-col gap-2 py-4 border-b border-slate-200 bg-white px-8">
      <div className="flex items-center gap-4 max-w-5xl mx-auto w-full">
        <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg shadow-sm">
          {current}
        </div>
        <div className="flex flex-col flex-1 gap-1">
          <div className="flex justify-between items-center text-sm font-semibold text-primary uppercase tracking-wider">
            <span className="flex items-center gap-2">
              STEP {current} OF {total} <span className="text-slate-400">•</span> {title}
            </span>
            {badge && (
              <span className="bg-mint text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-sm">
                {badge}
              </span>
            )}
          </div>
          <div className="w-full bg-secondary h-2 mt-1 rounded-full overflow-hidden">
            <div 
              className="bg-primary h-full transition-all duration-500 ease-out" 
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
