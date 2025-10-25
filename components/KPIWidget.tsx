
import React from 'react';
import { SystemStatus } from '../types';
import Tooltip from './Tooltip';

interface KPIWidgetProps {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  unit: string;
  status: SystemStatus;
  tooltipText: string;
}

const statusStyles: Record<SystemStatus, { text: string; bg: string; border: string }> = {
  [SystemStatus.Normal]: { text: 'text-green-300', bg: 'bg-green-500/10', border: 'border-green-500/30' },
  [SystemStatus.Warning]: { text: 'text-yellow-300 animate-pulse', bg: 'bg-yellow-500/10', border: 'border-yellow-500/30' },
  [SystemStatus.Critical]: { text: 'text-red-300 animate-pulse', bg: 'bg-red-500/10', border: 'border-red-500/30' },
};

const KPIWidget: React.FC<KPIWidgetProps> = ({ icon, title, value, unit, status, tooltipText }) => {
  const styles = statusStyles[status];

  return (
    <div className={`p-4 rounded-lg flex items-center transition-all duration-300 ${styles.bg} border ${styles.border}`}>
      <Tooltip text={tooltipText}>
        <div className={`mr-4 p-2 rounded-full ${styles.text} ${styles.bg}`}>
          {icon}
        </div>
      </Tooltip>
      <div className="flex-1">
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-100">
          {value} <span className="text-lg font-normal text-gray-400">{unit}</span>
        </p>
      </div>
    </div>
  );
};

export default KPIWidget;