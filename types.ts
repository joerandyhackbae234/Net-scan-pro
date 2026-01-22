
export interface OperatorData {
  id: string;
  name: string;
  strength: number; // 0-100
  latency: number; // ms
  type: '4G' | '5G' | 'LTE' | 'H+';
  status: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  color: string;
}

export interface NetworkStats {
  downlink: number;
  effectiveType: string;
  rtt: number;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
  city?: string;
}
