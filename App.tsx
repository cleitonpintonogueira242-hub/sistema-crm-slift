import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { Trips } from './pages/Trips';
import { Team } from './pages/Team';
import { WeekendAwards } from './pages/WeekendAwards';
import { DriverFreight } from './pages/DriverFreight';
import { Settings } from './pages/Settings';

// Simple Router implementation based on state
const AppContent: React.FC = () => {
  const [activePage, setActivePage] = useState('dashboard');

  const renderPage = () => {
    switch(activePage) {
      case 'dashboard': return <Dashboard />;
      case 'trips': return <Trips />;
      case 'team': return <Team />;
      case 'driver_freight': return <DriverFreight />;
      case 'weekend_awards': return <WeekendAwards />;
      case 'settings': return <Settings />;
      case 'vehicles': return <Team />; 
      case 'finance': return <div className="ml-64 p-8 text-center text-slate-500 mt-20">Módulo Financeiro Detalhado (Em Breve)</div>;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-navy-50">
      <Sidebar activePage={activePage} setActivePage={setActivePage} />
      <main className="flex-1">
        {renderPage()}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}