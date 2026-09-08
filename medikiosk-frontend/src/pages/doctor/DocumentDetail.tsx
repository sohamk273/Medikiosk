import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, FileText, FileScan, CheckCircle2, 
  AlertCircle, Archive, Save, Loader2, PlayCircle, Eye
} from 'lucide-react';
import { MockDocumentProvider, type DocumentRecord } from '@/services/doctor/MockDocumentProvider';
import { Modal } from '@/components/ui/Modal';

export default function DocumentDetail() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [doc, setDoc] = useState<DocumentRecord | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<Record<string, string>>({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (documentId) {
      const found = MockDocumentProvider.getDocumentById(documentId);
      setDoc(found);
      if (found && found.extractedData && found.ocrStatus !== 'not-started') {
        setExtractedData(found.extractedData);
      }
    }
  }, [documentId]);

  if (!doc) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-screen bg-slate-50 p-6">
        <FileScan className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">Document Not Found</h2>
        <p className="text-slate-500 mt-2 text-center max-w-md">
          The requested document could not be found or has been removed.
        </p>
        <button 
          onClick={() => navigate('/doctor/documents')}
          className="mt-6 px-6 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-colors"
        >
          Back to Documents
        </button>
      </div>
    );
  }

  const handleStartOcr = async () => {
    setIsProcessing(true);
    await MockDocumentProvider.startOcr(doc.id);
    const updated = MockDocumentProvider.getDocumentById(doc.id);
    setDoc(updated);
    if (updated?.extractedData) {
      setExtractedData(updated.extractedData);
    }
    setIsProcessing(false);
  };

  const handleFieldChange = (key: string, value: string) => {
    setExtractedData(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveReview = () => {
    MockDocumentProvider.saveOcrReview(doc.id, extractedData);
    const updated = MockDocumentProvider.getDocumentById(doc.id);
    setDoc(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleArchive = () => {
    MockDocumentProvider.archiveDocument(doc.id);
    setShowArchiveModal(false);
    navigate('/doctor/documents');
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
      {/* Sticky Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between shrink-0 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/doctor/documents')}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold text-slate-800">{doc.documentType}</h1>
              {doc.status === 'review-required' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">
                  REVIEW REQUIRED
                </span>
              )}
              {doc.status === 'reviewed' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                  REVIEWED
                </span>
              )}
              {doc.status === 'archived' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200">
                  ARCHIVED
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 font-medium">
              <span>Patient: <button onClick={() => navigate(`/doctor/patient/${doc.patientId}`)} className="text-teal-600 hover:underline">{doc.patientName}</button></span>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span>Case: <button onClick={() => navigate(`/doctor/case/${doc.caseId}`)} className="text-teal-600 hover:underline">{doc.caseId}</button></span>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span>ID: {doc.id}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4 md:mt-0">
          {saveSuccess && (
            <span className="text-sm font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-3 py-2 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              Saved successfully
            </span>
          )}
          {doc.status !== 'archived' && (
            <>
              <button
                onClick={() => setShowArchiveModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 hover:text-red-600 transition-colors font-bold rounded-lg text-sm"
              >
                <Archive className="w-4 h-4" />
                Archive
              </button>
              <button
                onClick={handleSaveReview}
                disabled={doc.ocrStatus === 'not-started' || doc.ocrStatus === 'processing'}
                className="flex items-center gap-2 px-5 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                <Save className="w-4 h-4" />
                Save Review
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Two-Column Workspace */}
      <main className="flex-1 overflow-hidden p-6">
        <div className="flex h-full gap-6">
          
          {/* Left Panel: Preview & Metadata */}
          <div className="w-1/2 flex flex-col gap-6 overflow-y-auto pr-2 pb-12">
            
            {/* Synthetic Preview Box */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
              <div className="bg-slate-800 text-white px-4 py-3 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 font-bold text-sm">
                  <FileText className="w-4 h-4 text-slate-400" />
                  Document Preview
                </div>
                <div className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
                  Synthetic Data
                </div>
              </div>
              
              <div className="p-8 flex-1 bg-slate-50 relative min-h-[400px] flex items-center justify-center">
                {/* Mock Document Visual representation */}
                <div className="absolute inset-4 bg-white shadow-sm border border-slate-200 rounded p-6 overflow-hidden">
                  <div className="border-b-2 border-slate-800 pb-4 mb-6 flex justify-between items-end">
                    <div>
                      <h2 className="text-xl font-bold text-slate-800 uppercase tracking-tight">{doc.documentType}</h2>
                      <p className="text-sm text-slate-500 mt-1">MediKiosk Default Health Center</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="font-bold text-slate-700">Patient: {doc.patientName}</p>
                      <p className="text-slate-500">Date: {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-4 opacity-50 select-none">
                    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                    <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    
                    <div className="mt-8">
                       {doc.mockOcrText ? (
                         <p className="text-sm text-slate-400 font-mono whitespace-pre-wrap">{doc.mockOcrText}</p>
                       ) : (
                         <div className="border-t border-slate-100 pt-4 flex gap-8">
                           <div className="flex-1 space-y-2">
                             <div className="h-3 bg-slate-100 rounded w-full"></div>
                             <div className="h-3 bg-slate-100 rounded w-full"></div>
                             <div className="h-3 bg-slate-100 rounded w-2/3"></div>
                           </div>
                           <div className="flex-1 space-y-2">
                             <div className="h-3 bg-slate-100 rounded w-full"></div>
                             <div className="h-3 bg-slate-100 rounded w-4/5"></div>
                           </div>
                         </div>
                       )}
                    </div>
                  </div>
                  
                  {/* Overlay action */}
                  <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] flex items-center justify-center">
                    <button 
                      onClick={() => setShowPreviewModal(true)}
                      className="bg-slate-800 text-white px-6 py-3 rounded-lg font-bold shadow-xl hover:bg-slate-700 transition-colors flex items-center gap-2"
                    >
                      <Eye className="w-5 h-5" />
                      Expand Preview
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata Card */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
              <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2 border-b border-slate-100 pb-3">
                Metadata
              </h3>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                <div>
                  <p className="text-slate-500 font-medium mb-1">File Name</p>
                  <p className="font-bold text-slate-800 break-all">{doc.fileName}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium mb-1">File Size</p>
                  <p className="font-bold text-slate-800">{doc.fileSize}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium mb-1">Uploaded On</p>
                  <p className="font-bold text-slate-800">{new Date(doc.uploadedAt).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-500 font-medium mb-1">Source</p>
                  <p className="font-bold text-slate-800">{doc.id.includes('UP') ? 'Manual Upload' : 'Patient Kiosk'}</p>
                </div>
              </div>
            </div>
            
          </div>

          {/* Right Panel: OCR Workspace */}
          <div className="w-1/2 flex flex-col overflow-hidden pb-12">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full overflow-hidden">
              <div className="bg-slate-50 border-b border-slate-200 px-5 py-4 flex justify-between items-center shrink-0">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Synthetic OCR Workspace</h3>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">Extraction review explicitly isolated from primary clinical data.</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md text-xs font-bold border border-blue-100 uppercase tracking-wider">
                  {doc.ocrStatus.replace('-', ' ')}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-white">
                {doc.ocrStatus === 'not-started' && !isProcessing && (
                  <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto">
                    <div className="bg-blue-50 p-4 rounded-full mb-6">
                      <FileScan className="w-12 h-12 text-blue-500" />
                    </div>
                    <h4 className="text-xl font-bold text-slate-800 mb-2">OCR Not Processed</h4>
                    <p className="text-slate-500 mb-8 text-sm leading-relaxed">
                      Run synthetic OCR processing on this demo document to simulate field extraction.
                    </p>
                    <button
                      onClick={handleStartOcr}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      <PlayCircle className="w-5 h-5" />
                      Start OCR Simulation
                    </button>
                  </div>
                )}

                {isProcessing && (
                  <div className="h-full flex flex-col items-center justify-center text-center">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-6" />
                    <h4 className="text-lg font-bold text-slate-800 mb-2">Simulating OCR Processing...</h4>
                    <div className="w-64 space-y-2 text-sm text-slate-500 font-medium mt-4">
                      <div className="flex items-center justify-between">
                        <span>Reading document...</span>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Extracting fields...</span>
                        <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    </div>
                  </div>
                )}

                {(doc.ocrStatus === 'completed' || doc.ocrStatus === 'reviewed') && !isProcessing && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div>
                        <p className="text-sm font-bold text-slate-700">Overall Confidence</p>
                        <p className={`text-2xl font-black ${doc.ocrConfidence && doc.ocrConfidence < 80 ? 'text-red-600' : 'text-emerald-600'}`}>
                          {doc.ocrConfidence}%
                        </p>
                      </div>
                      {doc.ocrConfidence && doc.ocrConfidence < 80 && (
                        <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg text-sm font-bold">
                          <AlertCircle className="w-5 h-5" />
                          Review strongly recommended
                        </div>
                      )}
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-bold text-slate-800 border-b border-slate-100 pb-2">Extracted Fields</h4>
                      {Object.entries(extractedData).map(([key, value]) => {
                        // Generate a synthetic sub-confidence for visual realism
                        const subConf = doc.ocrConfidence ? Math.min(99, Math.max(50, doc.ocrConfidence + (key.length % 5) * 4 - 8)) : 85;
                        const isLowConf = subConf < 80;
                        
                        return (
                          <div key={key} className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm focus-within:ring-2 focus-within:ring-teal-500 focus-within:border-transparent transition-all">
                            <div className="flex justify-between items-center mb-1">
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">{key}</label>
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isLowConf ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'}`}>
                                {subConf}% CONF
                              </span>
                            </div>
                            <input 
                              type="text"
                              value={value}
                              onChange={(e) => handleFieldChange(key, e.target.value)}
                              disabled={doc.status === 'archived'}
                              className="w-full font-medium text-slate-800 bg-transparent outline-none focus:bg-slate-50 rounded p-1 -ml-1 transition-colors"
                            />
                          </div>
                        );
                      })}
                    </div>
                    
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl text-sm mt-8 flex gap-3">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <div>
                        <strong>Safety Notice:</strong> Edits saved here correct the OCR record ONLY. They <strong>do not</strong> update the Patient's demographics, primary Case Assessment, or Diagnosis.
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Preview Modal */}
      {showPreviewModal && (
        <Modal
          open={showPreviewModal}
          title={doc.fileName}
          onClose={() => setShowPreviewModal(false)}
        >
          <div className="bg-slate-100 p-8 rounded-lg flex items-center justify-center min-h-[500px] border border-slate-200 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-yellow-500 text-yellow-900 font-bold px-3 py-1 rounded text-xs uppercase tracking-wider shadow-sm z-10">
              Demo Preview - Synthetic Data
            </div>
            <div className="bg-white p-10 shadow-xl rounded-sm w-full max-w-2xl min-h-[600px]">
              <div className="text-center border-b-2 border-slate-800 pb-4 mb-8">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-widest">{doc.documentType}</h2>
                <p className="text-slate-500 mt-1 font-medium">MediKiosk Default Health Center</p>
              </div>
              
              <div className="flex justify-between text-sm mb-12 text-slate-700">
                <div>
                  <p><strong>Patient Name:</strong> {doc.patientName}</p>
                  <p><strong>Case Reference:</strong> {doc.caseId}</p>
                </div>
                <div className="text-right">
                  <p><strong>Date:</strong> {new Date(doc.uploadedAt).toLocaleDateString()}</p>
                  <p><strong>Document ID:</strong> {doc.id.split('-').pop()}</p>
                </div>
              </div>

              <div className="space-y-6">
                {Object.entries(doc.extractedData || {}).map(([k, v]) => (
                  <div key={k} className="flex border-b border-slate-100 pb-2">
                    <span className="w-1/3 font-bold text-slate-600">{k}</span>
                    <span className="w-2/3 text-slate-800">{v as React.ReactNode}</span>
                  </div>
                ))}
              </div>
              
              <div className="mt-16 text-center text-slate-400 text-xs italic">
                -- End of synthetic document --
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Archive Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl p-6">
            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <Archive className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Archive Document?</h3>
            <p className="text-slate-600 mb-6">
              This document will be removed from the active lists but retained in the system. Are you sure you want to proceed?
            </p>
            <div className="flex gap-3 justify-end">
              <button 
                onClick={() => setShowArchiveModal(false)}
                className="px-5 py-2.5 font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleArchive}
                className="px-5 py-2.5 font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
              >
                Archive Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
