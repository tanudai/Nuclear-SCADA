import React from 'react';

interface TooltipProps {
  text: string;
  children: React.ReactNode;
}

const Tooltip: React.FC<TooltipProps> = ({ text, children }) => {
  return (
    <div className="relative group flex justify-center">
      {children}
      <span className="absolute bottom-full mb-2 w-max max-w-xs px-3 py-1.5 bg-gray-900 text-white text-xs rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20 border border-gray-700">
        {text}
      </span>
    </div>
  );
};

export default Tooltip;
