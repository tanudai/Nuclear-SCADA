
import { useState, useEffect, useRef } from 'react';
import { MaintenanceTask, PlantData, SystemStatus } from '../types';

const INITIAL_MAINTENANCE_DATA: MaintenanceTask[] = [
    { id: 'maint-001', component: 'Primary Coolant Pump A', task: 'Impeller Inspection', dueDate: '3 Days', status: 'Pending' },
    { id: 'maint-002', component: 'Turbine Governor', task: 'Calibration Check', dueDate: '5 Days', status: 'Pending' },
    { id: 'maint-003', component: 'Backup Diesel Generator 1', task: 'Fuel System Flush', dueDate: '1 Week', status: 'Pending' },
    { id: 'maint-004', component: 'Control Rod Drive Mechanism #23', task: 'Full Diagnostic', dueDate: '2 Weeks', status: 'Pending' },
    { id: 'maint-006', component: 'Radiation Monitor System', task: 'Sensor Calibration', dueDate: 'Completed', status: 'Completed' },
];

const potentialTasks = [
    { component: 'Secondary Coolant Pump', task: 'Bearing Lubrication' },
    { component: 'Electrical Grid Switchgear', task: 'Contact Cleaning' },
    { component: 'Core Temperature Sensor Array', task: 'Recalibration' },
    { component: 'Containment Vessel Airlock B', task: 'Seal Integrity Test' },
];

export const useMaintenanceData = (plantData: PlantData) => {
    const [maintenanceTasks, setMaintenanceTasks] = useState<MaintenanceTask[]>(INITIAL_MAINTENANCE_DATA);
    const criticalTaskAdded = useRef(false);

    // Effect for simulating task progression over time
    useEffect(() => {
        const interval = setInterval(() => {
            setMaintenanceTasks(prevTasks => {
                let tasks = [...prevTasks];
                const pendingTasks = tasks.filter(t => t.status === 'Pending');
                
                // 10% chance to start a pending task
                if (pendingTasks.length > 0 && Math.random() < 0.1) {
                    const taskToStart = pendingTasks[Math.floor(Math.random() * pendingTasks.length)];
                    taskToStart.status = 'In Progress';
                    taskToStart.dueDate = 'In Progress';
                }

                const inProgressTasks = tasks.filter(t => t.status === 'In Progress');
                 // 15% chance to complete an in-progress task
                if (inProgressTasks.length > 0 && Math.random() < 0.15) {
                    const taskToComplete = inProgressTasks[Math.floor(Math.random() * inProgressTasks.length)];
                    taskToComplete.status = 'Completed';
                    taskToComplete.dueDate = 'Completed';
                }

                // 5% chance to add a new routine task
                if (Math.random() < 0.05) {
                    const newTaskTemplate = potentialTasks[Math.floor(Math.random() * potentialTasks.length)];
                    const newTask: MaintenanceTask = {
                        id: `maint-${Date.now()}`,
                        component: newTaskTemplate.component,
                        task: newTaskTemplate.task,
                        dueDate: `${Math.floor(Math.random() * 10) + 1} Days`,
                        status: 'Pending',
                    };
                    tasks = [newTask, ...tasks];
                }

                return tasks.sort((a, b) => {
                    const statusOrder = { 'In Progress': 1, 'Pending': 2, 'Completed': 3 };
                    return statusOrder[a.status] - statusOrder[b.status];
                });
            });
        }, 10000); // Update every 10 seconds

        return () => clearInterval(interval);
    }, []);

    // Effect for adding emergency tasks based on plant status
    useEffect(() => {
        if (plantData.overallStatus === SystemStatus.Critical && !criticalTaskAdded.current) {
            const emergencyTask: MaintenanceTask = {
                id: `maint-emergency-${Date.now()}`,
                component: 'Reactor Core Integrity',
                task: 'URGENT: Post-Criticality Inspection',
                dueDate: 'Immediate',
                status: 'In Progress',
            };
            setMaintenanceTasks(prev => [emergencyTask, ...prev]);
            criticalTaskAdded.current = true;
        } else if (plantData.overallStatus !== SystemStatus.Critical) {
            // Reset the flag when status is no longer critical
            criticalTaskAdded.current = false;
        }
    }, [plantData.overallStatus]);

    const addMaintenanceTask = (component: string, task: string, dueDate: string) => {
        const newTask: MaintenanceTask = {
            id: `maint-manual-${Date.now()}`,
            component,
            task,
            dueDate,
            status: 'Pending',
        };
        setMaintenanceTasks(prevTasks => {
            const updatedTasks = [newTask, ...prevTasks];
            return updatedTasks.sort((a, b) => {
                const statusOrder = { 'In Progress': 1, 'Pending': 2, 'Completed': 3 };
                return statusOrder[a.status] - statusOrder[b.status];
            });
        });
    };

    return { maintenanceTasks, addMaintenanceTask };
};