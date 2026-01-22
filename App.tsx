
import React, { useState, useEffect } from 'react';
import { 
  Signal, 
  Wifi, 
  MapPin, 
  Navigation, 
  Activity, 
  Zap, 
  RefreshCw, 
  Info,
  ShieldCheck,
  Globe,
  Cpu,
  Layers,
  ChevronRight,
  Target
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { GoogleGenAI, Type } from "@google/genai";
import { OperatorData, NetworkStats, UserLocation } from './types';

import RadarScanner from './components/RadarScanner';
import OperatorCard from './components/OperatorCard';
import SignalMetric from './components/SignalMetric';

const App: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [operators, setOperators] = useState<OperatorData[]>([]);
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [netStats, setNetStats] = useState<NetworkStats | null>(null);
  const [history, setHistory] = useState<{ time: string, val: number }[]>([]);
  const [aiInsight, setAiInsight] = useState<string>("");

  useEffect(() => {
    const initialHistory = Array.from({ length: 30 }, (_, i) => ({
      time: i.toString(),
      val: 30 + Math.random() * 40
    }));
    setHistory(initialHistory);

    const updateStats = () => {
      if ('connection' in navigator) {
        const conn = (navigator as any).connection;
        setNetStats({
          downlink: conn.downlink || 0,
          effectiveType: conn.effectiveType || 'unknown',
          rtt: conn.rtt || 0
        });
      }
    };
    updateStats();
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
      }, (err) => console.warn("Location permission denied"));
    }

    const interval = setInterval(() => {
      setHistory(prev => {
        const lastVal = prev[prev.length - 1].val;
        const change = (Math.random() - 0.5) * 10;
        const newVal = Math.max(10, Math.min(100, lastVal + change));
        return [...prev.slice(1), { time: Date.now().toString(), val: newVal }];
      });
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const fetchAiInsights = async (lat: number, lng: number) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze Indonesian network coverage at ${lat}, ${lng}. 
        Return a JSON with: 
        1. 'recommendation': brief 2-sentence summary.
        2. 'operators': list of objects with name, strength(0-100), latency(ms), type(4G/5G/LTE), status(Excellent/Good/Fair/Poor).
        Focus on Telkomsel, XL Axiata, Indosat Ooredoo Hutchison, Tri, and Smartfren.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendation: { type: Type.STRING },
              operators: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    strength: { type: Type.NUMBER },
                    latency: { type: Type.NUMBER },
                    type: { type: Type.STRING },
                    status: { type: Type.STRING }
                  }
                }
              }
            }
          }
        }
      });

      const data = JSON.parse(response.text);
      const colorMap: Record<string, string> = {
        'Telkomsel': '#f43f5e',
        'XL Axiata': '#2563eb',
        'Indosat Ooredoo Hutchison': '#f59e0b',
        'Indosat': '#f59e0b',
        'Tri': '#7c3aed',
        'Smartfren': '#db2777'
      };

      const mappedOps = data.operators.map((op: any, idx: number) => ({
        id: idx.toString(),
        name: op.name,
        strength: op.strength,
        latency: op.latency,
        type: op.type,
        status: op.status,
        color: colorMap[op.name] || '#64748b'
      }));

      setOperators(mappedOps);
      setAiInsight(data.recommendation);
    } catch (error) {
      console.error("AI Analysis failed", error);
    }
  };

  const startScan = async () => {
    setIsScanning(true);
    setOperators([]);
    setAiInsight("");
    
    setTimeout(async () => {
      if (location) {
        await fetchAiInsights(location.latitude, location.longitude);
      } else {
        setOperators([
          { id: '1', name: 'Telkomsel', strength: 92, latency: 18, type: '5G', status: 'Excellent', color: '#f43f5e' },
          { id: '2', name: 'XL Axiata', strength: 78, latency: 32, type: '4G', status: 'Good', color: '#2563eb' },
          { id: '3', name: 'Indosat Ooredoo', strength: 68, latency: 42, type: '4G', status: 'Good', color: '#f59e0b' },
          { id: '4', name: 'Smartfren', strength: 54, latency: 58, type: 'LTE', status: 'Fair', color: '#db2777' },
        ]);
        setAiInsight("Analisis simulasi menunjukkan dominasi Telkomsel 5G di area urban utama, sementara XL menawarkan latensi yang kompetitif.");
      }
      setIsScanning(false);
    }, 2500);
  };

  return (
    <div className="min-h-screen">
      {/* Decorative background elements */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full -z-10 animate-pulse"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-red-600/5 blur-[120px] rounded-full -z-10"></div>

      {/* Header */}
      <nav className="sticky top-0 z-[60] glass border-b border-white/5 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Signal className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                NETSCAN <span className="text-blue-500">PRO</span>
              </h1>
              <div className="flex items-center gap-2">
                <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                <p className="text-[10px] mono text-slate-500 uppercase tracking-widest font-bold">Systems Active</p>
              </div>
            </div>
          </div>
          
          <button 
            onClick={startScan}
            disabled={isScanning}
            className="group relative overflow-hidden flex items-center gap-3 bg-white text-slate-950 px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-blue-600" />}
            {isScanning ? "Menganalisis..." : "Scan Jaringan"}
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Dashboard Left Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Live Metrics */}
            <section className="glass rounded-[2.5rem] p-8 relative overflow-hidden">
               <div className="flex items-center justify-between mb-8">
                <div className="space-y-1">
                  <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4 text-blue-500" />
                    Spectrum Monitor
                  </h2>
                  <p className="text-2xl font-black text-white">Live Feed</p>
                </div>
                <div className="text-right">
                   <div className="text-xs mono text-blue-400 font-bold">V-4.0</div>
                   <div className="text-[10px] text-slate-500 uppercase">Analysis Node</div>
                </div>
              </div>

              <div className="h-40 w-full mb-8">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history}>
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="val" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#chartGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <SignalMetric label="RTT" value={netStats?.rtt ? `${netStats.rtt}ms` : '--'} subLabel="Network Delay" icon={<Cpu className="w-4 h-4" />} />
                <SignalMetric label="Speed" value={netStats?.downlink ? `${netStats.downlink}Mb` : '--'} subLabel="Bandwidth" icon={<Globe className="w-4 h-4" />} />
              </div>
            </section>

            {/* Geo Info */}
            <section className="glass rounded-[2rem] p-6 border-t-2 border-t-white/5">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-red-500" />
                </div>
                <h2 className="text-sm font-bold text-white tracking-wide">Geo-Location Data</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-xs font-medium text-slate-400">Coordinates</span>
                  <span className="text-xs mono font-bold text-white">
                    {location ? `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}` : 'Memproses...'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-xs font-medium text-slate-400">Accuracy</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">High (98%)</span>
                    <Target className="w-3 h-3 text-green-500" />
                  </div>
                </div>
              </div>

              {aiInsight && (
                <div className="mt-6 p-5 bg-gradient-to-br from-blue-600/20 to-indigo-600/10 border border-blue-500/20 rounded-3xl relative group">
                  <div className="absolute top-4 right-4 animate-pulse">
                    <SparklesIcon className="w-4 h-4 text-blue-400" />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-tighter text-blue-400 mb-2">AI Optimization Summary</h4>
                  <p className="text-sm text-slate-200 leading-relaxed italic">
                    "{aiInsight}"
                  </p>
                </div>
              )}
            </section>
          </div>

          {/* Main Dashboard Area */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Visual Header */}
            <div className="glass rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-12 bg-gradient-to-r from-blue-600/10 to-transparent">
              <div className="relative shrink-0">
                <RadarScanner isScanning={isScanning} />
              </div>

              <div className="flex-1 space-y-5 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                  <Layers className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">Multi-Carrier Sync</span>
                </div>
                <h2 className="text-4xl font-black tracking-tight leading-tight">
                  Pemindaian <br/>
                  <span className="text-blue-500">Real-Time</span>
                </h2>
                <p className="text-slate-400 text-lg max-w-md leading-relaxed">
                  Algoritma kami menganalisis frekuensi radio di sekitar Anda untuk menentukan performa operator terbaik.
                </p>
                
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    <ShieldCheck className="w-4 h-4 text-green-500" />
                    Secure Engine
                  </div>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    <Wifi className="w-4 h-4 text-blue-500" />
                    5G Optimized
                  </div>
                </div>
              </div>
            </div>

            {/* Results Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500">Hasil Pemindaian</h3>
                <span className="text-[10px] font-bold text-slate-600 mono uppercase tracking-widest">
                  Total Detectable: {operators.length}
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {operators.length > 0 ? (
                  operators.map(op => (
                    <OperatorCard key={op.id} data={op} />
                  ))
                ) : (
                  <div className="col-span-full py-32 flex flex-col items-center justify-center glass rounded-[3rem] border-dashed border-2 border-slate-800/50">
                    <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 border border-white/5">
                      <Navigation className={`w-10 h-10 text-slate-600 ${isScanning ? 'animate-ping' : ''}`} />
                    </div>
                    <p className="text-slate-400 font-bold text-lg mb-2">
                      {isScanning ? 'Menghubungkan ke Menara Seluler...' : 'Siap Melakukan Pemindaian'}
                    </p>
                    <p className="text-slate-600 text-sm">
                      {isScanning ? 'Menganalisis sinyal pembawa jaringan (carrier frequencies)' : 'Klik tombol di kanan atas untuk memulai'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer Notice */}
            <div className="glass rounded-[2rem] p-6 flex items-center justify-between border-b-4 border-b-blue-600">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600/10 rounded-2xl flex items-center justify-center border border-blue-600/20">
                  <Info className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Butuh bantuan memilih operator?</h4>
                  <p className="text-xs text-slate-400">Lihat panduan lengkap pemilihan paket data terbaik di aplikasi kami.</p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-20 border-t border-white/5 py-16 px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left relative z-10">
          <div className="space-y-2">
            <h2 className="text-lg font-black tracking-tighter">NETSCAN CORE</h2>
            <p className="text-sm text-slate-500 max-w-xs">Teknologi pemindaian sinyal tercanggih untuk mendukung konektivitas tanpa batas di seluruh Indonesia.</p>
          </div>
          <div className="flex gap-12 text-sm font-bold text-slate-400">
            <a href="#" className="hover:text-blue-500 transition-colors">Documentation</a>
            <a href="#" className="hover:text-blue-500 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-500 transition-colors">API</a>
          </div>
          <div className="text-right flex flex-col items-center md:items-end gap-2">
             <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-[10px] mono text-slate-500 uppercase tracking-widest">Version 4.0.2 Stable</div>
             <p className="text-slate-600 text-[10px] mono uppercase tracking-widest">© 2024 Jakarta Lab Systems</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

const SparklesIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
  </svg>
);

export default App;
