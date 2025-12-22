import type { KPI } from '../../types';

interface KPICardProps {
  kpi: KPI;
}

export default function KPICard({ kpi }: KPICardProps) {
  const getStatusColor = (status: KPI['status']) => {
    switch (status) {
      case 'normal': return 'bg-green-500';
      case 'warning': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="flex flex-col gap-3 p-4 bg-dark-tertiary rounded-lg">
      <div className="flex justify-between items-center">
        <span className="text-sm font-semibold text-white/95">{kpi.title}</span>
        <div className={`w-2 h-2 rounded-full ${getStatusColor(kpi.status)}`}></div>
      </div>
      <div className="flex flex-col gap-2">
        <div className="text-2xl font-semibold text-white/95">{kpi.value}</div>
        <div className="text-xs text-white/55">{kpi.change}</div>
      </div>
    </div>
  );
}