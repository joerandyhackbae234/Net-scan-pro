
import React, { useState } from 'react';
import { Lock, ShieldCheck, ArrowRight, AlertCircle, Cpu } from 'lucide-react';

interface TokenGateProps {
  onVerify: (token: string) => boolean;
}

const TokenGate: React.FC<TokenGateProps> = ({ onVerify }) => {
  const [token, setToken] = useState('');
  const [error, setError] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(false);

    // Simulasi delay verifikasi untuk efek keren
    setTimeout(() => {
      const isValid = onVerify(token);
      if (!isValid) {
        setError(true);
        setIsSubmitting(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden bg-[#050810]">
      {/* Background Decor */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="glass rounded-[2.5rem] p-10 border-t border-white/10 shadow-2xl">
          <div className="flex flex-col items-center text-center mb-10">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/40 mb-6 group">
              <Lock className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
            </div>
            <h1 className="text-3xl font-black text-white mb-2 tracking-tight">Access Restricted</h1>
            <p className="text-slate-400 text-sm">Masukkan Access Token eksklusif Anda untuk melanjutkan ke dashboard NetScan Pro.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <ShieldCheck className={`w-5 h-5 transition-colors ${error ? 'text-red-500' : 'text-slate-500 group-focus-within:text-blue-500'}`} />
              </div>
              <input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Enter Token (e.g. NETSCAN-XXXX)"
                className={`w-full bg-black/40 border ${error ? 'border-red-500/50' : 'border-white/10 group-focus-within:border-blue-500/50'} rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none transition-all font-medium`}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-400 text-xs font-bold animate-shake p-3 bg-red-500/5 rounded-xl border border-red-500/10">
                <AlertCircle className="w-4 h-4" />
                Token tidak valid atau sudah kedaluwarsa.
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !token}
              className="w-full group bg-white hover:bg-blue-600 text-slate-950 hover:text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                  Verifying...
                </div>
              ) : (
                <>
                  Buka Akses
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between text-[10px] mono text-slate-500 uppercase font-bold tracking-widest">
            <div className="flex items-center gap-2">
              <Cpu className="w-3 h-3" />
              Secure-Node-Active
            </div>
            <span>V4.0.2 Stable</span>
          </div>
        </div>
        
        <p className="mt-8 text-center text-slate-600 text-[10px] mono uppercase tracking-[0.2em]">
          NETSCAN PRO © 2024 JAKARTA LAB SYSTEMS
        </p>
      </div>
    </div>
  );
};

export default TokenGate;
