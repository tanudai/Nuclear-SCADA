import React from 'react';
import { RadiationIcon } from './icons';

interface ContainmentSystemProps {
    pressure: number;
    temperature: number;
    radiation: number;
}


const SubsystemPanel: React.FC<{title: string, icon: React.ReactNode, children: React.ReactNode}> = ({title, icon, children}) => (
    <div className="bg-gray-800/50 rounded-lg p-4 flex flex-col h-full border border-gray-700">
        <div className="flex items-center mb-4">
            <div className="p-2 bg-gray-700/50 rounded-full mr-3">{icon}</div>
            <h3 className="text-lg font-semibold text-gray-200">{title}</h3>
        </div>
        <div className="flex-grow space-y-3">
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

const AirlockStatus: React.FC<{ name: string, sealed: boolean }> = ({ name, sealed }) => (
     <div className="flex justify-between items-center bg-gray-900/50 p-3 rounded-md">
        <p className="text-gray-400">{name}</p>
        <p className={`font-semibold text-sm ${sealed ? 'text-green-400' : 'text-red-400'}`}>{sealed ? 'SEALED' : 'OPEN'}</p>
    </div>
);

const ContainmentSystem: React.FC<ContainmentSystemProps> = ({ pressure, temperature, radiation }) => {
    return (
        <SubsystemPanel title="Containment Status" icon={<RadiationIcon className="w-5 h-5 text-red-400"/>}>
            <MetricDisplay label="Internal Pressure" value={pressure.toFixed(3)} unit="atm" />
            <MetricDisplay label="Internal Temp." value={temperature.toFixed(2)} unit="°C" />
            <MetricDisplay label="Radiation Level" value={(radiation * 10).toFixed(3)} unit="mSv/h" />
            <div className="pt-3 border-t border-gray-700/50">
                <h4 className="text-gray-400 text-sm mb-2">Airlock Integrity</h4>
                 <div className="space-y-2">
                    <AirlockStatus name="Equipment Hatch" sealed={true} />
                    <AirlockStatus name="Personnel Lock #1" sealed={true} />
                    <AirlockStatus name="Personnel Lock #2" sealed={true} />
                 </div>
            </div>
        </SubsystemPanel>
    );
};

export default ContainmentSystem;
