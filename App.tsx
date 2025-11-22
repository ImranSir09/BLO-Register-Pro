
import React, { useState } from 'react';
import { AppProviders, ToastContainer } from './contexts/AppContexts';
import Header from './components/Header';
import BottomNav from './components/BottomNav';
import Dashboard from './pages/Dashboard';
import Households from './pages/Households';
import Elections from './pages/Elections';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import AIAssistant from './pages/AIAssistant';
import type { Page } from './types';

const App: React.FC = () => {
  const [activePage, setActivePage] = useState<Page>('Dashboard');

  const renderPage = () => {
    switch (activePage) {
      case 'Dashboard': return <Dashboard />;
      case 'Census': return <Households />;
      case 'Elections': return <Elections />;
      case 'Reports': return <Reports />;
      case 'Settings': return <Settings />;
      case 'AIAssistant': return <AIAssistant />;
      default: return <Dashboard />;
    }
  };
  
  // Removed pb-24 as nav is now static. Added relative for absolute positioning of children (like FABs).
  const mainClasses = `flex-grow overflow-y-auto relative hide-scrollbar`;

  return (
    <AppProviders>
      <div className="min-h-screen bg-slate-950 flex justify-center md:items-center md:p-8">
        {/* Device simulation container */}
        <div className="flex flex-col h-screen w-full md:h-[850px] md:w-[400px] md:rounded-[2.5rem] md:border-[12px] md:border-slate-900 bg-slate-900 font-sans shadow-2xl overflow-hidden relative ring-1 ring-white/5">
          {/* Mobile Notch simulation (Desktop only) */}
          <div className="hidden md:block absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-slate-900 rounded-b-3xl z-50 border-b border-r border-l border-white/5"></div>
          
          <Header />
          <main className={mainClasses}>
            {renderPage()}
          </main>
          
          {/* Floating Assistant Button logic can go here if needed, or inside pages */}

          <BottomNav activePage={activePage} setActivePage={setActivePage} />
          <ToastContainer />
          
          {/* iOS Home Indicator simulation (Desktop only) */}
           <div className="hidden md:block absolute bottom-1 left-1/2 -translate-x-1/2 w-32 h-1 bg-slate-700 rounded-full z-50"></div>
        </div>
      </div>
      
      {/* Scrollbar hiding styles */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </AppProviders>
  );
};

export default App;
