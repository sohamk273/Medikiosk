import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ScanLine, FileSearch, CheckCircle2, Trash2, ShieldAlert } from 'lucide-react';
import { usePatientSession } from '@/features/patient/PatientSessionContext';
import type { DocumentType } from '@/features/patient/PatientSessionContext';
import { StepProgressIndicator } from '@/components/ui/StepProgressIndicator';
import { MockDocumentProvider } from '@/services/documents/MockDocumentProvider';

type ScanState = 'idle' | 'scanning' | 'processing' | 'scanned';

const DOCUMENT_OPTIONS: { id: DocumentType; label: string; labelHindi: string; icon: React.ReactNode }[] = [
  { id: 'prescription', label: 'Prescription', labelHindi: 'पिछली दवाई की पर्ची', icon: <FileText className="w-8 h-8" /> },
  { id: 'lab_report', label: 'Lab Report', labelHindi: 'जांच रिपोर्ट', icon: <FileSearch className="w-8 h-8" /> },
  { id: 'discharge_summary', label: 'Discharge Summary', labelHindi: 'डिस्चार्ज सारांश', icon: <FileText className="w-8 h-8" /> },
  { id: 'opd_slip', label: 'OPD Slip', labelHindi: 'पिछली ओपीडी पर्ची', icon: <FileText className="w-8 h-8" /> },
  { id: 'other', label: 'Other', labelHindi: 'अन्य', icon: <FileText className="w-8 h-8" /> },
];

