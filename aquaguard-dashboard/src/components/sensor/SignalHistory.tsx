import { useState, useEffect } from 'react';
import { Calendar, Download, TrendingUp, Activity } from 'lucide-react';
import TimeSeriesChart from '../charts/TimeSeriesChart';

interface SignalHistoryProps {
  sensorId: string;
}

export default function SignalHistory({ sensorId }: SignalHistoryProps) {
  const [period, setPeriod] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState<'rms' | 'peak' | 'frequency'>('rms');
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [metrics, setMetrics] = useState({
    rms: 0,
    peak: 0,
    frequency: 0,
    snr: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistoryData();
  }, [sensorId, period]);

  const fetchHistoryData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/sensors/${sensorId}/history?period=${period}`);
      const data = await response.json();
      
      setHistoryData(data.data || []);
      setMetrics(data.metrics || {
        rms: 0,
        peak: 0,
        frequency: 0,
        snr: 0
      });
    } catch (error) {
      console.error('Erreur chargement historique:', error);
      // Fallback sur données simulées
      const mockData = generateMockData();
      setHistoryData(mockData);
      setMetrics({
        rms: 0.0045,
        peak: 0.0123,
        frequency: 1250,
        snr: 42.3
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMockData = () => {
    const now = new Date();
    const hours = period === '24h' ? 24 : period === '7d' ? 168 : 720;
    const data = [];
    
    for (let i = 0; i < hours; i++) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      data.push({
        timestamp: time.toISOString(),
        rms: 0.003 + Math.random() * 0.004,
        peak: 0.008 + Math.random() * 0.008,
        frequency: 1200 + Math.random() * 100,
        status: Math.random() > 0.95 ? 'anomaly' : 'normal'
      });
    }
    
    return data.reverse();
  };

  const exportData = () => {
    const csv = [
      'Timestamp,RMS,Peak,Frequency,Status',
      ...historyData.map(d => 
        `${d.timestamp},${d.rms.toFixed(6)},${d.peak.toFixed(6)},${d.frequency.toFixed(1)},${d.status}`
      )
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sensor-${sensorId}-history-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="bg-dark-tertiary p-8 rounded-lg text-center">
        <div className="text-white/75">Chargement de l'historique...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Contrôles */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Calendar className="w-5 h-5 text-white/75" />
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-3 py-2 bg-dark-tertiary border border-white/10 rounded-sm text-white/95"
          >
            <option value="24h">Dernières 24 heures</option>
            <option value="7d">Derniers 7 jours</option>
            <option value="30d">Derniers 30 jours</option>
          </select>
        </div>
        
        <button
          onClick={exportData}
          className="flex items-center gap-2 px-4 py-2 bg-aqua-primary hover:bg-aqua-secondary text-black/85 rounded-sm"
        >
          <Download className="w-4 h-4" />
          Exporter CSV
        </button>
      </div>

      {/* Métriques calculées */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-dark-tertiary p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-white/55">RMS Moyen</span>
          </div>
          <div className="text-xl font-semibold text-white/95">{metrics.rms.toFixed(4)}</div>
          <div className="text-xs text-white/75">Amplitude efficace</div>
        </div>
        
        <div className="bg-dark-tertiary p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-green-400" />
            <span className="text-xs text-white/55">Pic Maximum</span>
          </div>
          <div className="text-xl font-semibold text-white/95">{metrics.peak.toFixed(4)}</div>
          <div className="text-xs text-white/75">Amplitude crête</div>
        </div>
        
        <div className="bg-dark-tertiary p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-white/55">Fréquence Dominante</span>
          </div>
          <div className="text-xl font-semibold text-white/95">{metrics.frequency.toFixed(0)} Hz</div>
          <div className="text-xs text-white/75">Composante principale</div>
        </div>
        
        <div className="bg-dark-tertiary p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-white/55">SNR</span>
          </div>
          <div className="text-xl font-semibold text-white/95">{metrics.snr.toFixed(1)} dB</div>
          <div className="text-xs text-white/75">Signal/Bruit</div>
        </div>
      </div>

      {/* Graphique temporel */}
      <div className="bg-dark-tertiary p-6 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white/95">
            Évolution Temporelle - {selectedMetric.toUpperCase()}
          </h3>
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value as 'rms' | 'peak' | 'frequency')}
            className="px-3 py-1 bg-dark-quaternary border border-white/10 rounded text-white/95 text-sm"
          >
            <option value="rms">RMS</option>
            <option value="peak">Pic</option>
            <option value="frequency">Fréquence</option>
          </select>
        </div>
        <div className="bg-dark-quaternary rounded border border-white/10 p-4">
          {historyData.length > 0 ? (
            <TimeSeriesChart 
              data={historyData} 
              metric={selectedMetric}
            />
          ) : (
            <div className="h-64 flex items-center justify-center text-white/75">
              <div className="text-center">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>Aucune donnée disponible</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tableau des données */}
      <div className="bg-dark-tertiary rounded-lg overflow-hidden">
        <div className="p-4 border-b border-white/10">
          <h3 className="text-lg font-semibold text-white/95">Données Détaillées</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-dark-quaternary">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/75 uppercase">Timestamp</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/75 uppercase">RMS</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/75 uppercase">Pic</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/75 uppercase">Fréquence</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-white/75 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {historyData.slice(0, 10).map((row, index) => (
                <tr key={index} className="hover:bg-dark-quaternary/50">
                  <td className="px-4 py-3 text-sm text-white/95">
                    {new Date(row.timestamp).toLocaleString('fr-FR')}
                  </td>
                  <td className="px-4 py-3 text-sm text-white/95">{row.rms.toFixed(4)}</td>
                  <td className="px-4 py-3 text-sm text-white/95">{row.peak.toFixed(4)}</td>
                  <td className="px-4 py-3 text-sm text-white/95">{row.frequency.toFixed(1)} Hz</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      row.status === 'anomaly' 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {row.status === 'anomaly' ? 'Anomalie' : 'Normal'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {historyData.length > 10 && (
          <div className="p-4 text-center text-white/55 text-sm">
            Affichage des 10 premiers résultats sur {historyData.length} total
          </div>
        )}
      </div>
    </div>
  );
}