import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Activity, Mic, Pill, HeartPulse, FileText, CheckCircle2, AlertTriangle, Edit2, ShieldAlert } from 'lucide-react';
import { usePatientSession } from '@/features/patient/PatientSessionContext';
import type { PatientDocument } from '@/features/patient/PatientSessionContext';
import { StepProgressIndicator } from '@/components/ui/StepProgressIndicator';
import { Modal } from '@/components/ui/Modal';
import { AYUSH_QUESTIONS } from '@/services/ayush/MockAyushProvider';

export default function Review() {
  const navigate = useNavigate();
  const { 
    language, 
    patient, 
    abhaId, 
    identificationMethod, 
    chiefComplaint, 
    voiceIntake, 
    ayushIntake, 
    medicationHistory, 
    allergyHistory, 
    documentIntake,
    setReviewConfirmed 
  } = usePatientSession();

  const [previewDoc, setPreviewDoc] = useState<PatientDocument | null>(null);

  const maskPhone = (phone?: string) => {
    if (!phone) return '';
    if (phone.length === 10) return `${phone.slice(0, 2)}••••${phone.slice(-4)}`;
    return phone;
  };

  const maskAbha = (abha?: string) => {
    if (!abha) return '';
    const clean = abha.replace(/-/g, '');
    if (clean.length === 14) return `XXXX XXXX ${clean.slice(-4)}`;
    return abha;
  };

  const handleConfirm = () => {
    setReviewConfirmed(true);
    navigate('/patient/submit');
  };

  // The bottom bar proxy
  const handleContinueProxy = () => {
    handleConfirm();
  };

  const handleBackProxy = () => {
    navigate('/patient/documents/review');
  };

  return (
    <div className="w-full">
      <button id="patient-review-continue-btn" className="hidden" onClick={handleContinueProxy} />
      <button id="patient-review-back-btn" className="hidden" onClick={handleBackProxy} />

      <StepProgressIndicator
        current={17}
        total={24}
        title={language === 'hi' ? 'अपनी जानकारी जाँचें' : language === 'mr' ? 'तुमची माहिती तपासा' : 'REVIEW YOUR INFORMATION'}
      />

      <div className="max-w-4xl mx-auto px-6 pt-6 pb-32">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-primary mb-2">
            {language === 'hi' ? 'अपनी जानकारी जाँचें' : 'Review Your Information'}
          </h2>
          <p className="text-slate-500">
            {language === 'hi'
              ? 'कृपया केस जमा करने से पहले नीचे दी गई जानकारी जाँच लें।'
              : 'Please check the information below before submitting your case.'}
          </p>
        </div>

        <div className="space-y-6">
          
          {/* 1. Patient Information */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-3 text-slate-800 font-bold text-lg">
                <User className="w-6 h-6 text-primary" />
                {language === 'hi' ? 'रोगी की जानकारी' : 'Patient Information'}
              </div>
              <button 
                onClick={() => navigate(identificationMethod === 'abha' ? '/patient/profile' : '/patient/register')}
                className="flex items-center gap-2 text-primary font-bold hover:bg-slate-100 px-4 py-2 rounded-xl transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                {language === 'hi' ? 'बदलें' : 'Edit'}
              </button>
            </div>
            <div className="p-6">
              {patient ? (
                <div className="grid grid-cols-2 gap-4 text-slate-700">
                  <div><span className="text-slate-500">{language === 'hi' ? 'नाम:' : 'Name:'}</span> <span className="font-bold">{patient.name}</span></div>
                  <div><span className="text-slate-500">{language === 'hi' ? 'उम्र:' : 'Age:'}</span> <span className="font-bold">{patient.age}</span></div>
                  <div><span className="text-slate-500">{language === 'hi' ? 'लिंग:' : 'Gender:'}</span> <span className="font-bold">{patient.gender}</span></div>
                  <div><span className="text-slate-500">{language === 'hi' ? 'मोबाइल:' : 'Mobile:'}</span> <span className="font-bold">{maskPhone(patient.mobile)}</span></div>
                  {patient.district && <div><span className="text-slate-500">{language === 'hi' ? 'जिला:' : 'District:'}</span> <span className="font-bold">{patient.district}</span></div>}
                  {patient.state && <div><span className="text-slate-500">{language === 'hi' ? 'राज्य:' : 'State:'}</span> <span className="font-bold">{patient.state}</span></div>}
                  {identificationMethod === 'abha' && abhaId && (
                    <div className="col-span-2 mt-2 pt-2 border-t border-slate-100 flex items-center gap-2 text-[#0D9488] font-bold">
                      <ShieldAlert className="w-4 h-4" /> 
                      {language === 'hi' ? 'आभा लिंक:' : 'ABHA Linked:'} {maskAbha(abhaId)}
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-slate-500 italic">{language === 'hi' ? 'कोई जानकारी नहीं' : 'No information provided'}</div>
              )}
            </div>
          </div>

          {/* 2. Today's Concern */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-3 text-slate-800 font-bold text-lg">
                <Activity className="w-6 h-6 text-primary" />
                {language === 'hi' ? 'आज की समस्या' : "Today's Concern"}
              </div>
              <button 
                onClick={() => navigate('/patient/chief-complaint')}
                className="flex items-center gap-2 text-primary font-bold hover:bg-slate-100 px-4 py-2 rounded-xl transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                {language === 'hi' ? 'बदलें' : 'Edit'}
              </button>
            </div>
            <div className="p-6">
              {chiefComplaint.primaryComplaint ? (
                <div className="inline-flex items-center bg-[#E6FAF5] text-[#0D9488] px-4 py-2 rounded-xl font-bold">
                  {chiefComplaint.primaryComplaint}
                </div>
              ) : (
                <div className="text-slate-500 italic">{language === 'hi' ? 'कोई जानकारी नहीं' : 'No information provided'}</div>
              )}
            </div>
          </div>

          {/* 3. What You Told Us */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-3 text-slate-800 font-bold text-lg">
                <Mic className="w-6 h-6 text-primary" />
                {language === 'hi' ? 'आपने क्या बताया' : 'What You Told Us'}
              </div>
              <button 
                onClick={() => navigate('/patient/voice')}
                className="flex items-center gap-2 text-primary font-bold hover:bg-slate-100 px-4 py-2 rounded-xl transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                {language === 'hi' ? 'बदलें' : 'Edit'}
              </button>
            </div>
            <div className="p-6">
              {voiceIntake.responses.length > 0 ? (
                <div className="space-y-4">
                  {voiceIntake.responses.map((resp, i) => (
                    <div key={i} className="bg-slate-50 rounded-xl p-4">
                      <p className="text-sm text-slate-500 mb-1">{language === 'hi' ? resp.questionHindi : resp.question}</p>
                      <p className="font-bold text-slate-800">{resp.inputMethod === 'voice' ? resp.transcript : resp.selectedOption}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500 italic">{language === 'hi' ? 'कोई जानकारी नहीं' : 'No information provided'}</div>
              )}
            </div>
          </div>

          {/* 4. AYUSH Health Questions */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-3 text-slate-800 font-bold text-lg">
                <HeartPulse className="w-6 h-6 text-primary" />
                {language === 'hi' ? 'आयुष स्वास्थ्य प्रश्न' : 'AYUSH Health Questions'}
              </div>
              <button 
                onClick={() => navigate('/patient/ayush')}
                className="flex items-center gap-2 text-primary font-bold hover:bg-slate-100 px-4 py-2 rounded-xl transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                {language === 'hi' ? 'बदलें' : 'Edit'}
              </button>
            </div>
            <div className="p-6">
              {ayushIntake.responses.length > 0 ? (
                <div className="space-y-4">
                  {ayushIntake.responses.map((resp, i) => {
                    const originalQ = AYUSH_QUESTIONS.find(q => q.id === resp.questionId);
                    const qText = originalQ ? (language === 'hi' ? originalQ.questionHindi : originalQ.question) : resp.question;
                    const aText = (language === 'hi' && resp.answerHindi) ? resp.answerHindi : resp.answer;
                    return (
                      <div key={i} className="bg-slate-50 rounded-xl p-4">
                        <p className="text-sm text-slate-500 mb-1">{qText}</p>
                        <p className="font-bold text-slate-800">{aText}</p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-slate-500 italic">{language === 'hi' ? 'कोई जानकारी नहीं' : 'No information provided'}</div>
              )}
            </div>
          </div>

          {/* 5. Medicines */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-3 text-slate-800 font-bold text-lg">
                <Pill className="w-6 h-6 text-primary" />
                {language === 'hi' ? 'दवाइयाँ' : 'Medicines'}
              </div>
              <button 
                onClick={() => navigate('/patient/medications')}
                className="flex items-center gap-2 text-primary font-bold hover:bg-slate-100 px-4 py-2 rounded-xl transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                {language === 'hi' ? 'बदलें' : 'Edit'}
              </button>
            </div>
            <div className="p-6">
              {medicationHistory.takingMedicines === 'yes_daily' || medicationHistory.takingMedicines === 'yes_sometimes' ? (
                <div>
                  <p className="font-bold text-slate-800 mb-2">
                    {medicationHistory.takingMedicines === 'yes_daily'
                      ? (language === 'hi' ? 'हाँ, रोज़ाना लेता/लेती हूँ' : 'Yes, taking every day')
                      : (language === 'hi' ? 'हाँ, कभी-कभी लेता/लेती हूँ' : 'Yes, taking sometimes')}
                  </p>
                  {medicationHistory.medicines && (
                    <div className="bg-slate-50 rounded-xl p-4 text-slate-700">
                      {medicationHistory.medicines}
                    </div>
                  )}
                </div>
              ) : medicationHistory.takingMedicines === 'no' ? (
                <div className="text-slate-600 font-bold">{language === 'hi' ? 'कोई दवाई नहीं ले रहे हैं' : 'Not taking any medicines'}</div>
              ) : medicationHistory.takingMedicines === 'not_sure' ? (
                <div className="text-slate-600 font-bold">{language === 'hi' ? 'पता नहीं' : 'Not sure'}</div>
              ) : (
                <div className="text-slate-500 italic">{language === 'hi' ? 'कोई दवाइयों की जानकारी नहीं' : 'No medicines reported'}</div>
              )}
            </div>
          </div>

          {/* 6. Allergies */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-3 text-slate-800 font-bold text-lg">
                <AlertTriangle className="w-6 h-6 text-primary" />
                {language === 'hi' ? 'एलर्जी' : 'Allergies'}
              </div>
              <button 
                onClick={() => navigate('/patient/allergies')}
                className="flex items-center gap-2 text-primary font-bold hover:bg-slate-100 px-4 py-2 rounded-xl transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                {language === 'hi' ? 'बदलें' : 'Edit'}
              </button>
            </div>
            <div className="p-6">
              {allergyHistory.hasAllergy === 'yes' ? (
                <div>
                  <p className="font-bold text-slate-800 mb-2">{language === 'hi' ? 'हाँ, एलर्जी है' : 'Yes, has allergies'}</p>
                  <div className="bg-slate-50 rounded-xl p-4 text-slate-700 grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-slate-500 text-sm">{language === 'hi' ? 'प्रकार:' : 'Type:'}</span>
                      <p className="font-bold">{allergyHistory.allergyType}</p>
                    </div>
                    <div>
                      <span className="text-slate-500 text-sm">{language === 'hi' ? 'प्रतिक्रिया:' : 'Reaction:'}</span>
                      <p className="font-bold">{allergyHistory.reaction}</p>
                    </div>
                  </div>
                  {allergyHistory.breathingDifficulty && (
                    <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-xl flex items-center gap-2 font-bold text-sm">
                      <AlertTriangle className="w-5 h-5" />
                      {language === 'hi' ? 'सांस लेने में तकलीफ (Code Yellow)' : 'Breathing difficulty (Code Yellow)'}
                    </div>
                  )}
                </div>
              ) : allergyHistory.hasAllergy === 'no' ? (
                <div className="text-slate-600 font-bold">{language === 'hi' ? 'कोई एलर्जी नहीं' : 'No allergies reported'}</div>
              ) : allergyHistory.hasAllergy === 'not_sure' ? (
                <div className="text-slate-600 font-bold">{language === 'hi' ? 'पता नहीं' : 'Not sure'}</div>
              ) : (
                <div className="text-slate-500 italic">{language === 'hi' ? 'कोई एलर्जी की जानकारी नहीं' : 'No allergies reported'}</div>
              )}
            </div>
          </div>

          {/* 7. Documents */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-b border-slate-200">
              <div className="flex items-center gap-3 text-slate-800 font-bold text-lg">
                <FileText className="w-6 h-6 text-primary" />
                {language === 'hi' ? 'दस्तावेज़' : 'Documents'}
              </div>
              <button 
                onClick={() => navigate('/patient/documents/review')}
                className="flex items-center gap-2 text-primary font-bold hover:bg-slate-100 px-4 py-2 rounded-xl transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                {language === 'hi' ? 'बदलें' : 'Edit'}
              </button>
            </div>
            <div className="p-6">
              {documentIntake.documents.length > 0 ? (
                <div className="grid gap-4">
                  {documentIntake.documents.map(doc => (
                    <div key={doc.id} className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl p-4">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">{language === 'hi' ? doc.titleHindi : doc.title}</h4>
                        <p className="text-xs text-slate-500">{doc.fileName}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[#0D9488] text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {doc.status === 'reviewed' ? (language === 'hi' ? 'जाँचा गया' : 'Reviewed') : (language === 'hi' ? 'स्कैन हो गया' : 'Scanned')}
                        </span>
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="text-primary text-sm font-bold bg-white border border-slate-200 px-3 py-1 rounded-lg hover:bg-slate-100 transition-colors"
                        >
                          {language === 'hi' ? 'देखें' : 'View'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-500 italic">{language === 'hi' ? 'कोई दस्तावेज़ नहीं जोड़ा गया' : 'No documents added'}</div>
              )}
            </div>
          </div>

        </div>

        {/* Confirmation Area */}
        <div className="mt-12 bg-white rounded-3xl p-8 border border-[#0D9488]/30 shadow-lg text-center flex flex-col items-center">
          <p className="text-xl font-bold text-slate-800 mb-6">
            {language === 'hi' ? 'ऊपर दी गई जानकारी सही है इसकी पुष्टि करें।' : 'Please confirm that the information above is correct.'}
          </p>
          <button
            onClick={handleConfirm}
            className="bg-[#0D9488] text-white px-12 py-5 rounded-2xl font-bold text-2xl flex items-center gap-3 hover:bg-[#0B8070] transition-colors shadow-lg"
          >
            <CheckCircle2 className="w-8 h-8" />
            {language === 'hi' ? 'सब सही है' : 'Everything Looks Correct'}
          </button>
        </div>

      </div>

      {/* Document Preview Modal */}
      <Modal
        open={previewDoc !== null}
        onClose={() => setPreviewDoc(null)}
        title={
          <div className="flex items-center gap-3 text-slate-800">
            <FileText className="w-6 h-6 text-[#0D9488]" />
            <h3 className="font-bold text-xl">
              {previewDoc ? (language === 'hi' ? previewDoc.titleHindi : previewDoc.title) : ''}
            </h3>
          </div>
        }
      >
        {previewDoc && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center">
              DEMO PREVIEW - SYNTHETIC DATA
            </div>
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 min-h-[300px] whitespace-pre-wrap font-mono text-sm text-slate-700">
              {previewDoc.mockOcrText}
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
