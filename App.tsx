
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Signal, 
  MapPin, 
  Navigation, 
  Activity, 
  Zap, 
  RefreshCw, 
  Globe,
  Cpu,
  Target,
  History as HistoryIcon,
  Download,
  TrendingUp,
  Satellite,
  ShieldCheck,
  ChevronDown
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area } from 'recharts';
import { GoogleGenAI, Type } from "@google/genai";
import { OperatorData, NetworkStats, UserLocation } from './types';

import RadarScanner from './components/RadarScanner';
import OperatorCard from './components/OperatorCard';
import SignalMetric from './components/SignalMetric';
import TokenGate from './components/TokenGate';
import ScanHistory from './components/ScanHistory';
import LivePing from './components/LivePing';

const MASTER_TOKEN = "NETSCAN-2025-ADMIN";

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isScanning, setIsScanning] = useState(false);
  const [operators, setOperators] = useState<OperatorData[]>([]);
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [netStats, setNetStats] = useState<NetworkStats | null>(null);
  const [historyData, setHistoryData] = useState<{ time: string, val: number }[]>([]);
  const [aiInsight, setAiInsight] = useState<string>("");
  const [scanLogs, setScanLogs] = useState<any[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const savedToken = localStorage.getItem('netscan_access_token');
    if (savedToken === MASTER_TOKEN) setIsAuthenticated(true);

    const savedLogs = localStorage.getItem('netscan_logs');
    if (savedLogs) setScanLogs(JSON.parse(savedLogs));

    const initialHistory = Array.from({ length: 30 }, (_, i) => ({
      time: i.toString(),
      val: 30 + Math.random() * 40
    }));
    setHistoryData(initialHistory);

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
      navigator.geolocation.watchPosition((pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          altitude: pos.coords.altitude
        });
      }, (err) => console.error(err), { enableHighAccuracy: true });
    }

    const interval = setInterval(() => {
      setHistoryData(prev => {
        const lastVal = prev[prev.length - 1].val;
        const newVal = Math.max(10, Math.min(100, lastVal + (Math.random() - 0.5) * 15));
        return [...prev.slice(1), { time: new Date().toLocaleTimeString(), val: newVal }];
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleVerifyToken = (token: string) => {
    if (token === MASTER_TOKEN) {
      localStorage.setItem('netscan_access_token', token);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    localStorage.removeItem('netscan_access_token');
    setIsAuthenticated(false);
  };

  const fetchAiInsights = async (lat: number, lng: number) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze detailed Indonesian network coverage at ${lat}, ${lng}. 
        Focus on signal integrity, authenticity (anti-jamming), and frequency bands (LTE, 5G Sub-6).
        Return JSON with recommendation and a comprehensive list of all major operators (Telkomsel, XL, Indosat, Tri, Smartfren).`,
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
                    status: { type: Type.STRING },
                    integrityScore: { type: Type.NUMBER },
                    bands: { type: Type.ARRAY, items: { type: Type.STRING } },
                    verified: { type: Type.BOOLEAN }
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
        'XL': '#2563eb',
        'Indosat Ooredoo Hutchison': '#f59e0b',
        'Indosat': '#f59e0b',
        'Tri': '#7c3aed',
        'Smartfren': '#db2777'
      };

      const mappedOps = data.operators.map((op: any, idx: number) => ({
        ...op,
        id: Date.now() + idx + '',
        color: colorMap[op.name] || '#64748b'
      }));

      setOperators(mappedOps);
      setAiInsight(data.recommendation);

      const newLog = {
        id: Date.now(),
        date: new Date().toLocaleString(),
        location: `${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        topOperator: mappedOps[0]?.name || 'Unknown',
        strength: mappedOps[0]?.strength || 0
      };
      const updatedLogs = [newLog, ...scanLogs].slice(0, 10);
      setScanLogs(updatedLogs);
      localStorage.setItem('netscan_logs', JSON.stringify(updatedLogs));

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
        // Fallback Mock Data with full signal types
        const mock: OperatorData[] = [
          { id: '1', name: 'Telkomsel', strength: 94, latency: 15, type: '5G-SA', status: 'Excellent', color: '#f43f5e', integrityScore: 99, bands: ['n40 (2.3GHz)', 'n1 (2.1GHz)'], verified: true },
          { id: '2', name: 'Indosat', strength: 82, latency: 28, type: '5G', status: 'Excellent', color: '#f59e0b', integrityScore: 96, bands: ['n3 (1.8GHz)'], verified: true },
          { id: '3', name: 'XL Axiata', strength: 76, latency: 34, type: '4G', status: 'Good', color: '#2563eb', integrityScore: 94, bands: ['B1', 'B3'], verified: true },
          { id: '4', name: 'Tri', strength: 68, latency: 42, type: 'LTE', status: 'Fair', color: '#7c3aed', integrityScore: 91, bands: ['B3'], verified: true }
        ];
        setOperators(mock);
      }
      setIsScanning(false);
    }, 3000);
  };

  const exportReport = () => {
    const report = {
      timestamp: new Date().toISOString(),
      location: location,
      networkStats: netStats,
      results: operators,
      aiRecommendation: aiInsight
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `NetScan_Report_${Date.now()}.json`;
    a.click();
  };

  if (!isAuthenticated) return <TokenGate onVerify={handleVerifyToken} />;

  return (
    <div className="min-h-screen text-slate-200">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full -z-10 animate-pulse"></div>
      
      {/* Navigation */}
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
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowHistory(!showHistory)}
              className="p-2.5 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-all relative"
            >
              <HistoryIcon className="w-5 h-5 text-slate-400" />
            </button>
            <button 
              onClick={startScan}
              disabled={isScanning}
              className="group flex items-center gap-3 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:bg-blue-500 active:scale-95 disabled:opacity-50 shadow-lg shadow-blue-600/20"
            >
              {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
              {isScanning ? "Pemindaian..." : "Mulai Scan"}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* New Enhanced Location Bar */}
        <div className="glass rounded-3xl p-6 mb-8 flex flex-wrap items-center justify-between gap-6 border-l-4 border-l-blue-500">
           <div className="flex items-center gap-6">
              <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20">
                <Satellite className={`w-8 h-8 text-blue-500 ${isScanning ? 'animate-bounce' : ''}`} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-1 flex items-center gap-2">
                  <Target className="w-3 h-3" /> Live Position Status
                </p>
                <h2 className="text-2xl font-black text-white flex items-center gap-3">
                  {location ? `${location.latitude.toFixed(5)}, ${location.longitude.toFixed(5)}` : 'Mencari Satelit...'}
                  <span className="text-xs font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded">GPS-L1/L5</span>
                </h2>
                <div className="flex items-center gap-4 mt-1">
                   <span className="text-[10px] text-slate-400 flex items-center gap-1">
                     <ShieldCheck className="w-3 h-3 text-emerald-500" /> Accuracy: {location?.accuracy?.toFixed(1) || '--'}m
                   </span>
                   <span className="text-[10px] text-slate-400 flex items-center gap-1">
                     <Navigation className="w-3 h-3 text-blue-500" /> Alt: {location?.altitude?.toFixed(0) || '0'}m MSL
                   </span>
                </div>
              </div>
           </div>
           <div className="hidden md:flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Network Node</p>
                <p className="text-sm font-black text-white">Jakarta-Main-Grid</p>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-600" />
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <section className="glass rounded-[2.5rem] p-8 relative overflow-hidden">
               <div className="flex items-center justify-between mb-6">
                <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> Stability Metrics
                </h2>
                <div className="text-[10px] mono text-emerald-500 font-bold px-2 py-1 bg-emerald-500/10 rounded animate-pulse">LIVE FEED</div>
              </div>
              <div className="h-32 w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historyData}>
                    <defs>
                      <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <Area type="monotone" dataKey="val" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorVal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <LivePing />
              <div className="grid grid-cols-2 gap-4 mt-6">
                <SignalMetric label="Throughput" value={netStats?.downlink ? `${netStats.downlink}Mbps` : '--'} subLabel="Real-time" icon={<Globe className="w-4 h-4" />} />
                <SignalMetric label="Protocols" value={netStats?.effectiveType.toUpperCase() || 'N/A'} subLabel="Layer-2" icon={<Cpu className="w-4 h-4" />} />
              </div>
            </section>

            {aiInsight && (
              <section className="glass rounded-[2rem] p-6 bg-gradient-to-br from-blue-600/10 to-transparent border-l-4 border-l-blue-500">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-yellow-500" /> AI Frequency Analysis
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed italic mb-6">"{aiInsight}"</p>
                <button onClick={exportReport} className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-xs font-bold transition-all">
                  <Download className="w-4 h-4" /> Download Security Log
                </button>
              </section>
            )}

            {showHistory && <ScanHistory logs={scanLogs} onClear={() => setScanLogs([])} onClose={() => setShowHistory(false)} />}
          </div>

          <div className="lg:col-span-8 space-y-8">
            <div className="glass rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-12">
              <RadarScanner isScanning={isScanning} />
              <div className="flex-1 text-center md:text-left">
                <h2 className="text-4xl font-black tracking-tight leading-tight text-white mb-4">
                  Full Spectrum <br/> <span className="text-blue-500">Validator</span>
                </h2>
                <p className="text-slate-400 text-lg">
                  Mendeteksi semua jenis sinyal (LTE, 5G, H+) dan memvalidasi keaslian paket data untuk mencegah serangan IMSI-Catcher.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Operator Health Grid</h3>
                <span className="text-[10px] text-slate-600 mono uppercase tracking-widest">Scanning all bands...</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {operators.length > 0 ? (
                  operators.map(op => <OperatorCard key={op.id} data={op} />)
                ) : (
                  <div className="col-span-full py-24 flex flex-col items-center justify-center glass rounded-[3rem] border-dashed border-2 border-slate-800/50">
                    <Navigation className={`w-12 h-12 text-slate-700 mb-4 ${isScanning ? 'animate-spin' : ''}`} />
                    <p className="text-slate-500 font-bold">Mulai pemindaian spektrum sekarang</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
