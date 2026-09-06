import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Eye, Trash2, CheckCircle2 } from 'lucide-react';
import { usePatientSession } from '@/features/patient/PatientSessionContext';
import type { PatientDocument } from '@/features/patient/PatientSessionContext';
import { StepProgressIndicator } from '@/components/ui/StepProgressIndicator';
import { Modal } from '@/components/ui/Modal';

export default function Review() {
  const navigate = useNavigate();
  const { language, documentIntake, updateDocument, removeDocument } = usePatientSession();

  const [previewDoc, setPreviewDoc] = useState<PatientDocument | null>(null);

  const handleConfirm = () => {
    // Mark all as reviewed
    documentIntake.documents.forEach(doc => {
      updateDocument(doc.id, { status: 'reviewed' });
    });
    navigate('/patient/review');
  };

  const handleBackProxy = () => {
    navigate('/patient/documents/scan');
  };

  const hasDocuments = documentIntake.documents.length > 0;

  return (
    <div className="w-full">
      <button id="review-continue-btn" className="hidden" onClick={handleConfirm} />
      <button id="review-back-btn" className="hidden" onClick={handleBackProxy} />

      <StepProgressIndicator
        current={16}
        total={24}
        title={language === 'hi' ? 'दस्तावेज़ जाँचें' : language === 'mr' ? 'कागदपत्रे तपासा' : 'REVIEW YOUR DOCUMENTS'}
      />

      <div className="max-w-7xl mx-auto px-6 pt-6 pb-32">
        <div className="mb-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-primary leading-tight mb-1">
              {language === 'hi' ? 'दस्तावेज़ जाँचें' : 'Review Your Documents'}
            </h2>
            <p className="text-slate-500 text-base">
              {language === 'hi'
                ? 'सुनिश्चित करें कि आपने सही दस्तावेज़ स्कैन किए हैं।'
                : 'Please review the documents you have scanned.'}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
          {!hasDocuments ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-600 mb-2">
                {language === 'hi' ? 'कोई दस्तावेज़ नहीं' : 'No documents scanned'}
              </h3>
              <p className="text-slate-500 mb-6">
                {language === 'hi' ? 'आपने कोई दस्तावेज़ स्कैन नहीं किया है।' : 'You have not scanned any documents.'}
              </p>
              <button
                onClick={handleBackProxy}
                className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-primary/90 transition-colors"
              >
                {language === 'hi' ? 'वापस जाएँ' : 'Go Back'}
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 mb-8">
                {documentIntake.documents.map(doc => (
                  <div key={doc.id} className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-2xl p-5">
                    <div className="w-14 h-14 rounded-xl bg-[#E6FAF5] text-[#0D9488] flex items-center justify-center shrink-0">
                      <FileText className="w-7 h-7" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-slate-800">
                        {language === 'hi' ? doc.titleHindi : doc.title}
                      </h3>
                      <p className="text-sm text-slate-500 mb-1">{doc.fileName}</p>
                      <div className="flex items-center gap-1 text-[#0D9488] text-xs font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        {language === 'hi' ? 'स्कैन हो गया' : 'Scanned'}
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold hover:bg-slate-50 transition-colors shadow-sm"
                      >
                        <Eye className="w-4 h-4" />
                        {language === 'hi' ? 'देखें' : 'View'}
                      </button>
                      <button
                        onClick={() => removeDocument(doc.id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-red-500 font-bold hover:bg-red-50 transition-colors shadow-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        {language === 'hi' ? 'हटाएँ' : 'Remove'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col items-center border-t border-slate-200 pt-8 mt-4">
                <p className="text-lg font-bold text-slate-700 mb-6">
                  {language === 'hi' ? 'क्या सब सही है?' : 'Everything looks correct?'}
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={handleBackProxy}
                    className="px-8 py-4 rounded-2xl bg-white border-2 border-slate-200 font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    {language === 'hi' ? 'वापस जाएँ' : 'Go Back'}
                  </button>
                  <button
                    onClick={handleConfirm}
                    className="px-10 py-4 rounded-2xl bg-[#0D9488] font-bold text-white text-xl hover:bg-[#0B8070] transition-colors shadow-lg flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-6 h-6" />
                    {language === 'hi' ? 'सही है' : 'Looks Correct'}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

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
