import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Printer, Download, Archive, 
  CheckCircle2, AlertTriangle, FileText, Pill, Activity, User, ClipboardList 
} from 'lucide-react';
import { MockClinicalReportProvider, type ClinicalReport } from '@/services/doctor/MockClinicalReportProvider';

export default function ClinicalReportDetail() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState<ClinicalReport | undefined>();
  const [downloadMsg, setDownloadMsg] = useState(false);

  useEffect(() => {
    if (reportId) {
      setReport(MockClinicalReportProvider.getReportById(reportId));
    }
  }, [reportId]);

  if (!report) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center h-screen bg-slate-50 p-6">
        <FileText className="w-16 h-16 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-700">Report Not Found</h2>
        <p className="text-slate-500 mt-2 text-center max-w-md">
          The requested clinical report could not be found or has been removed.
        </p>
        <button 
          onClick={() => navigate('/doctor/reports')}
          className="mt-6 px-6 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-colors"
        >
          Back to Clinical Reports
        </button>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    setDownloadMsg(true);
    setTimeout(() => setDownloadMsg(false), 3000);
  };

  const handleReview = () => {
    MockClinicalReportProvider.markReportReviewed(report.id);
    setReport({ ...report, status: 'reviewed', reviewedAt: new Date().toISOString() });
  };

  const handleArchive = () => {
    if (confirm('Archive this report?\n\nArchived reports remain available for viewing but cannot be edited or act as active reports.')) {
      MockClinicalReportProvider.archiveReport(report.id);
      navigate('/doctor/reports');
    }
  };

  const getReportIcon = () => {
    switch(report.reportType) {
      case 'prescription': return <Pill className="w-5 h-5 text-teal-600" />;
      case 'ayush-assessment': return <Activity className="w-5 h-5 text-teal-600" />;
      case 'patient-history': return <User className="w-5 h-5 text-teal-600" />;
      case 'case-summary': return <ClipboardList className="w-5 h-5 text-teal-600" />;
      default: return <FileText className="w-5 h-5 text-teal-600" />;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50 print:bg-white print:overflow-visible">
      
      <style>
        {`
          @media print {
            body * {
              visibility: hidden;
            }
            #print-area, #print-area * {
              visibility: visible;
            }
            #print-area {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              padding: 0;
              margin: 0;
            }
            /* Hide the scrollbar space */
            ::-webkit-scrollbar {
              display: none;
            }
          }
        `}
      </style>

      {/* Sticky Header - Hidden during print */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row items-start md:items-center justify-between shrink-0 sticky top-0 z-10 shadow-sm print:hidden">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/doctor/reports')}
            className="p-2 -ml-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-3">
              {getReportIcon()}
              <h1 className="text-xl font-bold text-slate-800">{report.title}</h1>
              {report.status === 'archived' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                  ARCHIVED - READ ONLY
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-100 uppercase">
                  FINALIZED - READ ONLY
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 mt-1 text-sm text-slate-500 font-medium">
              <span>Patient: <button onClick={() => navigate(`/doctor/patient/${report.patientId}`)} className="text-teal-600 hover:underline">{report.patientName}</button></span>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span>Case: <button onClick={() => navigate(`/doctor/case/${report.caseId}`)} className="text-teal-600 hover:underline">{report.caseId}</button></span>
              <span className="w-1 h-1 bg-slate-300 rounded-full" />
              <span>ID: {report.id}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 mt-4 md:mt-0">
          {downloadMsg && (
            <span className="text-sm font-bold text-teal-600 flex items-center gap-1 bg-teal-50 px-3 py-2 rounded-lg mr-2 border border-teal-100">
              <CheckCircle2 className="w-4 h-4" />
              Report download prepared successfully
            </span>
          )}
          
          <button
            onClick={handleDownload}
            className="p-2 text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-colors rounded-lg"
            title="Download Report"
          >
            <Download className="w-5 h-5" />
          </button>
          
          <button
            onClick={handlePrint}
            className="p-2 text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-colors rounded-lg"
            title="Print / Preview"
          >
            <Printer className="w-5 h-5" />
          </button>

          {report.status !== 'archived' && (
            <button
              onClick={handleArchive}
              className="p-2 text-slate-500 bg-white border border-slate-200 hover:bg-red-50 hover:text-red-600 transition-colors rounded-lg"
              title="Archive Report"
            >
              <Archive className="w-5 h-5" />
            </button>
          )}

          {report.status === 'generated' && (
            <button
              onClick={handleReview}
              className="flex items-center gap-2 px-5 py-2 bg-teal-600 text-white font-bold rounded-lg hover:bg-teal-700 transition-colors text-sm shadow-sm"
            >
              <CheckCircle2 className="w-4 h-4" />
              Mark as Reviewed
            </button>
          )}
        </div>
      </header>

      {/* Scrollable Report Content */}
      <main className="flex-1 overflow-auto p-8 print:p-0">
        
        {/* Printable Area Container */}
        <div id="print-area" className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 p-12 print:border-none print:shadow-none print:w-full print:max-w-none">
          
          {/* Clinical Header */}
          <div className="border-b-2 border-slate-800 pb-6 mb-8 text-center relative">
             <div className="absolute top-0 right-0 text-right text-sm text-slate-500">
               <p><strong>Date:</strong> {new Date(report.generatedAt).toLocaleDateString()}</p>
               <p><strong>Report ID:</strong> {report.id}</p>
             </div>
             <h1 className="text-3xl font-black text-slate-800 uppercase tracking-widest">{report.title}</h1>
             <p className="text-slate-600 mt-2 font-medium">MediKiosk Health Center - {report.department}</p>
             <p className="text-slate-500 text-sm mt-1">Attending: {report.doctorName}</p>
          </div>

          {/* Safety Banner */}
          {report.redFlagTriggered && (
             <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl mb-8 flex items-start gap-3">
               <AlertTriangle className="w-6 h-6 shrink-0 mt-0.5" />
               <div>
                 <h4 className="font-bold text-red-900">ATTENTION REQUIRED</h4>
                 <p className="text-sm mt-1">A safety alert was triggered during patient intake. Please review the original case information before clinical action.</p>
               </div>
             </div>
          )}

          {/* Report Sections */}
          <div className="space-y-10 text-slate-800">
            
            {/* Standard Patient Info Section */}
            {(report.content.patientInformation || report.content.patientHistory) && (
              <section>
                <h3 className="text-lg font-bold border-b border-slate-200 pb-2 mb-4 uppercase tracking-wider text-slate-700">Patient Details</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-slate-50 p-4 rounded-lg border border-slate-100">
                   {Object.entries(report.content.patientInformation || {}).map(([k, v]) => (
                     <div key={k}>
                       <p className="text-slate-500 font-bold mb-1">{k}</p>
                       <p className="font-medium text-slate-800">{v}</p>
                     </div>
                   ))}
                   {Object.entries(report.content.patientHistory || {}).map(([k, v]) => (
                     <div key={k}>
                       <p className="text-slate-500 font-bold mb-1">{k}</p>
                       <p className="font-medium text-slate-800">{v}</p>
                     </div>
                   ))}
                </div>
              </section>
            )}

            {/* Diagnosis / Concern Summary */}
            {(report.diagnosis || report.chiefComplaint) && report.reportType !== 'patient-history' && (
              <section>
                <h3 className="text-lg font-bold border-b border-slate-200 pb-2 mb-4 uppercase tracking-wider text-slate-700">Clinical Focus</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {report.chiefComplaint && (
                    <div>
                      <p className="text-sm text-slate-500 font-bold mb-1">Chief Complaint</p>
                      <p className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-sm">{report.chiefComplaint}</p>
                    </div>
                  )}
                  {report.diagnosis && (
                    <div>
                      <p className="text-sm text-slate-500 font-bold mb-1">Diagnosis / Impression</p>
                      <p className="bg-teal-50 p-3 rounded-lg border border-teal-100 text-teal-900 font-bold text-sm">{report.diagnosis}</p>
                    </div>
                  )}
                </div>
              </section>
            )}

            {/* Clinical Assessment */}
            {report.content.clinicalAssessment && Object.keys(report.content.clinicalAssessment).length > 0 && (
              <section>
                <h3 className="text-lg font-bold border-b border-slate-200 pb-2 mb-4 uppercase tracking-wider text-slate-700">Clinical Assessment</h3>
                <div className="space-y-4">
                  {Object.entries(report.content.clinicalAssessment).map(([k, v]) => (
                    v !== 'Not provided' && (
                      <div key={k}>
                        <p className="text-sm text-slate-500 font-bold mb-1">{k}</p>
                        <p className="text-sm text-slate-800 whitespace-pre-wrap">{v}</p>
                      </div>
                    )
                  ))}
                </div>
              </section>
            )}

            {/* AYUSH Assessment */}
            {report.content.ayushAssessment && Object.keys(report.content.ayushAssessment).length > 0 && (
              <section>
                <h3 className="text-lg font-bold border-b border-slate-200 pb-2 mb-4 uppercase tracking-wider text-slate-700">AYUSH Assessment</h3>
                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                  {Object.entries(report.content.ayushAssessment).map(([k, v]) => (
                    <div key={k} className={k === 'Notes' ? 'col-span-2' : ''}>
                      <p className="text-sm text-slate-500 font-bold mb-1">{k}</p>
                      <p className="text-sm text-slate-800 whitespace-pre-wrap">{v}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Prescription */}
            {(report.reportType === 'prescription' || report.reportType === 'case-summary' || report.reportType === 'consultation-summary') && (
              <section>
                <h3 className="text-lg font-bold border-b border-slate-200 pb-2 mb-4 uppercase tracking-wider text-slate-700 flex items-center gap-2">
                  <Pill className="w-5 h-5 text-slate-400" /> Rx Prescription
                </h3>
                {report.content.prescriptions && report.content.prescriptions.length > 0 ? (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="px-4 py-3 font-bold text-slate-600">Medicine</th>
                          <th className="px-4 py-3 font-bold text-slate-600">Dosage</th>
                          <th className="px-4 py-3 font-bold text-slate-600">Frequency</th>
                          <th className="px-4 py-3 font-bold text-slate-600">Duration</th>
                          <th className="px-4 py-3 font-bold text-slate-600">Instructions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {report.content.prescriptions.map((p, i) => (
                          <tr key={i}>
                            <td className="px-4 py-3 font-bold text-slate-800">{p.medicineName}</td>
                            <td className="px-4 py-3 text-slate-600">{p.dosage}</td>
                            <td className="px-4 py-3 text-slate-600">{p.frequency}</td>
                            <td className="px-4 py-3 text-slate-600">{p.duration}</td>
                            <td className="px-4 py-3 text-slate-600">{p.instructions || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 italic">No medicines prescribed.</p>
                )}
              </section>
            )}

            {/* Follow Up */}
            {report.content.followUp && report.content.followUp.required && (
              <section>
                <h3 className="text-lg font-bold border-b border-slate-200 pb-2 mb-4 uppercase tracking-wider text-slate-700">Follow-up Plan</h3>
                <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                  <p className="text-sm text-blue-900 mb-2"><strong>Timeframe:</strong> {report.content.followUp.timeframe || 'Not specified'}</p>
                  <p className="text-sm text-blue-900"><strong>Instructions:</strong> {report.content.followUp.instructions || 'Not specified'}</p>
                </div>
              </section>
            )}
            
            {/* Associated Documents */}
            {report.content.documents && report.content.documents.length > 0 && (
              <section className="print:hidden">
                <h3 className="text-lg font-bold border-b border-slate-200 pb-2 mb-4 uppercase tracking-wider text-slate-700">Associated Documents</h3>
                <ul className="space-y-2">
                  {report.content.documents.map(doc => (
                    <li key={doc.id}>
                      <button 
                        onClick={() => navigate(`/doctor/documents/${doc.id}`)}
                        className="text-sm text-teal-600 hover:underline flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        {doc.fileName} ({doc.type})
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )}

          </div>

          {/* Footer Footer */}
          <div className="mt-16 pt-8 border-t border-slate-200 text-center text-slate-400 text-xs flex justify-between items-center">
            <p>Generated by MediKiosk EMR</p>
            <p>Page 1 of 1</p>
            <p><strong>Status:</strong> {report.status.toUpperCase()}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
