
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Dashboard from './components/Dashboard';
import TrendingCharts from './components/TrendingCharts';
import MaintenanceSchedule from './components/MaintenanceSchedule';
import { usePlantData } from './hooks/usePlantData';
import AIDiagnosticsModal from './components/AIDiagnosticsModal';
import SystemsControl from './components/SystemsControl';
import { getAiEmergencyProcedure } from './services/geminiService';
import { PlantData } from './types';
import LoginModal from './components/LoginModal';


type Tab = 'dashboard' | 'trending' | 'maintenance' | 'systems';

// EOP Modal Component Definition
interface EOPModalProps {
  plantData: PlantData;
  onClose: () => void;
}
const EOPModal: React.FC<EOPModalProps> = ({ plantData, onClose }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [procedure, setProcedure] = React.useState('');

  React.useEffect(() => {
    const fetchProcedure = async () => {
      setIsLoading(true);
      const result = await getAiEmergencyProcedure(plantData);
      setProcedure(result);
      setIsLoading(false);
    };
    fetchProcedure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // An improved markdown to HTML converter
  const renderMarkdown = (text: string) => {
    let html = text;
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Numbered lists
    html = html.replace(/^\s*\d\.\s+(.*)/gm, '<li class="ml-4 mb-2">$1</li>');
    html = html.replace(/(\<li.*\>.*<\/li\>)/gs, '<ol class="list-decimal list-inside">$1</ol>');
    // Bullets (just in case)
    html = html.replace(/^\s*-\s+(.*)/gm, '<li class="ml-4">$1</li>');
    html = html.replace(/(?<!<ol.*>)(\<li.*\>.*<\/li\>)(?!<\/ol>)/gs, '<ul>$1</ul>');
    return { __html: html };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl border border-red-500/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-red-400">AI-Generated Emergency Procedure</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="bg-gray-900/50 p-4 rounded-md h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400"></div>
              <p className="mt-4 text-gray-300">Generating procedure based on current conditions...</p>
            </div>
          ) : (
            <div className="prose prose-invert text-gray-300" dangerouslySetInnerHTML={renderMarkdown(procedure)}></div>
          )}
        </div>
      </div>
    </div>
  );
};


const App: React.FC = () => {
  const { 
    plantData, 
    dataHistory, 
    alerts, 
    setControlRod, 
    acknowledgeAlerts,
    toggleCoolantPump,
    initiateGridSync,
    activateECCS,
    controlMode 
  } = usePlantData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEOPModalOpen, setIsEOPModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(true);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleAskAI = () => {
    setIsModalOpen(true);
  };

  const handleShowEOP = () => {
    setIsEOPModalOpen(true);
  };
  
  const handleLogin = (user: string, pass: string) => {
    // In a real application, this would be a call to a secure backend.
    if (user === 'operator' && pass === 'password123') {
        setIsAuthenticated(true);
        setIsLoginModalOpen(false);
        setLoginError(null);
    } else {
        setLoginError('Invalid credentials. Please try again.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsLoginModalOpen(true);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'systems':
        return <SystemsControl 
                  plantData={plantData}
                  onToggleCoolantPump={toggleCoolantPump}
                  onInitiateGridSync={initiateGridSync}
                  onActivateECCS={activateECCS}
                  controlMode={controlMode}
                  isAuthenticated={isAuthenticated}
                />;
      case 'trending':
        return <TrendingCharts dataHistory={dataHistory} />;
      case 'maintenance':
        return <MaintenanceSchedule plantData={plantData} isAuthenticated={isAuthenticated} />;
      case 'dashboard':
      default:
        return (
          <Dashboard
            plantData={plantData}
            alerts={alerts}
            onSetControlRod={setControlRod}
            onAcknowledgeAlerts={acknowledgeAlerts}
            onAskAI={handleAskAI}
            onShowEOP={handleShowEOP}
            isAuthenticated={isAuthenticated}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 font-sans">
      <Header 
        status={plantData.overallStatus} 
        eccsStatus={plantData.eccsStatus}
        eccsWaterLevel={plantData.eccsWaterLevel}
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab as Tab)}
        isAuthenticated={isAuthenticated}
        onLogout={handleLogout}
      />
      <main>
        {renderActiveTab()}
      </main>
      {isModalOpen && (
        <AIDiagnosticsModal 
          plantData={plantData} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
      {isEOPModalOpen && (
        <EOPModal 
          plantData={plantData} 
          onClose={() => setIsEOPModalOpen(false)} 
        />
      )}
       {isLoginModalOpen && (
        <LoginModal
          onLogin={handleLogin}
          error={loginError}
        />
      )}
    </div>
  );
};

export default App;
