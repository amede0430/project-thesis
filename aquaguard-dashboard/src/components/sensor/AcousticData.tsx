import { useState, useEffect, useRef } from 'react';
import { Play, Pause, Download } from 'lucide-react';

interface AcousticDataProps {
  sensorId: string;
}

export default function AcousticData({ sensorId }: AcousticDataProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [amplitude] = useState(1.0);
  const [waveformData, setWaveformData] = useState<number[]>([]);
  const [sampleData, setSampleData] = useState<number[]>([]);
  const [spectrogramData, setSpectrogramData] = useState<number[][]>([]);
  const [frequencyAxis, setFrequencyAxis] = useState<number[]>([]);
  const [timeAxis, setTimeAxis] = useState<number[]>([]);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spectrogramRef = useRef<HTMLCanvasElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);

  // WebSocket qui met à jour les états seulement
  useEffect(() => {
    if (!isRunning) return;
    
    const ws = new WebSocket('ws://localhost:8000/ws/acoustic');
    wsRef.current = ws;
    
    ws.onopen = () => {
      console.log('WebSocket connecté');
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        if (data.type === 'waveform_update') {
          const samples = data.waveform?.samples || [];
          const values = data.waveform?.values || [];
          
          // Debug des valeurs
          if (values.length > 0) {
            const min = Math.min(...values);
            const max = Math.max(...values);
            const avg = values.reduce((a, b) => a + b, 0) / values.length;
            console.log(`Signal - Min: ${min.toFixed(3)}, Max: ${max.toFixed(3)}, Avg: ${avg.toFixed(3)}, Range: ${(max-min).toFixed(3)}`);
            console.log(`Premiers 10 points:`, values.slice(0, 10).map(v => v.toFixed(3)));
          }
          
          setSampleData(samples);
          setWaveformData(values);
          setLastUpdate(new Date());
        }
        
        if (data.type === 'spectrogram_update') {
          setSpectrogramData(data.spectrogram || []);
          if (data.spectrogram_meta) {
            setFrequencyAxis(data.spectrogram_meta.frequencies || []);
            setTimeAxis(data.spectrogram_meta.times || []);
          }
        }
      } catch (error) {
        console.error('Erreur WebSocket:', error);
      }
    };
    
    ws.onerror = (error) => {
      console.error('Erreur WebSocket:', error);
    };
    
    return () => {
      ws.close();
    };
  }, [isRunning]);

  const getSignalColor = () => '#00ff88';

  // Animation continue comme dans l'ancien projet
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerY = height / 2;
    const signalColor = getSignalColor();

    const drawWaveform = () => {
      if (!isRunning) return;

      // Effacer le canvas
      ctx.fillStyle = '#0f1419';
      ctx.fillRect(0, 0, width, height);

      // Grille de fond
      ctx.strokeStyle = 'rgba(100, 150, 200, 0.1)';
      ctx.lineWidth = 1;

      // Lignes horizontales
      for (let i = 0; i <= 4; i++) {
        const y = (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Lignes verticales
      for (let i = 0; i <= 10; i++) {
        const x = (width / 10) * i;
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      // Ligne centrale
      ctx.strokeStyle = 'rgba(100, 150, 200, 0.3)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(width, centerY);
      ctx.stroke();

      // Dessiner le signal
      ctx.beginPath();
      ctx.strokeStyle = signalColor;
      ctx.lineWidth = 2;
      ctx.shadowBlur = 10;
      ctx.shadowColor = signalColor;

      if (sampleData.length > 0 && waveformData.length > 0) {
        const minSample = Math.min(...sampleData);
        const maxSample = Math.max(...sampleData);
        const sampleRange = maxSample - minSample;
        const maxY = Math.max(...waveformData.map(Math.abs));

        const step = Math.max(1, Math.floor(sampleData.length / width));
        let prevX = 0;
        let prevY = centerY;

        for (let i = 0; i < sampleData.length; i += step) {
          const x_canvas = sampleRange > 0 ? ((sampleData[i] - minSample) / sampleRange) * width : (i / (sampleData.length - 1)) * width;
          let y = maxY > 0 ? (waveformData[i] / maxY) * amplitude : 0;
          const canvasY = centerY - (y * (height * 0.35));

          if (i > 0) {
            ctx.lineTo(x_canvas, canvasY);
          } else {
            ctx.moveTo(x_canvas, canvasY);
          }

          prevX = x_canvas;
          prevY = canvasY;
        }

        if (prevX < width) {
          ctx.lineTo(width, prevY);
        }
      }

      ctx.stroke();
      ctx.shadowBlur = 0;

      timeRef.current += 0.02;

      // Labels
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.font = '12px sans-serif';
      ctx.fillText('Amplitude', 10, 20);
      ctx.fillText('Signal acoustique', 10, height - 10);

      // Indicateur d'amplitude
      ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
      ctx.fillRect(width - 30, 10, 20, height - 20);
      ctx.fillStyle = signalColor;
      const ampHeight = (height - 20) * amplitude;
      ctx.fillRect(width - 30, height - 10 - ampHeight, 20, ampHeight);

      animationRef.current = requestAnimationFrame(drawWaveform);
    };

    drawWaveform();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isRunning, amplitude, waveformData, sampleData]);

  // Animation spectrogramme continue
  useEffect(() => {
    const canvas = spectrogramRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;

    const drawSpectrogram = () => {
      if (!isRunning) return;

      ctx.fillStyle = '#101428';
      ctx.fillRect(0, 0, width, height);

      if (!spectrogramData.length || !spectrogramData[0]?.length) {
        ctx.fillStyle = 'rgba(255,255,255,0.6)';
        ctx.font = '14px sans-serif';
        ctx.fillText('En attente de données de spectrogramme…', 20, height / 2);
        return;
      }

      const rows = spectrogramData.length;
      const cols = spectrogramData[0].length;
      const cellWidth = width / cols;
      const cellHeight = height / rows;

      const freqMin = frequencyAxis.length ? frequencyAxis[0] : 0;
      const freqMax = frequencyAxis.length ? frequencyAxis[frequencyAxis.length - 1] : 4000;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const intensity = (spectrogramData[r][c] ?? 0) / 255;
          const hue = 220 - intensity * 220;
          const lightness = 15 + intensity * 65;
          ctx.fillStyle = `hsl(${hue}, 85%, ${lightness}%)`;
          const y = height - (r + 1) * cellHeight;
          ctx.fillRect(c * cellWidth, y, cellWidth + 1, cellHeight + 1);
        }
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const targetFreq = i * 1000;
        const ratio = freqMax > freqMin ? (targetFreq - freqMin) / (freqMax - freqMin) : i / 4;
        const y = height - ratio * height;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '12px sans-serif';
      [0, 1000, 2000, 3000, 4000].forEach((freq) => {
        const ratio = freqMax > freqMin ? (freq - freqMin) / (freqMax - freqMin) : freq / 4000;
        const y = height - ratio * height - 6;
        ctx.fillText(`${freq / 1000} kHz`, 8, Math.max(12, Math.min(height - 6, y)));
      });

      if (freqMax > freqMin) {
        const lowBound = Math.max(0, Math.min(1000, freqMax));
        const highBound = Math.min(4000, freqMax);
        if (highBound > lowBound) {
          const startRatio = (lowBound - freqMin) / (freqMax - freqMin);
          const endRatio = (highBound - freqMin) / (freqMax - freqMin);
          const criticalStartY = height - endRatio * height;
          const criticalHeight = (endRatio - startRatio) * height;
          ctx.strokeStyle = 'rgba(211,47,47,0.6)';
          ctx.lineWidth = 2;
          ctx.strokeRect(0, criticalStartY, width, criticalHeight);
        }
      }
    };

    if (isRunning) {
      drawSpectrogram();
    }
  }, [isRunning, spectrogramData, frequencyAxis]);

  const togglePlayback = () => {
    setIsRunning(!isRunning);
  };

  return (
    <div className="space-y-6">
      {/* Contrôles */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <button
            onClick={togglePlayback}
            className={`flex items-center gap-2 px-4 py-2 rounded-sm transition-colors duration-300 ${
              isRunning ? 'bg-red-500 text-white hover:bg-red-600' : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isRunning ? 'Pause' : 'Démarrer'}
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-white/75">
            Dernière mise à jour: {lastUpdate.toLocaleTimeString('fr-FR')}
          </div>
          <button className="flex items-center gap-2 px-3 py-2 bg-dark-tertiary hover:bg-dark-quaternary rounded-sm text-white/95">
            <Download className="w-4 h-4" />
            Capture
          </button>
        </div>
      </div>

      {/* Métriques instantanées */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-dark-tertiary p-4 rounded-lg">
          <div className="text-xs text-white/55 mb-1">Statut Connexion</div>
          <div className="text-xl font-semibold text-white/95">{isRunning ? 'Connecté' : 'Déconnecté'}</div>
          <div className="text-xs text-white/75">WebSocket</div>
        </div>
        <div className="bg-dark-tertiary p-4 rounded-lg">
          <div className="text-xs text-white/55 mb-1">Données Reçues</div>
          <div className="text-xl font-semibold text-white/95">{waveformData.length}</div>
          <div className="text-xs text-white/75">Échantillons</div>
        </div>
        <div className="bg-dark-tertiary p-4 rounded-lg">
          <div className="text-xs text-white/55 mb-1">Fréquences</div>
          <div className="text-xl font-semibold text-white/95">{frequencyAxis.length}</div>
          <div className="text-xs text-white/75">Bins</div>
        </div>
        <div className="bg-dark-tertiary p-4 rounded-lg">
          <div className="text-xs text-white/55 mb-1">Dernière MAJ</div>
          <div className="text-xl font-semibold text-green-400">{lastUpdate.toLocaleTimeString('fr-FR')}</div>
          <div className="text-xs text-white/75">Temps réel</div>
        </div>
      </div>

      {/* Graphiques côte à côte */}
      <div className="flex gap-6">
        {/* Signal temporel */}
        <div className="flex-1 bg-dark-tertiary p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white/95 mb-4">Signal Temporel</h3>
          <canvas
            ref={canvasRef}
            width={800}
            height={300}
            className="w-full h-auto rounded-lg border border-gray-700"
            style={{ backgroundColor: '#0f1419' }}
          />
        </div>

        {/* Spectrogramme */}
        <div className="flex-1 bg-dark-tertiary p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-white/95 mb-4">Spectrogramme (0-4 kHz)</h3>
          <canvas
            ref={spectrogramRef}
            width={800}
            height={400}
            className="w-full h-auto rounded-lg border border-gray-700"
            style={{ backgroundColor: '#101428' }}
          />
          {timeAxis.length > 1 && (
            <p className="mt-2 text-xs text-white/60">
              Fenêtre analysée : {timeAxis[timeAxis.length - 1].toFixed(2)} s
            </p>
          )}
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="text-red-600">⚠ Zone critique (100-4000 Hz) :</span> couleurs chaudes (orange/rouge)
              indiquent une activité acoustique susceptible d'être liée à une fuite.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}