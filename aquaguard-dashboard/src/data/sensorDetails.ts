import type { SensorDetails } from '../types/sensor';

export const sensorDetailsData: SensorDetails = {
  id: 'AQ-N-047',
  name: 'Capteur AQ-N-047 - Avenue Steinmetz',
  location: 'Avenue Steinmetz',
  sector: 'Secteur Nord',
  coordinates: '6.3703°N, 2.3912°E',
  status: 'critical',
  lastUpdate: 'il y a 2 min',
  
  model: 'AquaSense Pro v3.2',
  serialNumber: 'AS-2023-04-047',
  installDate: '15 mars 2023',
  lastMaintenance: '28 novembre 2024',
  networkType: 'Distribution',
  depth: '1,8 mètres',
  pipelineDiameter: '200 mm',
  material: 'Fonte ductile',
  
  signalStrength: 75,
  transmissionQuality: 'excellent',
  batteryLevel: 82,
  lastCommunication: 'il y a 2 min',
  
  alertsGenerated: 12,
  avgTimeBetweenAlerts: '14h',
  falseAlarmRate: 18,
  availability: 98.2
};