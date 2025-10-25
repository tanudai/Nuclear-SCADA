import React from 'react';
import { PlantData, Alert, SystemStatus } from '../types';
import KPIWidget from './KPIWidget';
import ReactorControl from './ReactorControl';
import AlarmPanel from './EventLog';
import PlantSchematic from './PlantSchematic';
import { TemperatureIcon, PressureIcon, TurbineIcon, PowerIcon, RadiationIcon, FlowIcon, GridIcon } from './icons/index';

interface DashboardProps {
  plantData: PlantData;
  alerts: Alert[];
  onSetControlRod: (position: number) => void;
  onAcknowledgeAlerts: () => void;
  onAskAI: () => void;
  onShowEOP: () => void;
  isAuthenticated: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ plantData, alerts, onSetControlRod, onAcknowledgeAlerts, onAskAI, onShowEOP, isAuthenticated }) => {
  return (
    <div className="p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      
      {/* KPI Widgets */}
      <div className="lg:col-span-3 xl:col-span-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        <KPIWidget icon={<GridIcon className="w-6 h-6"/>} title="Grid Demand" value={plantData.gridDemand.toFixed(0)} unit="MW" status={SystemStatus.Normal} tooltipText="Current power demand from the electrical grid. The plant will automatically try to match this output." />
        <KPIWidget icon={<PowerIcon className="w-6 h-6"/>} title="Power Output" value={plantData.powerOutput.toFixed(0)} unit="MW" status={plantData.overallStatus} tooltipText="Total electrical power being generated." />
        <KPIWidget icon={<TemperatureIcon className="w-6 h-6"/>} title="Reactor Temp." value={plantData.reactorTemperature.toFixed(0)} unit="°C" status={plantData.overallStatus} tooltipText="Average temperature of the reactor core." />
        <KPIWidget icon={<PressureIcon className="w-6 h-6"/>} title="Coolant Pressure" value={plantData.coolantPressure.toFixed(0)} unit="bar" status={plantData.overallStatus} tooltipText="Pressure within the primary coolant loop." />
        <KPIWidget icon={<TurbineIcon className="w-6 h-6"/>} title="Turbine Speed" value={plantData.turbineRPM} unit="RPM" status={plantData.overallStatus} tooltipText="Rotational speed of the main power turbine." />
        <KPIWidget icon={<RadiationIcon className="w-6 h-6"/>} title="Radiation" value={plantData.radiationLevel.toFixed(4)} unit="mSv/h" status={plantData.overallStatus} tooltipText="Ambient radiation levels near the core." />
        <KPIWidget icon={<FlowIcon className="w-6 h-6"/>} title="Coolant Flow" value={plantData.coolantFlow.toFixed(0)} unit="m³/s" status={plantData.overallStatus} tooltipText="Rate of coolant circulation through the reactor." />
      </div>

      {/* Main Panels */}
      <div className="lg:col-span-2 xl:col-span-2 h-96">
        <PlantSchematic status={plantData.overallStatus} eccsStatus={plantData.eccsStatus} eccsWaterLevel={plantData.eccsWaterLevel} />
      </div>
      <div className="lg:col-span-1 xl:col-span-2 h-96">
        <AlarmPanel alerts={alerts} onAcknowledge={onAcknowledgeAlerts} onShowEOP={onShowEOP} />
      </div>

      {/* Control Panel */}
      <div className="lg:col-span-3 xl:col-span-4 h-auto">
        <ReactorControl
          currentPosition={plantData.controlRodPosition}
          onPositionChange={onSetControlRod}
          onAskAI={onAskAI}
          isAuthenticated={isAuthenticated}
        />
      </div>

    </div>
  );
};

export default Dashboard;