export default function Scan() {
  const navigate = useNavigate();
  const { language, documentIntake, setCurrentDocumentType, addDocument, removeDocument, completeDocumentIntake } = usePatientSession();

  const [scanState, setScanState] = useState<ScanState>('idle');
  const [scanProgress, setScanProgress] = useState(0);

  const selectedType = documentIntake.currentDocumentType;

  // Cleanup effect just in case we unmount during a scan
  useEffect(() => {
    return () => {
      setScanState('idle');
      setScanProgress(0);
    };
  }, []);

  const handleDocumentSelect = (type: DocumentType) => {
    if (scanState === 'idle' || scanState === 'scanned') {
      setCurrentDocumentType(type);
      setScanState('idle');
    }
  };

  const handleScan = () => {
    if (!selectedType || scanState !== 'idle') return;

    setScanState('scanning');
    setScanProgress(0);

    const scanDuration = 1000;
    const processDuration = MockDocumentProvider.getProcessingDuration();

    // Mock scanning progress animation
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, scanDuration / 10);

    // Transition to processing
    setTimeout(() => {
      setScanState('processing');
      // Transition to scanned
      setTimeout(() => {
        const mockDoc = MockDocumentProvider.getMockDocument(selectedType);
        addDocument(mockDoc);
        setScanState('scanned');
        setCurrentDocumentType(null); // Reset selection after successful scan
      }, processDuration);
    }, scanDuration);
  };

  // BottomBar proxy methods
  const handleContinueProxy = () => {
    if (documentIntake.completed && documentIntake.documents.length === 0) {
      navigate('/patient/review');
    } else if (documentIntake.documents.length > 0) {
      navigate('/patient/documents/review');
    }
  };

  const handleBackProxy = () => {
    navigate('/patient/allergies');
  };

  return (
    <div className="w-full">
      <button id="scan-continue-btn" className="hidden" onClick={handleContinueProxy} />
      <button id="scan-back-btn" className="hidden" onClick={handleBackProxy} />

      <StepProgressIndicator
        current={15}
        total={24}
        title={language === 'hi' ? 'दस्तावेज़ स्कैन' : language === 'mr' ? 'कागदपत्रे स्कॅन' : 'DOCUMENT SCAN'}
      />

      <div className="max-w-7xl mx-auto px-6 pt-6 pb-32">
        <div className="mb-6 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center shrink-0">
            <ScanLine className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-primary leading-tight mb-1">
              {language === 'hi' ? 'अपने पुराने दस्तावेज़ स्कैन करें' : 'Scan Your Previous Documents'}
            </h2>
            <p className="text-slate-500 text-base">
              {language === 'hi'
                ? 'अगर आपके पास पिछली पर्ची या जांच की रिपोर्ट है, तो उसे यहाँ स्कैन कर सकते हैं।'
                : 'If you have a previous prescription or medical report, you can scan it here.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_380px] gap-8">
          
          {/* LEFT: Scanning Area */}
          <div className="space-y-6">
            
            {/* Document Types */}
            <div className="grid grid-cols-3 gap-3">
              {DOCUMENT_OPTIONS.map((opt) => {
                const isSelected = selectedType === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => handleDocumentSelect(opt.id)}
                    disabled={scanState === 'scanning' || scanState === 'processing'}
                    className={`
                      relative flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-200 text-center min-h-[120px]
                      ${isSelected
                        ? 'border-[#0D9488] bg-[#F0FDF9]'
                        : 'border-slate-200 bg-white hover:border-[#0D9488]/30 hover:bg-slate-50'}
                      ${(scanState === 'scanning' || scanState === 'processing') && !isSelected ? 'opacity-50 cursor-not-allowed' : ''}
                    `}
                  >
                    {isSelected && (
                      <div className="absolute top-2 right-2 text-[#0D9488]">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                    <div className={`mb-2 ${isSelected ? 'text-[#0D9488]' : 'text-slate-500'}`}>
                      {opt.icon}
                    </div>
                    <span className={`text-sm font-bold mb-1 ${isSelected ? 'text-[#0D9488]' : 'text-slate-700'}`}>
                      {language === 'hi' ? opt.labelHindi : opt.label}
                    </span>
                    <span className={`text-xs ${isSelected ? 'text-[#0D9488]/80' : 'text-slate-500'}`}>
                      {language === 'hi' ? opt.label : opt.labelHindi}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Scanner Frame */}
            <div className={`relative w-full h-[400px] border-4 rounded-3xl overflow-hidden flex flex-col items-center justify-center transition-colors duration-300 ${
              scanState === 'idle' || scanState === 'scanned' ? 'border-dashed border-slate-300 bg-slate-50' :
              scanState === 'scanning' ? 'border-solid border-[#0D9488] bg-[#F0FDF9]' :
              'border-solid border-primary bg-slate-100'
            }`}>
              
              {(scanState === 'idle' || scanState === 'scanned') && (
                <div className="text-center text-slate-500 space-y-4">
                  <ScanLine className="w-16 h-16 mx-auto opacity-50" />
                  <div>
                    <p className="text-xl font-bold">{language === 'hi' ? 'दस्तावेज़ यहाँ रखें' : 'Place your document here'}</p>
                    <p className="text-sm opacity-80 mt-1">Select a document type above and tap scan</p>
                  </div>
                </div>
              )}

              {scanState === 'scanning' && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <FileText className="w-24 h-24 text-slate-300" />
                  </div>
                  <div 
                    className="absolute top-0 left-0 w-full h-1 bg-[#0D9488] shadow-[0_0_15px_#0D9488] transition-all duration-[100ms] ease-linear"
                    style={{ top: `${scanProgress}%` }}
                  />
                  <div className="absolute bottom-6 left-0 w-full text-center">
                    <div className="inline-block bg-white/90 backdrop-blur px-6 py-2 rounded-full shadow-sm text-[#0D9488] font-bold animate-pulse">
                      {language === 'hi' ? 'आपका दस्तावेज़ स्कैन हो रहा है...' : 'Scanning your document...'}
                    </div>
                  </div>
                </>
              )}

              {scanState === 'processing' && (
                <div className="text-center text-primary space-y-4">
                  <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                  <div className="font-bold">
                    {language === 'hi' ? 'दस्तावेज़ समझा जा रहा है...' : 'Reading your document...'}
                  </div>
                </div>
              )}

            </div>

            {/* Scan Action */}
            <div className="flex justify-center">
              <button
                onClick={handleScan}
                disabled={!selectedType || scanState === 'scanning' || scanState === 'processing'}
                className={`
                  px-12 py-4 rounded-2xl font-bold text-xl flex items-center gap-3 transition-colors shadow-lg
                  ${!selectedType || scanState === 'scanning' || scanState === 'processing'
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-[#0D9488] text-white hover:bg-[#0B8070]'}
                `}
              >
                <ScanLine className="w-6 h-6" />
                {language === 'hi' ? 'दस्तावेज़ स्कैन करें' : 'Scan Document'}
              </button>
            </div>
            
            <div className="flex justify-center mt-6">
              <button
                onClick={() => {
                  completeDocumentIntake(true);
                  navigate('/patient/review');
                }}
                className="px-6 py-3 rounded-xl font-bold text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200 transition-colors"
              >
                {language === 'hi' ? 'मेरे पास कोई दस्तावेज़ नहीं है' : "I don't have any documents"}
              </button>
            </div>
          </div>

          {/* RIGHT: Scanned Documents List */}
          <div className="bg-slate-50 border border-slate-200 rounded-3xl p-6 flex flex-col h-full max-h-[700px] overflow-hidden">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-[#0D9488]" />
              {language === 'hi' ? 'स्कैन किए गए दस्तावेज़' : 'Scanned Documents'}
              <span className="ml-auto bg-white border border-slate-200 px-2 py-1 rounded-md text-sm text-slate-500">
                {documentIntake.documents.length}
              </span>
            </h3>

            <div className="flex-1 overflow-y-auto pr-2 space-y-3">
              {documentIntake.documents.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-400 p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl">
                  <FileSearch className="w-12 h-12 mb-3 opacity-50" />
                  <p className="font-medium text-sm">
                    {language === 'hi' ? 'अभी कोई दस्तावेज़ नहीं जोड़ा गया है' : 'No documents added yet'}
                  </p>
                </div>
              ) : (
                documentIntake.documents.map((doc) => (
                  <div key={doc.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F0FDF9] text-[#0D9488] flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">
                        {language === 'hi' ? doc.titleHindi : doc.title}
                      </p>
                      <p className="text-xs text-slate-500 truncate">{doc.fileName}</p>
                      <div className="flex items-center gap-1 mt-1 text-[#0D9488] text-xs font-semibold">
                        <CheckCircle2 className="w-3 h-3" /> Scanned
                      </div>
                    </div>
                    <button
                      onClick={() => removeDocument(doc.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Privacy notice */}
            <div className="mt-4 pt-4 border-t border-slate-200 flex items-start gap-2 text-slate-500 text-xs">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <p>
                {language === 'hi'
                  ? 'आपके दस्तावेज़ केवल इस परामर्श के लिए दिखाए जाएंगे।'
                  : 'Your documents are shown only for this consultation.'}
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
