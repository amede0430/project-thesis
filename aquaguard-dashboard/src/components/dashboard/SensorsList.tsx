import { useNavigate } from 'react-router-dom';
import type { Sensor } from '../../types';

interface SensorsListProps {
  sensors: Sensor[];
}

export default function SensorsList({ sensors }: SensorsListProps) {
  const navigate = useNavigate();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'leak_detected': return 'bg-red-600';
      case 'inactive': return 'bg-red-500';
      case 'error': return 'bg-orange-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'active': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'leak_detected': return 'Fuite Détectée';
      case 'inactive': return 'Inactif';
      case 'error': return 'Erreur';
      case 'maintenance': return 'Maintenance';
      case 'active': return 'Actif';
      default: return 'Inconnu';
    }
  };

  // Capteur unique de Sakété
  const saketeeSensor = sensors[0];

  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Détails du Capteur</h2>
        {saketeeSensor && (
          <button 
            onClick={() => navigate(`/sensor/${saketeeSensor.id}`)}
            className="text-sm text-aqua-primary hover:text-aqua-dark font-medium"
          >
            Voir détails
          </button>
        )}
      </div>
      <div className="bg-white rounded-lg overflow-hidden shadow-sm border border-gray-200">
        <div>
          {saketeeSensor ? (
            <div className="hover:bg-gray-50 flex relative gap-4 p-4">
              <div className={`absolute w-1 top-0 bottom-0 left-0 rounded-tl-lg rounded-bl-lg ${getStatusColor(saketeeSensor.status)}`}></div>
              <div className="flex flex-col gap-3 pl-3 flex-1">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-semibold text-gray-900">{saketeeSensor.name}</div>
                  <div className={`text-xs px-2 py-1 rounded-sm font-medium ${
                    saketeeSensor.status === 'active' ? 'bg-green-100 text-green-700' :
                    saketeeSensor.status === 'error' ? 'bg-red-100 text-red-700' :
                    saketeeSensor.status === 'maintenance' ? 'bg-yellow-100 text-yellow-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {getStatusText(saketeeSensor.status)}
                  </div>
                </div>
                <div className="text-xs text-gray-700">{saketeeSensor.location}</div>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-gray-500">Coordonnées:</span>
                    <div className="text-gray-700">{saketeeSensor.latitude}°N, {saketeeSensor.longitude}°E</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Secteur:</span>
                    <div className="text-gray-700">{saketeeSensor.sector}</div>
                  </div>
                </div>
                <button 
                  onClick={() => navigate('/monitoring')}
                  className="hover:bg-aqua-dark text-sm flex justify-center items-center gap-1 font-medium rounded-sm bg-aqua-primary text-white px-3 py-2 mt-2"
                >
                  <span>Analyser en détail</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-gray-500">
              Aucun capteur détecté
            </div>
          )}
        </div>
      </div>
    </section>
  );
}