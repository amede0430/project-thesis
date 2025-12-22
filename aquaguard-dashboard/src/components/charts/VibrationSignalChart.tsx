import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { thingSpeakService } from '../../services/thingspeak';
import { vibrationService } from '../../services/vibration';
import type { VibrationAnalysisResponse } from '../../services/vibration';
import { AlertTriangle, CheckCircle, Zap } from 'lucide-react';

interface VibrationSignalChartProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  maxResults?: number;
  darkMode?: boolean;
}

export default function VibrationSignalChart({
  autoRefresh = false,
  refreshInterval = 15000,
  maxResults = 40,
  darkMode = false,
}: VibrationSignalChartProps) {
  const [analysis, setAnalysis] = useState<VibrationAnalysisResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAndAnalyze = async () => {
    try {
      setLoading(false);
      setError(null);

      // 1. Récupérer les données acoustiques de ThingSpeak
      const acousticData = await thingSpeakService.fetchAcousticData(maxResults);

      if (acousticData.length === 0) {
        setError('Aucune donnée disponible');
        return;
      }

      // 2. Envoyer au backend pour analyse
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

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'anomaly':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <Zap className="w-5 h-5 text-yellow-500" />;
      default:
        return null;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'normal':
        return 'Normal';
      case 'anomaly':
        return 'Anomalie';
      case 'warning':
        return 'Attention';
      default:
        return 'Inconnu';
    }
  };

  if (loading && !analysis) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={darkMode ? 'text-white/55' : 'text-gray-500'}>
          Analyse en cours...
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

  const chartData = analysis.vibration_signal.map((value, index) => ({
    time: formatTime(analysis.timestamps[index]),
    vibration: value,
  }));

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white/95' : 'text-gray-900'}`}>
            Signal Vibratoire
          </h3>
          <p className={`text-sm ${darkMode ? 'text-white/65' : 'text-gray-500'}`}>
            {analysis.vibration_signal.length} échantillons
            <span className={darkMode ? 'ml-2 text-aqua-primary' : 'ml-2 text-blue-500'}>
              • Calculé depuis ThingSpeak
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

      <div className={darkMode ? 'bg-dark-quaternary rounded-sm p-2' : 'bg-white rounded p-2'}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? '#333' : '#e5e7eb'} />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: darkMode ? 'rgba(255,255,255,0.65)' : '#6b7280' }}
              angle={-45}
              textAnchor="end"
              height={60}
              stroke={darkMode ? '#444' : '#d1d5db'}
            />
            <YAxis
              tick={{ fontSize: 11, fill: darkMode ? 'rgba(255,255,255,0.65)' : '#6b7280' }}
              stroke={darkMode ? '#444' : '#d1d5db'}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? '#1a1a1a' : '#fff',
                border: darkMode ? '1px solid #333' : '1px solid #e5e7eb',
                borderRadius: '4px',
                color: darkMode ? '#fff' : '#000',
              }}
            />
            <Line
              type="monotone"
              dataKey="vibration"
              stroke="#00d4aa"
              strokeWidth={2}
              dot={false}
              name="Magnitude"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={`mt-2 text-xs flex justify-between ${darkMode ? 'text-white/55' : 'text-gray-500'}`}>
        <span>Magnitude</span>
        <span>Temps</span>
      </div>

      {/* Métriques d'analyse */}
      <div className="grid grid-cols-4 gap-3 text-xs mt-3">
        <div className={darkMode ? 'p-2 bg-dark-quaternary rounded' : 'p-3 bg-gray-50 rounded'}>
          <div className={`flex items-center gap-2 mb-1 ${darkMode ? 'text-white/95' : 'text-gray-900'}`}>
            {getStatusIcon(analysis.status)}
            <span className="font-semibold">Statut</span>
          </div>
          <div className={`text-sm font-bold ${darkMode ? 'text-white/95' : 'text-gray-900'}`}>
            {getStatusText(analysis.status)}
          </div>
        </div>

        <div className={darkMode ? 'p-2 bg-blue-500/10 rounded' : 'p-3 bg-blue-50 rounded'}>
          <div className={darkMode ? 'text-blue-400 font-semibold' : 'text-blue-600 font-semibold'}>
            RMS
          </div>
          <div className={`text-sm font-bold ${darkMode ? 'text-white/95' : 'text-gray-900'}`}>
            {analysis.rms.toFixed(4)}
          </div>
        </div>

        <div className={darkMode ? 'p-2 bg-purple-500/10 rounded' : 'p-3 bg-purple-50 rounded'}>
          <div className={darkMode ? 'text-purple-400 font-semibold' : 'text-purple-600 font-semibold'}>
            Peak
          </div>
          <div className={`text-sm font-bold ${darkMode ? 'text-white/95' : 'text-gray-900'}`}>
            {analysis.peak.toFixed(4)}
          </div>
        </div>

        <div className={darkMode ? 'p-2 bg-green-500/10 rounded' : 'p-3 bg-green-50 rounded'}>
          <div className={darkMode ? 'text-green-400 font-semibold' : 'text-green-600 font-semibold'}>
            Fréquence
          </div>
          <div className={`text-sm font-bold ${darkMode ? 'text-white/95' : 'text-gray-900'}`}>
            {analysis.frequency.toFixed(1)} Hz
          </div>
        </div>
      </div>
    </div>
  );
}
