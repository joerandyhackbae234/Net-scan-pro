
import React from 'react';
import { X, Trash2, Clock, MapPin, Signal } from 'lucide-react';

interface ScanHistoryProps {
  logs: any[];
  onClear: () => void;
  onClose: () => void;
}

const ScanHistory: React.FC<ScanHistoryProps> = ({ logs, onClear, onClose }) => {
  return (
    <div className="glass rounded-[2rem] p-6 border border-white/10 shadow-2xl animate-in slide-in-from-bottom-4 duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-sm font-bold uppercase tracking-widest text-white flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-500" />
          Recent Scans
        </h3>
        <div className="flex gap-2">
          <button onClick={onClear} className="p-2 hover:bg-red-500/10 rounded-lg group" title="Hapus Semua">
            <Trash2 className="w-4 h-4 text-slate-500 group-hover:text-red-500 transition-colors" />
          </button>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-lg">
            <X className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {logs.length === 0 ? (
          <p className="text-xs text-slate-500 text-center py-10">Belum ada riwayat pemindaian.</p>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="p-4 bg-white/5 rounded-2xl border border-white/5 hover:bg-white/[0.08] transition-all">
              <div className="flex justify-between items-start mb-2">
                <span className="text-[10px] font-bold text-blue-400 mono">{log.date}</span>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                   <MapPin className="w-3 h-3" /> {log.location}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <span className="text-xs font-bold text-slate-200">{log.topOperator}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Signal className="w-3 h-3 text-slate-500" />
                  <span className="text-xs font-black text-white">{log.strength}%</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ScanHistory;
