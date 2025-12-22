import { CheckCircle, AlertTriangle, PlusCircle, Wrench, MapPin, XCircle } from 'lucide-react';
import type { Activity } from '../../types';

interface ActivityFeedProps {
  activities: Activity[];
}

export default function ActivityFeed({ activities }: ActivityFeedProps) {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'alert': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'new-sensor': return <PlusCircle className="w-4 h-4 text-aqua-primary" />;
      case 'maintenance': return <Wrench className="w-4 h-4 text-blue-500" />;
      case 'intervention': return <MapPin className="w-4 h-4 text-green-500" />;
      case 'false-alert': return <XCircle className="w-4 h-4 text-gray-500" />;
      default: return <CheckCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityBgColor = (type: Activity['type']) => {
    switch (type) {
      case 'resolved': return 'bg-green-500/15';
      case 'alert': return 'bg-red-500/15';
      case 'new-sensor': return 'bg-aqua-primary/15';
      case 'maintenance': return 'bg-blue-500/15';
      case 'intervention': return 'bg-green-500/15';
      case 'false-alert': return 'bg-gray-500/15';
      default: return 'bg-gray-500/15';
    }
  };

  return (
    <section>
      <h2 className="text-lg mb-4 font-semibold text-white/95">Activité Récente</h2>
      <div className="bg-dark-tertiary p-4 rounded-lg">
        <div>
          {activities.map((activity, index) => (
            <div key={activity.id} className={`flex gap-3 ${index < activities.length - 1 ? 'mb-4' : ''}`}>
              <div className={`flex shrink-0 justify-center items-center w-8 h-8 rounded-full ${getActivityBgColor(activity.type)}`}>
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1">
                <div className="text-sm text-white/95">{activity.title}</div>
                <div className="text-xs text-white/75">{activity.description}</div>
                <div className="text-xs text-white/55">{activity.timestamp}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}