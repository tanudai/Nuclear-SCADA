import React from 'react';
import Tooltip from './Tooltip';
import { TurbineIcon, PowerIcon } from './icons';

interface PowerGenerationProps {
    turbineRPM: number;
    powerOutput: number;
    gridSyncStatus: 'Disconnected' | 'Synchronizing' | 'Connected';
    onInitiateGridSync: () => void;
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

const MetricDisplay: React.FC<{label: string, value: string, unit: string}> = ({label, value, unit}) => (
    <div className="flex justify-between items-baseline bg-gray-900/50 p-3 rounded-md">
        <p className="text-gray-400">{label}</p>
        <p className="font-mono text-xl text-gray-200">{value} <span className="text-sm text-gray-400">{unit}</span></p>
    </div>
);


const PowerGeneration: React.FC<PowerGenerationProps> = ({ turbineRPM, powerOutput, gridSyncStatus, onInitiateGridSync, isAuthenticated }) => {
    const generatorFrequency = (turbineRPM / 30).toFixed(2); // Simplified: 1800 RPM = 60 Hz
    const gridFrequency = 60.00;

    const statusStyles = {
        'Connected': 'bg-green-500/20 text-green-300',
        'Synchronizing': 'bg-yellow-500/20 text-yellow-300 animate-pulse',
        'Disconnected': 'bg-red-500/20 text-red-300',
    };

    return (
        <SubsystemPanel title="Power Generation" icon={<PowerIcon className="w-5 h-5 text-yellow-400"/>}>
            <MetricDisplay label="Turbine Speed" value={turbineRPM.toString()} unit="RPM" />
            <MetricDisplay label="Generator Freq." value={generatorFrequency} unit="Hz" />
            <MetricDisplay label="Grid Freq." value={gridFrequency.toFixed(2)} unit="Hz" />

            <div className="flex items-center justify-between pt-4 border-t border-gray-700/50">
                <p className="text-gray-400">Grid Status</p>
                <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusStyles[gridSyncStatus]}`}>
                    {gridSyncStatus.toUpperCase()}
                </span>
            </div>
             <Tooltip text={isAuthenticated ? "Attempt to match generator frequency to the grid" : "Login required to perform grid operations."}>
                <div className="w-full">
                    <button 
                        onClick={onInitiateGridSync}
                        disabled={gridSyncStatus !== 'Disconnected' || !isAuthenticated}
                        className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400"
                    >
                        Synchronize to Grid
                    </button>
                </div>
            </Tooltip>
        </SubsystemPanel>
    );
};

export default PowerGeneration;