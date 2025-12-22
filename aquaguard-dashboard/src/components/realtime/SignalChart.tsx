import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from 'recharts';

const data = [
  { time: '14:55:30', value: -12 },
  { time: '14:55:31', value: -8 },
  { time: '14:55:32', value: 15 },
  { time: '14:55:33', value: 22 },
  { time: '14:55:34', value: 18 },
  { time: '14:55:35', value: -5 },
  { time: '14:55:36', value: -18 },
  { time: '14:55:37', value: -25 },
  { time: '14:55:38', value: 8 },
  { time: '14:55:39', value: 28 },
  { time: '14:55:40', value: 35 },
  { time: '14:55:41', value: 18 },
  { time: '14:55:42', value: -12 },
  { time: '14:55:43', value: -22 },
  { time: '14:55:44', value: -8 },
  { time: '14:55:45', value: 12 },
  { time: '14:55:46', value: 25 },
  { time: '14:55:47', value: 32 },
  { time: '14:55:48', value: 15 },
  { time: '14:55:49', value: -8 },
  { time: '14:55:50', value: -25 },
];

export default function SignalChart() {
  return (
    <div className="bg-dark-quaternary w-full h-64 rounded-sm p-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
          <XAxis 
            dataKey="time" 
            axisLine={{ stroke: '#64748B' }}
            tick={{ fill: '#94A3B8', fontSize: 11 }}
          />
          <YAxis 
            domain={[-50, 50]}
            axisLine={{ stroke: '#64748B' }}
            tick={{ fill: '#94A3B8', fontSize: 11 }}
            tickFormatter={(value) => `${value} dB`}
          />
          <ReferenceLine y={30} stroke="#F59E0B" strokeDasharray="5 5" />
          <ReferenceLine y={-30} stroke="#F59E0B" strokeDasharray="5 5" />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#2DD4BF" 
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}