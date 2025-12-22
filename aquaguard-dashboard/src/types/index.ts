export interface Alert {
  id: string;
  severity: 'critical' | 'medium' | 'low';
  sensor: string;
  location: string;
  sector: string;
  type: string;
  confidence: number;
  timestamp: string;
}

export interface KPI {
  label: string;
  value: string | number;
  subtitle: string;
  status: 'normal' | 'warning' | 'critical';
}

export interface Sensor {
  id: number;
  name: string;
  location: string;
  latitude: number;
  longitude: number;
  sector: string;
  status: 'active' | 'inactive' | 'maintenance' | 'error' | 'leak_detected';
  created_at: string;
  model?: string;
  serial_number?: string;
  installation_date?: string;
  last_maintenance?: string;
  network_type?: string;
  installation_depth?: number;
  pipe_diameter?: number;
  pipe_material?: string;
  signal_strength?: number;
  battery_level?: number;
  last_communication?: string;
}

export interface Activity {
  id: string;
  type: 'resolved' | 'alert' | 'new-sensor' | 'maintenance' | 'intervention' | 'false-alert';
  title: string;
  description: string;
  timestamp: string;
}

