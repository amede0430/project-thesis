interface SensorInfoProps {
  sensor: any;
}

export default function SensorInfo({ sensor }: SensorInfoProps) {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="flex flex-col gap-6">
        <section>
          <h2 className="text-lg mb-4 font-semibold text-white/95">Informations Techniques du Capteur</h2>
          <div className="bg-dark-tertiary p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs mb-1 text-white/55">Modèle</div>
                <div className="text-sm text-white/95">{sensor.model}</div>
              </div>
              <div>
                <div className="text-xs mb-1 text-white/55">Numéro de série</div>
                <div className="text-sm text-white/95">{sensor.serial_number || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs mb-1 text-white/55">Date d'installation</div>
                <div className="text-sm text-white/95">{sensor.installation_date ? new Date(sensor.installation_date).toLocaleDateString('fr-FR') : 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs mb-1 text-white/55">Dernière maintenance</div>
                <div className="text-sm text-white/95">{sensor.last_maintenance ? new Date(sensor.last_maintenance).toLocaleDateString('fr-FR') : 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs mb-1 text-white/55">Type de réseau</div>
                <div className="text-sm text-white/95">{sensor.network_type || 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs mb-1 text-white/55">Profondeur d'installation</div>
                <div className="text-sm text-white/95">{sensor.installation_depth ? `${sensor.installation_depth}m` : 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs mb-1 text-white/55">Diamètre canalisation</div>
                <div className="text-sm text-white/95">{sensor.pipe_diameter ? `${sensor.pipe_diameter}mm` : 'N/A'}</div>
              </div>
              <div>
                <div className="text-xs mb-1 text-white/55">Matériau</div>
                <div className="text-sm text-white/95">{sensor.pipe_material || 'N/A'}</div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg mb-4 font-semibold text-white/95">Statut de Connexion</h2>
          <div className="bg-dark-tertiary p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex justify-between items-center">
                <div className="text-sm text-white/75">Force du signal IoT</div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-dark-quaternary rounded-full">
                    <div className={`h-2 rounded-full bg-green-500`} style={{width: `${sensor.signal_strength || 0}%`}}></div>
                  </div>
                  <span className="text-sm font-medium text-white/95">-72 dBm</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-white/75">Qualité transmission</div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-white/95 capitalize">Excellente</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-white/75">Niveau de batterie</div>
                <div className="flex items-center gap-2">
                  <div className="w-16 h-2 bg-dark-quaternary rounded-full">
                    <div className={`h-2 rounded-full bg-green-500`} style={{width: `${sensor.battery_level || 0}%`}}></div>
                  </div>
                  <span className="text-sm font-medium text-white/95">{sensor.battery_level || 0}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="text-sm text-white/75">Dernière communication</div>
                <span className="text-sm font-medium text-white/95">{sensor.last_communication ? new Date(sensor.last_communication).toLocaleString('fr-FR') : 'N/A'}</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg mb-4 font-semibold text-white/95">Statistiques Rapides (7 derniers jours)</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-dark-tertiary p-4 rounded-lg">
              <div className="text-xs mb-1 text-white/55">Alertes générées</div>
              <div className="text-2xl mb-1 font-semibold text-white/95">3</div>
              <div className="text-xs text-white/75">+3 vs semaine précédente</div>
            </div>
            <div className="bg-dark-tertiary p-4 rounded-lg">
              <div className="text-xs mb-1 text-white/55">Temps moyen entre alertes</div>
              <div className="text-2xl mb-1 font-semibold text-white/95">12h</div>
              <div className="text-xs text-white/75">-2h vs semaine précédente</div>
            </div>
            <div className="bg-dark-tertiary p-4 rounded-lg">
              <div className="text-xs mb-1 text-white/55">Taux de fausses alarmes</div>
              <div className="text-2xl mb-1 font-semibold text-white/95">15%</div>
              <div className="text-xs text-white/75">-5% vs semaine précédente</div>
            </div>
            <div className="bg-dark-tertiary p-4 rounded-lg">
              <div className="text-xs mb-1 text-white/55">Taux de disponibilité</div>
              <div className="text-2xl mb-1 font-semibold text-white/95">98.5%</div>
              <div className="text-xs text-white/75">+0.3% vs semaine précédente</div>
            </div>
          </div>
        </section>
      </div>

      <div>
        <section>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white/95">Carte Miniature de Localisation</h2>
            <button className="hover:text-aqua-primary text-sm flex items-center gap-2 text-aqua-secondary">
              <span>Agrandir</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </button>
          </div>
          <div className="bg-dark-tertiary h-80 p-4 rounded-lg">
            <div className="relative w-full h-full rounded-sm overflow-hidden">
              <iframe 
                width="100%" 
                height="100%" 
                style={{ border: 'none', borderRadius: '4px' }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${sensor.longitude-0.01},${sensor.latitude-0.01},${sensor.longitude+0.01},${sensor.latitude+0.01}&layer=mapnik&marker=${sensor.latitude},${sensor.longitude}`}
                title="Localisation du capteur"
              />
              
              {/* Overlay avec capteurs voisins */}
              <div className="absolute inset-0 pointer-events-none">
                {/* Capteur principal */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-red-500 border-2 border-white rounded-full shadow-lg flex justify-center items-center animate-pulse">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                
                {/* Capteurs voisins */}
                <div className="absolute top-1/4 left-1/3 w-3 h-3 bg-green-500 border border-white rounded-full"></div>
                <div className="absolute bottom-1/3 right-1/4 w-3 h-3 bg-yellow-500 border border-white rounded-full"></div>
                <div className="absolute top-2/3 left-1/4 w-3 h-3 bg-green-500 border border-white rounded-full"></div>
                <div className="absolute top-1/3 right-1/3 w-3 h-3 bg-yellow-500 border border-white rounded-full"></div>
                <div className="absolute bottom-1/4 left-2/3 w-3 h-3 bg-green-500 border border-white rounded-full"></div>
              </div>

              {/* Légende */}
              <div className="absolute bottom-4 left-4 bg-dark-primary/90 p-2 rounded-sm text-xs z-10">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-white/95">Normal</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-white/95">Attention</span>
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span className="text-white/95">Alerte</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-white/95">Critique</span>
                </div>
              </div>

              {/* Info zone */}
              <div className="absolute top-4 right-4 bg-dark-primary/90 p-2 rounded-sm text-xs">
                <div className="font-medium text-white/95">Avenue Steinmetz</div>
                <div className="text-white/75">Cotonou, Bénin</div>
                <div className="text-white/55 mt-1">6 capteurs voisins</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}