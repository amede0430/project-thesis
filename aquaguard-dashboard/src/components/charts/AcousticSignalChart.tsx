import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { thingSpeakService } from '../../services/thingspeak';
import type { AcousticData } from '../../services/thingspeak';

interface AcousticSignalChartProps {
  sensorId?: number;
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  maxResults?: number;
  darkMode?: boolean;
}

export default function AcousticSignalChart({ 
  autoRefresh = false, 
  refreshInterval = 15000,
  maxResults = 40,
  darkMode = false
}: AcousticSignalChartProps) {
  const [data, setData] = useState<AcousticData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(false); // Don't show loading on refresh
      setError(null);
      const acousticData = await thingSpeakService.fetchAcousticData(maxResults);
      setData(acousticData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    }
  };

  useEffect(() => {
    fetchData();

    if (autoRefresh) {
      const interval = setInterval(fetchData, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, maxResults]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const chartData = data.map(item => ({
    time: formatTime(item.timestamp),
    'Acc X': item.accX,
    'Acc Y': item.accY,
    'Acc Z': item.accZ,
  }));

  if (loading && data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className={darkMode ? "text-white/55" : "text-gray-500"}>Chargement des données...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <div className={darkMode ? "text-red-400" : "text-red-500"}>Erreur: {error}</div>
        <button 
          onClick={fetchData}
          className={darkMode 
            ? "px-4 py-2 bg-aqua-primary text-dark-primary rounded hover:bg-aqua-secondary" 
            : "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"}
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className={`text-lg font-semibold ${darkMode ? 'text-white/95' : 'text-gray-900'}`}>
            Signal Acoustique
          </h3>
          <p className={`text-sm ${darkMode ? 'text-white/65' : 'text-gray-500'}`}>
            {data.length} échantillons
            {data.length > 0 && (
              <span className={darkMode ? 'ml-2 text-aqua-primary' : 'ml-2 text-blue-500'}>
                • ThingSpeak
              </span>
            )}
          </p>
        </div>
        <button 
          onClick={fetchData}
          disabled={loading}
          className={darkMode 
            ? "px-3 py-1 text-sm bg-dark-quaternary text-white/95 rounded hover:bg-dark-quaternary/80 disabled:opacity-50" 
            : "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"}
        >
          {loading ? 'Actualisation...' : 'Actualiser'}
        </button>
      </div>

      <div className={darkMode ? "bg-dark-quaternary rounded-sm p-2" : "bg-white rounded p-2"}>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke={darkMode ? "#333" : "#e5e7eb"} />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 11, fill: darkMode ? 'rgba(255,255,255,0.65)' : '#6b7280' }}
              angle={-45}
              textAnchor="end"
              height={60}
              stroke={darkMode ? "#444" : "#d1d5db"}
            />
            <YAxis 
              tick={{ fontSize: 11, fill: darkMode ? 'rgba(255,255,255,0.65)' : '#6b7280' }}
              stroke={darkMode ? "#444" : "#d1d5db"}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: darkMode ? '#1a1a1a' : '#fff',
                border: darkMode ? '1px solid #333' : '1px solid #e5e7eb',
                borderRadius: '4px',
                color: darkMode ? '#fff' : '#000'
              }}
            />
            <Legend 
              wrapperStyle={{
                fontSize: '12px',
                color: darkMode ? 'rgba(255,255,255,0.95)' : '#374151'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="Acc X" 
              stroke="#ef4444" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="Acc Y" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false}
            />
            <Line 
              type="monotone" 
              dataKey="Acc Z" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className={`mt-2 text-xs flex justify-between ${darkMode ? 'text-white/55' : 'text-gray-500'}`}>
        <span>Amplitude</span>
        <span>Temps</span>
      </div>

      {data.length > 0 && (
        <div className="grid grid-cols-3 gap-3 text-xs mt-3">
          <div className={darkMode ? "p-2 bg-red-500/10 rounded" : "p-3 bg-red-50 rounded"}>
            <div className={darkMode ? "text-red-400 font-semibold" : "text-red-600 font-semibold"}>Acc X</div>
            <div className={`text-lg font-bold ${darkMode ? 'text-white/95' : 'text-gray-900'}`}>
              {data[data.length - 1].accX.toFixed(3)}
            </div>
          </div>
          <div className={darkMode ? "p-2 bg-blue-500/10 rounded" : "p-3 bg-blue-50 rounded"}>
            <div className={darkMode ? "text-blue-400 font-semibold" : "text-blue-600 font-semibold"}>Acc Y</div>
            <div className={`text-lg font-bold ${darkMode ? 'text-white/95' : 'text-gray-900'}`}>
              {data[data.length - 1].accY.toFixed(3)}
            </div>
          </div>
          <div className={darkMode ? "p-2 bg-green-500/10 rounded" : "p-3 bg-green-50 rounded"}>
            <div className={darkMode ? "text-green-400 font-semibold" : "text-green-600 font-semibold"}>Acc Z</div>
            <div className={`text-lg font-bold ${darkMode ? 'text-white/95' : 'text-gray-900'}`}>
              {data[data.length - 1].accZ.toFixed(3)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
