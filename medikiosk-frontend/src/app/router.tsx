import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import { KioskLayout } from '@/components/layout/KioskLayout';
import { EMRLayout } from '@/components/layout/EMRLayout';

// Patient Pages
import Welcome from '@/pages/patient/Welcome';
import Language from '@/pages/patient/Language';
import Identify from '@/pages/patient/Identify';
import Abha from '@/pages/patient/Abha';
import Register from '@/pages/patient/Register';
import OpdSlip from '@/pages/patient/OpdSlip';
import Consent from '@/pages/patient/Consent';
import Profile from '@/pages/patient/Profile';
import ChiefComplaint from '@/pages/patient/ChiefComplaint';
import Voice from '@/pages/patient/Voice';
import VoiceProcessing from '@/pages/patient/VoiceProcessing';
import VoiceConfirmation from '@/pages/patient/VoiceConfirmation';
import Ayush from '@/pages/patient/Ayush';
import Medications from '@/pages/patient/Medications';
import Allergies from '@/pages/patient/Allergies';
import Scan from '@/pages/patient/documents/Scan';
import Review from '@/pages/patient/documents/Review';
import PatientReview from '@/pages/patient/Review';
import Submit from '@/pages/patient/Submit';
import Complete from '@/pages/patient/Complete';

// Doctor Pages
import Login from '@/pages/doctor/Login';
import Dashboard from '@/pages/doctor/Dashboard';
import Queue from '@/pages/doctor/Queue';
import Patients from '@/pages/doctor/Patients';
import Consultation from '@/pages/doctor/Consultation';
import Summary from '@/pages/doctor/patient/Summary';
import History from '@/pages/doctor/patient/History';
import PatientAyush from '@/pages/doctor/patient/Ayush';
import Documents from '@/pages/doctor/patient/Documents';
import Investigations from '@/pages/doctor/patient/Investigations';
import Prescription from '@/pages/doctor/patient/Prescription';
import Prakriti from '@/pages/doctor/patient/Prakriti';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/patient/language" replace />,
  },
  // Patient Kiosk Routes
  {
    path: '/patient',
    element: <KioskLayout />,
    children: [
      { index: true, element: <Welcome /> },
      { path: 'language', element: <Language /> },
      { path: 'identify', element: <Identify /> },
      { path: 'abha', element: <Abha /> },
      { path: 'register', element: <Register /> },
      { path: 'opd-slip', element: <OpdSlip /> },
      { path: 'consent', element: <Consent /> },
      { path: 'profile', element: <Profile /> },
      { path: 'chief-complaint', element: <ChiefComplaint /> },
      { path: 'voice', element: <Voice /> },
      { path: 'voice-processing', element: <VoiceProcessing /> },
      { path: 'voice-confirmation', element: <VoiceConfirmation /> },
      { path: 'ayush', element: <Ayush /> },
      { path: 'medications', element: <Medications /> },
      { path: 'allergies', element: <Allergies /> },
      { path: 'documents/scan', element: <Scan /> },
      { path: 'documents/review', element: <Review /> },
      { path: 'review', element: <PatientReview /> },
      { path: 'submit', element: <Submit /> },
      { path: 'complete', element: <Complete /> },
    ],
  },
  // Doctor EMR Routes
  {
    path: '/doctor',
    element: <EMRLayout />,
    children: [
      { index: true, element: <Navigate to="dashboard" replace /> },
      { path: 'login', element: <Login /> }, // In reality, login might not use EMRLayout, but for slice 1 placeholder it's fine
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'queue', element: <Queue /> },
      { path: 'patients', element: <Patients /> },
      { path: 'consultation', element: <Consultation /> },
      {
        path: 'patient/:id',
        children: [
          { index: true, element: <Navigate to="summary" replace /> },
          { path: 'summary', element: <Summary /> },
          { path: 'history', element: <History /> },
          { path: 'ayush', element: <PatientAyush /> },
          { path: 'documents', element: <Documents /> },
          { path: 'investigations', element: <Investigations /> },
          { path: 'prescription', element: <Prescription /> },
          { path: 'prakriti', element: <Prakriti /> },
        ]
      }
    ],
  }
]);
