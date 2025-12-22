import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Pause, Camera, Circle, Settings, AlertTriangle, Bookmark, Download, Share, Plus } from 'lucide-react';
import Header from '../components/ui/Header';
import SignalChart from '../components/realtime/SignalChart';
import SpectrogramChart from '../components/realtime/SpectrogramChart';
import AIAnalysis from '../components/realtime/AIAnalysis';

export default function RealTimeAnalysis() {
  const { sensorId } = useParams();
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('30s');
  const [colorScheme, setColorScheme] = useState('viridis');
  const [notes, setNotes] = useState('');

  return (
    <div className="min-h-screen bg-dark-secondary">
      <Header />
      
      <div className="p-6">
        <section className="mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl mb-2 font-semibold text-white/95">Analyse Temps Réel - Capteur {sensorId}</h1>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium text-white/95">Alerte Critique Active</span>
                </div>
                <span className="text-sm text-white/75">Rue Victor Hugo - 47.2186°N, 6.4866°E</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-white/75">Connexion: Excellente (12ms)</span>
                </div>
              </div>
              <div className="text-sm flex items-center gap-4 text-white/55">
                <div className="flex items-center gap-2">
                  <span>Session démarrée: 14:32:18 - Durée: 00:23:41</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate(`/sensor/${sensorId}`)}
                className="hover:bg-dark-quaternary flex justify-center items-center gap-2 bg-dark-tertiary text-red-500 px-4 py-2 rounded-sm"
              >
                <X className="w-4 h-4" />
                <span className="text-sm font-semibold">Quitter Mode Analyse</span>
              </button>
            </div>
          </div>
        </section>

        <section className="mb-6">
          <div className="bg-dark-tertiary rounded-lg">
            <div className="flex justify-between items-center border-b border-white/8 p-4">
              <h2 className="text-lg font-semibold text-white/95">Signal Temporel en Temps Réel</h2>
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  {['30s', '60s', '120s'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setTimeRange(range)}
                      className={`text-xs font-medium rounded-sm px-3 py-1.5 ${
                        timeRange === range 
                          ? 'bg-aqua-primary text-black/85' 
                          : 'bg-dark-quaternary text-white/75 hover:opacity-80'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
                <button className="hover:text-aqua-primary text-sm flex items-center gap-2 text-aqua-secondary">
                  <Pause className="w-4 h-4" />
                  <span>Pause</span>
                </button>
                <button className="hover:text-aqua-primary text-sm flex items-center gap-2 text-aqua-secondary">
                  <Camera className="w-4 h-4" />
                  <span>Capture</span>
                </button>
                <button className="hover:text-aqua-primary text-sm flex items-center gap-2 text-aqua-secondary">
                  <Circle className="w-4 h-4" />
                  <span>Enregistrer</span>
                </button>
              </div>
            </div>
            <div className="p-4">
              <SignalChart />
            </div>
          </div>
        </section>

        <section className="mb-6">
          <div className="bg-dark-tertiary rounded-lg">
            <div className="flex justify-between items-center border-b border-white/8 p-4">
              <h2 className="text-lg font-semibold text-white/95">Spectrogramme Temps Réel</h2>
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  {['Viridis', 'Plasma', 'Jet'].map((scheme) => (
                    <button
                      key={scheme}
                      onClick={() => setColorScheme(scheme.toLowerCase())}
                      className={`text-xs font-medium rounded-sm px-3 py-1.5 ${
                        colorScheme === scheme.toLowerCase() 
                          ? 'bg-aqua-primary text-black/85' 
                          : 'bg-dark-quaternary text-white/75 hover:opacity-80'
                      }`}
                    >
                      {scheme}
                    </button>
                  ))}
                </div>
                <button className="hover:text-aqua-primary text-sm flex items-center gap-2 text-aqua-secondary">
                  <Settings className="w-4 h-4" />
                  <span>Réglages</span>
                </button>
              </div>
            </div>
            <div className="p-4">
              <SpectrogramChart />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-3 gap-6">
          <AIAnalysis />

          <div className="bg-dark-tertiary rounded-lg">
            <div className="border-b border-white/8 p-4">
              <h3 className="text-base font-semibold text-white/95">Métriques Instantanées</h3>
            </div>
            <div className="flex flex-col gap-4 p-4">
              <div className="grid grid-cols-1 gap-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/75">Niveau RMS</span>
                  <span className="text-sm font-medium text-white/95">-18.4 dB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/75">Niveau de crête</span>
                  <span className="text-sm font-medium text-white/95">-8.2 dB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/75">Fréq. dominante</span>
                  <span className="text-sm font-medium text-white/95">1125 Hz</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/75">Ratio S/N</span>
                  <span className="text-sm font-medium text-white/95">12.5 dB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/75">Taux refresh</span>
                  <span className="text-sm font-medium text-white/95">10 Hz</span>
                </div>
              </div>
              
              <div className="pt-4 border-t border-white/8">
                <div className="text-xs mb-3 text-white/55">Statistiques de Session</div>
                <div className="grid grid-cols-1 gap-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/75">Durée totale</span>
                    <span className="text-sm font-medium text-white/95">00:23:41</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/75">Anomalies détectées</span>
                    <span className="text-sm font-medium text-white/95">3</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/75">Dernière anomalie</span>
                    <span className="text-sm font-medium text-white/95">3 min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white/75">Qualité moyenne</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-white/95">Excellente</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-dark-tertiary rounded-lg">
            <div className="border-b border-white/8 p-4">
              <h3 className="text-base font-semibold text-white/95">Contrôles de Session</h3>
            </div>
            <div className="flex flex-col gap-4 p-4">
              <div className="grid grid-cols-1 gap-2">
                <button className="hover:bg-red-600 flex justify-center items-center gap-2 bg-red-500 text-white/95 px-3 py-2 rounded-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-semibold">Générer Alerte Manuelle</span>
                </button>
                <button className="hover:bg-dark-quaternary flex justify-center items-center gap-2 border border-white/8 bg-dark-tertiary text-white/95 px-3 py-2 rounded-sm">
                  <Bookmark className="w-4 h-4" />
                  <span className="text-sm font-semibold">Marquer Événement</span>
                </button>
                <button className="hover:bg-dark-quaternary flex justify-center items-center gap-2 border border-white/8 bg-dark-tertiary text-white/95 px-3 py-2 rounded-sm">
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-semibold">Exporter Session</span>
                </button>
                <button className="hover:text-aqua-primary text-sm flex justify-center items-center gap-2 text-aqua-secondary px-3 py-2">
                  <Share className="w-4 h-4" />
                  <span>Partager Vue</span>
                </button>
              </div>

              <div className="pt-4 border-t border-white/8">
                <div className="text-xs mb-2 text-white/55">Notes de Session</div>
                <textarea 
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="text-sm w-full h-20 p-2 border border-white/8 bg-dark-quaternary text-white/95 rounded-sm"
                  placeholder="Ajouter une note horodatée..."
                />
                <button className="hover:bg-dark-quaternary flex justify-center items-center gap-2 w-full mt-2 border border-white/8 bg-dark-tertiary text-white/95 px-3 py-1.5 rounded-sm">
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Ajouter Note</span>
                </button>
              </div>

              <div className="pt-4 border-t border-white/8">
                <div className="text-xs mb-2 text-white/55">Historique des Notes</div>
                <div className="max-h-24 overflow-y-auto">
                  <div className="text-xs mb-2">
                    <div className="mb-1 text-white/75">14:45:23</div>
                    <div className="text-white/95">Signal anormal confirmé - bruit métallique caractéristique</div>
                  </div>
                  <div className="text-xs">
                    <div className="mb-1 text-white/75">14:32:18</div>
                    <div className="text-white/95">Début session analyse suite alerte automatique</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}