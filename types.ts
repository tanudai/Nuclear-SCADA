
export enum SystemStatus {
  Normal = 'NORMAL',
  Warning = 'WARNING',
  Critical = 'CRITICAL',
}

export interface PlantData {
  reactorTemperature: number;
  coolantPressure: number;
  turbineRPM: number;
  powerOutput: number;
  radiationLevel: number;
  coolantFlow: number;
  controlRodPosition: number;
  gridDemand: number;
  overallStatus: SystemStatus;
  // New detailed system states
  coolantPumpA: boolean;
  coolantPumpB: boolean;
  gridSyncStatus: 'Disconnected' | 'Synchronizing' | 'Connected';
  containmentPressure: number;
  containmentTemp: number;
  // New ECCS fields
  eccsStatus: 'Standby' | 'Active' | 'Fault';
  eccsWaterLevel: number; // as a percentage
}

export interface Alert {
  id: number;
  timestamp: string;
  message: string;
  status: SystemStatus;
}

export interface MaintenanceTask {
  id: string;
  component: string;
  task: string;
  dueDate: string;
  status: 'Pending' | 'In Progress' | 'Completed';
}
