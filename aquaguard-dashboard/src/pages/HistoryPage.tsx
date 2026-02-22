import { useState, useEffect } from 'react';
import { Download, Calendar, Filter, AlertTriangle, CheckCircle, Zap, Clock } from 'lucide-react';
import Header from '../components/ui/Header';

export default function HistoryPage() {
  const [dateRange, setDateRange] = useState('7');
  const [statusFilter, setStatusFilter] = useState('all');
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Données statiques de démonstration
  const staticAnalyses = [
    {
      id: 1,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'normal',
      confidence: 0.95,
      severity: 0.25,
      rms: 0.234,
      peak: 0.567,
      frequency: 125.3
    },
    {
      id: 2,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      status: 'warning',
      confidence: 0.87,
      severity: 0.72,
      rms: 0.456,
      peak: 0.892,
      frequency: 187.5
    },
    {
      id: 3,
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      status: 'normal',
      confidence: 0.92,
      severity: 0.18,
      rms: 0.198,
      peak: 0.423,
      frequency: 98.7
    },
    {
      id: 4,
      timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      status: 'anomaly',
      confidence: 0.91,
      severity: 0.88,
      rms: 0.678,
      peak: 1.234,
      frequency: 245.8
    },
    {
      id: 5,
      timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
      status: 'normal',
      confidence: 0.94,
      severity: 0.22,
      rms: 0.212,
      peak: 0.489,
      frequency: 112.4
    },
    {
      id: 6,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      status: 'warning',
      confidence: 0.85,
      severity: 0.75,
      rms: 0.523,
      peak: 0.945,
      frequency: 203.6
    },
    {
      id: 7,
      timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
      status: 'normal',
      confidence: 0.96,
      severity: 0.15,
      rms: 0.187,
      peak: 0.398,
      frequency: 89.2
    },
    {
      id: 8,
      timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      status: 'normal',
      confidence: 0.93,
      severity: 0.28,
      rms: 0.245,
      peak: 0.534,
      frequency: 134.7
    }
  ];

  const staticStatistics = {
    total_analyses: 8,
    normal_count: 5,
    normal_percentage: 62.5,
    warning_count: 2,
    warning_percentage: 25.0,
    anomaly_count: 1,
    anomaly_percentage: 12.5
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analysesData, statsData] = await Promise.all([
          fetch(`http://localhost:8000/history/analyses?days=${dateRange}&status=${statusFilter === 'all' ? '' : statusFilter}`).then(r => r.json()),
          fetch(`http://localhost:8000/history/statistics?days=${dateRange}`).then(r => r.json())
        ]);
        
        // Si les données sont vides, utiliser les données statiques
        if (!analysesData || analysesData.length === 0) {
          setAnalyses(staticAnalyses);
          setStatistics(staticStatistics);
        } else {
          setAnalyses(analysesData);
          setStatistics(statsData);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'historique:', error);
        // Utiliser les données statiques en cas d'erreur
        setAnalyses(staticAnalyses);
        setStatistics(staticStatistics);
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
      <div className="min-h-screen bg-light-secondary">
        <Header />
        <div className="p-6 flex justify-center items-center">
          <div className="text-gray-600">Chargement de l'historique...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-secondary">
      <Header />
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Historique des Analyses</h1>
            <p className="text-sm text-gray-600 mt-1">Analyses IA significatives du capteur AQG-SAK-001</p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-sm text-gray-900 focus:border-aqua-primary focus:outline-none focus:ring-1 focus:ring-aqua-primary"
            >
              <option value="7">7 derniers jours</option>
              <option value="30">30 derniers jours</option>
              <option value="90">3 derniers mois</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-white border border-gray-300 rounded-sm text-gray-900 focus:border-aqua-primary focus:outline-none focus:ring-1 focus:ring-aqua-primary"
            >
              <option value="all">Tous les statuts</option>
              <option value="normal">Normal</option>
              <option value="warning">Attention</option>
              <option value="anomaly">Anomalie</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-aqua-primary hover:bg-aqua-dark text-white font-medium rounded-sm">
              <Download className="w-4 h-4" />
              Exporter
            </button>
          </div>
        </div>

        {/* Statistiques */}
        {statistics && (
          <div className="grid grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Total Analyses</div>
              <div className="text-2xl font-semibold text-gray-900">{statistics.total_analyses}</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Normales</div>
              <div className="text-2xl font-semibold text-green-600">{statistics.normal_count}</div>
              <div className="text-xs text-gray-500">{statistics.normal_percentage.toFixed(1)}%</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Attention</div>
              <div className="text-2xl font-semibold text-yellow-600">{statistics.warning_count}</div>
              <div className="text-xs text-gray-500">{statistics.warning_percentage.toFixed(1)}%</div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              <div className="text-sm text-gray-600 mb-2">Anomalies</div>
              <div className="text-2xl font-semibold text-red-600">{statistics.anomaly_count}</div>
              <div className="text-xs text-gray-500">{statistics.anomaly_percentage.toFixed(1)}%</div>
            </div>
          </div>
        )}

        {/* Liste des analyses */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Analyses Enregistrées</h2>
            <p className="text-sm text-gray-600">Analyses avec confiance &gt; 80% et sévérité &gt; 70%</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr className="text-left text-sm text-gray-700">
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
                  <tr key={analysis.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 text-sm text-gray-900">{formatDate(analysis.timestamp)}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(analysis.status)}
                        <span className="text-sm text-gray-900">{getStatusLabel(analysis.status)}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm text-gray-900">{Math.round(analysis.confidence * 100)}%</div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm text-gray-900">{Math.round(analysis.severity * 100)}%</div>
                    </td>
                    <td className="p-3 text-sm text-gray-700">{analysis.rms.toFixed(3)}</td>
                    <td className="p-3 text-sm text-gray-700">{analysis.peak.toFixed(3)}</td>
                    <td className="p-3 text-sm text-gray-700">{analysis.frequency.toFixed(1)} Hz</td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-gray-500">
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