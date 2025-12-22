import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Clock, AlertTriangle, User, CheckCircle } from 'lucide-react';
import Header from '../components/ui/Header';
import { apiService } from '../services/api';

export default function AlertDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [alert, setAlert] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlert = async () => {
      if (!id) return;
      try {
        const alertData = await apiService.getAlert(id);
        setAlert(alertData);
      } catch (error) {
        console.error('Erreur lors du chargement de l\'alerte:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAlert();
  }, [id]);

  const handleResolve = async () => {
    if (!alert) return;
    try {
      await apiService.updateAlertStatus(alert.id, { status: 'RESOLVED' });
      setAlert({ ...alert, status: 'RESOLVED', resolved_at: new Date().toISOString() });
    } catch (error) {
      console.error('Erreur lors de la résolution:', error);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'CRITICAL': return 'text-red-500';
      case 'HIGH': return 'text-orange-500';
      case 'MEDIUM': return 'text-yellow-500';
      case 'LOW': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-red-500';
      case 'IN_PROGRESS': return 'text-orange-500';
      case 'RESOLVED': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'LEAK_DETECTED': 'Fuite Détectée',
      'SENSOR_OFFLINE': 'Capteur Hors Ligne',
      'MAINTENANCE_REQUIRED': 'Maintenance Requise'
    };
    return types[type] || type;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-secondary">
        <Header />
        <div className="p-6 flex justify-center items-center">
          <div className="text-white/75">Chargement des détails de l'alerte...</div>
        </div>
      </div>
    );
  }

  if (!alert) {
    return (
      <div className="min-h-screen bg-dark-secondary">
        <Header />
        <div className="p-6">
          <div className="text-center text-white/75">Alerte non trouvée</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-secondary">
      <Header />
      
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3 py-2 bg-dark-tertiary hover:bg-dark-quaternary text-white/95 rounded-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>
          <h1 className="text-2xl font-semibold text-white/95">
            Détails de l'Alerte #{alert.id}
          </h1>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Alert Info */}
          <div className="col-span-2 space-y-6">
            <div className="bg-dark-tertiary p-6 rounded-lg">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-xl font-semibold text-white/95 mb-2">
                    {getTypeLabel(alert.type)}
                  </h2>
                  <p className="text-white/75">{alert.message}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(alert.status)}`}>
                  {alert.status === 'RESOLVED' ? 'Résolue' : 
                   alert.status === 'IN_PROGRESS' ? 'En cours' : 'Active'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-5 h-5 ${getSeverityColor(alert.severity)}`} />
                  <span className="text-white/75">Sévérité:</span>
                  <span className={`font-medium ${getSeverityColor(alert.severity)}`}>
                    {alert.severity}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-white/55" />
                  <span className="text-white/75">Créée le:</span>
                  <span className="text-white/95">
                    {new Date(alert.created_at).toLocaleString('fr-FR')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-white/55" />
                  <span className="text-white/75">Capteur:</span>
                  <span className="text-white/95">{alert.sensor_name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/75">Localisation:</span>
                  <span className="text-white/95">{alert.sensor_location}</span>
                </div>
              </div>

              {alert.confidence && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="text-white/75">Confiance IA:</span>
                    <span className="text-white/95">{(alert.confidence * 100).toFixed(1)}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {alert.status !== 'RESOLVED' && (
              <div className="bg-dark-tertiary p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-white/95 mb-4">Actions</h3>
                <div className="flex gap-3">
                  <button
                    onClick={handleResolve}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Marquer comme Résolue
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-sm">
                    <User className="w-4 h-4" />
                    Assigner
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-dark-tertiary p-4 rounded-lg">
              <h3 className="text-lg font-semibold text-white/95 mb-4">Informations</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-white/75">ID Alerte:</span>
                  <span className="text-white/95">#{alert.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/75">ID Capteur:</span>
                  <span className="text-white/95">{alert.sensor_id}</span>
                </div>
                {alert.assigned_user_name && (
                  <div className="flex justify-between">
                    <span className="text-white/75">Assignée à:</span>
                    <span className="text-white/95">{alert.assigned_user_name}</span>
                  </div>
                )}
                {alert.resolved_at && (
                  <div className="flex justify-between">
                    <span className="text-white/75">Résolue le:</span>
                    <span className="text-white/95">
                      {new Date(alert.resolved_at).toLocaleString('fr-FR')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}