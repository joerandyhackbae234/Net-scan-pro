
import React from 'react';

interface RadarScannerProps {
  isScanning: boolean;
}

const RadarScanner: React.FC<RadarScannerProps> = ({ isScanning }) => {
  return (
    <div className="relative w-72 h-72 md:w-80 md:h-80 select-none">
      {/* Decorative Outer Ring */}
      <div className="absolute inset-[-10%] rounded-full border border-white/5 border-dashed animate-[spin_20s_linear_infinite]" />
      
      {/* Degree Markers */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
        <div 
          key={deg} 
          className="absolute top-1/2 left-1/2 w-full h-px origin-left -translate-y-1/2"
          style={{ transform: `rotate(${deg}deg) translateX(0)` }}
        >
          <div className="absolute right-0 w-2 h-2 bg-slate-800 rounded-full" />
        </div>
      ))}

      {/* Main Radar Body */}
      <div className="absolute inset-0 rounded-full glass border-white/10 flex items-center justify-center overflow-hidden">
        {/* Grids */}
        <div className="absolute inset-0 flex flex-col justify-between p-4 py-8">
           <div className="w-full h-px bg-white/5" />
           <div className="w-full h-px bg-white/5" />
           <div className="w-full h-px bg-white/5" />
           <div className="w-full h-px bg-white/5" />
        </div>
        <div className="absolute inset-0 flex justify-between p-8 py-4">
           <div className="h-full w-px bg-white/5" />
           <div className="h-full w-px bg-white/5" />
           <div className="h-full w-px bg-white/5" />
           <div className="h-full w-px bg-white/5" />
        </div>

        {/* Concentric Circles */}
        <div className="absolute inset-4 rounded-full border border-white/5" />
        <div className="absolute inset-16 rounded-full border border-white/5" />
        <div className="absolute inset-28 rounded-full border border-white/5" />
        <div className="absolute w-8 h-8 rounded-full border border-white/10 bg-blue-500/10" />

        {/* Scanning Beam */}
        <div className={`absolute inset-0 transition-opacity duration-500 ${isScanning ? 'opacity-100' : 'opacity-20'}`}>
          <div 
            className="absolute top-1/2 left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-gradient-to-tr from-transparent via-blue-500/10 to-transparent origin-center animate-scan"
            style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)' }}
          />
          <div 
             className="absolute top-1/2 left-1/2 w-[100%] h-px bg-blue-500/50 shadow-[0_0_20px_#3b82f6] origin-left animate-scan"
             style={{ transform: 'translateY(-50%) rotate(0deg)' }}
          />
        </div>

        {/* Floating Anomalies (Towers) */}
        <div className={`absolute top-[25%] left-[65%] flex flex-col items-center gap-1 transition-transform duration-1000 ${isScanning ? 'scale-110' : 'scale-100 opacity-50'}`}>
          <div className="w-3 h-3 bg-blue-500 rounded-full shadow-[0_0_15px_#3b82f6] animate-pulse" />
          <span className="text-[8px] mono text-blue-400 font-bold bg-blue-500/10 px-1 rounded">X-102</span>
        </div>
        
        <div className={`absolute bottom-[30%] left-[20%] flex flex-col items-center gap-1 transition-transform duration-1000 ${isScanning ? 'scale-110' : 'scale-100 opacity-50'}`}>
          <div className="w-2.5 h-2.5 bg-red-500 rounded-full shadow-[0_0_15px_#ef4444] animate-pulse delay-700" />
          <span className="text-[8px] mono text-red-400 font-bold bg-red-500/10 px-1 rounded">T-044</span>
        </div>

        <div className={`absolute top-[60%] right-[15%] flex flex-col items-center gap-1 transition-transform duration-1000 ${isScanning ? 'scale-110' : 'scale-100 opacity-50'}`}>
          <div className="w-2 h-2 bg-emerald-500 rounded-full shadow-[0_0_15px_#10b981] animate-pulse delay-300" />
          <span className="text-[8px] mono text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded">I-988</span>
        </div>
      </div>

      {/* Center Beacon */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-[0_0_30px_#fff] z-10" />
    </div>
  );
};

export default RadarScanner;
