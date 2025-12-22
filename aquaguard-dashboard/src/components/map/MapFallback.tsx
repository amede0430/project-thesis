interface Sensor {
  id: string;
  position: [number, number];
  status: string;
  location: string;
  sector: string;
}

interface MapFallbackProps {
  sensors: Sensor[];
}

export default function MapFallback({ sensors }: MapFallbackProps) {
  const statusColors = {
    normal: 'bg-green-500',
    attention: 'bg-yellow-500',
    alerte: 'bg-orange-500',
    critique: 'bg-red-500',
    offline: 'bg-gray-500'
  };

  return (
    <div className="w-full h-full bg-dark-quaternary rounded-sm p-6 flex flex-col">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-white/95 mb-2">
          Carte du Réseau - Cotonou, Bénin
        </h3>
        <p className="text-white/75 text-sm">
          Visualisation des capteurs en mode liste (carte en cours de chargement)
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 flex-1 overflow-y-auto">
        {sensors.map((sensor) => (
          <div key={sensor.id} className="bg-dark-tertiary p-4 rounded-lg border border-white/10">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-3 h-3 rounded-full ${statusColors[sensor.status as keyof typeof statusColors]}`}></div>
              <div className="font-semibold text-white/95">{sensor.id}</div>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="text-white/75">{sensor.location}</div>
              <div className="text-white/55">{sensor.sector}</div>
              <div className="text-white/55">
                Coordonnées: {sensor.position[0].toFixed(4)}°N, {sensor.position[1].toFixed(4)}°E
              </div>
              
              <div className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                sensor.status === 'critique' ? 'bg-red-500/20 text-red-300' :
                sensor.status === 'alerte' ? 'bg-orange-500/20 text-orange-300' :
                sensor.status === 'attention' ? 'bg-yellow-500/20 text-yellow-300' :
                sensor.status === 'offline' ? 'bg-gray-500/20 text-gray-300' :
                'bg-green-500/20 text-green-300'
              }`}>
                {sensor.status.toUpperCase()}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-4 text-center text-xs text-white/55">
        {sensors.length} capteurs • Dernière mise à jour: il y a 2 min
      </div>
    </div>
  );
}