import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { RefreshCw, UserPlus, MapPin, ExternalLink, Check, Clock, Search, Wrench, CheckCircle, FileText, Download, Printer } from 'lucide-react';
import Header from '../components/ui/Header';

export default function AlertManagement() {
  useParams();
  const navigate = useNavigate();
  const [newNote, setNewNote] = useState('');

  const alert = {
    id: 'ALT-2024-11-28-0347',
    severity: 'critical',
    status: 'investigation',
    detectionDate: '28 novembre 2024, 03:47:23',
    duration: '4h 23min',
    sensor: 'AQ-N-047',
    location: 'Rue Victor Hugo',
    assignee: 'Amadou Diallo',
    confidence: 87,
    type: 'Fuite haute pression - Pattern acoustique caractéristique',
    frequencies: '450-750 Hz, 1200-1500 Hz',
    score: '8.3/10',
    dbLevel: '72.3 dB',
    dominantFreq: '680 Hz',
    snr: '15.2 dB'
  };

  const workflow = [
    { step: 'Détection', status: 'completed', time: '28 nov 2024, 03:47:23', user: 'Système IA' },
    { step: 'Assignation', status: 'completed', time: '28 nov 2024, 04:12:45', user: 'Elena Martinez → Amadou Diallo' },
    { step: 'Investigation en cours', status: 'current', time: '28 nov 2024, 05:30:12', user: 'Amadou Diallo' },
    { step: 'Confirmation/Rejet', status: 'pending', time: 'En attente', user: '' },
    { step: 'Intervention Terrain', status: 'pending', time: 'En attente', user: '' },
    { step: 'Résolution', status: 'pending', time: 'En attente', user: '' }
  ];

  const notes = [
    { user: 'Elena Martinez', time: 'il y a 3h', message: 'Alerte générée par détection IA - Pattern acoustique cohérent avec une fuite haute pression. Assignation à @amadou pour investigation terrain urgente.' },
    { user: 'Amadou Diallo', time: 'il y a 2h 30min', message: 'En route vers le site. ETA 15 minutes. Matériel d\'inspection emporté.' },
    { user: 'Amadou Diallo', time: 'il y a 2h', message: 'Sur site. Investigation en cours. Son de fuite confirmé auditivement près du raccordement principal. Creusement exploratoire nécessaire.' }
  ];

  return (
    <div className="min-h-screen bg-dark-secondary">
      <Header />
      
      <div className="p-6">
        <section className="mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl mb-2 font-semibold text-white/95">Alerte #{alert.id}</h1>
              <div className="flex items-center gap-4 mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="text-sm font-medium bg-red-500/15 text-white/95 px-2 py-1 rounded-sm">Critique</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm font-medium bg-yellow-500/15 text-white/95 px-2 py-1 rounded-sm">En Investigation</span>
                </div>
              </div>
              <div className="text-sm grid grid-cols-2 gap-6">
                <div>
                  <div className="text-xs mb-1 text-white/55">Date de détection</div>
                  <div className="text-white/95">{alert.detectionDate}</div>
                </div>
                <div>
                  <div className="text-xs mb-1 text-white/55">Durée depuis détection</div>
                  <div className="font-semibold text-white/95">{alert.duration}</div>
                </div>
                <div>
                  <div className="text-xs mb-1 text-white/55">Capteur concerné</div>
                  <div className="text-white/95">
                    <button 
                      onClick={() => navigate(`/sensor/${alert.sensor}`)}
                      className="hover:text-aqua-primary text-aqua-secondary"
                    >
                      {alert.sensor}
                    </button> - {alert.location}
                  </div>
                </div>
                <div>
                  <div className="text-xs mb-1 text-white/55">Opérateur assigné</div>
                  <div className="flex items-center gap-2">
                    <img 
                      alt="Avatar Amadou Diallo" 
                      src="https://static.paraflowcontent.com/public/resource/image/ac8ff240-ff4b-4281-badb-47c79888b1d9.jpeg" 
                      className="w-6 h-6 border border-white/8 rounded-full"
                    />
                    <span className="text-white/95">{alert.assignee}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button className="hover:bg-dark-quaternary flex justify-center items-center gap-2 bg-dark-tertiary text-white/95 px-4 py-2 rounded-md">
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm font-semibold">Changer de Statut</span>
              </button>
              <button className="hover:bg-dark-quaternary flex justify-center items-center gap-2 bg-dark-tertiary text-white/95 px-4 py-2 rounded-md">
                <UserPlus className="w-4 h-4" />
                <span className="text-sm font-semibold">Réassigner</span>
              </button>
              <button 
                onClick={() => navigate('/network-map')}
                className="hover:bg-aqua-secondary flex justify-center items-center gap-2 bg-aqua-primary text-black/85 px-4 py-2 rounded-md"
              >
                <MapPin className="w-4 h-4" />
                <span className="text-sm font-semibold">Voir Capteur sur Carte</span>
              </button>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 flex flex-col gap-8">
            <section>
              <h2 className="text-lg mb-4 font-semibold text-white/95">Détails de Détection IA</h2>
              <div className="bg-dark-tertiary p-6 rounded-lg">
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div>
                    <div className="text-xs mb-1 text-white/55">Type d'anomalie détectée</div>
                    <div className="text-sm font-medium text-white/95">{alert.type}</div>
                  </div>
                  <div>
                    <div className="text-xs mb-1 text-white/55">Niveau de confiance</div>
                    <div className="text-sm font-medium text-white/95">{alert.confidence}%</div>
                  </div>
                  <div>
                    <div className="text-xs mb-1 text-white/55">Fréquences caractéristiques</div>
                    <div className="text-sm text-white/95">{alert.frequencies}</div>
                  </div>
                  <div>
                    <div className="text-xs mb-1 text-white/55">Score de probabilité de fuite</div>
                    <div className="text-sm font-medium text-white/95">{alert.score}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-base mb-3 font-semibold text-white/95">Snapshot Acoustique au Moment de Détection</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-dark-quaternary p-4 rounded-lg">
                      <div className="text-sm mb-2 text-white/75">Signal Temporel (60s)</div>
                      <div className="w-full h-32 bg-dark-primary rounded-sm flex items-center justify-center">
                        <span className="text-white/55 text-xs">Graphique signal temporel</span>
                      </div>
                    </div>
                    <div className="bg-dark-quaternary p-4 rounded-lg">
                      <div className="text-sm mb-2 text-white/75">Spectrogramme</div>
                      <img 
                        alt="Spectrogramme de détection" 
                        src="https://static.paraflowcontent.com/public/resource/image/c3c9f5ec-5867-43bd-ae68-15ecce2237d6.jpeg" 
                        className="w-full h-32 object-cover rounded-sm"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-sm grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-xs mb-1 text-white/55">Niveau dB</div>
                    <div className="font-semibold text-white/95">{alert.dbLevel}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs mb-1 text-white/55">Fréquence dominante</div>
                    <div className="font-semibold text-white/95">{alert.dominantFreq}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs mb-1 text-white/55">SNR</div>
                    <div className="font-semibold text-white/95">{alert.snr}</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-white/8">
                  <button 
                    onClick={() => navigate(`/sensor/${alert.sensor}/real-time-analysis`)}
                    className="hover:text-aqua-primary text-sm flex items-center gap-2 text-aqua-secondary"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Voir Données Complètes en Analyse Temps Réel</span>
                  </button>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg mb-4 font-semibold text-white/95">Workflow de l'Alerte</h2>
              <div className="bg-dark-tertiary p-6 rounded-lg">
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-white/75">Progression</span>
                    <span className="text-sm font-medium text-white/95">Étape 3/6</span>
                  </div>
                  <div className="h-2 bg-dark-quaternary rounded-full">
                    <div className="h-2 bg-aqua-primary rounded-full" style={{width: '50%'}}></div>
                  </div>
                </div>

                <div>
                  {workflow.map((step, index) => (
                    <div key={index} className="flex items-start gap-4 mb-4 last:mb-0">
                      <div className={`flex justify-center items-center w-8 h-8 rounded-full ${
                        step.status === 'completed' ? 'bg-green-500' :
                        step.status === 'current' ? 'bg-yellow-500' :
                        'bg-dark-quaternary border border-white/12'
                      }`}>
                        {step.status === 'completed' ? <Check className="w-4 h-4 text-white" /> :
                         step.status === 'current' ? <Clock className="w-4 h-4 text-white" /> :
                         step.step === 'Confirmation/Rejet' ? <Search className="w-4 h-4 text-white/55" /> :
                         step.step === 'Intervention Terrain' ? <Wrench className="w-4 h-4 text-white/55" /> :
                         <CheckCircle className="w-4 h-4 text-white/55" />}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${step.status === 'pending' ? 'text-white/55' : 'text-white/95'}`}>
                          {step.step}
                        </div>
                        <div className={`text-xs ${step.status === 'pending' ? 'text-white/35' : 'text-white/55'}`}>
                          {step.time}{step.user && ` - ${step.user}`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg mb-4 font-semibold text-white/95">Collaboration et Notes</h2>
              <div className="bg-dark-tertiary p-6 rounded-lg">
                <div className="mb-6">
                  {notes.map((note, index) => (
                    <div key={index} className="flex gap-3 mb-4 last:mb-0">
                      <img 
                        alt={`Avatar ${note.user}`}
                        src={`https://static.paraflowcontent.com/public/resource/image/${index === 0 ? '1b2bcf32-2cf1-44c0-b33b-eff5652e0b8b' : '714e4205-6991-4764-aebf-21665944699b'}.jpeg`}
                        className="w-8 h-8 border border-white/8 rounded-full"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white/95">{note.user}</span>
                          <span className="text-xs text-white/55">{note.time}</span>
                        </div>
                        <div className="text-sm text-white/75">{note.message}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/8">
                  <textarea 
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                    className="focus:border-aqua-primary focus:outline-none text-sm w-full border border-white/8 bg-dark-quaternary text-white/95 p-3 rounded-md"
                    placeholder="Ajouter une note ou mentionner un collègue avec @..."
                    rows={3}
                  />
                  <div className="flex justify-end mt-3">
                    <button className="hover:bg-aqua-secondary flex justify-center items-center gap-2 bg-aqua-primary text-black/85 px-4 py-2 rounded-md">
                      <span className="text-sm font-semibold">Ajouter Note</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <div className="flex flex-col gap-8">
            <section>
              <h2 className="text-lg mb-4 font-semibold text-white/95">Panneau d'Actions</h2>
              <div className="bg-dark-tertiary p-6 rounded-lg">
                <div className="mb-6">
                  <h3 className="text-sm mb-3 font-medium text-white/95">Changement de Statut</h3>
                  <div className="flex items-center gap-2 mb-3 border border-white/8 bg-dark-quaternary px-3 py-2 rounded-md">
                    <span className="flex-1 text-sm text-white/95">Sélectionner nouveau statut</span>
                    <div className="bg-transparent flex justify-center items-center w-4 h-4">
                      <svg className="w-4 h-4 text-white/75" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                  <textarea 
                    className="text-sm w-full mb-3 border border-white/8 bg-dark-quaternary text-white/95 p-3 rounded-md"
                    placeholder="Commentaire obligatoire justifiant le changement..."
                    rows={2}
                  />
                  <button className="hover:bg-aqua-secondary flex justify-center items-center gap-2 w-full bg-aqua-primary text-black/85 px-4 py-2 rounded-md">
                    <span className="text-sm font-semibold">Mettre à Jour Statut</span>
                  </button>
                </div>

                <div className="mb-6 pt-6 border-t border-white/8">
                  <h3 className="text-sm mb-3 font-medium text-white/95">Export et Rapports</h3>
                  <div className="space-y-3">
                    <button className="hover:bg-dark-quaternary flex justify-center items-center gap-2 w-full border border-white/8 bg-dark-tertiary text-white/95 px-4 py-2 rounded-md">
                      <FileText className="w-4 h-4" />
                      <span className="text-sm font-semibold">Générer Rapport d'Alerte (PDF)</span>
                    </button>
                    <button className="hover:bg-dark-quaternary flex justify-center items-center gap-2 w-full border border-white/8 bg-dark-tertiary text-white/95 px-4 py-2 rounded-md">
                      <Download className="w-4 h-4" />
                      <span className="text-sm font-semibold">Exporter Timeline (CSV)</span>
                    </button>
                    <button className="hover:bg-dark-quaternary flex justify-center items-center gap-2 w-full border border-white/8 bg-dark-tertiary text-white/95 px-4 py-2 rounded-md">
                      <Printer className="w-4 h-4" />
                      <span className="text-sm font-semibold">Imprimer Fiche d'Intervention</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-lg mb-4 font-semibold text-white/95">Alertes Similaires Récentes</h2>
              <div className="bg-dark-tertiary p-6 rounded-lg">
                <div className="space-y-4">
                  {[
                    { id: '#ALT-2024-11-25-0123', sensor: 'AQ-N-048', distance: '150m', status: 'resolved' },
                    { id: '#ALT-2024-11-22-0456', sensor: 'AQ-N-049', distance: '180m', status: 'false' },
                    { id: '#ALT-2024-11-20-0789', sensor: 'AQ-N-046', distance: '120m', status: 'resolved' }
                  ].map((item, index) => (
                    <div key={index} className="flex justify-between items-center bg-dark-quaternary p-3 rounded-md">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          item.status === 'resolved' ? 'bg-green-500' : 
                          item.status === 'false' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <div className="text-sm font-medium text-white/95">{item.id}</div>
                          <div className="text-xs text-white/55">{item.sensor} - {item.distance} - {
                            item.status === 'resolved' ? 'Résolu' :
                            item.status === 'false' ? 'Fausse alerte' : 'En cours'
                          }</div>
                        </div>
                      </div>
                      <button className="hover:text-aqua-primary text-xs text-aqua-secondary">Voir</button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}