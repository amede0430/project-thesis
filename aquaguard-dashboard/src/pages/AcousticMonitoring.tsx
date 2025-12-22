import AcousticSignalChart from '../components/charts/AcousticSignalChart';

export default function AcousticMonitoring() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Surveillance Acoustique</h1>
        <p className="text-gray-600 mt-2">
          Données en temps réel des capteurs acoustiques via ThingSpeak
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <AcousticSignalChart 
          autoRefresh={true}
          refreshInterval={15000}
          maxResults={40}
        />
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">À propos des données</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Acc X, Y, Z</strong> : Accélération sur les trois axes</li>
          <li>• <strong>Source</strong> : ThingSpeak Channel 3210058</li>
          <li>• <strong>Actualisation</strong> : Automatique toutes les 15 secondes</li>
          <li>• <strong>Échantillons</strong> : 40 dernières mesures</li>
        </ul>
      </div>
    </div>
  );
}
