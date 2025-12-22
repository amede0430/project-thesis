import { useState, useEffect } from 'react';
import { Download, Calendar, Filter, FileText, BarChart3, TrendingUp, AlertTriangle, CheckCircle, Zap, Clock } from 'lucide-react';
import Header from '../components/ui/Header';

export default function Reports() {
  const [dateRange, setDateRange] = useState('7d');
  const [statusFilter, setStatusFilter] = useState('all');
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analysesData, statsData] = await Promise.all([
          fetch(`http://localhost:8000/history/analyses?days=${dateRange.replace('d', '')}&status=${statusFilter === 'all' ? '' : statusFilter}`).then(r => r.json()),
          fetch(`http://localhost:8000/history/statistics?days=${dateRange.replace('d', '')}`).then(r => r.json())
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
      'pending': 'En attente',
      'generating': 'Génération...',
      'completed': 'Terminé',
      'failed': 'Échec'
    };
    return statuses[status] || status;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-secondary">
        <Header />
        <div className="p-6 flex justify-center items-center">
          <div className="text-white/75">Chargement des rapports...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-secondary">
      <Header />
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-white/95">Rapports et Historique</h1>
          <div className="flex items-center gap-4">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 bg-dark-tertiary border border-white/10 rounded-sm text-white/95 focus:border-aqua-primary focus:outline-none"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="90d">3 derniers mois</option>
              <option value="1y">Dernière année</option>
            </select>
            <button className="flex items-center gap-2 px-4 py-2 bg-aqua-primary hover:bg-aqua-secondary text-black/85 font-medium rounded-sm">
              <Download className="w-4 h-4" />
              Exporter
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-8">
          <div className="bg-dark-tertiary p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-white/75">Total Alertes</span>
            </div>
            <div className="text-2xl font-semibold text-white/95">
              {historyMetrics?.total_alerts ?? 0}
            </div>
          </div>
          <div className="bg-dark-tertiary p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-white/75">Alertes Résolues</span>
            </div>
            <div className="text-2xl font-semibold text-white/95">
              {historyMetrics?.resolved_alerts ?? 0}
            </div>
          </div>
          <div className="bg-dark-tertiary p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-white/75">Capteurs Actifs</span>
            </div>
            <div className="text-2xl font-semibold text-white/95">
              {historyMetrics?.active_sensors ?? 0}
            </div>
          </div>
          <div className="bg-dark-tertiary p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm text-white/75">Fuites Détectées</span>
            </div>
            <div className="text-2xl font-semibold text-white/95">
              {historyMetrics?.leak_detections ?? 0}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Reports List */}
          <div className="col-span-2">
            <div className="bg-dark-tertiary rounded-lg">
              <div className="p-4 border-b border-white/10">
                <div className="flex justify-between items-center">
                  <h2 className="text-lg font-semibold text-white/95">Rapports Disponibles</h2>
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-white/55" />
                    <select
                      value={reportType}
                      onChange={(e) => setReportType(e.target.value)}
                      className="px-2 py-1 bg-dark-quaternary border border-white/10 rounded-sm text-white/95 text-sm"
                    >
                      <option value="all">Tous les types</option>
                      <option value="secteur">Secteur</option>
                      <option value="analyse">Analyse</option>
                      <option value="performance">Performance</option>
                      <option value="mensuel">Mensuel</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="divide-y divide-white/10">
                {reports.length > 0 ? reports.map((report) => (
                  <div key={report.id} className="p-4 hover:bg-dark-quaternary/50">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-aqua-primary/20 rounded-sm flex items-center justify-center">
                          <FileText className="w-4 h-4 text-aqua-primary" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white/95">{report.title}</div>
                          <div className="text-xs text-white/55">
                            {formatDate(report.created_at)} • {getReportTypeLabel(report.type)} • {getStatusLabel(report.status)}
                          </div>
                        </div>
                      </div>
                      <button 
                        className="flex items-center gap-1 px-3 py-1 bg-dark-quaternary hover:bg-dark-quaternary/80 text-white/95 text-sm rounded-sm"
                        disabled={report.status !== 'completed'}
                      >
                        <Download className="w-3 h-3" />
                        {report.status === 'completed' ? 'Télécharger' : 'Pas disponible'}
                      </button>
                    </div>
                  </div>
                )) : (
                  <div className="p-4 text-center text-white/55">
                    Aucun rapport disponible
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <div className="bg-dark-tertiary p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white/95 mb-4">Actions Rapides</h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-2 px-3 py-2 bg-dark-quaternary hover:bg-dark-quaternary/80 text-white/95 rounded-sm text-sm">
                  <BarChart3 className="w-4 h-4" />
                  Générer Rapport Personnalisé
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 bg-dark-quaternary hover:bg-dark-quaternary/80 text-white/95 rounded-sm text-sm">
                  <Calendar className="w-4 h-4" />
                  Programmer Rapport
                </button>
                <button className="w-full flex items-center gap-2 px-3 py-2 bg-dark-quaternary hover:bg-dark-quaternary/80 text-white/95 rounded-sm text-sm">
                  <Download className="w-4 h-4" />
                  Exporter Données Brutes
                </button>
              </div>
            </div>

            <div className="bg-dark-tertiary p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white/95 mb-4">Métriques Système</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/75">Rapports Totaux</span>
                  <span className="text-white/95">{reportMetrics?.total_reports ?? 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/75">En Attente</span>
                  <span className="text-orange-500">{reportMetrics?.pending_reports ?? 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/75">Terminés</span>
                  <span className="text-green-500">{reportMetrics?.completed_reports ?? 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/75">Temps de Fonctionnement</span>
                  <span className="text-white/95">Pas disponible</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}