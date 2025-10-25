import React, { useState, useEffect, useRef, useCallback } from 'react';
import { PlantData } from '../types';

interface TrendingChartsProps {
  dataHistory: PlantData[];
}

interface LineChartProps {
  data: number[];
  timestamps: string[];
  title: string;
  color: string;
  unit: string;
  height?: number;
  width?: number;
}

const LineChart: React.FC<LineChartProps> = ({ data, timestamps, title, color, unit, height = 200, width = 400 }) => {
  const [hoverInfo, setHoverInfo] = useState<{ x: number; y: number; value: string; timestamp: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State for zoom and pan
  const [viewRange, setViewRange] = useState({ start: 0, end: data.length > 1 ? data.length - 1 : 1 });
  
  // Refs for panning logic
  const isPanning = useRef(false);
  const panStart = useRef({ x: 0, start: 0, end: 0 });

  // Reset view when data source changes
  useEffect(() => {
    setViewRange({ start: 0, end: data.length > 1 ? data.length - 1 : 1 });
  }, [data.length]);
  
  const resetView = useCallback(() => {
      setViewRange({ start: 0, end: data.length > 1 ? data.length - 1 : 1 });
  }, [data.length]);

  const isZoomed = viewRange.start > 0 || viewRange.end < data.length - 1;

  // Slicing data for current view
  const visibleData = data.slice(viewRange.start, viewRange.end + 1);
  const visibleTimestamps = timestamps.slice(viewRange.start, viewRange.end + 1);

  if (visibleData.length < 2) {
    return (
        <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 h-full flex flex-col items-center justify-center text-gray-500">
            Collecting data...
        </div>
    );
  }

  // Y-axis scaling based on visible data
  const maxVal = Math.max(...visibleData, 0) * 1.1 || 1;
  const minVal = Math.min(...visibleData) >= 0 ? 0 : Math.min(...visibleData) * 0.9;
  const range = maxVal - minVal === 0 ? 1 : maxVal - minVal;
  
  const points = visibleData
    .map((point, i) => {
      const x = (i / (visibleData.length - 1)) * width;
      const y = height - ((point - minVal) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');
    
  const latestValue = data.length > 0 ? data[data.length - 1].toFixed(title.includes('Radiation') ? 4 : 1) : '0.0';

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || e.button !== 0) return;
    e.preventDefault();
    isPanning.current = true;
    panStart.current = { x: e.clientX, start: viewRange.start, end: viewRange.end };
    containerRef.current.style.cursor = 'grabbing';
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;

    if (isPanning.current) {
        // Panning logic
        const dx = e.clientX - panStart.current.x;
        const currentViewRange = panStart.current.end - panStart.current.start;
        const pixelsPerIndex = containerRef.current.clientWidth / (currentViewRange + 1);
        
        if (pixelsPerIndex <= 0) return;

        const dIndex = Math.round(dx / pixelsPerIndex);

        let newStart = panStart.current.start - dIndex;
        let newEnd = panStart.current.end - dIndex;

        // Clamp to boundaries
        if (newStart < 0) {
            newEnd = currentViewRange;
            newStart = 0;
        }
        if (newEnd >= data.length) {
            newStart = data.length - 1 - currentViewRange;
            newEnd = data.length - 1;
        }

        setViewRange({ start: newStart, end: newEnd });
    } else {
        // Tooltip logic
        const rect = containerRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const indexInView = Math.min(visibleData.length - 1, Math.max(0, Math.round((x / rect.width) * (visibleData.length - 1))));
        const originalIndex = viewRange.start + indexInView;
        
        const pointValue = data[originalIndex];
        const pointTimestamp = timestamps[originalIndex];
        
        const pointX = (indexInView / (visibleData.length - 1)) * width;
        const pointY = height - ((pointValue - minVal) / range) * height;

        setHoverInfo({
          x: pointX,
          y: pointY,
          value: pointValue.toFixed(title.includes('Radiation') ? 4 : 2),
          timestamp: pointTimestamp,
        });
    }
  };

  const handleMouseUp = () => {
    if (isPanning.current) {
      isPanning.current = false;
      if (containerRef.current) {
        containerRef.current.style.cursor = 'grab';
      }
    }
  };
  
  const handleMouseLeave = () => {
      handleMouseUp();
      setHoverInfo(null);
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    e.preventDefault();
    
    const zoomIntensity = 0.1;
    const currentViewRange = viewRange.end - viewRange.start;
    const rect = containerRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const anchorRatio = mouseX / rect.width;

    let zoomDirection = e.deltaY < 0 ? -1 : 1; // -1 for zoom in, 1 for zoom out
    
    // Prevent zooming too far in or out
    if (currentViewRange <= 5 && zoomDirection === -1) return;
    if (currentViewRange >= data.length - 1 && zoomDirection === 1) {
        resetView();
        return;
    }

    const rangeChange = Math.ceil(currentViewRange * zoomIntensity);

    let newStart = viewRange.start + Math.round(rangeChange * anchorRatio * zoomDirection);
    let newEnd = viewRange.end - Math.round(rangeChange * (1-anchorRatio) * zoomDirection);

    // Clamp to data boundaries
    newStart = Math.max(0, newStart);
    newEnd = Math.min(data.length - 1, newEnd);
    
    // Ensure we don't zoom in too far or create an invalid range
    if (newEnd - newStart < 5 || newStart >= newEnd) {
        return;
    }

    setViewRange({ start: newStart, end: newEnd });
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700 h-full flex flex-col">
        <div className="flex justify-between items-center mb-2">
            <div className="flex items-center">
                <span className="w-3 h-3 rounded-sm mr-2 flex-shrink-0" style={{ backgroundColor: color }} aria-hidden="true"></span>
                <h4 className="font-semibold text-gray-300">{title}</h4>
            </div>
            <div className="flex items-center space-x-3">
                 {isZoomed && (
                    <button 
                        onClick={resetView} 
                        className="text-xs text-cyan-400 hover:text-cyan-300 bg-cyan-900/50 px-2 py-0.5 rounded transition-colors"
                        aria-label={`Reset zoom for ${title}`}
                    >
                        Reset
                    </button>
                )}
                <p style={{ color }} className="font-mono text-xl font-bold">
                    {latestValue} <span className="text-sm font-normal text-gray-400">{unit}</span>
                </p>
            </div>
        </div>
        <div 
          ref={containerRef}
          className="flex-grow relative cursor-grab"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
        >
            <svg viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="w-full h-full">
                <polyline
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  points={points}
                />
                 {hoverInfo && (
                    <g>
                        <line
                            x1={hoverInfo.x}
                            y1="0"
                            x2={hoverInfo.x}
                            y2={height}
                            stroke="#9ca3af"
                            strokeWidth="1"
                            strokeDasharray="3,3"
                        />
                        <circle
                            cx={hoverInfo.x}
                            cy={hoverInfo.y}
                            r="4"
                            fill={color}
                            stroke="white"
                            strokeWidth="1.5"
                        />
                    </g>
                )}
            </svg>
            {hoverInfo && containerRef.current && (
                <div
                    className="absolute p-2 text-xs bg-gray-900 border border-gray-700 rounded-md shadow-lg pointer-events-none z-10"
                    style={{
                        top: `${hoverInfo.y}px`,
                        left: `${hoverInfo.x + 15}px`,
                        transform: `translateY(-50%) ${hoverInfo.x > containerRef.current.clientWidth * 0.75 ? 'translateX(calc(-100% - 30px))' : ''}`,
                    }}
                >
                    <div className="font-semibold text-gray-300">{hoverInfo.timestamp}</div>
                    <div className="font-mono font-bold" style={{ color: color }}>
                        {hoverInfo.value} {unit}
                    </div>
                </div>
            )}
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>{isZoomed ? 'Zoomed View' : '-5 min'}</span>
            <span>Now</span>
        </div>
    </div>
  );
};


const TrendingCharts: React.FC<TrendingChartsProps> = ({ dataHistory }) => {
    const [displayHistory, setDisplayHistory] = useState<PlantData[]>(dataHistory);
    const dataHistoryRef = useRef(dataHistory);
    dataHistoryRef.current = dataHistory;

    useEffect(() => {
        const intervalId = setInterval(() => {
            setDisplayHistory(dataHistoryRef.current);
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const now = new Date();
    const timestamps = displayHistory.map((_, index) => {
        const secondsAgo = displayHistory.length - 1 - index;
        return new Date(now.getTime() - secondsAgo * 1000).toLocaleTimeString();
    });

    const temperatureData = displayHistory.map(d => d.reactorTemperature);
    const powerData = displayHistory.map(d => d.powerOutput);
    const pressureData = displayHistory.map(d => d.coolantPressure);
    const gridDemandData = displayHistory.map(d => d.gridDemand);
    const radiationData = displayHistory.map(d => d.radiationLevel);
    const controlRodData = displayHistory.map(d => d.controlRodPosition);

  return (
    <div className="p-4 md:p-6">
        <h2 className="text-2xl font-bold text-gray-100 mb-4">Historical Data Trending</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
            <LineChart data={temperatureData} timestamps={timestamps} title="Reactor Temperature" color="#f59e0b" unit="°C" />
            <LineChart data={powerData} timestamps={timestamps} title="Power Output" color="#3b82f6" unit="MW" />
            <LineChart data={pressureData} timestamps={timestamps} title="Coolant Pressure" color="#10b981" unit="bar" />
            <LineChart data={gridDemandData} timestamps={timestamps} title="Grid Demand" color="#60a5fa" unit="MW" />
            <LineChart data={radiationData} timestamps={timestamps} title="Radiation Level" color="#8b5cf6" unit="mSv/h" />
            <LineChart data={controlRodData} timestamps={timestamps} title="Control Rod Position" color="#d1d5db" unit="%" />
        </div>
    </div>
  );
};

export default TrendingCharts;
