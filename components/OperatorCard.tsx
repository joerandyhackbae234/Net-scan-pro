
import React from 'react';
import { Signal, Clock, Zap, ArrowUpRight } from 'lucide-react';
import { OperatorData } from '../types';

interface OperatorCardProps {
  data: OperatorData;
}

const OperatorCard: React.FC<OperatorCardProps> = ({ data }) => {
  const isExcellent = data.status === 'Excellent';
  
  return (
    <div className="glass rounded-[2rem] p-6 group cursor-pointer transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.3)] border-t border-white/10 relative overflow-hidden">
      {/* Glow effect matching operator color */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 transition-opacity group-hover:opacity-30" 
        style={{ backgroundColor: data.color }}
      />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110"
            style={{ 
              backgroundColor: `${data.color}15`, 
              borderColor: `${data.color}30` 
            }}
          >
            <div className="relative">
              <Signal className="w-6 h-6" style={{ color: data.color }} />
              {isExcellent && (
                 <span className="absolute -top-1 -right-1 flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ backgroundColor: data.color }}></span>
                    <span className="relative inline-flex rounded-full h-2 w-2" style={{ backgroundColor: data.color }}></span>
                  </span>
              )}
            </div>
          </div>
          <div>
            <h3 className="font-extrabold text-xl text-white group-hover:text-blue-400 transition-colors">{data.name}</h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] mono font-bold text-slate-500 uppercase tracking-widest">{data.type} Connection</span>
              <span className="w-1 h-1 rounded-full bg-slate-700"></span>
              <span className="text-[10px] mono font-bold text-slate-500 uppercase">Sub-6GHz</span>
            </div>
          </div>
        </div>
        <button className="p-2 bg-white/5 rounded-xl border border-white/5 opacity-0 group-hover:opacity-100 transition-opacity">
          <ArrowUpRight className="w-4 h-4 text-slate-400" />
        </button>
      </div>

      <div className="space-y-6 relative z-10">
        <div className="p-4 bg-black/20 rounded-2xl border border-white/5">
          <div className="flex justify-between items-center mb-3">
             <span className="text-[10px] font-black uppercase tracking-tighter text-slate-400">Signal Fidelity</span>
             <span className="text-lg font-black text-white">{data.strength}%</span>
          </div>
          <div className="h-2 w-full bg-slate-800/50 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(59,130,246,0.3)]" 
              style={{ width: `${data.strength}%`, backgroundColor: data.color }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex items-center gap-3">
            <Clock className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase leading-none mb-1">Latency</p>
              <p className="text-sm font-black text-white">{data.latency}<span className="text-[10px] text-slate-500 ml-0.5">ms</span></p>
            </div>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex items-center gap-3">
            <Zap className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase leading-none mb-1">Stability</p>
              <p className="text-sm font-black text-white">{data.status === 'Excellent' ? '99.9%' : '94.2%'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorCard;
