import { LineChart, Line, ResponsiveContainer } from 'recharts';

const trendData = [
  { time: '14:50', value: 22 },
  { time: '14:51', value: 35 },
  { time: '14:52', value: 48 },
  { time: '14:53', value: 62 },
  { time: '14:54', value: 78 },
  { time: '14:55', value: 87 },
];

export default function AIAnalysis() {
  return (
    <div className="bg-dark-tertiary rounded-lg">
      <div className="border-b border-white/8 p-4">
        <h3 className="text-base font-semibold text-white/95">Analyse IA Temps Réel</h3>
      </div>
      <div className="flex flex-col gap-4 p-4">
        <div className="text-center">
          <div className="text-xs mb-1 text-white/55">Probabilité de Fuite</div>
          <div className="text-3xl font-bold text-white/95 mb-2">87%</div>
          <div className="w-full h-2 bg-dark-quaternary rounded-full">
            <div className="h-2 bg-red-500 rounded-full" style={{width: '87%'}}></div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/75">Type détecté</span>
            <span className="text-sm font-medium text-white/95">Fuite majeure</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/75">Confiance</span>
            <span className="text-sm font-medium text-white/95">91%</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-white/75">Fréq. suspectes</span>
            <span className="text-sm font-medium text-white/95">850-1200Hz</span>
          </div>
        </div>

        <div className="bg-dark-quaternary w-full h-16 rounded-sm">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#EF4444" 
                strokeWidth={2}
                dot={{ fill: '#EF4444', strokeWidth: 0, r: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div>
          <div className="text-xs mb-2 text-white/55">Événements de la session</div>
          <div>
            <div className="text-xs flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
              <span className="text-white/75">14:52:18 - Pic détecté (89%)</span>
            </div>
            <div className="text-xs flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-white/75">14:48:32 - Anomalie mineure</span>
            </div>
            <div className="text-xs flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-white/75">14:32:18 - Session démarrée</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}