import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ClipboardList, Search, FilePlus2, Eye, 
  CheckCircle2, Archive, X, Loader2
} from 'lucide-react';
import { MockClinicalReportProvider, type ClinicalReportType } from '@/services/doctor/MockClinicalReportProvider';
import { MockDoctorCaseProvider, type DoctorCase } from '@/services/doctor/MockDoctorCaseProvider';

export default function ClinicalReports() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string>('All');
  
  // Generate Modal State
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [reportType, setReportType] = useState<ClinicalReportType>('consultation-summary');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);

  const allReports = MockClinicalReportProvider.getReports();
  const cases = MockDoctorCaseProvider.getCases();

  const stats = useMemo(() => {
    return {
      total: allReports.length,
      generated: allReports.filter(r => r.status === 'generated').length,
      reviewed: allReports.filter(r => r.status === 'reviewed').length,
      archived: MockClinicalReportProvider.getArchivedReports().length,
      drafts: allReports.filter(r => r.status === 'draft' || r.status === 'generating').length
    };
  }, [allReports]);

  const filteredReports = useMemo(() => {
    let result = activeFilter === 'Archived' 
      ? MockClinicalReportProvider.getArchivedReports()
      : allReports;

    if (activeFilter !== 'All' && activeFilter !== 'Archived') {
      const typeMap: Record<string, string> = {
        'Consultation Summary': 'consultation-summary',
        'Prescription': 'prescription',
        'AYUSH Assessment': 'ayush-assessment',
        'Patient History': 'patient-history',
        'Case Summary': 'case-summary'
      };
      if (typeMap[activeFilter]) {
        result = result.filter(r => r.reportType === typeMap[activeFilter]);
      }
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(r => 
        r.patientName.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.caseId.toLowerCase().includes(q) ||
        (r.diagnosis && r.diagnosis.toLowerCase().includes(q)) ||
        (r.chiefComplaint && r.chiefComplaint.toLowerCase().includes(q))
      );
    }

    return result;
  }, [allReports, activeFilter, searchQuery]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCaseId) return;

    setIsGenerating(true);
    setGenerationStep(1); // Collecting
    
    // Simulate pipeline steps visually before provider finishes
    setTimeout(() => setGenerationStep(2), 600); // Preparing
    setTimeout(() => setGenerationStep(3), 1200); // Formatting
    
    try {
      const reportId = await MockClinicalReportProvider.generateReport(selectedCaseId, reportType);
      setGenerationStep(4); // Ready
      setTimeout(() => {
        setIsGenerating(false);
        setShowGenerateModal(false);
        setSelectedCaseId('');
        navigate(`/doctor/reports/${reportId}`);
      }, 500);
    } catch (err) {
      setIsGenerating(false);
      alert('Failed to generate report.');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'reviewed':
        return <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-emerald-100"><CheckCircle2 className="w-3 h-3" /> Reviewed</span>;
      case 'archived':
        return <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-slate-200"><Archive className="w-3 h-3" /> Archived</span>;
      case 'generating':
        return <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-blue-100"><Loader2 className="w-3 h-3 animate-spin" /> Generating</span>;
      default:
        return <span className="inline-flex items-center gap-1 bg-teal-50 text-teal-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-teal-100">Generated</span>;
    }
  };

  const filters = ['All', 'Consultation Summary', 'Prescription', 'AYUSH Assessment', 'Patient History', 'Case Summary', 'Archived'];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-50">
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0">
        <div>
          <div className="flex items-center gap-2 text-slate-800">
            <ClipboardList className="w-6 h-6 text-teal-600" />
            <h1 className="text-xl font-bold">Clinical Reports</h1>
          </div>
          <p className="text-sm text-slate-500 font-medium mt-1">
            क्लिनिकल रिपोर्ट्स / View and manage finalized reports
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-bold text-slate-800">{new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
            <p className="text-xs text-slate-500">OPD Room 4</p>
          </div>
          <div className="h-8 w-px bg-slate-200" />
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-100">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-semibold">EMR Connected</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-auto p-6">
        {/* KPIs */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <button onClick={() => setActiveFilter('All')} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-left hover:border-teal-500 transition-colors">
            <p className="text-sm font-medium text-slate-500">TOTAL REPORTS</p>
            <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
          </button>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm font-medium text-slate-500">GENERATED</p>
            <p className="text-2xl font-bold text-slate-800">{stats.generated}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm font-medium text-slate-500">REVIEWED</p>
            <p className="text-2xl font-bold text-slate-800">{stats.reviewed}</p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <p className="text-sm font-medium text-slate-500">DRAFTS</p>
            <p className="text-2xl font-bold text-slate-800">{stats.drafts}</p>
          </div>
          <button onClick={() => setActiveFilter('Archived')} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-left hover:border-teal-500 transition-colors">
            <p className="text-sm font-medium text-slate-500">ARCHIVED</p>
            <p className="text-2xl font-bold text-slate-800">{stats.archived}</p>
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex-1 flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search patient, report ID, case ID, diagnosis..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm"
              />
            </div>
            <div className="flex overflow-x-auto bg-white border border-slate-200 rounded-lg p-1 shadow-sm hide-scrollbar">
              {filters.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    activeFilter === f 
                      ? 'bg-teal-50 text-teal-700' 
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <button 
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-2 bg-teal-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-teal-700 transition-colors shadow-sm shrink-0"
          >
            <FilePlus2 className="w-4 h-4" />
            Generate Report
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Report</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Patient / Case</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Diagnosis / Concern</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Generated</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                    <div className="flex flex-col items-center">
                      <ClipboardList className="w-12 h-12 text-slate-300 mb-3" />
                      <p className="text-base font-medium text-slate-700">No clinical reports found.</p>
                      <p className="text-sm mt-1">Try changing your search or filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReports.map(report => (
                  <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{report.id}</p>
                      <p className="text-xs font-medium text-slate-500 mt-0.5">{report.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-800">{report.patientName}</p>
                      <p className="text-xs text-slate-500 mt-0.5">Case: {report.caseId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700 truncate max-w-[200px]">
                        {report.diagnosis !== 'Not provided' ? report.diagnosis : report.chiefComplaint}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-700">{new Date(report.generatedAt).toLocaleDateString()}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{new Date(report.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(report.status)}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => navigate(`/doctor/reports/${report.id}`)}
                        className="flex items-center gap-2 text-teal-600 font-bold hover:text-teal-800 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Report
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2 text-teal-700 font-bold">
                <FilePlus2 className="w-5 h-5" />
                Generate Clinical Report
              </div>
              {!isGenerating && (
                <button onClick={() => setShowGenerateModal(false)} className="text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
            
            {isGenerating ? (
              <div className="p-10 flex flex-col items-center justify-center">
                <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-6" />
                <h3 className="text-lg font-bold text-slate-800 mb-6">Generating Report...</h3>
                <div className="w-full max-w-xs space-y-3 text-sm font-medium text-slate-500">
                  <div className="flex items-center justify-between">
                    <span className={generationStep >= 1 ? 'text-slate-800' : ''}>Collecting case data...</span>
                    {generationStep > 1 ? <CheckCircle2 className="w-4 h-4 text-teal-600" /> : generationStep === 1 ? <Loader2 className="w-4 h-4 animate-spin text-teal-600" /> : null}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={generationStep >= 2 ? 'text-slate-800' : ''}>Preparing report format...</span>
                    {generationStep > 2 ? <CheckCircle2 className="w-4 h-4 text-teal-600" /> : generationStep === 2 ? <Loader2 className="w-4 h-4 animate-spin text-teal-600" /> : null}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={generationStep >= 3 ? 'text-slate-800' : ''}>Formatting clinical information...</span>
                    {generationStep > 3 ? <CheckCircle2 className="w-4 h-4 text-teal-600" /> : generationStep === 3 ? <Loader2 className="w-4 h-4 animate-spin text-teal-600" /> : null}
                  </div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleGenerate} className="p-6">
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Patient / Case</label>
                    <select 
                      required
                      value={selectedCaseId}
                      onChange={(e) => setSelectedCaseId(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 text-sm font-medium"
                    >
                      <option value="">Select a finalized case...</option>
                      {cases.filter((c: DoctorCase) => c.status === 'completed' || c.status === 'closed').map((c: DoctorCase) => (
                        <option key={c.caseId} value={c.caseId}>
                          {c.caseId} - {c.patientName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1.5">Report Type</label>
                    <select 
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value as ClinicalReportType)}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 text-sm font-medium"
                    >
                      <option value="consultation-summary">Consultation Summary</option>
                      <option value="prescription">Prescription</option>
                      <option value="ayush-assessment">AYUSH Assessment</option>
                      <option value="patient-history">Patient History</option>
                      <option value="case-summary">Complete Case Summary</option>
                    </select>
                  </div>
                </div>

                <div className="mt-8 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowGenerateModal(false)}
                    className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!selectedCaseId}
                    className="px-5 py-2.5 text-sm font-bold text-white bg-teal-600 hover:bg-teal-700 disabled:opacity-50 rounded-lg transition-colors shadow-sm"
                  >
                    Generate Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
