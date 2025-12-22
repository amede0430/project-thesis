import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import NetworkMapPage from './pages/NetworkMap';
import HistoryPage from './pages/HistoryPage';
import SensorDetails from './pages/SensorDetails';
import RealTimeAnalysis from './pages/RealTimeAnalysis';
import AlertManagement from './pages/AlertManagement';
import AlertDetails from './pages/AlertDetails';
import Monitoring from './pages/Monitoring';
import AcousticMonitoring from './pages/AcousticMonitoring';
// import SensorsManagement from './pages/SensorsManagement'; // Commenté - plus nécessaire avec un seul capteur
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/network-map" element={
          <ProtectedRoute>
            <NetworkMapPage />
          </ProtectedRoute>
        } />
        <Route path="/reports" element={
          <ProtectedRoute>
            <HistoryPage />
          </ProtectedRoute>
        } />
        <Route path="/sensor/:sensorId" element={
          <ProtectedRoute>
            <SensorDetails />
          </ProtectedRoute>
        } />
        <Route path="/sensor/:sensorId/real-time-analysis" element={
          <ProtectedRoute>
            <RealTimeAnalysis />
          </ProtectedRoute>
        } />
        <Route path="/alert/:id" element={
          <ProtectedRoute>
            <AlertDetails />
          </ProtectedRoute>
        } />
        <Route path="/alerts" element={
          <ProtectedRoute>
            <AlertManagement />
          </ProtectedRoute>
        } />
        <Route path="/monitoring" element={
          <ProtectedRoute>
            <Monitoring />
          </ProtectedRoute>
        } />
        <Route path="/acoustic" element={
          <ProtectedRoute>
            <AcousticMonitoring />
          </ProtectedRoute>
        } />
        {/* Route commentée - Gestion des capteurs plus nécessaire avec un seul capteur fixe
        <Route path="/sensors" element={
          <ProtectedRoute>
            <SensorsManagement />
          </ProtectedRoute>
        } />
        */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;