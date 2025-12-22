import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import Header from '../components/ui/Header';
import LeafletMap from '../components/map/LeafletMap';
import { useWebSocket } from '../hooks/useWebSocket';
import { apiService } from '../services/api';

export default function NetworkMapPage() {
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sensors, setSensors] = useState<any[]>([]);
  const { lastMessage, connectionStatus } = useWebSocket('ws://localhost:8000/ws/sensors');

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const data = await apiService.getSensors();
        setSensors(data);
      } catch (error) {
        console.error('Erreur chargement capteurs:', error);
      }
    };
    fetchSensors();
  }, []);

  useEffect(() => {
    if (lastMessage) {
      setSensors(prev => prev.map(sensor => 
        sensor.id === lastMessage.sensor_id 
          ? { ...sensor, status: lastMessage.status }
          : sensor
      ));
    }
  }, [lastMessage]);

  const filteredSensors = sensors.filter(sensor => 
    (selectedSector === 'all' || sensor.sector === selectedSector) &&
    (selectedStatus === 'all' || sensor.status === selectedStatus)
  );
  
  const sensorCounts = {
    active: filteredSensors.filter(s => s.status === 'active').length,
    maintenance: filteredSensors.filter(s => s.status === 'maintenance').length,
    error: filteredSensors.filter(s => s.status === 'error').length,
    inactive: filteredSensors.filter(s => s.status === 'inactive').length,
  };

  return (
    <div className="min-h-screen bg-dark-secondary">
      <Header />
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-white/95">Carte du Réseau</h1>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/55" />
              <input
                type="text"
                placeholder="Rechercher un capteur..."
                className="pl-10 pr-4 py-2 bg-dark-tertiary border border-white/10 rounded-sm text-white/95 focus:border-aqua-primary focus:outline-none"
              />
            </div>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="px-3 py-2 bg-dark-tertiary border border-white/10 rounded-sm text-white/95 focus:border-aqua-primary focus:outline-none"
            >
              <option value="all">Tous les secteurs</option>
              <option value="Centre-ville">Centre-ville</option>
              <option value="Dantokpa">Dantokpa</option>
              <option value="Akpakpa">Akpakpa</option>
              <option value="Porto-Novo">Porto-Novo</option>
              <option value="Parakou">Parakou</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-dark-tertiary border border-white/10 rounded-sm text-white/95 focus:border-aqua-primary focus:outline-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="maintenance">Maintenance</option>
              <option value="error">Erreur</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
        </div>

        {/* Full width map */}
        <div className="bg-dark-tertiary rounded-lg p-4">
          <div className="relative w-full h-[700px] rounded-sm overflow-hidden">
            <LeafletMap sensors={filteredSensors} />
            

            
            {/* Status info */}
            <div className="absolute top-4 left-4 bg-dark-primary/95 backdrop-blur-sm p-3 rounded-lg text-sm z-[1000] border border-white/10">
              <div className="font-semibold text-white/95 mb-1">Réseau AquaGuard</div>
              <div className="text-white/75 text-xs">
                {filteredSensors.length} capteurs • {sensorCounts.error + sensorCounts.inactive} alertes actives
              </div>
              <div className="text-white/55 text-xs mt-1">
                WebSocket: {connectionStatus} • Temps réel
              </div>
            </div>
            
            {/* Quick stats */}
            <div className="absolute bottom-4 right-4 bg-dark-primary/95 backdrop-blur-sm p-3 rounded-lg text-xs z-[1000] border border-white/10">
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <div className="text-red-400 font-bold text-lg">{sensorCounts.inactive}</div>
                  <div className="text-white/75">Inactifs</div>
                </div>
                <div className="text-center">
                  <div className="text-orange-400 font-bold text-lg">{sensorCounts.error}</div>
                  <div className="text-white/75">Erreurs</div>
                </div>
                <div className="text-center">
                  <div className="text-yellow-400 font-bold text-lg">{sensorCounts.maintenance}</div>
                  <div className="text-white/75">Maintenance</div>
                </div>
                <div className="text-center">
                  <div className="text-green-400 font-bold text-lg">{sensorCounts.active}</div>
                  <div className="text-white/75">Actifs</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}