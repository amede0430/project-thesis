import { Droplets, LayoutDashboard, Map, FileText, Bell, ChevronDown, LogOut, Settings, Activity } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('aquaguard-token');
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="w-full bg-white border-b border-gray-200 p-4 shadow-sm">
      <nav className="flex justify-between items-center w-full">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="flex justify-center items-center w-8 h-8 bg-aqua-primary rounded-sm">
              <Droplets className="text-lg text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">AquaGuard</span>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => navigate('/dashboard')}
              className={`hover:text-aqua-dark text-sm flex items-center gap-2 font-medium ${
                isActive('/dashboard') ? 'text-aqua-primary' : 'text-gray-600'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
            <button 
              onClick={() => navigate('/network-map')}
              className={`hover:text-gray-900 text-sm flex items-center gap-2 ${
                isActive('/network-map') ? 'text-aqua-primary' : 'text-gray-600'
              }`}
            >
              <Map className="w-4 h-4" />
              <span>Carte du Réseau</span>
            </button>
            <button 
              onClick={() => navigate('/monitoring')}
              className={`hover:text-gray-900 text-sm flex items-center gap-2 ${
                isActive('/monitoring') ? 'text-aqua-primary' : 'text-gray-600'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Monitoring</span>
            </button>
            <button 
              onClick={() => navigate('/reports')}
              className={`hover:text-gray-900 text-sm flex items-center gap-2 ${
                isActive('/reports') ? 'text-aqua-primary' : 'text-gray-600'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Historique</span>
            </button>
            {/* Bouton Gestion Capteurs commenté - plus nécessaire avec un seul capteur fixe
            <button 
              onClick={() => navigate('/sensors')}
              className={`hover:text-gray-900 text-sm flex items-center gap-2 ${
                isActive('/sensors') ? 'text-aqua-primary' : 'text-gray-600'
              }`}
            >
              <Settings className="w-4 h-4" />
              <span>Gestion Capteurs</span>
            </button>
            */}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/alert/ALT-2024-11-28-0347')}
            className="flex relative justify-center items-center w-10 h-10 hover:bg-gray-100 rounded-sm"
          >
            <Bell className="w-5 h-5 text-gray-600" />
            <div className="flex absolute -top-1 -right-1 justify-center items-center w-5 h-5 bg-red-500 rounded-full">
              <span className="text-xs font-semibold text-white">3</span>
            </div>
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2"
            >
              <img 
                alt="Avatar of current user" 
                src="https://static.paraflowcontent.com/public/resource/image/17d12e1d-6dd0-4fc3-8840-00f6c8b27791.jpeg" 
                className="w-8 h-8 border border-gray-200 rounded-full"
              />
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>
            
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-sm shadow-lg z-50">
                <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Se déconnecter</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </header>
  );
}