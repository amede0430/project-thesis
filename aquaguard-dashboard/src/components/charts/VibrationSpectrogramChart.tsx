import { useEffect, useState } from 'react';
import { thingSpeakService } from '../../services/thingspeak';
import { vibrationService } from '../../services/vibration';
import type { VibrationAnalysisResponse } from '../../services/vibration';
import SpectrogramChart from './SpectrogramChart';

interface VibrationSpectrogramChartProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  maxResults?: number;
  darkMode?: boolean;
}

export default function VibrationSpectrogramChart({
  autoRefresh = false,
  refreshInterval = 15000,
  maxResults = 200,  // Augmenté à 200 pour plus de données
  darkMode = false,
}: VibrationSpectrogramChartProps) {
  const [analysis, setAnalysis] = useState<VibrationAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAndAnalyze = async () => {
    try {
      setLoading(false);
      setError(null);

      // Récupérer les données acoustiques de ThingSpeak
      const acousticData = await thingSpeakService.fetchAcousticData(maxResults);

      if (acousticData.length === 0) {
        setError('Aucune donnée disponible');
        return;
      }

      // Envoyer au backend pour analyse
      const vibrationAnalysis = await vibrationService.analyzeVibration(acousticData);
      setAnalysis(vibrationAnalysis);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'analyse');
    }
  };

  useEffect(() => {
    fetchAndAnalyze();

    if (autoRefresh) {
      const interval = setInterval(fetchAndAnalyze, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, maxResults]);

  if (loading && !analysis) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={darkMode ? 'text-white/55' : 'text-gray-500'}>
          Chargement...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className={darkMode ? 'text-red-400' : 'text-red-500'}>Erreur: {error}</div>
        <button
          onClick={fetchAndAnalyze}
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

  if (!analysis) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white/95' : 'text-gray-900'}`}>
            Spectrogramme
          </h3>
          <p className={`text-sm ${darkMode ? 'text-white/65' : 'text-gray-500'}`}>
            Analyse fréquentielle
            <span className={darkMode ? 'ml-2 text-aqua-primary' : 'ml-2 text-blue-500'}>
              • Signal vibratoire
            </span>
          </p>
        </div>
        <button
          onClick={fetchAndAnalyze}
          disabled={loading}
          className={
            darkMode
              ? 'px-3 py-1 text-sm bg-dark-quaternary text-white/95 rounded hover:bg-dark-quaternary/80 disabled:opacity-50'
              : 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50'
          }
        >
          {loading ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>

      <SpectrogramChart
        spectrogram={analysis.spectrogram}
        freqs={analysis.spectrogram_freqs}
        times={analysis.spectrogram_times}
        darkMode={darkMode}
      />
    </div>
  );
}
