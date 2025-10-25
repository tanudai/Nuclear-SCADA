import React, { useState, useEffect } from 'react';
import Tooltip from './Tooltip';

interface ReactorControlProps {
  currentPosition: number;
  onPositionChange: (position: number) => void;
  onAskAI: () => void;
  isAuthenticated: boolean;
}

const ReactorControl: React.FC<ReactorControlProps> = ({ currentPosition, onPositionChange, onAskAI, isAuthenticated }) => {
  const [sliderValue, setSliderValue] = useState(currentPosition);

  useEffect(() => {
    setSliderValue(currentPosition);
  }, [currentPosition]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSliderValue(Number(e.target.value));
  };
  
  const handleSliderMouseUp = () => {
    onPositionChange(sliderValue);
  };
  
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 flex flex-col h-full border border-gray-700">
      <h3 className="text-lg font-semibold text-gray-200 mb-4">Reactor Controls</h3>
      <div className="flex-grow flex flex-col justify-between">
        <div>
          <label htmlFor="control-rod" className="block text-sm font-medium text-gray-400 mb-2">
            Control Rod Insertion
          </label>
          <Tooltip text={!isAuthenticated ? "Login required to operate controls." : "Adjusts reactor power. 0% = Max Power, 100% = Min Power. Interaction enables manual mode for 20s."}>
            <div className="flex items-center space-x-4">
              <input
                id="control-rod"
                type="range"
                min="0"
                max="100"
                step="1"
                value={sliderValue}
                onChange={handleSliderChange}
                onMouseUp={handleSliderMouseUp}
                onTouchEnd={handleSliderMouseUp}
                disabled={!isAuthenticated}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Control Rod Insertion"
              />
              <span className="font-mono text-lg text-cyan-300 w-16 text-right">
                {Math.round(sliderValue)}%
              </span>
            </div>
          </Tooltip>
          <div className="text-xs text-gray-500 flex justify-between mt-1">
            <span>0% (Raised)</span>
            <span>100% (Inserted)</span>
          </div>
        </div>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          <Tooltip text={!isAuthenticated ? "Login required for emergency shutdown." : "Initiates an immediate, emergency shutdown by fully inserting all control rods."}>
            <button 
              onClick={() => onPositionChange(100)}
              disabled={!isAuthenticated}
              className="w-full bg-red-800 hover:bg-red-700 text-white font-bold py-3 px-4 rounded-md transition-colors shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              SCRAM (Emergency Shutdown)
            </button>
          </Tooltip>
          <Tooltip text="Request an AI analysis of the current plant status and recommended actions.">
            <button 
              onClick={onAskAI}
              className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-md transition-colors shadow-lg"
            >
              Run AI Diagnostics
            </button>
          </Tooltip>
        </div>
      </div>
    </div>
  );
};

export default ReactorControl;