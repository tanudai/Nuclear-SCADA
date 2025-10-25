import React, { useState } from 'react';
import { PlantData } from '../types';
import CoolantSystem from './CoolantSystem';
import PowerGeneration from './PowerGeneration';
import ContainmentSchematic from './ContainmentSchematic';
import Tooltip from './Tooltip';
import { ShieldExclamationIcon, CogIcon, UserCircleIcon } from './icons';

interface SystemsControlProps {
  plantData: PlantData;
  onToggleCoolantPump: (pump: 'A' | 'B') => void;
  onInitiateGridSync: () => void;
  onActivateECCS: () => void;
  controlMode: 'auto' | 'manual';
  isAuthenticated: boolean;
}

const SubsystemPanel: React.FC<{title: string, icon: React.ReactNode, children: React.ReactNode}> = ({title, icon, children}) => (
    <div className="bg-gray-800/50 rounded-lg p-4 flex flex-col h-full border border-gray-700">
        <div className="flex items-center mb-4">
            <div className="p-2 bg-gray-700/50 rounded-full mr-3">{icon}</div>
            <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
        </div>
        <div className="flex-grow space-y-4 flex flex-col justify-between">
            {children}
        </div>
    </div>
);

const EmergencyCoolingSystem: React.FC<{ status: 'Standby' | 'Active' | 'Fault', waterLevel: number, onActivate: () => void, isAuthenticated: boolean }> = ({ status, waterLevel, onActivate, isAuthenticated }) => {
    const [confirming, setConfirming] = useState(false);
    const canActivate = status === 'Standby' && isAuthenticated;

    const statusStyles = {
        'Standby': 'bg-blue-500/20 text-blue-300',
        'Active': 'bg-green-500/20 text-green-300 animate-pulse',
        'Fault': 'bg-red-500/20 text-red-300',
    };
    
    const handleActivateClick = () => {
        if (!canActivate) return;

        if (confirming) {
            onActivate();
            setConfirming(false);
        } else {
            setConfirming(true);
            setTimeout(() => setConfirming(false), 5000); // Confirmation times out after 5 seconds
        }
    };

    let tooltipText: string;
    if (confirming) {
        tooltipText = "Click again to confirm activation. Resets in 5 seconds.";
    } else if (!isAuthenticated) {
        tooltipText = "Login required to activate ECCS";
    } else if (status !== 'Standby') {
        tooltipText = `Cannot activate: System status is ${status}`;
    } else {
        tooltipText = "Initiate emergency core cooling (requires confirmation).";
    }


    return (
        <SubsystemPanel title="Emergency Cooling (ECCS)" icon={<ShieldExclamationIcon className="w-5 h-5 text-red-400"/>}>
            <div>
                <div className="flex items-center justify-between mb-4">
                    <p className="text-gray-400">System Status</p>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusStyles[status]}`}>
                        {status.toUpperCase()}
                    </span>
                </div>

                <div>
                    <p className="text-sm text-gray-400 mb-1">Reservoir Level</p>
                    <div className="w-full bg-gray-900/50 rounded-full h-4 border border-gray-700">
                        <div className="bg-blue-400 h-full rounded-full" style={{ width: `${waterLevel}%` }}></div>
                    </div>
                    <p className="text-center text-lg font-mono text-blue-200 mt-1">{waterLevel.toFixed(1)}%</p>
                </div>
            </div>

            <Tooltip text={tooltipText}>
                <div className="w-full">
                    <button 
                        onClick={handleActivateClick}
                        disabled={!canActivate}
                        className={`w-full text-white font-bold py-3 px-4 rounded-md transition-all duration-300 shadow-lg flex items-center justify-center
                          ${!canActivate ? 'bg-gray-600 cursor-not-allowed' : 
                          (confirming ? 'bg-yellow-600 hover:bg-yellow-500' : 'bg-red-800 hover:bg-red-700')}`}
                    >
                        {confirming ? 'CONFIRM ACTIVATION' : 'MANUAL ACTIVATION'}
                    </button>
                </div>
            </Tooltip>
        </SubsystemPanel>
    );
};

const SystemsControl: React.FC<SystemsControlProps> = (props) => {
  const isAuto = props.controlMode === 'auto';
  
  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-100">Systems Control & Monitoring</h2>
        <div className={`flex items-center space-x-3 px-4 py-2 rounded-lg font-bold shadow-md transition-colors duration-300 ${
            isAuto
              ? 'bg-green-500/20 text-green-300'
              : 'bg-yellow-500/20 text-yellow-300 animate-pulse'
          }`}>
          {isAuto 
            ? <CogIcon className="w-6 h-6 animate-spin" style={{ animationDuration: '15s' }} /> 
            : <UserCircleIcon className="w-6 h-6" />
          }
          <div className="flex flex-col text-left leading-tight">
              <span className="text-xs text-gray-400 font-medium">MODE</span>
              <span className="text-lg">{props.controlMode.toUpperCase()}</span>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <CoolantSystem 
            pumpA_on={props.plantData.coolantPumpA}
            pumpB_on={props.plantData.coolantPumpB}
            coolantFlow={props.plantData.coolantFlow}
            onTogglePump={props.onToggleCoolantPump}
            controlMode={props.controlMode}
            isAuthenticated={props.isAuthenticated}
        />
        <PowerGeneration 
            turbineRPM={props.plantData.turbineRPM}
            powerOutput={props.plantData.powerOutput}
            gridSyncStatus={props.plantData.gridSyncStatus}
            onInitiateGridSync={props.onInitiateGridSync}
            controlMode={props.controlMode}
            isAuthenticated={props.isAuthenticated}
        />
        <ContainmentSchematic 
            pressure={props.plantData.containmentPressure}
            temperature={props.plantData.containmentTemp}
            radiation={props.plantData.radiationLevel}
        />
        <EmergencyCoolingSystem
            status={props.plantData.eccsStatus}
            waterLevel={props.plantData.eccsWaterLevel}
            onActivate={props.onActivateECCS}
            isAuthenticated={props.isAuthenticated}
        />
      </div>
    </div>
  );
};

export default SystemsControl;