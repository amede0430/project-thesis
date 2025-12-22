import { useState } from 'react';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

interface Sensor {
  id: string;
  position: [number, number];
  status: string;
  location: string;
  sector: string;
}

interface SVGMapProps {
  sensors: Sensor[];
}

export default function SVGMap({ sensors }: SVGMapProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [selectedSensor, setSelectedSensor] = useState<string | null>(null);

  // Conversion coordonnées géographiques vers SVG
  const coordsToSVG = (lat: number, lng: number) => {
    const x = ((lng - 2.3) * 2000) + 400;
    const y = ((6.4 - lat) * 2000) + 200;
    return { x, y };
  };

  const statusColors = {
    normal: '#10B981',
    attention: '#F59E0B',
    alerte: '#F97316',
    critique: '#EF4444',
    offline: '#6B7280'
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev * 1.5, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev / 1.5, 0.5));
  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full h-full bg-dark-quaternary rounded-sm overflow-hidden">
      {/* Contrôles */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 bg-dark-primary/95 border border-white/10 rounded text-white/75 hover:text-aqua-primary"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 bg-dark-primary/95 border border-white/10 rounded text-white/75 hover:text-aqua-primary"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={handleReset}
          className="p-2 bg-dark-primary/95 border border-white/10 rounded text-white/75 hover:text-aqua-primary"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Titre */}
      <div className="absolute top-4 left-4 z-10 bg-dark-primary/95 p-3 rounded border border-white/10">
        <h3 className="font-semibold text-white/95">Réseau AquaGuard - Cotonou</h3>
        <p className="text-xs text-white/75">{sensors.length} capteurs actifs</p>
      </div>

      {/* Carte SVG */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 600"
        className="cursor-move"
        style={{
          transform: `scale(${zoom}) translate(${pan.x}px, ${pan.y}px)`
        }}
      >
        {/* Fond de carte stylisé */}
        <defs>
          <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
            <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#374151" strokeWidth="0.5" opacity="0.3"/>
          </pattern>
        </defs>
        
        <rect width="100%" height="100%" fill="#1F2937" />
        <rect width="100%" height="100%" fill="url(#grid)" />
        
        {/* Zones de secteurs */}
        <g opacity="0.1">
          <rect x="50" y="50" width="300" height="200" fill="#2DD4BF" />
          <rect x="400" y="50" width="300" height="200" fill="#F59E0B" />
          <rect x="50" y="300" width="300" height="200" fill="#EF4444" />
          <rect x="400" y="300" width="300" height="200" fill="#10B981" />
        </g>

        {/* Réseau de canalisations */}
        <g stroke="#2DD4BF" strokeWidth="2" opacity="0.6" fill="none">
          <path d="M 400 300 L 200 150 L 600 150" strokeDasharray="5,5" />
          <path d="M 400 300 L 150 450 L 650 450" strokeDasharray="5,5" />
          <path d="M 400 300 L 400 100" strokeDasharray="5,5" />
          <path d="M 400 300 L 400 500" strokeDasharray="5,5" />
        </g>

        {/* Capteurs */}
        {sensors.map((sensor) => {
          const { x, y } = coordsToSVG(sensor.position[0], sensor.position[1]);
          const color = statusColors[sensor.status as keyof typeof statusColors];
          const isSelected = selectedSensor === sensor.id;
          const isCritical = sensor.status === 'critique';
          
          return (
            <g key={sensor.id}>
              {/* Zone d'alerte pour capteurs critiques */}
              {isCritical && (
                <circle
                  cx={x}
                  cy={y}
                  r="30"
                  fill={color}
                  opacity="0.1"
                  stroke={color}
                  strokeWidth="1"
                  strokeDasharray="3,3"
                />
              )}
              
              {/* Capteur */}
              <circle
                cx={x}
                cy={y}
                r={isCritical ? "8" : "6"}
                fill={color}
                stroke="white"
                strokeWidth="2"
                className="cursor-pointer hover:stroke-aqua-primary"
                onClick={() => setSelectedSensor(isSelected ? null : sensor.id)}
              >
                {isCritical && (
                  <animate
                    attributeName="r"
                    values="6;10;6"
                    dur="2s"
                    repeatCount="indefinite"
                  />
                )}
              </circle>
              
              {/* Label */}
              <text
                x={x}
                y={y - 15}
                textAnchor="middle"
                className="text-xs fill-white/75 pointer-events-none"
                fontSize="10"
              >
                {sensor.id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Popup d'information */}
      {selectedSensor && (
        <div className="absolute bottom-4 left-4 bg-dark-primary/95 p-4 rounded border border-white/10 max-w-xs z-10">
          {(() => {
            const sensor = sensors.find(s => s.id === selectedSensor);
            if (!sensor) return null;
            
            return (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: statusColors[sensor.status as keyof typeof statusColors] }}
                  />
                  <span className="font-semibold text-white/95">{sensor.id}</span>
                </div>
                <div className="text-sm text-white/75 mb-1">{sensor.location}</div>
                <div className="text-xs text-white/55 mb-2">{sensor.sector}</div>
                <div className="text-xs text-white/55">
                  {sensor.position[0].toFixed(4)}°N, {sensor.position[1].toFixed(4)}°E
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

      {/* Légende */}
      <div className="absolute bottom-4 right-4 bg-dark-primary/95 p-3 rounded border border-white/10 z-10">
        <div className="text-xs font-semibold text-white/95 mb-2">Statut des capteurs</div>
        <div className="space-y-1">
          {Object.entries(statusColors).map(([status, color]) => (
            <div key={status} className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-white/75 capitalize">{status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}