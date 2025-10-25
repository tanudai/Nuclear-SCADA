import React from 'react';
import { PlantData } from '../types';
import { getAiDiagnosis } from '../services/geminiService';

interface AIDiagnosticsModalProps {
  plantData: PlantData;
  onClose: () => void;
}

const AIDiagnosticsModal: React.FC<AIDiagnosticsModalProps> = ({ plantData, onClose }) => {
  const [isLoading, setIsLoading] = React.useState(true);
  const [diagnosis, setDiagnosis] = React.useState('');

  React.useEffect(() => {
    const fetchDiagnosis = async () => {
      setIsLoading(true);
      const result = await getAiDiagnosis(plantData);
      setDiagnosis(result);
      setIsLoading(false);
    };
    fetchDiagnosis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A simple markdown to HTML converter
  const renderMarkdown = (text: string) => {
    let html = text;
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Bullets
    html = html.replace(/^\s*-\s+(.*)/gm, '<li class="ml-4">$1</li>');
    html = html.replace(/(\<li.*\>.*<\/li\>)/gs, '<ul>$1</ul>');
    return { __html: html };
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true">
      <div className="bg-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-2xl border border-teal-500/30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-teal-400">AI Diagnostics Assistant</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="bg-gray-900/50 p-4 rounded-md h-96 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-400"></div>
              <p className="mt-4 text-gray-300">Analyzing plant data...</p>
            </div>
          ) : (
            <div className="prose prose-invert text-gray-300" dangerouslySetInnerHTML={renderMarkdown(diagnosis)}></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIDiagnosticsModal;