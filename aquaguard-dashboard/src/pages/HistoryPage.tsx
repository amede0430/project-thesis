import { useState, useEffect } from 'react';
import { Download, Calendar, Filter, AlertTriangle, CheckCircle, Zap, Clock } from 'lucide-react';
import Header from '../components/ui/Header';

export default function HistoryPage() {
  const [dateRange, setDateRange] = useState('7');
  const [statusFilter, setStatusFilter] = useState('all');
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analysesData, statsData] = await Promise.all([
          fetch(`http://localhost:8000/history/analyses?days=${dateRange}&status=${statusFilter === 'all' ? '' : statusFilter}`).then(r => r.json()),
          fetch(`http://localhost:8000/history/statistics?days=${dateRange}`).then(r => r.json())
        ]);
        setAnalyses(analysesData);
        setStatistics(statsData);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dateRange, statusFilter]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <Zap className="w-4 h-4 text-yellow-500" />;
      case 'anomaly':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const statuses: { [key: string]: string } = {
      'normal': 'Normal',
      'warning': 'Attention',
      'anomaly': 'Anomalie'
    };
    return statuses[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-secondary">
        <Header />
        <div className="p-6 flex justify-center items-center">
          <div className="text-white/75">Chargement de l'historique...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-secondary">
      <Header />
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-white/95">Historique des Analyses</h1>
            <p className="text-sm text-white/65 mt-1">Analyses IA significatives du capteur AQG-SAK-001</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 bg-dark-tertiary border border-white/10 rounded-sm text-white/95 focus:border-aqua-primary focus:outline-none"
            >
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">3 derniers mois</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-dark-tertiary border border-white/10 rounded-sm text-white/95 focus:border-aqua-primary focus:outline-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="normal">Normal</option>
              <option value="warning">Attention</option>
              <option value="anomaly">Anomalie</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-aqua-primary hover:bg-aqua-secondary text-black/85 font-medium rounded-sm">
              <Download className="w-4 h-4" />
              Exporter
            </button>
          </div>
        </div>

        {/* Statistiques */}
        {statistics && (
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-dark-tertiary p-4 rounded-lg">
              <div className="text-sm text-white/75 mb-2">Total Analyses</div>
              <div className="text-2xl font-semibold text-white/95">{statistics.total_analyses}</div>
            </div>
            <div className="bg-dark-tertiary p-4 rounded-lg">
              <div className="text-sm text-white/75 mb-2">Normales</div>
              <div className="text-2xl font-semibold text-green-500">{statistics.normal_count}</div>
              <div className="text-xs text-white/55">{statistics.normal_percentage.toFixed(1)}%</div>
            </div>
            <div className="bg-dark-tertiary p-4 rounded-lg">
              <div className="text-sm text-white/75 mb-2">Attention</div>
              <div className="text-2xl font-semibold text-yellow-500">{statistics.warning_count}</div>
              <div className="text-xs text-white/55">{statistics.warning_percentage.toFixed(1)}%</div>
            </div>
            <div className="bg-dark-tertiary p-4 rounded-lg">
              <div className="text-sm text-white/75 mb-2">Anomalies</div>
              <div className="text-2xl font-semibold text-red-500">{statistics.anomaly_count}</div>
              <div className="text-xs text-white/55">{statistics.anomaly_percentage.toFixed(1)}%</div>
            </div>
          </div>
        )}

        {/* Liste des analyses */}
        <div className="bg-dark-tertiary rounded-lg">
          <div className="p-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white/95">Analyses Enregistrées</h2>
            <p className="text-sm text-white/65">Analyses avec confiance &gt; 80% et sévérité &gt; 70%</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-dark-quaternary">
                <tr className="text-left text-sm text-white/75">
                  <th className="p-3">Date/Heure</th>
                  <th className="p-3">Statut</th>
                  <th className="p-3">Confiance</th>
                  <th className="p-3">Sévérité</th>
                  <th className="p-3">RMS</th>
                  <th className="p-3">Peak</th>
                  <th className="p-3">Fréquence</th>
                </tr>
              </thead>
              <tbody>
                {analyses.length > 0 ? analyses.map((analysis) => (
                  <tr key={analysis.id} className="border-b border-white/8 hover:bg-dark-quaternary/50">
                    <td className="p-3 text-sm text-white/95">{formatDate(analysis.timestamp)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(analysis.status)}
                        <span className="text-sm text-white/95">{getStatusLabel(analysis.status)}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm text-white/95">{Math.round(analysis.confidence * 100)}%</div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm text-white/95">{Math.round(analysis.severity * 100)}%</div>
                    </td>
                    <td className="p-3 text-sm text-white/75">{analysis.rms.toFixed(3)}</td>
                    <td className="p-3 text-sm text-white/75">{analysis.peak.toFixed(3)}</td>
                    <td className="p-3 text-sm text-white/75">{analysis.frequency.toFixed(1)} Hz</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-white/55">
                      Aucune analyse significative trouvée pour cette période
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}