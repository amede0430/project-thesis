import { useState } from 'react';

interface SensorTabsProps {
  onTabChange: (tabId: string) => void;
}

export default function SensorTabs({ onTabChange }: SensorTabsProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Vue d\'Ensemble' },
    { id: 'alerts', label: 'Alertes Actives' },
    { id: 'history', label: 'Historique des Alertes' },
    { id: 'acoustic', label: 'Données Acoustiques' },
    { id: 'acoustic-history', label: 'Historique Acoustique' }
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    onTabChange(tabId);
  };

  return (
    <div className="flex gap-2 mb-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabClick(tab.id)}
          className={`px-4 py-2 text-sm font-medium rounded-sm whitespace-nowrap ${
            activeTab === tab.id
              ? 'bg-aqua-primary text-black/85'
              : 'bg-dark-tertiary text-white/75 hover:opacity-80'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}