import { RouterProvider } from 'react-router-dom';
import { router } from './app/router';
import { PatientSessionProvider } from './features/patient/PatientSessionContext';

function App() {
  return (
    <PatientSessionProvider>
      <RouterProvider router={router} />
    </PatientSessionProvider>
  );
}

export default App;
