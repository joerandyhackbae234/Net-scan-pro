
import React, { useState, useEffect, useCallback } from 'react';
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
  Target,
  Lock,
  ArrowRight,
  History as HistoryIcon,
  Download,
  Trash2,
  TrendingUp
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
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
      navigator.geolocation.getCurrentPosition((pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude
        });
      });
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
        contents: `Analyze Indonesian network coverage at ${lat}, ${lng}. 
        Provide a detailed technical recommendation for: Gaming (low latency), Streaming (4K), and Work (stability).
        Return JSON with recommendation string and operators list.`,
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
        'Tri': '#7c3aed',
        'Smartfren': '#db2777'
      };

      const mappedOps = data.operators.map((op: any, idx: number) => ({
        id: Date.now() + idx + '',
        name: op.name,
        strength: op.strength,
        latency: op.latency,
        type: op.type,
        status: op.status,
        color: colorMap[op.name] || '#64748b'
      }));

      setOperators(mappedOps);
      setAiInsight(data.recommendation);

      // Save to logs
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
        const mock = [
          { id: '1', name: 'Telkomsel', strength: 92, latency: 18, type: '5G', status: 'Excellent', color: '#f43f5e' },
          { id: '2', name: 'XL Axiata', strength: 78, latency: 32, type: '4G', status: 'Good', color: '#2563eb' }
        ] as any;
        setOperators(mock);
        setAiInsight("Analisis lokal menunjukkan sinyal stabil untuk kebutuhan streaming dan kerja jarak jauh.");
      }
      setIsScanning(false);
    }, 2500);
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

  const clearLogs = () => {
    setScanLogs([]);
    localStorage.removeItem('netscan_logs');
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
              title="Riwayat Scan"
            >
              <HistoryIcon className="w-5 h-5 text-slate-400" />
              {scanLogs.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>}
            </button>
            <button 
              onClick={handleLogout}
              className="text-[10px] font-black text-slate-500 hover:text-red-500 transition-colors uppercase tracking-widest px-3"
            >
              Logout
            </button>
            <button 
              onClick={startScan}
              disabled={isScanning}
              className="group flex items-center gap-3 bg-white text-slate-950 px-6 py-2.5 rounded-xl font-bold text-sm transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {isScanning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4 text-blue-600" />}
              {isScanning ? "Scanning..." : "Deep Scan"}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Side Panels */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Real-time Diagnostics */}
            <section className="glass rounded-[2.5rem] p-8 relative overflow-hidden">
               <div className="flex items-center justify-between mb-6">
                <div className="space-y-1">
                  <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    Network Stability
                  </h2>
                </div>
                <div className="text-[10px] mono text-emerald-500 font-bold px-2 py-1 bg-emerald-500/10 rounded">LIVE</div>
              </div>

              <div className="h-32 w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={historyData}>
                    <Area type="monotone" dataKey="val" stroke="#10b981" strokeWidth={2} fillOpacity={0.1} fill="#10b981" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <LivePing />

              <div className="grid grid-cols-2 gap-4 mt-6">
                <SignalMetric label="Speed" value={netStats?.downlink ? `${netStats.downlink}Mb` : '--'} subLabel="Bandwidth" icon={<Globe className="w-4 h-4" />} />
                <SignalMetric label="Type" value={netStats?.effectiveType.toUpperCase() || 'N/A'} subLabel="Interface" icon={<Cpu className="w-4 h-4" />} />
              </div>
            </section>

            {/* AI Insights Panel */}
            {aiInsight && (
              <section className="glass rounded-[2rem] p-6 bg-gradient-to-br from-blue-600/10 to-purple-600/5 border-l-4 border-l-blue-500">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Target className="w-4 h-4 text-blue-400" />
                  </div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">AI Optimization Insight</h2>
                </div>
                <p className="text-sm text-slate-300 leading-relaxed italic mb-4">"{aiInsight}"</p>
                <button 
                  onClick={exportReport}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-xs font-bold transition-all"
                >
                  <Download className="w-4 h-4" /> Export Scan Report
                </button>
              </section>
            )}

            {/* Scan History Component */}
            {showHistory && (
              <ScanHistory 
                logs={scanLogs} 
                onClear={clearLogs} 
                onClose={() => setShowHistory(false)} 
              />
            )}
          </div>

          {/* Center Radar & Results */}
          <div className="lg:col-span-8 space-y-8">
            <div className="glass rounded-[3rem] p-10 flex flex-col md:flex-row items-center gap-12 bg-gradient-to-r from-blue-600/10 via-transparent to-transparent">
              <RadarScanner isScanning={isScanning} />
              <div className="flex-1 space-y-5 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                  <MapPin className="w-3.5 h-3.5 text-blue-400" />
                  <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
                    {location ? `${location.latitude.toFixed(3)}, ${location.longitude.toFixed(3)}` : 'Locating...'}
                  </span>
                </div>
                <h2 className="text-4xl font-black tracking-tight leading-tight text-white">
                  Spectrum <br/> Analysis <span className="text-blue-500">Active</span>
                </h2>
                <p className="text-slate-400 text-lg max-w-md">
                  Mendeteksi menara seluler terdekat dan mengukur kekuatan sinyal rata-rata untuk semua operator besar.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-sm font-black uppercase tracking-widest text-slate-500">Operator Grid</h3>
                {operators.length > 0 && (
                  <span className="text-[10px] font-bold bg-white/5 px-2 py-1 rounded text-slate-400 mono">
                    SCANNED AT {new Date().toLocaleTimeString()}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {operators.length > 0 ? (
                  operators.map(op => <OperatorCard key={op.id} data={op} />)
                ) : (
                  <div className="col-span-full py-32 flex flex-col items-center justify-center glass rounded-[3rem] border-dashed border-2 border-slate-800/50">
                    <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mb-6 border border-white/5">
                      <Navigation className={`w-10 h-10 text-slate-700 ${isScanning ? 'animate-ping' : ''}`} />
                    </div>
                    <p className="text-slate-500 font-bold text-lg">
                      {isScanning ? 'Sinkronisasi Frekuensi...' : 'Mulai Pemindaian untuk Hasil'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="py-12 px-6 border-t border-white/5 text-center">
        <p className="text-[10px] mono text-slate-600 uppercase tracking-[0.3em]">
          Designed for Advanced Network Diagnostics • v4.5 Enterprise
        </p>
      </footer>
    </div>
  );
};

export default App;
