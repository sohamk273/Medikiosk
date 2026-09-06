import { Outlet } from 'react-router-dom';
import { KioskHeader } from './KioskHeader';
import { KioskBottomBar } from './KioskBottomBar';

export function KioskLayout() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <KioskHeader />
      
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto w-full pb-24">
          <Outlet />
        </div>
      </main>

      <KioskBottomBar />
    </div>
  );
}
