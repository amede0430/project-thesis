import { useEffect, useRef, useState } from 'react';

interface Sensor {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  location: string;
  sector: string;
}

interface OpenStreetMapProps {
  sensors: Sensor[];
}

export default function OpenStreetMap({ sensors }: OpenStreetMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);


  const statusColors = {
    active: '#10B981',
    maintenance: '#F59E0B',
    error: '#F97316',
    inactive: '#EF4444',
    leak_detected: '#DC2626'
  };

  useEffect(() => {
    if (!mapRef.current || sensors.length === 0) return;

    // Créer l'iframe avec OpenStreetMap
    const iframe = document.createElement('iframe');
    iframe.width = '100%';
    iframe.height = '100%';
    iframe.style.border = 'none';
    iframe.style.borderRadius = '4px';
    
    // Centrer sur le Bénin
    const centerLat = 8.0;
    const centerLng = 2.0;
    const bbox = `${centerLng-1.5},${centerLat-2},${centerLng+1.5},${centerLat+2}`;
    
    iframe.src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik`;
    
    mapRef.current.appendChild(iframe);

    return () => {
      if (mapRef.current) {
        mapRef.current.innerHTML = '';
      }
    };
  }, [sensors]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-sm" />
      
      {/* Overlay avec capteurs aux vraies coordonnées */}
      <div className="absolute inset-0 pointer-events-none">
        {sensors.map((sensor) => {
          // Convertir les coordonnées GPS en position sur la carte
          // Calcul simple pour la zone du Bénin
          const mapBounds = {
            minLat: 6.2, maxLat: 10.5,
            minLng: 0.8, maxLng: 3.8
          };
          
          const x = ((sensor.longitude - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
          const y = ((mapBounds.maxLat - sensor.latitude) / (mapBounds.maxLat - mapBounds.minLat)) * 100;
          
          return (
            <div
              key={sensor.id}
              className="absolute pointer-events-auto cursor-pointer"
              style={{ left: `${x}%`, top: `${y}%`, zIndex: 2, transform: 'translate(-50%, -50%)' }}
              onClick={() => setSelectedSensor(selectedSensor === sensor.id.toString() ? null : sensor.id.toString())}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 border-white shadow-lg ${
                  sensor.status === 'error' || sensor.status === 'inactive' || sensor.status === 'leak_detected' ? 'animate-pulse' : ''
                }`}
                style={{ backgroundColor: statusColors[sensor.status as keyof typeof statusColors] }}
              />
              <div className="text-xs text-white bg-black/80 px-1 rounded mt-1 whitespace-nowrap text-center font-medium">
                {sensor.name.split(' ')[1]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Popup d'information */}
      {selectedSensor && (
        <div className="absolute bottom-4 left-4 bg-dark-primary/95 p-4 rounded border border-white/10 max-w-xs z-10">
          {(() => {
            const sensor = sensors.find(s => s.id.toString() === selectedSensor);
            if (!sensor) return null;
            
            return (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: statusColors[sensor.status as keyof typeof statusColors] }}
                  />
                  <span className="font-semibold text-white/95">{sensor.name}</span>
                </div>
                <div className="text-sm text-white/75 mb-1">{sensor.location}</div>
                <div className="text-xs text-white/55 mb-2">{sensor.sector}</div>
                <div className="text-xs text-white/55 mb-2">
                  {sensor.latitude.toFixed(4)}°N, {sensor.longitude.toFixed(4)}°E
                </div>
                <div className={`text-xs px-2 py-1 rounded text-center font-medium ${
                  sensor.status === 'leak_detected' ? 'bg-red-600/30 text-red-200 animate-pulse' :
                  sensor.status === 'inactive' ? 'bg-red-500/20 text-red-300' :
                  sensor.status === 'error' ? 'bg-orange-500/20 text-orange-300' :
                  sensor.status === 'maintenance' ? 'bg-yellow-500/20 text-yellow-300' :
                  'bg-green-500/20 text-green-300'
                }`}>
                  {sensor.status.toUpperCase()}
                </div>
                <button
                  onClick={() => setSelectedSensor(null)}
                  className="mt-2 text-xs text-aqua-primary hover:text-aqua-secondary"
                >
                  Fermer
                </button>
              </>
            );
          })()}
        </div>
      )}

      {/* Info carte */}
      <div className="absolute top-4 left-4 bg-dark-primary/95 p-3 rounded border border-white/10 z-10">
        <h3 className="font-semibold text-white/95 mb-1">Réseau AquaGuard</h3>
        <p className="text-xs text-white/75">Cotonou, Bénin</p>
        <p className="text-xs text-white/55">{sensors.length} capteurs</p>
      </div>

      {/* Légende */}
      <div className="absolute bottom-4 right-4 bg-dark-primary/95 p-3 rounded border border-white/10 z-10">
        <div className="text-xs font-semibold text-white/95 mb-2">Statuts Capteurs</div>
        <div className="space-y-1">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-white/75 capitalize">{status.replace('_', ' ')}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Statistiques */}
      <div className="absolute top-4 right-4 bg-dark-primary/95 p-3 rounded border border-white/10 z-10">
        <div className="text-xs font-semibold text-white/95 mb-2">Alertes</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-center">
            <div className="text-red-400 font-bold">{sensors.filter(s => s.status === 'inactive').length}</div>
            <div className="text-white/75">Inactifs</div>
          </div>
          <div className="text-center">
            <div className="text-orange-400 font-bold">{sensors.filter(s => s.status === 'error').length}</div>
            <div className="text-white/75">Erreurs</div>
          </div>
        </div>
      </div>
    </div>
  );
}