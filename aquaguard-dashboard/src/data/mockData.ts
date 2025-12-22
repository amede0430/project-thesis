import type { Alert, KPI, Sensor, Activity } from '../types';

export const kpis: KPI[] = [
  { label: 'Capteurs Actifs', value: '127', subtitle: 'sur 132 installés', status: 'normal' },
  { label: 'Alertes Critiques', value: '3', subtitle: 'intervention requise', status: 'critical' },
  { label: 'Alertes Moyennes', value: '7', subtitle: 'surveillance requise', status: 'warning' },
  { label: 'Alertes Faibles', value: '12', subtitle: 'à vérifier', status: 'warning' },
  { label: 'Temps Résolution', value: '2.4h', subtitle: 'temps moyen', status: 'normal' },
  { label: 'Taux de Perte', value: '18.2%', subtitle: 'réseau estimé', status: 'warning' },
];

export const alerts: Alert[] = [
  {
    id: '1',
    severity: 'critical',
    sensor: 'AQ-N-047',
    location: 'Avenue Steinmetz',
    sector: 'Secteur Nord',
    type: 'Fuite Majeure',
    confidence: 94,
    timestamp: 'il y a 12 min'
  },
  {
    id: '2',
    severity: 'critical',
    sensor: 'AQ-S-023',
    location: 'Place des Martyrs',
    sector: 'Secteur Sud',
    type: 'Rupture Canalisation',
    confidence: 89,
    timestamp: 'il y a 28 min'
  },
  {
    id: '3',
    severity: 'medium',
    sensor: 'AQ-E-091',
    location: 'Boulevard Lagunaire',
    sector: 'Secteur Est',
    type: 'Fuite Modérée',
    confidence: 76,
    timestamp: 'il y a 1h 15min'
  },
  {
    id: '4',
    severity: 'low',
    sensor: 'AQ-O-156',
    location: 'Rue Dantokpa',
    sector: 'Secteur Ouest',
    type: 'Anomalie Signal',
    confidence: 68,
    timestamp: 'il y a 2h 30min'
  }
];

export const sensors: Sensor[] = [
  {
    id: 'AQ-C-012',
    location: 'Place de l\'Étoile Rouge',
    sector: 'Secteur Centre',
    status: 'offline',
    issue: 'Hors ligne depuis 4h 15min',
    severity: 'critical'
  },
  {
    id: 'AQ-N-089',
    location: 'Quartier Akpakpa',
    sector: 'Secteur Nord',
    status: 'low-battery',
    issue: 'Signal faible - Batterie 15%',
    severity: 'medium'
  },
  {
    id: 'AQ-S-067',
    location: 'Rue Tokplegbe',
    sector: 'Secteur Sud',
    status: 'unresolved',
    issue: 'Alerte non résolue depuis 8h',
    severity: 'low'
  },
  {
    id: 'AQ-E-134',
    location: 'Quartier Fidjrossè',
    sector: 'Secteur Est',
    status: 'intermittent',
    issue: 'Communications intermittentes',
    severity: 'medium'
  },
  {
    id: 'AQ-O-201',
    location: 'Carrefour Cadjehoun',
    sector: 'Secteur Ouest',
    status: 'calibration',
    issue: 'Calibrage requis - Dérive détectée',
    severity: 'low'
  }
];

export const activities: Activity[] = [
  {
    id: '1',
    type: 'resolved',
    title: 'Alerte AQ-N-047 résolue',
    description: 'Fuite réparée par équipe Kossou A.',
    timestamp: 'il y a 15 min'
  },
  {
    id: '2',
    type: 'alert',
    title: 'Nouvelle alerte critique AQ-S-023',
    description: 'Rupture détectée Place des Martyrs',
    timestamp: 'il y a 28 min'
  },
  {
    id: '3',
    type: 'new-sensor',
    title: 'Nouveau capteur AQ-N-204 activé',
    description: 'Installation Avenue Clozel par Adjovi M.',
    timestamp: 'il y a 1h 20min'
  },
  {
    id: '4',
    type: 'maintenance',
    title: 'Maintenance préventive secteur Est',
    description: '5 capteurs calibrés avec succès',
    timestamp: 'il y a 2h 45min'
  },
  {
    id: '5',
    type: 'intervention',
    title: 'Intervention terrain complétée',
    description: 'AQ-E-091 - Fuite colmatée temporairement',
    timestamp: 'il y a 3h 10min'
  },
  {
    id: '6',
    type: 'false-alert',
    title: 'Fausse alerte AQ-C-156 fermée',
    description: 'Bruit de travaux identifié par Dossou K.',
    timestamp: 'il y a 4h 30min'
  }
];