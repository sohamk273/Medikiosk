import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  /** Controls visibility */
  open: boolean;
  /** Called when the modal should close (backdrop click, Esc, close button) */
  onClose: () => void;
  /** Optional title rendered above children */
  title?: ReactNode;
  /** Modal body content */
  children?: ReactNode;
  /** Optional footer content (e.g. action buttons) */
  footer?: ReactNode;
  /** Extra class names on the dialog panel */
  className?: string;
}

/**
 * Kiosk-aware modal dialog.
 * - Large touch targets suitable for 1366×768 kiosk display
 * - Smooth fade + scale animation
 * - Closes on backdrop click, Escape key, or explicit close button
 * - Traps body scroll while open
 */
export function Modal({ open, onClose, title, children, footer, className = '' }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  if (!open) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
    >
      {/* Dialog panel */}
      <div
        ref={dialogRef}
        className={`relative w-full max-w-xl mx-4 bg-white rounded-3xl shadow-2xl 
          animate-[modal-in_150ms_ease-out] 
          ${className}`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 
            flex items-center justify-center transition-colors z-10"
        >
          <X className="w-5 h-5 text-slate-600" />
        </button>

        {/* Title */}
        {title && (
          <div className="px-8 pt-8 pb-4 border-b border-slate-100">
            {title}
          </div>
        )}

        {/* Body */}
        {children && (
          <div className="px-8 py-6">
            {children}
          </div>
        )}

        {/* Footer */}
        {footer && (
          <div className="px-8 pb-8 pt-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}