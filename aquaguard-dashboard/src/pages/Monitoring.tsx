import { useState, useEffect, useRef } from 'react';
import { Activity, Zap, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import Header from '../components/ui/Header';
import { useWebSocket } from '../hooks/useWebSocket';
import AcousticSignalChart from '../components/charts/AcousticSignalChart';
import VibrationSignalChart from '../components/charts/VibrationSignalChart';
import VibrationSpectrogramChart from '../components/charts/VibrationSpectrogramChart';

export default function Monitoring() {
  const [signalData, setSignalData] = useState<number[]>([]);
  const [spectrogramData, setSpectrogramData] = useState<number[][]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [isConnected, setIsConnected] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const spectrogramRef = useRef<HTMLCanvasElement>(null);
  
  // WebSocket pour données temps réel
  const { lastMessage } = useWebSocket('ws://localhost:8000/ws/sensor/1');

  useEffect(() => {
    if (lastMessage) {
      try {
        // lastMessage is already an object, no need to parse
        const data = lastMessage as any;
        if (data.waveform) {
          setSignalData(data.waveform);
        }
        if (data.spectrogram) {
          setSpectrogramData(data.spectrogram);
        }
        if (data.analysis) {
          setAnalysisResult(data.analysis);
        }
        setIsConnected(true);
      } catch (error) {
        console.error('Erreur parsing WebSocket data:', error);
      }
    }
  }, [lastMessage]);

  // Dessiner le signal temporel
  useEffect(() => {
    if (signalData.length > 0 && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Nettoyer le canvas
      ctx.fillStyle = '#1a1a1a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Dessiner la grille
      ctx.strokeStyle = '#333';
      ctx.lineWidth = 1;
      for (let i = 0; i < 10; i++) {
        const y = (canvas.height / 10) * i;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Dessiner le signal
      ctx.strokeStyle = '#00d4aa';
      ctx.lineWidth = 2;
      ctx.beginPath();
      
      const stepX = canvas.width / signalData.length;
      const centerY = canvas.height / 2;
      const amplitude = canvas.height / 4;

      signalData.forEach((value, index) => {
        const x = index * stepX;
        const y = centerY - (value * amplitude);
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
    }
  }, [signalData]);

  // Dessiner le spectrogramme
  useEffect(() => {
    if (spectrogramData.length > 0 && spectrogramRef.current) {
      const canvas = spectrogramRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const imageData = ctx.createImageData(canvas.width, canvas.height);
      const data = imageData.data;

      const rows = spectrogramData.length;
      const cols = spectrogramData[0]?.length || 0;
      
      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const row = Math.floor((y / canvas.height) * rows);
          const col = Math.floor((x / canvas.width) * cols);
          
          const value = spectrogramData[row]?.[col] || 0;
          const intensity = Math.floor(value * 255);
          
          const pixelIndex = (y * canvas.width + x) * 4;
          data[pixelIndex] = intensity;     // R
          data[pixelIndex + 1] = intensity; // G
          data[pixelIndex + 2] = intensity; // B
          data[pixelIndex + 3] = 255;       // A
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
    }
  }, [spectrogramData]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'anomaly':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <Zap className="w-5 h-5 text-yellow-500" />;
      default:
        return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-dark-secondary font-inter">
      <Header />
      
      <div className="bg-dark-secondary flex w-full min-h-[856px]">
        <main className="flex-1 overflow-x-hidden flex flex-col p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-white/95">Monitoring Temps Réel</h1>
              <p className="text-sm text-white/65 mt-1">Capteur AQG-SAK-001 • Analyse acoustique en direct</p>
            </div>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-sm text-sm ${
                isConnected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                {isConnected ? 'Connecté' : 'Déconnecté'}
              </div>
              <div className="text-sm flex items-center gap-2 text-white/55">
                <Clock className="w-4 h-4" />
                <span>Temps réel</span>
              </div>
            </div>
          </div>

          {/* Signal Acoustique - Pleine largeur */}
          <div className="bg-dark-tertiary rounded-lg p-4 mb-6">
            <AcousticSignalChart 
              autoRefresh={true}
              refreshInterval={15000}
              maxResults={40}
              darkMode={true}
            />
          </div>

          {/* Grille 2 colonnes - Signal Vibratoire et Spectrogramme */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            {/* Signal Vibratoire */}
            <div className="bg-dark-tertiary rounded-lg p-4">
              <VibrationSignalChart
                autoRefresh={true}
                refreshInterval={15000}
                maxResults={40}
                darkMode={true}
              />
            </div>

            {/* Spectrogramme */}
            <div className="bg-dark-tertiary rounded-lg p-4">
              <VibrationSpectrogramChart
                autoRefresh={true}
                refreshInterval={15000}
                maxResults={200}
                darkMode={true}
              />
            </div>
          </div>

          {/* Résultat de l'analyse */}
          <div className="bg-dark-tertiary rounded-lg p-6">
            <h3 className="text-lg font-semibold text-white/95 mb-4">Résultat de l'Analyse IA</h3>
            
            {analysisResult ? (
              <div className="grid grid-cols-3 gap-6">
                {/* Statut principal */}
                <div className="bg-dark-quaternary rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    {getStatusIcon(analysisResult.status)}
                    <div>
                      <div className="text-sm font-semibold text-white/95">
                        {analysisResult.status === 'normal' ? 'Normal' : 
                         analysisResult.status === 'anomaly' ? 'Anomalie Détectée' : 
                         'Attention Requise'}
                      </div>
                      <div className="text-xs text-white/65">
                        Confiance: {Math.round((analysisResult.confidence || 0) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Métriques */}
                <div className="bg-dark-quaternary rounded-lg p-4">
                  <div className="text-sm font-semibold text-white/95 mb-3">Métriques</div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-white/65">RMS:</span>
                      <span className="text-white/95">{analysisResult.rms?.toFixed(3) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/65">Peak:</span>
                      <span className="text-white/95">{analysisResult.peak?.toFixed(3) || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/65">Fréquence:</span>
                      <span className="text-white/95">{analysisResult.frequency?.toFixed(1) || 'N/A'} Hz</span>
                    </div>
                  </div>
                </div>

                {/* Timestamp */}
                <div className="bg-dark-quaternary rounded-lg p-4">
                  <div className="text-sm font-semibold text-white/95 mb-3">Dernière Analyse</div>
                  <div className="text-xs text-white/65">
                    {analysisResult.timestamp ? 
                      new Date(analysisResult.timestamp).toLocaleString('fr-FR') : 
                      'En attente...'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-white/55">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <div>En attente des données d'analyse...</div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}