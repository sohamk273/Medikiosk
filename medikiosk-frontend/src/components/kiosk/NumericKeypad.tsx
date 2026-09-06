import { Delete, X } from 'lucide-react';

interface NumericKeypadProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  disabled?: boolean;
}

export function NumericKeypad({ onKeyPress, onBackspace, onClear, disabled = false }: NumericKeypadProps) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];

  return (
    <div className="grid grid-cols-3 gap-3 w-full max-w-sm mx-auto">
      {keys.map((key) => (
        <button
          key={key}
          disabled={disabled}
          onClick={() => onKeyPress(key)}
          className="h-16 text-2xl font-bold bg-[#F1F5F9] hover:bg-[#E2E8F0] active:bg-[#CBD5E1] text-[#0F172A] rounded-xl transition-colors disabled:opacity-50 disabled:pointer-events-none"
        >
          {key}
        </button>
      ))}
      
      <button
        disabled={disabled}
        onClick={onClear}
        className="h-16 text-lg font-bold bg-[#FEE2E2] hover:bg-[#FECACA] active:bg-[#FCA5A5] text-[#EF4444] rounded-xl transition-colors disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
      >
        <Delete className="w-5 h-5" />
        Clear
      </button>

      <button
        disabled={disabled}
        onClick={() => onKeyPress('0')}
        className="h-16 text-2xl font-bold bg-[#F1F5F9] hover:bg-[#E2E8F0] active:bg-[#CBD5E1] text-[#0F172A] rounded-xl transition-colors disabled:opacity-50 disabled:pointer-events-none"
      >
        0
      </button>

      <button
        disabled={disabled}
        onClick={onBackspace}
        className="h-16 bg-[#E2E8F0] hover:bg-[#CBD5E1] active:bg-[#94A3B8] text-[#334155] rounded-xl transition-colors flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none"
      >
        <X className="w-6 h-6" />
      </button>
    </div>
  );
}
