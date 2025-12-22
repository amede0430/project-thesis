import { useEffect, useState } from 'react';
import { thingSpeakService } from '../../services/thingspeak';
import { mlService } from '../../services/ml';
import type { MLPredictionResponse } from '../../services/ml';
import { AlertTriangle, CheckCircle, Activity } from 'lucide-react';

interface MLPredictionDisplayProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  maxResults?: number;
  darkMode?: boolean;
}

export default function MLPredictionDisplay({
  autoRefresh = false,
  refreshInterval = 15000,
  maxResults = 200,
  darkMode = false,
}: MLPredictionDisplayProps) {
  const [prediction, setPrediction] = useState<MLPredictionResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAndPredict = async () => {
    try {
      setLoading(false);
      setError(null);

      // Récupérer les données acoustiques
      const acousticData = await thingSpeakService.fetchAcousticData(maxResults);

      if (acousticData.length < 16) {
        setError('Pas assez de données pour la prédiction');
        return;
      }

      // Faire la prédiction
      const result = await mlService.predict(acousticData);
      setPrediction(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la prédiction');
    }
  };

  useEffect(() => {
    fetchAndPredict();

    if (autoRefresh) {
      const interval = setInterval(fetchAndPredict, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, maxResults]);

  const getStatusIcon = (pred: string) => {
    if (pred.toLowerCase().includes('normal')) {
      return <CheckCircle className="w-6 h-6 text-green-500" />;
    } else if (pred.toLowerCase().includes('fuite')) {
      return <AlertTriangle className="w-6 h-6 text-red-500" />;
    }
    return <Activity className="w-6 h-6 text-yellow-500" />;
  };

  if (loading && !prediction) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className={darkMode ? 'text-white/55' : 'text-gray-500'}>
          <Activity className="w-8 h-8 mx-auto mb-2 opacity-50 animate-pulse" />
          <div>Analyse en cours...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-4">
        <div className={darkMode ? 'text-red-400' : 'text-red-500'}>Erreur: {error}</div>
        <button
          onClick={fetchAndPredict}
          className={
            darkMode
              ? 'px-4 py-2 bg-aqua-primary text-dark-primary rounded hover:bg-aqua-secondary'
              : 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
          }
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!prediction) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Résultat de la prédiction - En haut */}
      <div className="grid grid-cols-3 gap-4">
        {/* Prédiction principale */}
        <div className={darkMode ? 'bg-dark-quaternary rounded-lg p-4' : 'bg-gray-50 rounded-lg p-4'}>
          <div className="flex items-center gap-3 mb-3">
            {getStatusIcon(prediction.prediction)}
            <div>
              <div className={`text-lg font-semibold ${darkMode ? 'text-white/95' : 'text-gray-900'}`}>
                {prediction.prediction}
              </div>
              <div className={`text-sm ${darkMode ? 'text-white/65' : 'text-gray-600'}`}>
                Confiance: {(prediction.confidence * 100).toFixed(1)}%
              </div>
            </div>
          </div>
          
          {/* Barre de confiance */}
          <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
            <div
              className={`h-full ${
                prediction.prediction.toLowerCase().includes('normal')
                  ? 'bg-green-500'
                  : 'bg-red-500'
              }`}
              style={{ width: `${prediction.confidence * 100}%` }}
            />
          </div>
        </div>

        {/* Probabilités */}
        <div className={`col-span-2 ${darkMode ? 'bg-dark-quaternary rounded-lg p-4' : 'bg-gray-50 rounded-lg p-4'}`}>
          <div className={`text-sm font-semibold mb-3 ${darkMode ? 'text-white/95' : 'text-gray-900'}`}>
            Probabilités
          </div>
          <div className="space-y-3">
            {Object.entries(prediction.probabilities).map(([className, prob]) => (
              <div key={className}>
                <div className="flex justify-between text-sm mb-1">
                  <span className={darkMode ? 'text-white/65' : 'text-gray-600'}>{className}</span>
                  <span className={darkMode ? 'text-white/95' : 'text-gray-900'}>
                    {(prob * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div
                    className="h-full bg-aqua-primary"
                    style={{ width: `${prob * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Spectrogramme 224x224 - En bas */}
      <div className={darkMode ? 'bg-dark-quaternary rounded-lg p-4' : 'bg-gray-50 rounded-lg p-4'}>
        <div className="flex justify-center">
          <img
            src={`data:image/png;base64,${prediction.spectrogram_image}`}
            alt="Spectrogramme"
            className="rounded border"
            style={{ 
              borderColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              maxWidth: '400px',
              width: '100%'
            }}
          />
        </div>
        <div className={`text-xs mt-2 text-center ${darkMode ? 'text-white/55' : 'text-gray-500'}`}>
          Spectrogramme (224x224) - Input du modèle ML
        </div>
      </div>

      {/* Bouton actualiser - Pleine largeur */}
      <button
        onClick={fetchAndPredict}
        disabled={loading}
        className={
          darkMode
            ? 'w-full px-4 py-2 bg-dark-quaternary text-white/95 rounded hover:bg-dark-quaternary/80 disabled:opacity-50'
            : 'w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50'
        }
      >
        {loading ? 'Actualisation...' : 'Actualiser la prédiction'}
      </button>
    </div>
  );
}
