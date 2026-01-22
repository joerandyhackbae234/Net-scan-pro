
import React from 'react';

interface SignalMetricProps {
  label: string;
  value: string;
  subLabel: string;
  icon: React.ReactNode;
}

const SignalMetric: React.FC<SignalMetricProps> = ({ label, value, subLabel, icon }) => {
  return (
    <div className="bg-white/5 border border-white/5 rounded-3xl p-5 flex flex-col items-center text-center group hover:bg-white/[0.08] transition-colors">
      <div className="p-3 bg-slate-900 rounded-2xl mb-4 border border-white/5 group-hover:scale-110 transition-transform">
        <div className="text-blue-500">{icon}</div>
      </div>
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1">{label}</span>
      <span className="text-2xl font-black text-white tracking-tighter">{value}</span>
      <span className="text-[10px] text-slate-500 font-medium mt-1">{subLabel}</span>
    </div>
  );
};

export default SignalMetric;
