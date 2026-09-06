import { QrCode, ScanBarcode, UserPlus } from 'lucide-react';

import { usePatientSession } from '@/features/patient/PatientSessionContext';
import { SelectionCard } from '@/components/kiosk/SelectionCard';

export default function Identify() {
  const { identificationMethod, setIdentificationMethod } = usePatientSession();

  const handleSelect = (method: 'abha' | 'opd' | 'new') => {
    setIdentificationMethod(method);
  };

  return (
    <div className="w-full max-w-5xl mx-auto pt-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
          2
        </div>
        <h2 className="text-2xl font-bold text-foreground">
          Choose Intake Method / पहचान का माध्यम चुनें
        </h2>
        <span className="ml-auto text-sm text-primary font-bold">Fast-Track OPD Entry</span>
      </div>

      <div className="grid grid-cols-3 gap-6 mb-8">
        <SelectionCard
          icon={<QrCode className="w-6 h-6" />}
          title="ABHA"
          regionalTitle="आभा खाता"
          subtitle="Scan the QR code on your ABHA Card or Ayushman App, or enter your 14-digit ABHA Number."
          badge="INSTANT 5S SYNC"
          selected={identificationMethod === 'abha'}
          onClick={() => handleSelect('abha')}
        />
        <SelectionCard
          icon={<ScanBarcode className="w-6 h-6" />}
          title="OPD Slip"
          regionalTitle="पर्ची"
          subtitle="Hold the barcode at the top of your paper OPD registration slip under the red glass scanner."
          badge="PAPER SLIP"
          selected={identificationMethod === 'opd'}
          onClick={() => handleSelect('opd')}
        />
        <SelectionCard
          icon={<UserPlus className="w-6 h-6" />}
          title="New Patient"
          regionalTitle="नया पंजीकरण"
          subtitle="First time visiting this hospital? Register easily using your 10-digit mobile number and name."
          badge="FIRST VISIT"
          selected={identificationMethod === 'new'}
          onClick={() => handleSelect('new')}
        />
      </div>

      <div className="bg-[#F0FDF4] rounded-2xl p-6 flex items-start gap-4 border border-[#DCFCE7] mt-8">
        <div className="w-12 h-12 rounded-full bg-[#34D399] flex items-center justify-center text-white shrink-0">
          <UserPlus className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-primary flex items-center gap-2">
            Need assistance? / मदद चाहिए? 
            <span className="bg-primary text-white text-xs px-2 py-1 rounded">Free Service</span>
          </h3>
          <p className="text-slate-600 mt-1">
            Hospital Sahayak Mr. Ramesh is on duty right next to Kiosk 2. Press the yellow "Call Sahayak" button below anytime, or ask for guidance in your preferred dialect.
          </p>
        </div>
      </div>
    </div>
  );
}
