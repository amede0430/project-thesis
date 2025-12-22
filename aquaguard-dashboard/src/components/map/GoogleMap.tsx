import { useEffect, useRef } from 'react';

interface Sensor {
  id: string;
  position: [number, number];
  status: string;
  location: string;
  sector: string;
}

interface GoogleMapProps {
  sensors: Sensor[];
}

declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
}

export default function GoogleMap({ sensors }: GoogleMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);


  const statusColors = {
    normal: '#10B981',
    attention: '#F59E0B',
    alerte: '#F97316',
    critique: '#EF4444',
    offline: '#6B7280'
  };

  useEffect(() => {
    // Charger Google Maps API
    if (!window.google) {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dO_BcqCGUOdAZE&libraries=geometry`;
      script.async = true;
      script.defer = true;
      
      window.initMap = () => {
        initializeMap();
      };
      
      script.onload = () => {
        initializeMap();
      };
      
      document.head.appendChild(script);
    } else {
      initializeMap();
    }
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !window.google) return;

    // Centre sur Cotonou, Bénin
    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat: 6.3578, lng: 2.3956 },
      zoom: 13,
      styles: [
        {
          "elementType": "geometry",
          "stylers": [{ "color": "#1f2937" }]
        },
        {
          "elementType": "labels.text.stroke",
          "stylers": [{ "color": "#1f2937" }]
        },
        {
          "elementType": "labels.text.fill",
          "stylers": [{ "color": "#9ca3af" }]
        },
        {
          "featureType": "water",
          "elementType": "geometry",
          "stylers": [{ "color": "#2dd4bf" }, { "lightness": -25 }]
        },
        {
          "featureType": "road",
          "elementType": "geometry",
          "stylers": [{ "color": "#374151" }]
        }
      ]
    });

    // setMap(mapInstance);

    // Ajouter les capteurs
    sensors.forEach(sensor => {
      const marker = new window.google.maps.Marker({
        position: { lat: sensor.position[0], lng: sensor.position[1] },
        map: mapInstance,
        title: sensor.id,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: sensor.status === 'critique' ? 12 : 8,
          fillColor: statusColors[sensor.status as keyof typeof statusColors],
          fillOpacity: 1,
          strokeColor: '#ffffff',
          strokeWeight: 2
        }
      });

      // Zone d'alerte pour capteurs critiques
      if (sensor.status === 'critique') {
        new window.google.maps.Circle({
          strokeColor: statusColors.critique,
          strokeOpacity: 0.3,
          strokeWeight: 1,
          fillColor: statusColors.critique,
          fillOpacity: 0.1,
          map: mapInstance,
          center: { lat: sensor.position[0], lng: sensor.position[1] },
          radius: 200
        });
      }

      // InfoWindow
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="color: #1f2937; padding: 8px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${statusColors[sensor.status as keyof typeof statusColors]};"></div>
              <strong>${sensor.id}</strong>
            </div>
            <div style="margin-bottom: 4px;">${sensor.location}</div>
            <div style="color: #6b7280; font-size: 12px; margin-bottom: 4px;">${sensor.sector}</div>
            <div style="color: #6b7280; font-size: 12px;">
              ${sensor.position[0].toFixed(4)}°N, ${sensor.position[1].toFixed(4)}°E
            </div>
            <div style="margin-top: 8px; padding: 4px 8px; border-radius: 4px; font-size: 11px; text-align: center; color: white; background-color: ${statusColors[sensor.status as keyof typeof statusColors]};">
              ${sensor.status.toUpperCase()}
            </div>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(mapInstance, marker);
        // setSelectedSensor(sensor.id);
      });
    });
  };

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-sm" />
      
      {/* Contrôles personnalisés */}
      <div className="absolute top-4 left-4 bg-dark-primary/95 p-3 rounded border border-white/10 z-10">
        <h3 className="font-semibold text-white/95 mb-1">Réseau AquaGuard</h3>
        <p className="text-xs text-white/75">Cotonou, Bénin</p>
        <p className="text-xs text-white/55">{sensors.length} capteurs</p>
      </div>

      {/* Légende */}
      <div className="absolute bottom-4 right-4 bg-dark-primary/95 p-3 rounded border border-white/10 z-10">
        <div className="text-xs font-semibold text-white/95 mb-2">Statut</div>
        <div className="space-y-1">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-white/75 capitalize">{status}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Statistiques */}
      <div className="absolute bottom-4 left-4 bg-dark-primary/95 p-3 rounded border border-white/10 z-10">
        <div className="text-xs font-semibold text-white/95 mb-2">Alertes</div>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="text-center">
            <div className="text-red-400 font-bold">{sensors.filter(s => s.status === 'critique').length}</div>
            <div className="text-white/75">Critiques</div>
          </div>
          <div className="text-center">
            <div className="text-orange-400 font-bold">{sensors.filter(s => s.status === 'alerte').length}</div>
            <div className="text-white/75">Alertes</div>
          </div>
        </div>
      </div>
    </div>
  );
}