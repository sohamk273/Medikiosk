import React from 'react';

interface BilingualTextProps {
  english: React.ReactNode;
  regional?: React.ReactNode;
  className?: string;
  englishClassName?: string;
  regionalClassName?: string;
}

export function BilingualText({ english, regional, className = '', englishClassName = '', regionalClassName = '' }: BilingualTextProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <span className={`font-bold text-foreground ${englishClassName}`}>{english}</span>
      {regional && (
        <span className={`font-devanagari text-slate-600 mt-1 ${regionalClassName}`}>
          {regional}
        </span>
      )}
    </div>
  );
}
