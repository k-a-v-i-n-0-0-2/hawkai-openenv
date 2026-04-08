import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Header from './Header';
import { useLocation } from 'react-router-dom';

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  
  // Routes without navigation
  const noNavRoutes = ['/login', '/name', '/details'];
  const showNav = !noNavRoutes.includes(location.pathname);

  if (!showNav) return <>{children}</>;

  return (
    <div className="min-h-screen bg-theme-bg overflow-x-hidden relative flex">
      {/* Desktop Sidebar (Fixed) */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        {/* Mobile/Tablet Header (Sticky) */}
        <Header />

        <main className="page-container safe-bottom">
          <div className="flex-1 flex flex-col animate-in fade-in slide-in-from-bottom-4 duration-500">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}
