
import React, { useState } from 'react';
import { Alert, SystemStatus } from '../types';

interface AlarmPanelProps {
  alerts: Alert[];
  onAcknowledge: () => void;
  onShowEOP: () => void;
}

const statusColors: Record<SystemStatus, string> = {
  [SystemStatus.Normal]: 'text-green-400',
  [SystemStatus.Warning]: 'text-yellow-400 animate-pulse',
  [SystemStatus.Critical]: 'text-red-500 font-bold animate-pulse',
};

const statusBorderColors: Record<SystemStatus, string> = {
  [SystemStatus.Normal]: 'border-green-500/50',
  [SystemStatus.Warning]: 'border-yellow-500/50',
  [SystemStatus.Critical]: 'border-red-500/50',
};

type FilterType = SystemStatus | 'ALL';

const AlarmPanel: React.FC<AlarmPanelProps> = ({ alerts, onAcknowledge, onShowEOP }) => {
  const [filter, setFilter] = useState<FilterType>('ALL');

  const filteredAlerts = alerts.filter(alert => 
    filter === 'ALL' || alert.status === filter
  );

  const hasCriticalAlerts = alerts.some(a => a.status === SystemStatus.Critical || a.status === SystemStatus.Warning);

  const FilterButton: React.FC<{ status: FilterType, label: string }> = ({ status, label }) => {
    const isActive = filter === status;
    const baseClasses = "px-3 py-1 text-xs font-semibold rounded-md transition-colors ";
    const activeClasses = "bg-blue-600 text-white";
    const inactiveClasses = "bg-gray-700 hover:bg-gray-600 text-gray-300";
    return (
      <button onClick={() => setFilter(status)} className={baseClasses + (isActive ? activeClasses : inactiveClasses)}>
        {label}
      </button>
    );
  };
  
  return (
    <div className="bg-gray-800/50 rounded-lg p-4 flex flex-col h-full border border-gray-700">
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-lg font-semibold text-gray-200">Alarm Panel</h3>
        <div className="flex items-center space-x-2">
            {hasCriticalAlerts && (
                <button
                    onClick={onShowEOP}
                    className="bg-red-700 hover:bg-red-600 text-white text-xs font-bold py-1 px-3 rounded-md transition-colors animate-pulse"
                >
                    Request EOP
                </button>
            )}
            <button 
              onClick={onAcknowledge}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-1 px-3 rounded-md transition-colors"
            >
              Acknowledge All
            </button>
        </div>
      </div>
      <div className="flex items-center space-x-2 mb-3">
          <FilterButton status="ALL" label="All" />
          <FilterButton status={SystemStatus.Critical} label="Critical" />
          <FilterButton status={SystemStatus.Warning} label="Warning" />
      </div>
      <div className="overflow-y-auto flex-grow pr-2">
        {filteredAlerts.length === 0 ? (
          <div className="text-gray-500 text-center pt-8">No {filter !== 'ALL' && filter.toLowerCase()} alarms to display.</div>
        ) : (
          filteredAlerts.map(alert => (
            <div key={alert.id} className={`flex items-start text-sm mb-2 p-2 rounded-md bg-gray-900/50 border-l-4 ${statusBorderColors[alert.status]}`}>
              <span className="font-mono text-gray-500 mr-3">{alert.timestamp}</span>
              <span className={`flex-1 ${statusColors[alert.status]}`}>{alert.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AlarmPanel;
