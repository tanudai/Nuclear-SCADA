
import React, { useState } from 'react';
import { MaintenanceTask, PlantData } from '../types';
import { useMaintenanceData } from '../hooks/useMaintenanceData';
import Tooltip from './Tooltip';

const statusStyles: Record<MaintenanceTask['status'], string> = {
    'Pending': 'bg-yellow-500/20 text-yellow-300',
    'In Progress': 'bg-blue-500/20 text-blue-300 animate-pulse',
    'Completed': 'bg-green-500/20 text-green-400',
};

interface MaintenanceScheduleProps {
    plantData: PlantData;
    isAuthenticated: boolean;
}

const MaintenanceSchedule: React.FC<MaintenanceScheduleProps> = ({ plantData, isAuthenticated }) => {
  const { maintenanceTasks, addMaintenanceTask } = useMaintenanceData(plantData);
  const [showForm, setShowForm] = useState(false);
  const [newComponent, setNewComponent] = useState('');
  const [newTask, setNewTask] = useState('');
  const [newDueDate, setNewDueDate] = useState('');

  const handleAddTask = () => {
    if (newComponent.trim() && newTask.trim() && newDueDate.trim()) {
        addMaintenanceTask(newComponent, newTask, newDueDate);
        setShowForm(false);
        setNewComponent('');
        setNewTask('');
        setNewDueDate('');
    } else {
        alert("Please fill out all fields.");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setNewComponent('');
    setNewTask('');
    setNewDueDate('');
  };

  return (
    <div className="p-4 md:p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-100">Maintenance Schedule</h2>
        {!showForm && (
            <Tooltip text={!isAuthenticated ? "Login required to add tasks." : ""}>
                <button 
                    onClick={() => setShowForm(true)}
                    disabled={!isAuthenticated}
                    className="bg-teal-600 hover:bg-teal-500 text-white font-bold py-2 px-4 rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                    Add New Task
                </button>
          </Tooltip>
        )}
      </div>

      {showForm && (
        <div className="bg-gray-800 p-4 rounded-lg mb-4 border border-gray-700">
          <h3 className="text-lg font-semibold text-gray-200 mb-3">New Maintenance Task</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <input 
              type="text" 
              placeholder="Component Name (e.g., Coolant Pump B)"
              value={newComponent}
              onChange={(e) => setNewComponent(e.target.value)}
              className="bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-teal-500 focus:border-teal-500"
              aria-label="New task component name"
            />
            <input 
              type="text" 
              placeholder="Task Description (e.g., Bearing Inspection)"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-teal-500 focus:border-teal-500"
              aria-label="New task description"
            />
            <input 
              type="text" 
              placeholder="Due Date (e.g., 2 Days)"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              className="bg-gray-900 border border-gray-600 rounded-md p-2 text-gray-200 focus:ring-teal-500 focus:border-teal-500"
              aria-label="New task due date"
            />
          </div>
          <div className="flex justify-end space-x-3 mt-4">
            <button onClick={handleCancel} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded-md transition-colors">
              Cancel
            </button>
            <button onClick={handleAddTask} className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-md transition-colors">
              Save Task
            </button>
          </div>
        </div>
      )}

      <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-800">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Component</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Task</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Due Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    </tr>
                </thead>
                <tbody className="bg-gray-900/50 divide-y divide-gray-800">
                    {maintenanceTasks.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-800/70 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-200">{item.component}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.task}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{item.dueDate}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusStyles[item.status]}`}>
                                    {item.status}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceSchedule;