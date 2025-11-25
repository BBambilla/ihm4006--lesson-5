import React from 'react';

interface AngerMeterProps {
  level: number; // 0-10
  onBack?: () => void;
}

const AngerMeter: React.FC<AngerMeterProps> = ({ level, onBack }) => {
  // Determine color based on severity
  const getColorClass = (val: number) => {
    if (val < 4) return 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'; // Green/Success
    if (val < 8) return 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.5)]';   // Yellow/Warning
    return 'bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.8)]';                   // Red/Danger
  };

  const getEmoji = (val: number) => {
    if (val < 2) return '😌';
    if (val < 4) return '😐';
    if (val < 6) return '😠';
    if (val < 8) return '😡';
    return '🤬';
  };

  const getLabel = (val: number) => {
    if (val < 2) return 'CALM / RESOLVED';
    if (val < 4) return 'ANNOYED';
    if (val < 6) return 'UPSET';
    if (val < 8) return 'FURIOUS';
    return 'IRATE (DANGER)';
  };

  // Calculate percentage for width
  const percentage = Math.min(Math.max((level / 10) * 100, 5), 100);

  return (
    <div className={`w-full bg-gray-900 border-b border-gray-700 p-4 sticky top-0 z-20 transition-colors duration-500 ${level >= 9 ? 'rage-mode border-red-900' : ''}`}>
      <div className="max-w-3xl mx-auto">
        
        {/* Navigation / Back Button */}
        {onBack && (
          <button 
            onClick={onBack}
            className="group flex items-center gap-2 mb-4 text-xs font-mono text-gray-500 hover:text-emerald-400 transition-colors uppercase tracking-widest"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m15 18-6-6 6-6"/>
            </svg>
            <span className="group-hover:translate-x-1 transition-transform">Change Scenario</span>
          </button>
        )}

        <div className="flex justify-between items-end mb-2 text-white">
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-mono tracking-widest uppercase mb-1">Guest Emotion</span>
            <span className={`font-black text-xl tracking-tighter transition-colors duration-300 ${level >= 8 ? 'text-red-500' : 'text-gray-100'}`}>
              {getLabel(level)}
            </span>
          </div>
          <div className="text-4xl animate-bounce" style={{ animationDuration: level >= 8 ? '0.5s' : '2s' }}>
            {getEmoji(level)}
          </div>
        </div>

        {/* The Meter Track */}
        <div className="h-6 w-full bg-gray-800 rounded-full overflow-hidden border border-gray-700 relative">
          
          {/* Tick marks */}
          <div className="absolute top-0 left-0 w-full h-full flex justify-between px-1 z-10 pointer-events-none">
             {[...Array(11)].map((_, i) => (
               <div key={i} className={`h-full w-px ${i === 0 || i === 10 ? 'bg-transparent' : 'bg-gray-900/30'}`}></div>
             ))}
          </div>

          {/* The Fill Bar */}
          <div 
            className={`h-full transition-all duration-700 ease-out flex items-center justify-end pr-2 ${getColorClass(level)}`}
            style={{ width: `${percentage}%` }}
          >
            <span className="text-xs font-bold text-white drop-shadow-md font-mono">{level}/10</span>
          </div>
        </div>
        
        {/* Helper text for students */}
        <div className="mt-1 flex justify-between text-[10px] text-gray-500 font-mono uppercase">
           <span>Safe Zone</span>
           <span>Danger Zone</span>
        </div>
      </div>
    </div>
  );
};

export default AngerMeter;