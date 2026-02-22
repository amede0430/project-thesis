import { ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LeafletMap from '../map/LeafletMap';

interface NetworkMapProps {
  sensors: any[];
}

export default function NetworkMap({ sensors }: NetworkMapProps) {
  const navigate = useNavigate();
  
  return (
    <section>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Vue Carte du Réseau</h2>
        <button 
          onClick={() => navigate('/network-map')}
          className="hover:text-aqua-dark text-sm flex items-center gap-2 text-aqua-primary"
        >
          <span>Voir Carte Complète</span>
          <ExternalLink className="w-4 h-4" />
        </button>
      </div>
      
      <div className="bg-white h-80 p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="relative w-full h-full rounded-sm overflow-hidden">
          <LeafletMap sensors={sensors.slice(0, 8)} />
          
          {/* Legend */}
          <div className="absolute bottom-4 left-4 bg-white/95 p-2 rounded-sm text-xs z-[1000] shadow-md border border-gray-200">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-900">Actif</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-900">Maintenance</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              <span className="text-gray-900">Erreur</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-gray-900">Fuite/Inactif</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}