export interface SensorDetails {
  id: string;
  name: string;
  location: string;
  sector: string;
  coordinates: string;
  status: 'critical' | 'normal' | 'attention';
  lastUpdate: string;
  
  // Technical info
  model: string;
  serialNumber: string;
  installDate: string;
  lastMaintenance: string;
  networkType: string;
  depth: string;
  pipelineDiameter: string;
  material: string;
  
  // Connection status
  signalStrength: number;
  transmissionQuality: 'excellent' | 'good' | 'poor';
  batteryLevel: number;
  lastCommunication: string;
  
  // Statistics
  alertsGenerated: number;
  avgTimeBetweenAlerts: string;
  falseAlarmRate: number;
  availability: number;
}

export interface SensorTab {
  id: string;
  label: string;
  active: boolean;
}