import React from 'react';
import { SystemStatus, PlantData } from '../types';
import Tooltip from './Tooltip';

interface PlantSchematicProps {
  status: SystemStatus;
  eccsStatus: PlantData['eccsStatus'];
  eccsWaterLevel: number;
}

const statusColors: Record<SystemStatus, string> = {
  [SystemStatus.Normal]: 'text-green-500',
  [SystemStatus.Warning]: 'text-yellow-500',
  [SystemStatus.Critical]: 'text-red-500',
};

const statusFillColors: Record<SystemStatus, string> = {
    [SystemStatus.Normal]: 'fill-green-500/20',
    [SystemStatus.Warning]: 'fill-yellow-500/20',
    [SystemStatus.Critical]: 'fill-red-500/20',
};

const glowStyles: Record<SystemStatus, string> = {
    [SystemStatus.Normal]: 'glow-normal',
    [SystemStatus.Warning]: 'glow-warning',
    [SystemStatus.Critical]: 'glow-critical',
};

const eccsStyles: Record<PlantData['eccsStatus'], string> = {
  'Standby': 'eccs-standby',
  'Active': 'eccs-active',
  'Fault': 'eccs-fault',
};


const PlantSchematic: React.FC<PlantSchematicProps> = ({ status, eccsStatus, eccsWaterLevel }) => {
  // Calculation for the ECCS water level bar
  const barTotalHeight = 100;
  const barYOffset = 50;
  const fillHeight = barTotalHeight * (eccsWaterLevel / 100);
  const fillY = barYOffset + barTotalHeight - fillHeight;
  
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 flex flex-col items-center justify-center h-full border border-gray-700">
      <h3 className="text-lg font-semibold text-gray-200 mb-2">Plant Schematic</h3>
      <div className="relative w-full h-full">
        <svg viewBox="0 0 400 200" className="w-full h-full">
          <defs>
            <style>
              {`
              .coolant-flow {
                stroke-dasharray: 5 5;
                animation: flow 1s linear infinite;
              }
              @keyframes flow {
                from { stroke-dashoffset: 0; }
                to { stroke-dashoffset: 10; }
              }
              @keyframes pulse-glow {
                0%, 100% { opacity: 0.7; transform: scale(1); }
                50% { opacity: 0.3; transform: scale(1.02); }
              }
              .glow-normal {
                fill: #22c55e; /* green-500 */
                animation: pulse-glow 4s ease-in-out infinite;
              }
              .glow-warning {
                fill: #f59e0b; /* yellow-500 */
                animation: pulse-glow 2s ease-in-out infinite;
              }
              .glow-critical {
                fill: #ef4444; /* red-500 */
                animation: pulse-glow 0.8s ease-in-out infinite;
              }
              @keyframes eccs-active-pulse {
                0%, 100% { opacity: 0.7; }
                50% { opacity: 1; }
              }
              @keyframes eccs-fault-blink {
                50% { opacity: 0.3; }
              }
              .eccs-standby {
                fill: #3b82f6; /* blue-500 */
                stroke: #2563eb; /* blue-600 */
              }
              .eccs-active {
                fill: #22d3ee; /* cyan-400 */
                stroke: #06b6d4; /* cyan-500 */
                animation: eccs-active-pulse 1s ease-in-out infinite;
              }
              .eccs-fault {
                fill: #ef4444; /* red-500 */
                stroke: #dc2626; /* red-600 */
                animation: eccs-fault-blink 1s step-end infinite;
              }
            `}
            </style>
          </defs>
          
          {/* ECCS Water Level Indicator */}
          <g>
            <text x="120" y="45" textAnchor="middle" className="fill-current text-gray-300 text-[8px] font-bold">ECCS</text>
            {/* Bar Frame */}
            <rect x="115" y="50" width="10" height="100" rx="1" className="fill-gray-900/50 stroke-gray-500" strokeWidth="0.5" />
            {/* Water Level Fill */}
            {eccsWaterLevel > 0 && (
                <rect 
                    x="115" 
                    y={fillY} 
                    width="10" 
                    height={fillHeight} 
                    rx="1" 
                    className={eccsStyles[eccsStatus]}
                    strokeWidth="0.5"
                />
            )}
          </g>

          {/* Reactor Glow Indicator */}
          <rect x="20" y="45" width="90" height="110" rx="8" className={glowStyles[status]} />

          {/* Reactor Core */}
          <rect x="25" y="50" width="80" height="100" rx="5" className={`stroke-2 ${statusColors[status]} ${statusFillColors[status]}`} />
          <text x="65" y="105" textAnchor="middle" className="fill-current text-gray-300 text-xs font-bold">REACTOR</text>

          {/* Primary Coolant Loop (Hot) */}
          <path d="M 105 70 H 150" strokeWidth="4" className="stroke-red-500" />
          <path d="M 105 70 H 150" strokeWidth="2" stroke="white" className="coolant-flow" />

          {/* Steam Generator */}
          <rect x="150" y="40" width="40" height="120" rx="3" className="fill-gray-700 stroke-gray-500" />
          <text x="170" y="105" textAnchor="middle" transform="rotate(-90 170 105)" className="fill-current text-gray-300 text-[10px] font-bold tracking-wider">STEAM GENERATOR</text>

          {/* Primary Coolant Loop (Cold) */}
          <path d="M 105 130 H 150" strokeWidth="4" className="stroke-blue-500" />
          <path d="M 105 130 H 150" strokeWidth="2" stroke="white" className="coolant-flow" />

          {/* Secondary Loop (Steam) */}
          <path d="M 190 70 H 250" strokeWidth="3" className="stroke-gray-400" />
          <path d="M 190 70 H 250" strokeWidth="1.5" stroke="white" className="coolant-flow" />

          {/* Turbine */}
          <circle cx="270" cy="70" r="20" className="fill-gray-700 stroke-cyan-400" />
          <text x="270" y="75" textAnchor="middle" className="fill-current text-gray-300 text-[10px] font-bold">TURBINE</text>

          {/* Generator */}
          <rect x="290" y="55" width="40" height="30" rx="3" className="fill-gray-700 stroke-yellow-400" />
          <text x="310" y="73" textAnchor="middle" className="fill-current text-gray-300 text-[10px] font-bold">GENERATOR</text>

          {/* Power Out */}
          <path d="M 330 70 H 380" strokeWidth="2" stroke="yellow" className="stroke-yellow-400" />
          <path d="M 380 70 l -5 -5 m 5 5 l -5 5" strokeWidth="2" stroke="yellow" className="stroke-yellow-400" />
          
          {/* Cooling Tower */}
          <path d="M 270 90 V 120 H 330 V 90" strokeWidth="3" className="stroke-blue-400" />
          <path d="M 350 160 C 350 120, 310 120, 310 160" strokeWidth="2" className="fill-none stroke-gray-600" />
          <path d="M 310 120 H 350" strokeWidth="2" className="stroke-gray-600" />
          <text x="330" y="145" textAnchor="middle" className="fill-current text-gray-300 text-xs">COOLING TOWER</text>
        </svg>

        <Tooltip text={`ECCS Status: ${eccsStatus.toUpperCase()} | Reservoir: ${eccsWaterLevel.toFixed(1)}%`}>
            {/* This div is the hover target, positioned over the ECCS graphic */}
            <div 
              className="absolute cursor-pointer" 
              style={{ 
                  top: '22.5%',     // y=45 / 200
                  left: '28.75%',   // x=115 / 400
                  width: '2.5%',    // width=10 / 400
                  height: '55%'     // height=110 / 200
              }}
              aria-hidden="true"
            ></div>
        </Tooltip>
      </div>
    </div>
  );
};

export default PlantSchematic;