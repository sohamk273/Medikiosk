import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IdCard, Calendar, Users, Smartphone, MapPin, Languages, Edit2, ShieldCheck, Lock } from 'lucide-react';
import { usePatientSession } from '@/features/patient/PatientSessionContext';
import { AudioGuidanceBanner } from '@/components/kiosk/AudioGuidanceBanner';
import { Modal } from '@/components/ui/Modal';

export default function Profile() {
  const navigate = useNavigate();
  const { patient, identificationMethod, language } = usePatientSession();

  const [abhaEditModalOpen, setAbhaEditModalOpen] = useState(false);

  /**
   * Called when the user taps "Edit" on a core demographic card.
   * - ABHA patients: show an informational modal (no navigation, no browser alert).
   * - New / OPD patients: navigate to /patient/register to re-enter their data.
   */
  const handleEditDemographics = () => {
    if (identificationMethod === 'abha') {
      setAbhaEditModalOpen(true);
    } else {
      // New patient or OPD — their data was manually entered, so it's freely editable.
      navigate('/patient/register');
    }
  };

  const handleEditLanguage = () => {
    navigate('/patient/language');
  };

  if (!patient) return null;

  const isAbha = identificationMethod === 'abha';

  return (
    <>
      <div className="w-full max-w-7xl mx-auto pt-6 px-4 pb-32">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-4xl font-bold text-primary mb-2">
              Tell Us About Yourself / <span className="font-devanagari">अपने बारे में बताएं</span>
            </h2>
            <p className="text-lg text-slate-600">
              Verify your demographic details for your OPD registration slip. / अपनी पर्ची के लिए विवरण की पुष्टि करें।
            </p>
          </div>
          <div className="bg-[#CCFBF1] text-[#0D9488] px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-[10px]">✓</span>
            Self-Check Verification Mode
          </div>
        </div>

        <AudioGuidanceBanner
          englishText="Audio prompt: Please verify that your name and details are correct. Tap Edit to change."
          regionalText="कृपया जांचें कि आपका नाम और पता सही है। बदलने के लिए किसी भी कार्ड पर 'बदलें (Edit)' दबाएं।"
        />

        <div className="grid grid-cols-3 gap-6 mt-8">
          {/* Full Name */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between h-56">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-slate-500 font-bold text-sm uppercase tracking-wide">
                <IdCard className="w-5 h-5" /> FULL NAME / पूरा नाम
              </div>
              {isAbha && (
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">
                  ABHA Profile
                </span>
              )}
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary">{patient.name}</h3>
              <p className="text-slate-500 font-devanagari text-lg">{patient.name}</p>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-[#059669] font-bold text-sm flex items-center gap-1">
                <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-[10px]">✓</span>
                {/* Only say "ABHA Verified" when the session was established via ABHA — no Aadhaar claim */}
                {isAbha ? 'ABHA Verified' : 'Manual Entry'}
              </span>
              <button
                onClick={handleEditDemographics}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors"
              >
                {isAbha ? <Lock className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                Edit / बदलें
              </button>
            </div>
          </div>

          {/* Age */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between h-56">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-slate-500 font-bold text-sm uppercase tracking-wide">
                <Calendar className="w-5 h-5" /> AGE &amp; DOB / उम्र व जन्मतिथि
              </div>
              {parseInt(patient.age) >= 60 && (
                <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">Senior Citizen</span>
              )}
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary">
                {patient.age} Years <span className="text-xl font-normal text-slate-500">/ {patient.age} वर्ष</span>
              </h3>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-[#059669] font-bold text-sm flex items-center gap-1">
                <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-[10px]">+</span>
                {parseInt(patient.age) >= 60 ? 'Ayush OPD Priority' : 'Standard Ward'}
              </span>
              <button
                onClick={handleEditDemographics}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors"
              >
                {isAbha ? <Lock className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                Edit / बदलें
              </button>
            </div>
          </div>

          {/* Gender */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between h-56">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-slate-500 font-bold text-sm uppercase tracking-wide">
                <Users className="w-5 h-5" /> GENDER / लिंग
              </div>
              <div className="w-3 h-3 rounded-full bg-[#0D9488]" />
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary flex items-center gap-2">
                {patient.gender === 'Male' ? '♂' : patient.gender === 'Female' ? '♀' : '⚧'}
                {patient.gender}{' '}
                <span className="text-xl font-normal text-slate-500">
                  / {patient.gender === 'Male' ? 'पुरुष' : patient.gender === 'Female' ? 'महिला' : 'अन्य'}
                </span>
              </h3>
              <p className="text-slate-500 text-sm mt-1">Clinical Record: {patient.gender.charAt(0)}-{patient.age}</p>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-slate-500 font-bold text-sm">General OPD Ward</span>
              <button
                onClick={handleEditDemographics}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors"
              >
                {isAbha ? <Lock className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                Edit / बदलें
              </button>
            </div>
          </div>

          {/* Mobile */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between h-56">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-slate-500 font-bold text-sm uppercase tracking-wide">
                <Smartphone className="w-5 h-5" /> MOBILE NUMBER / मोबाइल
              </div>
              <span className="bg-[#CCFBF1] text-[#0D9488] px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                ✓ Demo Verified
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary">
                +91 {patient.mobile.slice(0, 5)} {patient.mobile.slice(5)}
              </h3>
              <p className="text-slate-500 text-sm mt-1">SMS Slip &amp; WhatsApp Rx Active</p>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-[#059669] font-bold text-sm flex items-center gap-1">
                <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-[10px]">💬</span>
                SMS Alerts ON
              </span>
              <button
                onClick={handleEditDemographics}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors"
              >
                {isAbha ? <Lock className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                Edit / बदलें
              </button>
            </div>
          </div>

          {/* District & State */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between h-56">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-slate-500 font-bold text-sm uppercase tracking-wide">
                <MapPin className="w-5 h-5" /> DISTRICT &amp; STATE / जिला
              </div>
              <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold">PIN: 415001</span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary">
                {patient.district || 'Pune'}, {patient.state || 'Maharashtra'}
              </h3>
              <p className="text-slate-500 font-devanagari text-lg">सतारा, महाराष्ट्र (पश्चिम भाग)</p>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-slate-500 font-bold text-sm flex items-center gap-1">
                🏢 District Civil Hospital OPD
              </span>
              <button
                onClick={handleEditDemographics}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors"
              >
                {isAbha ? <Lock className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                Edit / बदलें
              </button>
            </div>
          </div>

          {/* Language */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between h-56">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 text-slate-500 font-bold text-sm uppercase tracking-wide">
                <Languages className="w-5 h-5" /> LANGUAGE / बातचीत की भाषा
              </div>
              <span className="bg-[#CCFBF1] text-[#0D9488] px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                🎙️ Voice Active
              </span>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-primary">
                {language === 'mr' ? 'मराठी (Marathi)' : language === 'hi' ? 'हिन्दी (Hindi)' : 'English'} / हिन्दी
              </h3>
              <p className="text-slate-500 text-sm mt-1">Doctor consultation translation ready</p>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-[#059669] font-bold text-sm flex items-center gap-1">
                🎙️ Voice Input Enabled
              </span>
              {/* Language is always changeable regardless of identification method */}
              <button
                onClick={handleEditLanguage}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors"
              >
                🔄 Change / बदलें
              </button>
            </div>
          </div>
        </div>

        {/* Bottom confirmation prompt */}
        <div className="mt-8 bg-[#F0FDF4] border border-[#DCFCE7] rounded-3xl p-6 flex items-center gap-4">
          <div className="w-12 h-12 bg-[#059669] text-white rounded-full flex items-center justify-center shrink-0">
            <span className="text-2xl font-bold">👍</span>
          </div>
          <div>
            <h3 className="text-xl font-bold text-primary">
              Everything looks correct? Tap 'Continue' below to describe your health problem.
            </h3>
            <p className="text-slate-600 font-devanagari">
              सब कुछ सही है? अपनी स्वास्थ्य समस्या के बारे में बताने के लिए 'आगे बढ़ें' दबाएं।
            </p>
          </div>
        </div>
      </div>

      {/* ABHA Edit Protection Modal */}
      <Modal
        open={abhaEditModalOpen}
        onClose={() => setAbhaEditModalOpen(false)}
        title={
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-primary">
                ABHA Profile Linked
              </h3>
              <p className="text-slate-500 text-sm font-devanagari mt-0.5">
                ABHA प्रोफ़ाइल से जुड़ा हुआ
              </p>
            </div>
          </div>
        }
        footer={
          <button
            onClick={() => setAbhaEditModalOpen(false)}
            className="w-full bg-primary text-white py-4 rounded-2xl text-xl font-bold hover:bg-primary/90 transition-colors"
          >
            Understood / समझ गया
          </button>
        }
      >
        <div className="space-y-4">
          <p className="text-slate-700 text-lg leading-relaxed">
            Your ABHA-linked identity details are verified and{' '}
            <strong>cannot be changed here.</strong>{' '}
            Please update them through your ABHA profile.
          </p>
          <p className="text-slate-500 font-devanagari text-base leading-relaxed">
            आपकी ABHA से जुड़ी पहचान जानकारी सत्यापित है और यहाँ बदली नहीं जा सकती।
            कृपया अपनी ABHA प्रोफ़ाइल के माध्यम से इसे अपडेट करें।
          </p>
          <div className="bg-blue-50 rounded-2xl px-4 py-3 text-blue-700 text-sm flex items-start gap-2">
            <span className="mt-0.5 shrink-0">ℹ️</span>
            <span>
              Visit <strong>healthid.ndhm.gov.in</strong> or the ABHA app to update your core identity details.
            </span>
          </div>
        </div>
      </Modal>
    </>
  );
}
