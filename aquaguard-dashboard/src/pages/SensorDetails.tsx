import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Clock, MapPin, Play, History } from 'lucide-react';
import Header from '../components/ui/Header';
import SensorTabs from '../components/sensor/SensorTabs';
import SensorInfo from '../components/sensor/SensorInfo';
import AcousticData from '../components/sensor/AcousticData';
import SignalHistory from '../components/sensor/SignalHistory';
import { apiService } from '../services/api';

export default function SensorDetails() {
  const { sensorId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [sensor, setSensor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSensorDetails = async () => {
      if (!sensorId) return;
      try {
        const data = await apiService.getSensorDetails(parseInt(sensorId));
        setSensor(data);
      } catch (error) {
        console.error('Erreur chargement détails capteur:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSensorDetails();
  }, [sensorId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'leak_detected': return 'bg-red-600';
      case 'error': return 'bg-red-500';
      case 'inactive': return 'bg-red-400';
      case 'maintenance': return 'bg-yellow-500';
      case 'active': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'leak_detected': return 'Fuite Détectée';
      case 'error': return 'Erreur';
      case 'inactive': return 'Inactif';
      case 'maintenance': return 'Maintenance';
      case 'active': return 'Actif';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-secondary">
        <Header />
        <div className="p-6 text-center text-white/75">Chargement...</div>
      </div>
    );
  }

  if (!sensor) {
    return (
      <div className="min-h-screen bg-dark-secondary">
        <Header />
        <div className="p-6 text-center text-white/75">Capteur non trouvé</div>
      </div>
    );
  }

  const handleRealTimeAnalysis = () => {
    navigate(`/sensor/${sensorId}/real-time-analysis`);
  };

  const handleHistoryView = () => {
    setActiveTab('signal-history');
  };

  return (
    <div className="min-h-screen bg-dark-secondary">
      <Header />
      
      <div className="p-6">
        <section className="mb-8">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl mb-2 font-semibold text-white/95">{sensor.name}</h1>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(sensor.status)}`}></div>
                  <span className="text-sm font-medium text-white/95">
                    {getStatusLabel(sensor.status)}
                  </span>
                </div>
                <span className="text-sm text-white/75">{sensor.sector}</span>
                <span className="text-sm text-white/55">{sensor.latitude.toFixed(4)}°N, {sensor.longitude.toFixed(4)}°E</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-white/55">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Dernière mise à jour: {sensor.last_update ? new Date(sensor.last_update).toLocaleString('fr-FR') : 'N/A'}</span>
                </div>
                <span>Modèle: {sensor.model}</span>
                <span>Série: {sensor.serial_number}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-white/55 mt-2">
                <span>Signal: {sensor.signal_strength}%</span>
                <span>Batterie: {sensor.battery_level}%</span>
                <span>Réseau: {sensor.network_type}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/network-map')}
                className="hover:text-aqua-primary text-sm flex items-center gap-2 text-aqua-secondary"
              >
                <MapPin className="w-4 h-4" />
                <span>Voir sur Carte</span>
              </button>
              <button 
                onClick={handleRealTimeAnalysis}
                className="hover:bg-dark-quaternary flex justify-center items-center gap-2 bg-dark-tertiary text-white/95 px-4 py-2 rounded-sm"
              >
                <Play className="w-4 h-4" />
                <span className="text-sm font-semibold">Lancer Analyse Temps Réel</span>
              </button>
              <button 
                onClick={handleHistoryView}
                className="hover:bg-aqua-secondary flex justify-center items-center gap-2 bg-aqua-primary text-black/85 px-4 py-2 rounded-sm"
              >
                <History className="w-4 h-4" />
                <span className="text-sm font-semibold">Voir Historique Complet</span>
              </button>
            </div>
          </div>
        </section>

        <SensorTabs onTabChange={setActiveTab} />

        {activeTab === 'overview' && <SensorInfo sensor={sensor} />}
        {activeTab === 'acoustic' && <AcousticData sensorId={sensorId!} />}
        {activeTab === 'signal-history' && <SignalHistory sensorId={sensorId!} />}
        
        {!['overview', 'acoustic', 'signal-history'].includes(activeTab) && (
          <div className="bg-dark-tertiary p-8 rounded-lg text-center">
            <h3 className="text-lg font-semibold text-white/95 mb-2">
              {activeTab === 'alerts' && 'Alertes Actives'}
              {activeTab === 'history' && 'Historique des Alertes'}
              {activeTab === 'acoustic-history' && 'Historique Acoustique'}
            </h3>
            <p className="text-white/75">Contenu en cours de développement</p>
          </div>
        )}
      </div>
    </div>
  );
}