
import React from 'react';
import { SystemStatus } from '../types';
import { ChartBarIcon, WrenchScrewdriverIcon, CogIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from './icons';
import Tooltip from './Tooltip';

interface HeaderProps {
  status: SystemStatus;
  eccsStatus: 'Standby' | 'Active' | 'Fault';
  eccsWaterLevel: number;
  activeTab: string;
  onTabChange: (tab: string) => void;
  isAuthenticated: boolean;
  onLogout: () => void;
}

const statusInfo: Record<SystemStatus, { text: string; bg: string; indicator: string }> = {
  [SystemStatus.Normal]: { text: 'NORMAL', bg: 'bg-green-500', indicator: 'animate-none' },
  [SystemStatus.Warning]: { text: 'WARNING', bg: 'bg-yellow-500', indicator: 'animate-pulse' },
  [SystemStatus.Critical]: { text: 'CRITICAL', bg: 'bg-red-500', indicator: 'animate-ping' },
};

const eccsStatusInfo: Record<'Standby' | 'Active' | 'Fault', { text: string; bg: string; indicator?: string }> = {
  'Standby': { text: 'STANDBY', bg: 'bg-blue-500' },
  'Active': { text: 'ACTIVE', bg: 'bg-cyan-400', indicator: 'animate-pulse' },
  'Fault': { text: 'FAULT', bg: 'bg-red-500', indicator: 'animate-ping' },
};


const Header: React.FC<HeaderProps> = ({ status, eccsStatus, eccsWaterLevel, activeTab, onTabChange, isAuthenticated, onLogout }) => {
  const currentStatus = statusInfo[status];
  const currentEccsStatus = eccsStatusInfo[eccsStatus];

  const NavTab: React.FC<{ tabName: string, label: string, icon: React.ReactNode, tooltipText: string }> = ({ tabName, label, icon, tooltipText }) => {
    const isActive = activeTab === tabName;
    return (
      <Tooltip text={tooltipText}>
        <button 
          onClick={() => onTabChange(tabName)}
          className={`flex items-center px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
            isActive 
              ? 'border-teal-400 text-teal-300 bg-gray-800/50' 
              : 'border-transparent text-gray-400 hover:text-white hover:bg-gray-700/50'
          }`}
          role="tab"
          aria-selected={isActive}
        >
          {icon}
          <span className="ml-2">{label}</span>
        </button>
      </Tooltip>
    )
  }

  return (
    <header className="bg-gray-900/80 backdrop-blur-sm shadow-lg sticky top-0 z-10">
      <div className="p-4 flex justify-between items-center border-b border-gray-700">
        <div className="flex items-center">
          <div className="w-8 h-8 mr-3 bg-teal-500 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-900" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-100 tracking-wider">
            NUCLEAR POWER <span className="text-teal-400">SCADA</span>
          </h1>
        </div>
        <div className="flex items-center space-x-4">
            {isAuthenticated && (
                <div className="flex items-center space-x-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-sm font-semibold text-gray-200">Operator</p>
                        <p className="text-xs text-green-400">Authenticated</p>
                    </div>
                    <UserCircleIcon className="w-8 h-8 text-gray-300"/>
                    <Tooltip text="Logout">
                      <button onClick={onLogout} className="p-2 rounded-full bg-gray-700/50 hover:bg-red-500/30 text-gray-400 hover:text-red-300 transition-colors">
                        <ArrowRightOnRectangleIcon className="w-5 h-5"/>
                      </button>
                    </Tooltip>
                </div>
            )}
             <div className="h-8 w-px bg-gray-700 hidden sm:block"></div>
            <div className="flex items-center space-x-3">
                <div className="flex items-center">
                    <span className="text-gray-400 mr-2 text-sm hidden md:block">PLANT:</span>
                    <div className={`relative px-3 py-1 rounded-md text-sm font-bold text-white shadow-md ${currentStatus.bg}`}>
                        <div className={`absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full ${currentStatus.bg} ${currentStatus.indicator}`}></div>
                        <div className={`absolute top-0 right-0 h-2 w-2 rounded-full ${currentStatus.bg}`}></div>
                        {currentStatus.text}
                    </div>
                </div>
                <div className="flex items-center">
                    <Tooltip text={`ECCS Status: ${eccsStatus.toUpperCase()} | Reservoir: ${eccsWaterLevel.toFixed(1)}%`}>
                        <div className={`relative px-3 py-1 rounded-md text-sm font-bold text-white shadow-md ${currentEccsStatus.bg}`}>
                            {currentEccsStatus.indicator && (
                                <div className={`absolute -top-0.5 -right-0.5 h-3 w-3 rounded-full ${currentEccsStatus.bg} ${currentEccsStatus.indicator}`}></div>
                            )}
                            <div className={`absolute top-0 right-0 h-2 w-2 rounded-full ${currentEccsStatus.bg}`}></div>
                            {currentEccsStatus.text}
                        </div>
                    </Tooltip>
                </div>
            </div>
        </div>
      </div>
      <nav className="px-4 flex items-center space-x-2" role="tablist">
        <NavTab tabName="dashboard" label="Dashboard" icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a1 1 0 000-2H4a1 1 0 000 2zM13 4h3a1 1 0 100-2h-3a1 1 0 100 2zM4 9h3a1 1 0 100-2H4a1 1 0 100 2zM13 9h3a1 1 0 100-2h-3a1 1 0 100 2zM4 14h3a1 1 0 100-2H4a1 1 0 100 2zM13 14h3a1 1 0 100-2h-3a1 1 0 100 2z"/></svg>} tooltipText="View main plant overview and controls." />
        <NavTab tabName="systems" label="Systems" icon={<CogIcon className="h-5 w-5" />} tooltipText="Control and monitor individual plant subsystems." />
        <NavTab tabName="trending" label="Trending" icon={<ChartBarIcon className="h-5 w-5" />} tooltipText="Analyze historical data trends for key metrics." />
        <NavTab tabName="maintenance" label="Maintenance" icon={<WrenchScrewdriverIcon className="h-5 w-5" />} tooltipText="View and manage the equipment maintenance schedule." />
      </nav>
    </header>
  );
};

export default Header;
