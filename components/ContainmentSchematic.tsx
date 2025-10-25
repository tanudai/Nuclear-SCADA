
import React from 'react';
import { SystemStatus } from '../types';

interface ContainmentSchematicProps {
    pressure: number;
    temperature: number;
    radiation: number;
}

const airlocks = [
    { name: "Equipment Hatch", sealed: true },
    { name: "Personnel Lock #1", sealed: true },
    { name: "Personnel Lock #2", sealed: true },
];

const getStatus = (value: number, warnThreshold: number, critThreshold: number): SystemStatus => {
    if (value >= critThreshold) return SystemStatus.Critical;
    if (value >= warnThreshold) return SystemStatus.Warning;
    return SystemStatus.Normal;
}

const statusColorMap: Record<SystemStatus, string> = {
  [SystemStatus.Normal]: 'green-500',
  [SystemStatus.Warning]: 'yellow-500',
  [SystemStatus.Critical]: 'red-500',
};

const radiationGlow: Record<SystemStatus, string> = {
    [SystemStatus.Normal]: 'radiation-glow-normal',
    [SystemStatus.Warning]: 'radiation-glow-warning',
    [SystemStatus.Critical]: 'radiation-glow-critical',
};

const ContainmentSchematic: React.FC<ContainmentSchematicProps> = ({ pressure, temperature, radiation }) => {
    const pressureStatus = getStatus(pressure, 1.2, 1.5);
    const tempStatus = getStatus(temperature, 40, 60);
    const radiationStatus = getStatus(radiation, 0.01, 0.02);

    const statusList = [pressureStatus, tempStatus, radiationStatus];
    const overallStatus = statusList.includes(SystemStatus.Critical) ? SystemStatus.Critical :
        statusList.includes(SystemStatus.Warning) ? SystemStatus.Warning : SystemStatus.Normal;

    const getStatusColor = (status: SystemStatus, type: 'stroke' | 'fill' | 'text') => {
        const color = statusColorMap[status];
        return `${type}-${color}`;
    };

    return (
        <div className="bg-gray-800/50 rounded-lg p-4 flex flex-col h-full border border-gray-700">
            <h3 className="text-lg font-semibold text-gray-200 mb-2">Containment Status</h3>
            <div className="grid grid-cols-2 gap-x-4 flex-grow">
                <div className="col-span-1 flex items-center justify-center">
                    <svg viewBox="0 0 200 200" className="w-full h-full max-h-64">
                        <defs>
                            <style>
                                {`
                                @keyframes radiation-pulse {
                                    0%, 100% { opacity: 0.2; }
                                    50% { opacity: 0.6; }
                                }
                                .radiation-glow-normal {
                                    --glow-color: #fde047; /* yellow-300 */
                                    animation: radiation-pulse 5s ease-in-out infinite;
                                    opacity: 0.2;
                                }
                                .radiation-glow-warning {
                                    --glow-color: #f59e0b; /* yellow-500 */
                                    animation: radiation-pulse 2s ease-in-out infinite;
                                    opacity: 0.4;
                                }
                                .radiation-glow-critical {
                                     --glow-color: #ef4444; /* red-500 */
                                    animation: radiation-pulse 0.8s ease-in-out infinite;
                                    opacity: 0.6;
                                }
                                `}
                            </style>
                            <radialGradient id="radiationGradient" cx="50%" cy="50%" r="50%">
                                <stop offset="0%" stopColor="var(--glow-color)" stopOpacity="1" />
                                <stop offset="100%" stopColor="var(--glow-color)" stopOpacity="0" />
                            </radialGradient>
                        </defs>

                        {/* Containment Building structure */}
                        <path d="M 30 180 C 30 100, 170 100, 170 180 H 30 Z" className={`stroke-2 ${getStatusColor(overallStatus, 'stroke')} fill-gray-700/20`} />
                        <rect x="20" y="180" width="160" height="10" className={`stroke-2 ${getStatusColor(overallStatus, 'stroke')} fill-gray-700/20`} />

                        {/* Radiation glow */}
                        <circle cx="100" cy="150" r="50" fill="url(#radiationGradient)" className={radiationGlow[radiationStatus]} />

                        {/* Reactor Vessel inside containment */}
                        <rect x="85" y="130" width="30" height="50" rx="3" className="fill-gray-600 stroke-gray-400" />
                        <rect x="80" y="120" width="40" height="10" rx="2" className="fill-gray-500" />
                        <text x="100" y="160" textAnchor="middle" className="fill-current text-gray-300 text-[8px] font-bold">CORE</text>
                    </svg>
                </div>
                <div className="col-span-1 flex flex-col justify-center space-y-3">
                    {/* Data Displays */}
                    <div>
                        <p className="text-xs text-gray-400 font-semibold">PRESSURE</p>
                        <p className={`text-2xl font-mono font-bold ${getStatusColor(pressureStatus, 'text')}`}>{pressure.toFixed(3)} <span className="text-base font-sans text-gray-500">atm</span></p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-semibold">TEMPERATURE</p>
                        <p className={`text-2xl font-mono font-bold ${getStatusColor(tempStatus, 'text')}`}>{temperature.toFixed(1)} <span className="text-base font-sans text-gray-500">°C</span></p>
                    </div>
                     <div>
                        <p className="text-xs text-gray-400 font-semibold">RADIATION</p>
                        <p className={`text-2xl font-mono font-bold ${getStatusColor(radiationStatus, 'text')}`}>{radiation.toFixed(4)} <span className="text-base font-sans text-gray-500">mSv/h</span></p>
                    </div>
                    <div className="pt-2 border-t border-gray-700/50">
                        <h4 className="text-gray-400 text-sm mb-1">Airlock Integrity</h4>
                        <div className="space-y-1 text-xs">
                            {airlocks.map(lock => (
                                <div key={lock.name} className="flex justify-between items-center">
                                    <span className="text-gray-300">{lock.name}</span>
                                    <span className={`font-semibold ${lock.sealed ? 'text-green-400' : 'text-red-400'}`}>{lock.sealed ? 'SEALED' : 'OPEN'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContainmentSchematic;
