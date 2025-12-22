import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplets, Eye, EyeOff } from 'lucide-react';
import { apiService } from '../services/api';

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiService.login(credentials);
      localStorage.setItem('aquaguard-token', response.access_token);
      navigate('/dashboard');
    } catch (error) {
      alert('Erreur de connexion: ' + (error as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-dark-secondary flex items-center justify-center p-4">
      <div className="bg-dark-tertiary p-8 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="flex justify-center items-center w-10 h-10 bg-aqua-primary rounded-sm">
            <Droplets className="text-xl text-black/85" />
          </div>
          <h1 className="text-2xl font-semibold text-white/95">AquaGuard</h1>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white/75 mb-2">
              Nom d'utilisateur
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({...credentials, username: e.target.value})}
              className="w-full p-3 bg-dark-quaternary border border-white/10 rounded-sm text-white/95 focus:border-aqua-primary focus:outline-none"
              placeholder="Entrez votre nom d'utilisateur"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/75 mb-2">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="w-full p-3 bg-dark-quaternary border border-white/10 rounded-sm text-white/95 focus:border-aqua-primary focus:outline-none pr-10"
                placeholder="Entrez votre mot de passe"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/55 hover:text-white/75"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-aqua-primary hover:bg-aqua-secondary text-black/85 font-medium py-3 rounded-sm transition-colors"
          >
            Se connecter
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-white/55">
          Plateforme de monitoring des réseaux d'eau
        </div>
      </div>
    </div>
  );
}