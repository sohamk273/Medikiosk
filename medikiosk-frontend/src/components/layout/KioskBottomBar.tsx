import { ArrowLeft, Volume2, HelpCircle, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { usePatientSession } from '@/features/patient/PatientSessionContext';
import { BilingualText } from '../ui/BilingualText';
import { AYUSH_QUESTIONS } from '@/services/ayush/MockAyushProvider';

export function KioskBottomBar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { identificationMethod, consent, chiefComplaint, voiceIntake, ayushIntake, medicationHistory, allergyHistory, documentIntake } = usePatientSession();

  const path = location.pathname.replace(/\/$/, '');

  const handleBack = () => {
    if (path === '/patient' || path === '/patient/') return;

    // On voice page, delegate to the hidden back button so Voice.tsx can
    // handle its own state (stopping timer, resetting active recording, etc.)
    if (path === '/patient/voice') {
      const voiceBackBtn = document.getElementById('voice-back-btn') as HTMLButtonElement | null;
      if (voiceBackBtn) { voiceBackBtn.click(); return; }
    }
    if (path === '/patient/ayush') {
      const btn = document.getElementById('ayush-back-btn') as HTMLButtonElement | null;
      if (btn) { btn.click(); return; }
    }
    if (path === '/patient/medications') {
      const btn = document.getElementById('medications-back-btn') as HTMLButtonElement | null;
      if (btn) { btn.click(); return; }
    }
    if (path === '/patient/allergies') {
      const btn = document.getElementById('allergies-back-btn') as HTMLButtonElement | null;
      if (btn) { btn.click(); return; }
    }
    if (path === '/patient/documents/scan') {
      const btn = document.getElementById('scan-back-btn') as HTMLButtonElement | null;
      if (btn) { btn.click(); return; }
    }
    if (path === '/patient/documents/review') {
      const btn = document.getElementById('review-back-btn') as HTMLButtonElement | null;
      if (btn) { btn.click(); return; }
    }
    if (path === '/patient/review') {
      const btn = document.getElementById('patient-review-back-btn') as HTMLButtonElement | null;
      if (btn) { btn.click(); return; }
    }

    // Voice processing — back is not meaningful during auto-processing
    if (path === '/patient/voice-processing') return;

    // Voice confirmation — back returns to voice for same question
    if (path === '/patient/voice-confirmation') {
      navigate('/patient/voice');
      return;
    }

    navigate(-1);
  };

  const handleContinue = () => {
    // Delegate to in-page submit buttons first
    const submitBtn = document.getElementById('register-submit-btn') as HTMLButtonElement | null;
    if (submitBtn) { submitBtn.click(); return; }

    const confirmBtn = document.getElementById('voice-confirm-btn') as HTMLButtonElement | null;
    if (confirmBtn && path === '/patient/voice-confirmation') {
      confirmBtn.click();
      return;
    }

    if (path === '/patient/ayush') {
      const btn = document.getElementById('ayush-continue-btn') as HTMLButtonElement | null;
      if (btn) { btn.click(); return; }
    }
    if (path === '/patient/medications') {
      const btn = document.getElementById('medications-continue-btn') as HTMLButtonElement | null;
      if (btn) { btn.click(); return; }
    }
    if (path === '/patient/allergies') {
      const btn = document.getElementById('allergies-continue-btn') as HTMLButtonElement | null;
      if (btn) { btn.click(); return; }
    }
    if (path === '/patient/documents/scan') {
      const btn = document.getElementById('scan-continue-btn') as HTMLButtonElement | null;
      if (btn) { btn.click(); return; }
    }
    if (path === '/patient/documents/review') {
      const btn = document.getElementById('review-continue-btn') as HTMLButtonElement | null;
      if (btn) { btn.click(); return; }
    }
    if (path === '/patient/review') {
      const btn = document.getElementById('patient-review-continue-btn') as HTMLButtonElement | null;
      if (btn) { btn.click(); return; }
    }

    // Route-based progression
    if (path === '/patient') {
      navigate('/patient/language');
    } else if (path === '/patient/language') {
      navigate('/patient/identify');
    } else if (path === '/patient/identify') {
      if (identificationMethod === 'abha') {
        navigate('/patient/abha');
      } else if (identificationMethod === 'new') {
        navigate('/patient/register');
      } else if (identificationMethod === 'opd') {
        navigate('/patient/opd-slip');
      } else {
        return;
      }
    } else if (path === '/patient/abha') {
      navigate('/patient/consent');
    } else if (path === '/patient/consent') {
      navigate('/patient/profile');
    } else if (path === '/patient/profile') {
      navigate('/patient/chief-complaint');
    } else if (path === '/patient/chief-complaint') {
      navigate('/patient/voice');
    } else if (path === '/patient/voice') {
      const actionBtn = document.getElementById('voice-action-btn') as HTMLButtonElement | null;
      if (actionBtn) {
        actionBtn.click();
      }
      return;
    } else if (path === '/patient/voice-processing') {
      // Auto-navigating — Continue disabled
      return;
    } else if (path === '/patient/voice-confirmation') {
      // Already handled above via confirmBtn
      return;
    } else if (path === '/patient/ayush') {
      return; // handled by proxy
    } else if (path === '/patient/medications') {
      return; // handled by proxy
    } else if (path === '/patient/allergies') {
      return; // handled by proxy
    } else if (path === '/patient/documents/scan') {
      return; // handled by proxy
    } else if (path === '/patient/documents/review') {
      return; // handled by proxy
    } else if (path === '/patient/review') {
      return; // handled by proxy
    } else {
      return;
    }
  };

  // ─── Disabled state logic ──────────────────────────────────────────────────
  
  const currentAyushQuestion = AYUSH_QUESTIONS[ayushIntake.currentQuestionIndex];
  const hasAyushAnswer = ayushIntake.responses.some(r => r.questionId === currentAyushQuestion?.id);

  const isContinueDisabled =
    (path === '/patient/consent' && !consent.accepted) ||
    (path === '/patient/chief-complaint' && !chiefComplaint.primaryComplaint) ||
    path === '/patient/voice-processing' ||
    // Voice confirmation: handled by in-page button; bottom Continue mirrors it
    (path === '/patient/voice-confirmation' && !voiceIntake.pendingConfirmation) ||
    (path === '/patient/ayush' && !hasAyushAnswer) ||
    (path === '/patient/medications' && !medicationHistory.takingMedicines) ||
    (path === '/patient/allergies' && (!allergyHistory.hasAllergy || (allergyHistory.hasAllergy === 'yes' && (!allergyHistory.allergyType || !allergyHistory.reaction)))) ||
    (path === '/patient/documents/scan' && !documentIntake.completed && documentIntake.documents.length === 0);

  // Hide Back on processing (it's automatic)
  const hideBack =
    path === '/patient' ||
    path === '/patient/' ||
    path === '/patient/voice-processing';

  return (
    <footer className="bg-white border-t border-slate-200 px-8 py-6 flex items-center justify-between sticky bottom-0 z-50">

      <button
        onClick={handleBack}
        className={`flex items-center gap-3 bg-secondary text-primary px-8 py-4 rounded-2xl transition-colors shadow-sm ${
          hideBack
            ? 'opacity-50 pointer-events-none'
            : 'hover:bg-secondary/80'
        }`}
      >
        <ArrowLeft className="w-6 h-6" />
        <BilingualText
          english="Back"
          regional="पीछे"
          englishClassName="text-xl font-bold"
          regionalClassName="text-base"
        />
      </button>

      <div className="flex items-center gap-4">
        <button className="flex items-center gap-3 bg-mint text-primary px-8 py-4 rounded-2xl hover:bg-mint/80 transition-colors shadow-sm">
          <Volume2 className="w-6 h-6" />
          <BilingualText
            english="Repeat Audio"
            regional="पुनः सुनें"
            englishClassName="text-xl font-bold"
            regionalClassName="text-base"
          />
        </button>

        <button className="flex items-center gap-3 bg-[#E0E7FF] text-medical px-8 py-4 rounded-2xl hover:bg-[#C7D2FE] transition-colors shadow-sm">
          <HelpCircle className="w-6 h-6" />
          <BilingualText
            english="Need Help / Sahayak"
            regional="सहायता / सहायक"
            englishClassName="text-xl font-bold"
            regionalClassName="text-base"
          />
        </button>
      </div>

      {path !== '/patient/voice-processing' && (
        <button
          onClick={handleContinue}
          disabled={isContinueDisabled}
          className={`flex items-center gap-3 px-10 py-4 rounded-2xl transition-colors shadow-md ${
            isContinueDisabled
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : path === '/patient/voice' && voiceIntake.activeInputMethod === 'voice'
                ? 'bg-[#0D9488] text-white hover:bg-[#0B8070]'
                : 'bg-primary text-white hover:bg-primary/90'
          }`}
        >
          <BilingualText
            english={path === '/patient/voice' && voiceIntake.activeInputMethod === 'voice' ? "Stop Recording" : "Continue"}
            regional={path === '/patient/voice' && voiceIntake.activeInputMethod === 'voice' ? "रोकें" : "आगे बढ़ें"}
            englishClassName={`text-2xl font-bold ${isContinueDisabled ? 'text-slate-500' : 'text-white'}`}
            regionalClassName={`text-lg ${isContinueDisabled ? 'text-slate-500' : 'text-primary-foreground/90'}`}
          />
          {path === '/patient/voice' && voiceIntake.activeInputMethod === 'voice' ? (
            <span className="w-6 h-6 bg-white ml-2 rounded-sm" />
          ) : (
            <ArrowRight className="w-8 h-8" />
          )}
        </button>
      )}

    </footer>
  );
}
