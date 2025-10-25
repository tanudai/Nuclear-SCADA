import React from 'react';
import ToggleSwitch from './ToggleSwitch';
import Tooltip from './Tooltip';
import { FlowIcon } from './icons';

interface CoolantSystemProps {
    pumpA_on: boolean;
    pumpB_on: boolean;
    coolantFlow: number;
    onTogglePump: (pump: 'A' | 'B') => void;
    controlMode: 'auto' | 'manual';
    isAuthenticated: boolean;
}

const SubsystemPanel: React.FC<{title: string, icon: React.ReactNode, children: React.ReactNode}> = ({title, icon, children}) => (
    <div className="bg-gray-800/50 rounded-lg p-4 flex flex-col h-full border border-gray-700">
        <div className="flex items-center mb-4">
            <div className="p-2 bg-gray-700/50 rounded-full mr-3">{icon}</div>
            <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
        </div>
        <div className="flex-grow space-y-4">
            {children}
        </div>
    </div>
);


const CoolantSystem: React.FC<CoolantSystemProps> = ({ pumpA_on, pumpB_on, coolantFlow, onTogglePump, isAuthenticated }) => {

    const PumpControl: React.FC<{ name: string, pumpId: 'A' | 'B', isOn: boolean }> = ({ name, pumpId, isOn }) => (
        <div className="flex items-center justify-between bg-gray-900/50 p-3 rounded-md">
            <span className="font-medium text-gray-300">{name}</span>
            <div className="flex items-center space-x-3">
                <span className={`text-sm font-bold ${isOn ? 'text-green-400' : 'text-gray-500'}`}>
                    {isOn ? 'ACTIVE' : 'INACTIVE'}
                </span>
                 <Tooltip text={isAuthenticated ? `Toggle Pump ${pumpId}` : "Login required to operate pumps."}>
                    <div className={!isAuthenticated ? 'cursor-not-allowed' : ''}>
                        <ToggleSwitch
                            checked={isOn}
                            onChange={() => onTogglePump(pumpId)}
                            disabled={!isAuthenticated}
                        />
                    </div>
                 </Tooltip>
            </div>
        </div>
    );
    
    return (
        <SubsystemPanel title="Primary Coolant System" icon={<FlowIcon className="w-5 h-5 text-blue-400"/>}>
            <PumpControl name="Coolant Pump A" pumpId="A" isOn={pumpA_on} />
            <PumpControl name="Coolant Pump B" pumpId="B" isOn={pumpB_on} />
            <div className="pt-4 border-t border-gray-700/50">
                <p className="text-sm text-gray-400">Total Coolant Flow</p>
                <p className="text-3xl font-bold text-blue-300">{coolantFlow.toFixed(1)} <span className="text-lg font-normal">m³/s</span></p>
            </div>
        </SubsystemPanel>
    );
};

export default CoolantSystem;