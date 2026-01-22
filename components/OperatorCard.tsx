
import React from 'react';
import { Signal, Clock, Zap, ArrowUpRight, ShieldCheck, Activity } from 'lucide-react';
import { OperatorData } from '../types';

interface OperatorCardProps {
  data: OperatorData;
}

const OperatorCard: React.FC<OperatorCardProps> = ({ data }) => {
  const isExcellent = data.status === 'Excellent';
  
  return (
    <div className="glass rounded-[2rem] p-6 group cursor-pointer transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.4)] border-t border-white/10 relative overflow-hidden">
      {/* Background Glow */}
      <div 
        className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-10 transition-opacity group-hover:opacity-40" 
        style={{ backgroundColor: data.color }}
      />
      
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div className="flex items-center gap-4">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 group-hover:scale-110 shadow-lg"
            style={{ 
              backgroundColor: `${data.color}15`, 
              borderColor: `${data.color}30` 
            }}
          >
            <div className="relative">
              <Signal className="w-6 h-6" style={{ color: data.color }} />
              {data.verified && (
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5">
                  <ShieldCheck className="w-2.5 h-2.5 text-blue-600" fill="currentColor" />
                </div>
              )}
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-xl text-white group-hover:text-blue-400 transition-colors">{data.name}</h3>
              <span className={`px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest ${data.type.includes('5G') ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-blue-500/20 text-blue-400 border border-blue-500/20'}`}>
                {data.type}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              {data.bands.map((band, idx) => (
                <span key={idx} className="text-[8px] mono font-bold text-slate-500 bg-slate-800/50 px-1.5 py-0.5 rounded">
                  {band}
                </span>
              ))}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 text-emerald-400 mb-1">
            <ShieldCheck className="w-3 h-3" />
            <span className="text-[10px] font-black">{data.integrityScore}% Valid</span>
          </div>
        </div>
      </div>

      <div className="space-y-5 relative z-10">
        <div className="p-4 bg-black/30 rounded-2xl border border-white/5 backdrop-blur-md">
          <div className="flex justify-between items-center mb-3">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
               <Activity className="w-3 h-3 text-blue-500" /> Signal Strength
             </span>
             <span className="text-lg font-black text-white">{data.strength}%</span>
          </div>
          <div className="h-1.5 w-full bg-slate-800/50 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-1000 ease-out" 
              style={{ width: `${data.strength}%`, backgroundColor: data.color, boxShadow: `0 0 10px ${data.color}` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex items-center gap-3 hover:bg-white/10 transition-colors">
            <Clock className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase leading-none mb-1">Response</p>
              <p className="text-sm font-black text-white">{data.latency}<span className="text-[10px] text-slate-500 ml-0.5">ms</span></p>
            </div>
          </div>
          <div className="bg-white/5 p-3 rounded-2xl border border-white/5 flex items-center gap-3 hover:bg-white/10 transition-colors">
            <Zap className="w-4 h-4 text-slate-500" />
            <div>
              <p className="text-[9px] font-bold text-slate-500 uppercase leading-none mb-1">Integrity</p>
              <p className="text-sm font-black text-white">{data.integrityScore > 90 ? 'High' : 'Medium'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OperatorCard;
