import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Alert } from '../../types';

interface AlertsTableProps {
  alerts: Alert[];
}

export default function AlertsTable({ alerts }: AlertsTableProps) {
  const navigate = useNavigate();
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'leak_detected': return 'Fuite Détectée';
      case 'sensor_offline': return 'Capteur Hors Ligne';
      case 'maintenance_required': return 'Maintenance Requise';
      case 'system_error': return 'Erreur Système';
      default: return type;
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'critical': return 'Critique';
      case 'high': return 'Haute';
      case 'medium': return 'Moyenne';
      case 'low': return 'Faible';
      default: return severity;
    }
  };

  const getButtonStyle = (severity: string) => {
    return severity === 'critical' 
      ? 'bg-aqua-primary text-black/85 hover:bg-aqua-secondary'
      : 'bg-dark-quaternary text-white/95 hover:bg-dark-quaternary/80';
  };

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Alertes Actives Prioritaires</h2>
        <button 
          onClick={() => navigate('/alert/ALT-2024-11-28-0347')}
          className="hover:text-aqua-dark text-sm flex items-center gap-2 text-aqua-primary"
        >
          <span>Voir Toutes</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      
      <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
        <div className="bg-gray-50 text-gray-700 p-3 text-xs grid grid-cols-12 gap-3 font-medium">
          <div className="col-span-1">Sév.</div>
          <div className="col-span-2">Capteur</div>
          <div className="col-span-3">Localisation</div>
          <div className="col-span-3">Type Anomalie</div>
          <div className="col-span-1">Conf.</div>
          <div className="col-span-2">Action</div>
        </div>

        <div>
          {alerts.map((alert) => (
            <div key={alert.id} className="hover:bg-gray-50 grid grid-cols-12 items-center gap-3 p-3 border-b border-gray-100 last:border-b-0">
              <div className="col-span-1">
                <div className={`w-3 h-3 rounded-full ${getSeverityColor(alert.severity)}`} title={getSeverityText(alert.severity)}></div>
              </div>
              <div className="col-span-2">
                <div className="text-sm font-medium text-gray-900">{alert.sensor_name}</div>
              </div>
              <div className="col-span-3">
                <div className="text-sm text-gray-900">Capteur {alert.sensor_name}</div>
                <div className="text-xs text-gray-500">ID: {alert.sensor_id}</div>
              </div>
              <div className="col-span-3">
                <div className="text-sm text-gray-900">{getTypeText(alert.type)}</div>
                <div className="text-xs text-gray-500">{new Date(alert.created_at).toLocaleString('fr-FR')}</div>
              </div>
              <div className="col-span-1">
                <span className="text-sm font-medium text-gray-900">95%</span>
              </div>
              <div className="col-span-2 flex gap-1">
                <button 
                  onClick={() => navigate(`/alert/ALT-2024-${alert.id}`)}
                  className="text-xs flex justify-center items-center gap-1 font-medium rounded-sm px-2 py-1 bg-aqua-primary text-white hover:bg-aqua-dark"
                >
                  <span>Gérer</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}