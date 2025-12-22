/*
 * ⚠️ INTERFACE DÉSACTIVÉE ⚠️
 * 
 * Cette interface de gestion des capteurs n'est plus nécessaire
 * car le projet utilise maintenant un seul capteur fixe à Sakété.
 * 
 * Le code est conservé en commentaire pour référence future.
 * Pour réactiver, décommenter ce fichier et les routes dans App.tsx et Header.tsx
 */

import { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, MapPin, Settings, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/ui/Header';
import { apiService } from '../services/api';

export default function SensorsManagement() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [editingSensor, setEditingSensor] = useState<string | null>(null);
  const [sensors, setSensors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSensors = async () => {
      try {
        const data = await apiService.getSensors();
        setSensors(data);
      } catch (error) {
        console.error('Erreur lors du chargement des capteurs:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSensors();
  }, []);

  const filteredSensors = sensors.filter(sensor => 
    (searchTerm === '' || sensor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     sensor.location.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedSector === 'all' || sensor.sector === selectedSector) &&
    (selectedStatus === 'all' || sensor.status === selectedStatus)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-secondary">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-white/75">Chargement des capteurs...</div>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'inactive': return 'bg-red-500';
      case 'error': return 'bg-orange-500';
      case 'maintenance': return 'bg-yellow-500';
      case 'active': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'inactive': return 'Inactif';
      case 'error': return 'Erreur';
      case 'maintenance': return 'Maintenance';
      case 'active': return 'Actif';
      default: return 'Inconnu';
    }
  };

  return (
    <div className="min-h-screen bg-dark-secondary">
      <Header />
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-white/95">Gestion des Capteurs</h1>
          <div className="flex items-center gap-4">
            <button className="flex items-center gap-2 px-4 py-2 bg-aqua-primary hover:bg-aqua-secondary text-black/85 font-medium rounded-sm">
              <Plus className="w-4 h-4" />
              Ajouter Capteur
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-dark-tertiary hover:bg-dark-quaternary text-white/95 border border-white/10 rounded-sm">
              <Download className="w-4 h-4" />
              Exporter
            </button>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-dark-tertiary p-4 rounded-lg mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/55" />
              <input
                type="text"
                placeholder="Rechercher par ID ou localisation..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-dark-quaternary border border-white/10 rounded-sm text-white/95 focus:border-aqua-primary focus:outline-none"
              />
            </div>
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="px-3 py-2 bg-dark-quaternary border border-white/10 rounded-sm text-white/95 focus:border-aqua-primary focus:outline-none"
            >
              <option value="all">Tous les secteurs</option>
              <option value="Centre-ville">Centre-ville</option>
              <option value="Dantokpa">Dantokpa</option>
              <option value="Akpakpa">Akpakpa</option>
              <option value="Porto-Novo">Porto-Novo</option>
              <option value="Parakou">Parakou</option>
              <option value="Abomey">Abomey</option>
              <option value="Ouidah">Ouidah</option>
              <option value="Kandi">Kandi</option>
              <option value="Savè">Savè</option>
              <option value="Lokossa">Lokossa</option>
            </select>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 bg-dark-quaternary border border-white/10 rounded-sm text-white/95 focus:border-aqua-primary focus:outline-none"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="maintenance">Maintenance</option>
              <option value="error">Erreur</option>
              <option value="inactive">Inactif</option>
            </select>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-dark-tertiary p-4 rounded-lg text-center">
            <div className="text-2xl font-semibold text-white/95">{sensors.length}</div>
            <div className="text-sm text-white/75">Total Capteurs</div>
          </div>
          <div className="bg-dark-tertiary p-4 rounded-lg text-center">
            <div className="text-2xl font-semibold text-green-500">{sensors.filter(s => s.status === 'active').length}</div>
            <div className="text-sm text-white/75">Actifs</div>
          </div>
          <div className="bg-dark-tertiary p-4 rounded-lg text-center">
            <div className="text-2xl font-semibold text-yellow-500">{sensors.filter(s => s.status === 'maintenance').length}</div>
            <div className="text-sm text-white/75">Maintenance</div>
          </div>
          <div className="bg-dark-tertiary p-4 rounded-lg text-center">
            <div className="text-2xl font-semibold text-orange-500">{sensors.filter(s => s.status === 'error').length}</div>
            <div className="text-sm text-white/75">Erreurs</div>
          </div>
          <div className="bg-dark-tertiary p-4 rounded-lg text-center">
            <div className="text-2xl font-semibold text-red-500">{sensors.filter(s => s.status === 'inactive').length}</div>
            <div className="text-sm text-white/75">Inactifs</div>
          </div>
        </div>

        {/* Tableau des capteurs */}
        <div className="bg-dark-tertiary rounded-lg overflow-hidden">
          <div className="bg-dark-quaternary text-white/75 p-3 text-sm grid grid-cols-12 gap-3 font-medium">
            <div className="col-span-2">ID Capteur</div>
            <div className="col-span-3">Localisation</div>
            <div className="col-span-2">Secteur</div>
            <div className="col-span-1">Statut</div>
            <div className="col-span-2">Coordonnées</div>
            <div className="col-span-2">Actions</div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            {filteredSensors.map((sensor) => (
              <div key={sensor.id} className="hover:bg-dark-quaternary/50 grid grid-cols-12 items-center gap-3 p-3 border-b border-white/8 last:border-b-0">
                <div className="col-span-2">
                  <div className="font-medium text-white/95">{sensor.name}</div>
                </div>
                <div className="col-span-3">
                  <div className="text-white/95">{sensor.location}</div>
                </div>
                <div className="col-span-2">
                  <div className="text-white/75">{sensor.sector}</div>
                </div>
                <div className="col-span-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(sensor.status)}`}></div>
                    <span className="text-xs text-white/75">{getStatusText(sensor.status)}</span>
                  </div>
                </div>
                <div className="col-span-2">
                  <div className="text-xs text-white/55">
                    {sensor.latitude.toFixed(4)}°N<br />
                    {sensor.longitude.toFixed(4)}°E
                  </div>
                </div>
                <div className="col-span-2 flex gap-1">
                  <button
                    onClick={() => navigate(`/sensor/${sensor.id}`)}
                    className="p-1 bg-dark-quaternary hover:bg-aqua-primary/20 text-white/75 hover:text-aqua-primary rounded"
                    title="Voir détails"
                  >
                    <Settings className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingSensor(sensor.name)}
                    className="p-1 bg-dark-quaternary hover:bg-blue-500/20 text-white/75 hover:text-blue-400 rounded"
                    title="Modifier"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate('/network-map')}
                    className="p-1 bg-dark-quaternary hover:bg-green-500/20 text-white/75 hover:text-green-400 rounded"
                    title="Voir sur carte"
                  >
                    <MapPin className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1 bg-dark-quaternary hover:bg-red-500/20 text-white/75 hover:text-red-400 rounded"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 text-sm text-white/55 text-center">
          {filteredSensors.length} capteur(s) affiché(s) sur {sensors.length} total
        </div>
      </div>

      {/* Modal d'édition */}
      {editingSensor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-dark-tertiary p-6 rounded-lg w-full max-w-md">
            <h3 className="text-lg font-semibold text-white/95 mb-4">Modifier Capteur {editingSensor}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white/75 mb-1">Localisation</label>
                <input
                  type="text"
                  defaultValue={sensors.find(s => s.name === editingSensor)?.location}
                  className="w-full p-2 bg-dark-quaternary border border-white/10 rounded text-white/95 focus:border-aqua-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-white/75 mb-1">Secteur</label>
                <select className="w-full p-2 bg-dark-quaternary border border-white/10 rounded text-white/95 focus:border-aqua-primary focus:outline-none">
                  <option>Cotonou</option>
                  <option>Porto-Novo</option>
                  <option>Parakou</option>
                  <option>Abomey</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-white/75 mb-1">Statut</label>
                <select className="w-full p-2 bg-dark-quaternary border border-white/10 rounded text-white/95 focus:border-aqua-primary focus:outline-none">
                  <option>Actif</option>
                  <option>Maintenance</option>
                  <option>Erreur</option>
                  <option>Inactif</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditingSensor(null)}
                className="flex-1 px-4 py-2 bg-dark-quaternary hover:bg-dark-quaternary/80 text-white/95 rounded"
              >
                Annuler
              </button>
              <button
                onClick={() => setEditingSensor(null)}
                className="flex-1 px-4 py-2 bg-aqua-primary hover:bg-aqua-secondary text-black/85 font-medium rounded"
              >
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}