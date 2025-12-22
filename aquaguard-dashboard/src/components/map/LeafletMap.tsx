import { useEffect, useRef } from 'react';

interface Sensor {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  status: string;
  location: string;
  sector: string;
}

interface LeafletMapProps {
  sensors: Sensor[];
}

export default function LeafletMap({ sensors }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);

  const statusColors = {
    active: '#10B981',
    maintenance: '#F59E0B',
    error: '#F97316',
    inactive: '#EF4444',
    leak_detected: '#DC2626'
  };

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Ajouter le CSS Leaflet
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(link);
    }

    // Créer la carte Leaflet via CDN
    if (!(window as any).L) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      script.onload = initMap;
      document.head.appendChild(script);
    } else {
      initMap();
    }

    function initMap() {
      if (mapInstance.current) return;
      
      const L = (window as any).L;
      
      try {
        // Créer la carte
        mapInstance.current = L.map(mapRef.current).setView([8.0, 2.0], 7);
        
        // Ajouter les tuiles OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(mapInstance.current);
        
        updateMarkers();
      } catch (error) {
        console.error('Erreur initialisation carte:', error);
      }
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, []);

  // Mettre à jour les marqueurs quand les capteurs changent
  useEffect(() => {
    if (mapInstance.current && (window as any).L) {
      updateMarkers();
    }
  }, [sensors]);

  function updateMarkers() {
    if (!mapInstance.current || !(window as any).L || !sensors.length) return;
    
    try {
      const L = (window as any).L;
      
      // Supprimer tous les marqueurs existants
      mapInstance.current.eachLayer((layer: any) => {
        if (layer instanceof L.CircleMarker) {
          mapInstance.current.removeLayer(layer);
        }
      });
      
      // Ajouter les nouveaux marqueurs
      sensors.forEach(sensor => {
        if (!sensor.latitude || !sensor.longitude) return;
        
        const color = statusColors[sensor.status as keyof typeof statusColors] || '#6B7280';
        
        const marker = L.circleMarker([sensor.latitude, sensor.longitude], {
          radius: 8,
          fillColor: color,
          color: '#fff',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.8
        }).addTo(mapInstance.current);
        
        marker.bindPopup(`
          <div style="color: black;">
            <strong>${sensor.name}</strong><br>
            ${sensor.location}<br>
            Status: ${sensor.status}
          </div>
        `);
      });
    } catch (error) {
      console.error('Erreur mise à jour marqueurs:', error);
    }
  }

  return (
    <div className="relative w-full h-full">
      <div ref={mapRef} className="w-full h-full rounded-sm" />
      
      {/* Légende */}
      <div className="absolute bottom-4 right-4 bg-dark-primary/95 p-3 rounded border border-white/10 z-[1000]">
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

      {/* Info carte */}
      <div className="absolute top-4 left-4 bg-dark-primary/95 p-3 rounded border border-white/10 z-[1000]">
        <h3 className="font-semibold text-white/95 mb-1">Réseau AquaGuard</h3>
        <p className="text-xs text-white/75">Bénin</p>
        <p className="text-xs text-white/55">{sensors.length} capteurs</p>
      </div>
    </div>
  );
}