
export interface OperatorData {
  id: string;
  name: string;
  strength: number; // 0-100
  latency: number; // ms
  type: '4G' | '5G' | 'LTE' | 'H+' | '5G-SA';
  status: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  color: string;
  integrityScore: number; // 0-100 (Kevalidan Sinyal)
  bands: string[]; // Frekuensi yang terdeteksi
  verified: boolean;
}

export interface NetworkStats {
  downlink: number;
  effectiveType: string;
  rtt: number;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number | null;
}
