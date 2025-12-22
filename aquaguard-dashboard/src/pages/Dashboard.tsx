import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import Header from '../components/ui/Header';
import KPICard from '../components/dashboard/KPICard';
import AlertsTable from '../components/dashboard/AlertsTable';
import NetworkMap from '../components/dashboard/NetworkMap';
import SensorsList from '../components/dashboard/SensorsList';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import { apiService } from '../services/api';
import { useWebSocket } from '../hooks/useWebSocket';

export default function Dashboard() {
  const [kpis, setKpis] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [sensors, setSensors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { lastMessage } = useWebSocket('ws://localhost:8000/ws/sensors');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [kpisData, alertsData, activitiesData, sensorsData] = await Promise.all([
          apiService.getDashboardKPIs(),
          apiService.getDashboardAlerts(),
          apiService.getDashboardActivities(),
          apiService.getSensors()
        ]);
        
        setKpis(kpisData);
        setAlerts(alertsData);
        setActivities(activitiesData);
        setSensors(sensorsData);
      } catch (error) {
        console.error('Erreur chargement dashboard:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-secondary">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-white/75">Chargement du dashboard...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-secondary font-inter">
      <Header />
      
      <div className="bg-dark-secondary flex w-full min-h-[856px]">
        <main className="flex-1 overflow-x-hidden flex flex-col p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-white/95">Surveillance Sakété</h1>
              <p className="text-sm text-white/65 mt-1">Capteur AQG-SAK-001 • Site de Sakété, Bénin</p>
            </div>
            <div className="text-sm flex items-center gap-2 text-white/55">
              <Clock className="w-4 h-4" />
              <span>Mis à jour il y a 2 min</span>
            </div>
          </div>

          {/* KPIs - Commentés pour simplifier l'interface
          <section className="mb-8">
            <h2 className="text-lg mb-4 font-semibold text-white/95">État du Capteur Sakété</h2>
            <div className="grid grid-cols-4 gap-4">
              {sensors.length > 0 && [
                { 
                  title: 'Statut Capteur', 
                  value: sensors[0]?.status === 'active' ? 'ACTIF' : sensors[0]?.status?.toUpperCase() || 'INCONNU', 
                  change: sensors[0]?.status === 'active' ? 'Opérationnel' : 'Vérification requise', 
                  trend: sensors[0]?.status === 'active' ? 'up' : 'down' 
                },
                { 
                  title: 'Signal', 
                  value: '85%', 
                  change: 'Excellent', 
                  trend: 'up' 
                },
                { 
                  title: 'Alertes Ouvertes', 
                  value: kpis?.alerts_count || 0, 
                  change: '-2%', 
                  trend: 'down' 
                },
                { 
                  title: 'Batterie', 
                  value: '95%', 
                  change: 'Optimal', 
                  trend: 'stable' 
                }
              ].map((kpi, index) => (
                <KPICard key={index} kpi={kpi} />
              ))}
            </div>
          </section>
          */}

          {/* Main Content Grid */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            <AlertsTable alerts={alerts} />
            <NetworkMap sensors={sensors} />
          </div>

          {/* Bottom Grid */}
          <div className="grid grid-cols-2 gap-8">
            <SensorsList sensors={sensors} />
            <ActivityFeed activities={activities} />
          </div>
        </main>
      </div>
    </div>
  );
}