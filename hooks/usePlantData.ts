import { useState, useEffect, useCallback, useRef } from 'react';
import { PlantData, SystemStatus, Alert } from '../types';

const INITIAL_STATE: PlantData = {
  reactorTemperature: 450,
  coolantPressure: 155,
  turbineRPM: 1800,
  powerOutput: 300,
  radiationLevel: 0.005,
  coolantFlow: 80,
  controlRodPosition: 50,
  gridDemand: 300,
  overallStatus: SystemStatus.Normal,
  // New states
  coolantPumpA: true,
  coolantPumpB: true,
  gridSyncStatus: 'Connected',
  containmentPressure: 1.05,
  containmentTemp: 25,
  // New ECCS states
  eccsStatus: 'Standby',
  eccsWaterLevel: 100,
};

const LERP_FACTOR = 0.05; // Smoothing factor for value changes
const HISTORY_LENGTH = 300; // Keep 300 seconds (5 minutes) of history

export const usePlantData = () => {
  const [plantData, setPlantData] = useState<PlantData>(INITIAL_STATE);
  const [dataHistory, setDataHistory] = useState<PlantData[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [controlMode, setControlMode] = useState<'auto' | 'manual'>('auto');
  const targetControlRodPosition = useRef(INITIAL_STATE.controlRodPosition);
  const manualModeTimeout = useRef<number | null>(null);
  const prevEccsStatusRef = useRef<PlantData['eccsStatus']>(INITIAL_STATE.eccsStatus);

  const addAlert = useCallback((message: string, status: SystemStatus) => {
    setAlerts(prev => {
      const newAlert = { id: Date.now(), timestamp: new Date().toLocaleTimeString(), message, status };
      return [newAlert, ...prev.slice(0, 99)]; // Keep max 100 alerts
    });
  }, []);

  // Effect to log ECCS status changes for activation, deactivation, and faults.
  useEffect(() => {
    const previousStatus = prevEccsStatusRef.current;
    const currentStatus = plantData.eccsStatus;

    if (previousStatus !== currentStatus) {
      if (currentStatus === 'Active' && previousStatus === 'Standby') {
        // Log ECCS Activation
        addAlert('ECCS ACTIVATED: Manual override engaged. Emergency core cooling initiated.', SystemStatus.Critical);
      } else if (currentStatus === 'Fault' && previousStatus === 'Active') {
        if (plantData.eccsWaterLevel <= 0) {
          // Log ECCS Deactivation due to resource exhaustion, resulting in a fault.
          addAlert('ECCS DEACTIVATED: Reservoir depleted, cooling has ceased. System entered FAULT state.', SystemStatus.Critical);
        } else {
          // Log other potential ECCS faults.
          addAlert('ECCS FAULT: An unexpected system failure has occurred.', SystemStatus.Critical);
        }
      }
    }

    prevEccsStatusRef.current = currentStatus;
  }, [plantData.eccsStatus, plantData.eccsWaterLevel, addAlert]);
  
  const enterManualMode = useCallback(() => {
    if (manualModeTimeout.current) {
      clearTimeout(manualModeTimeout.current);
    }
    setControlMode('manual');
    manualModeTimeout.current = window.setTimeout(() => {
        setControlMode('auto');
        addAlert('Control system returned to AUTO mode.', SystemStatus.Normal);
        manualModeTimeout.current = null;
    }, 20000); // Revert to auto after 20 seconds of no input
  }, [addAlert]);


  useEffect(() => {
    const interval = setInterval(() => {
      setPlantData(prev => {
        let {
          reactorTemperature,
          coolantPressure,
          turbineRPM,
          powerOutput,
          radiationLevel,
          coolantFlow,
          controlRodPosition,
          gridDemand,
          coolantPumpA,
          coolantPumpB,
          gridSyncStatus,
          containmentPressure,
          containmentTemp,
          eccsStatus,
          eccsWaterLevel,
        } = prev;

        // 1. Simulate grid demand fluctuations
        gridDemand += (Math.random() - 0.5) * 10;
        gridDemand = Math.max(250, Math.min(1000, gridDemand));

        // 2. Auto-scaling logic for control rods in 'auto' mode
        if (controlMode === 'auto') {
          const powerDifference = gridDemand - powerOutput;
          const adjustment = powerDifference * 0.05;
          targetControlRodPosition.current -= adjustment;
          targetControlRodPosition.current = Math.max(0, Math.min(100, targetControlRodPosition.current));
        }
        
        controlRodPosition += (targetControlRodPosition.current - controlRodPosition) * LERP_FACTOR;

        // 3. Subsystem simulation
        const targetCoolantFlow = (coolantPumpA ? 50 : 0) + (coolantPumpB ? 50 : 0);
        coolantFlow += (targetCoolantFlow - coolantFlow) * LERP_FACTOR;

        // Core simulation logic
        const reactionRate = (100 - controlRodPosition) / 100;
        
        const heatGenerated = reactionRate * 15;
        const heatDissipated = (coolantFlow / 100) * (reactorTemperature/45); // Adjusted dissipation
        reactorTemperature += (heatGenerated - heatDissipated) * 0.1;
        
        // ECCS simulation
        if (eccsStatus === 'Active') {
            reactorTemperature -= 50; // Rapid cooling
            eccsWaterLevel -= 2; // Consume water
            if (eccsWaterLevel <= 0) {
                eccsWaterLevel = 0;
                eccsStatus = 'Fault';
            }
        }
        
        reactorTemperature = Math.max(30, reactorTemperature);

        const targetRPM = reactorTemperature > 300 ? (reactorTemperature - 300) * 5.5 : 0;
        turbineRPM += (targetRPM - turbineRPM) * LERP_FACTOR;
        
        const targetPower = gridSyncStatus === 'Connected' && turbineRPM > 1000 ? (turbineRPM / 3600) * 1200 : 0;
        powerOutput += (targetPower - powerOutput) * LERP_FACTOR;

        coolantPressure = 150 + (reactorTemperature - 400) * 0.05 + (coolantFlow/100 * 5);
        radiationLevel = 0.002 + (reactorTemperature / 100000) * reactionRate;
        containmentTemp += (reactorTemperature - containmentTemp - 20) * 0.0001; // Slow heat transfer
        containmentPressure = 1 + (containmentTemp / 1000);

        if (gridSyncStatus === 'Synchronizing' && Math.abs(turbineRPM - 1800) < 50) {
            gridSyncStatus = 'Connected';
            addAlert('Generator synchronized and connected to the main grid.', SystemStatus.Normal);
        }

        reactorTemperature += (Math.random() - 0.5) * 0.5;
        powerOutput += (Math.random() - 0.5) * 0.2;

        let overallStatus = SystemStatus.Normal;
        if (reactorTemperature > 850 || coolantPressure > 175 || coolantFlow < 20) {
          overallStatus = SystemStatus.Warning;
        }
        if (reactorTemperature > 950 || coolantPressure > 185 || coolantFlow < 5) {
          overallStatus = SystemStatus.Critical;
        }

        if (overallStatus !== prev.overallStatus) {
            if (overallStatus === SystemStatus.Warning) addAlert('System entered WARNING state.', SystemStatus.Warning);
            if (overallStatus === SystemStatus.Critical) addAlert('SYSTEM CRITICAL. IMMEDIATE ACTION REQUIRED.', SystemStatus.Critical);
        }

        const newPlantData: PlantData = {
          reactorTemperature: parseFloat(reactorTemperature.toFixed(2)),
          coolantPressure: parseFloat(coolantPressure.toFixed(2)),
          turbineRPM: parseInt(turbineRPM.toFixed(0)),
          powerOutput: parseFloat(powerOutput.toFixed(2)),
          radiationLevel: parseFloat(radiationLevel.toFixed(4)),
          coolantFlow: parseFloat(coolantFlow.toFixed(2)),
          controlRodPosition: parseFloat(controlRodPosition.toFixed(2)),
          gridDemand: parseFloat(gridDemand.toFixed(2)),
          overallStatus,
          coolantPumpA,
          coolantPumpB,
          gridSyncStatus,
          containmentPressure: parseFloat(containmentPressure.toFixed(3)),
          containmentTemp: parseFloat(containmentTemp.toFixed(2)),
          eccsStatus,
          eccsWaterLevel: parseFloat(eccsWaterLevel.toFixed(2)),
        };
        
        setDataHistory(prevHistory => [...prevHistory.slice(-HISTORY_LENGTH + 1), newPlantData]);
        
        return newPlantData;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      if (manualModeTimeout.current) {
        clearTimeout(manualModeTimeout.current);
      }
    };
  }, [addAlert, controlMode, enterManualMode]);

  const setControlRod = useCallback((position: number) => {
    enterManualMode();
    targetControlRodPosition.current = Math.max(0, Math.min(100, position));
    addAlert(`MANUAL OVERRIDE: Control rods set to ${position.toFixed(0)}%.`, SystemStatus.Warning);
  }, [addAlert, enterManualMode]);

  const toggleCoolantPump = useCallback((pump: 'A' | 'B') => {
    enterManualMode();
    setPlantData(prev => {
        const pumpKey = pump === 'A' ? 'coolantPumpA' : 'coolantPumpB';
        const newStatus = !prev[pumpKey];
        addAlert(`MANUAL OVERRIDE: Coolant Pump ${pump} turned ${newStatus ? 'ON' : 'OFF'}.`, SystemStatus.Warning);
        return { ...prev, [pumpKey]: newStatus };
    });
  }, [addAlert, enterManualMode]);
  
  const initiateGridSync = useCallback(() => {
    enterManualMode();
    setPlantData(prev => {
        if (prev.gridSyncStatus === 'Disconnected') {
            addAlert('Grid synchronization sequence initiated.', SystemStatus.Normal);
            return { ...prev, gridSyncStatus: 'Synchronizing' };
        }
        return prev;
    });
  }, [addAlert, enterManualMode]);

  const activateECCS = useCallback(() => {
    enterManualMode();
    setPlantData(prev => {
        if (prev.eccsStatus === 'Standby') {
            targetControlRodPosition.current = 100;
            return { ...prev, eccsStatus: 'Active' };
        }
        return prev;
    });
  }, [enterManualMode]);
  
  const acknowledgeAlerts = () => {
    setAlerts([]);
    addAlert("Alarm log acknowledged and cleared by operator.", SystemStatus.Normal);
  };


  return { plantData, dataHistory, alerts, setControlRod, acknowledgeAlerts, toggleCoolantPump, initiateGridSync, controlMode, activateECCS };
};