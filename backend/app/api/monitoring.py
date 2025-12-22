from fastapi import APIRouter, WebSocket, WebSocketDisconnect
import asyncio
import json
import numpy as np
from datetime import datetime
import random
from ..db.database import SessionLocal
from ..models.analysis_history import AnalysisHistory

router = APIRouter()

class MonitoringManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
        self.is_running = False

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        if not self.is_running:
            self.is_running = True
            asyncio.create_task(self.send_monitoring_data())

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if not self.active_connections:
            self.is_running = False
    
    async def save_analysis_to_db(self, sensor_id: int, status: str, confidence: float, 
                                 severity: float, rms: float, peak: float, frequency: float,
                                 signal_data: list, spectrogram_data: list):
        """Enregistre une analyse significative en base de données"""
        try:
            db = SessionLocal()
            analysis = AnalysisHistory(
                sensor_id=sensor_id,
                status=status,
                confidence=confidence,
                severity=severity,
                rms=rms,
                peak=peak,
                frequency=frequency,
                signal_data=json.dumps(signal_data[:100]),  # Limiter la taille
                spectrogram_data=json.dumps(spectrogram_data[:10]),  # Limiter la taille
                is_significant=True,
                processing_time=random.uniform(50, 200)  # Simulé
            )
            db.add(analysis)
            db.commit()
            db.close()
            print(f"Analyse enregistrée: {status} (conf: {confidence:.2f}, sev: {severity:.2f})")
        except Exception as e:
            print(f"Erreur sauvegarde analyse: {e}")

    async def send_monitoring_data(self):
        """Envoie les résultats d'analyse IA (pas les données brutes)"""
        while self.is_running and self.active_connections:
            try:
                # Import local pour éviter les imports circulaires
                from .ttn_integration import ttn_integration
                
                # Vérifier si on a une nouvelle analyse disponible
                analysis_result = await ttn_integration.get_latest_analysis()
                
                if analysis_result:
                    # Utiliser les résultats de l'analyse IA complète
                    signal = analysis_result['reconstructed_signal']
                    spectrogram = analysis_result['spectrogram']
                    status = analysis_result['status']
                    confidence = analysis_result['confidence']
                    severity = analysis_result['severity']
                    rms = analysis_result['rms']
                    peak = analysis_result['peak']
                    frequency = analysis_result['dominant_frequency']
                    data_points = analysis_result['data_points_used']
                    data_source = "IA Analysis"
                    
                    print(f"📊 Analyse IA disponible: {status} ({data_points} points)")
                else:
                    # Utiliser les données TTN récentes si disponibles
                    recent_ttn_data = ttn_integration.get_recent_data(5)  # 5 dernières minutes
                    
                    if recent_ttn_data and len(recent_ttn_data) > 10:
                        # Créer un signal à partir des données TTN récentes
                        ttn_values = [point['value'] for point in recent_ttn_data[-50:]]  # 50 derniers points
                        signal = self.interpolate_ttn_data(ttn_values, 1024)
                        spectrogram = self.generate_ttn_spectrogram(signal, len(ttn_values))
                        
                        # Analyse simple des données TTN
                        import numpy as np
                        ttn_array = np.array(ttn_values)
                        rms = float(np.sqrt(np.mean(ttn_array**2)))
                        peak = float(np.max(np.abs(ttn_array)))
                        std_val = float(np.std(ttn_array))
                        
                        # Détection simple basée sur les métriques
                        if std_val > 0.5:
                            status = "anomaly"
                            confidence = 0.85
                            severity = 0.8
                        elif std_val > 0.2:
                            status = "warning"
                            confidence = 0.75
                            severity = 0.6
                        else:
                            status = "normal"
                            confidence = 0.90
                            severity = 0.1
                            severity = std_val
                        
                        frequency = 0.1  # Fréquence TTN
                        data_points = len(ttn_values)
                        data_source = f"TTN Real Data ({signal_type})"
                        
                        print(f"📡 Données TTN récentes: {len(ttn_values)} points, type: {signal_type}")
                    else:
                        # Fallback sur simulation
                        signal, spectrogram = self.generate_demo_data()
                        status, confidence, severity = self.fallback_analysis(0.3, 0.5)
                        rms, peak, frequency = 0.3, 0.5, 0.1
                        data_points = 0
                        data_source = "Demo"
                
                # Le spectrogramme vient de l'analyse IA (déjà calculé)
                
                # Les métriques viennent de l'analyse IA (déjà calculées)
                
                # Enregistrer en base si sévérité et confiance élevées (et si c'est une vraie analyse)
                if analysis_result and confidence > 0.8 and severity > 0.7:
                    await self.save_analysis_to_db(1, status, confidence, severity, rms, peak, frequency, signal, spectrogram)
                
                # Préparer les données
                monitoring_data = {
                    "waveform": signal if isinstance(signal, list) else signal.tolist(),
                    "spectrogram": spectrogram,
                    "analysis": {
                        "status": status,
                        "confidence": confidence,
                        "severity": severity,
                        "rms": float(rms),
                        "peak": float(peak),
                        "frequency": float(frequency),
                        "timestamp": datetime.now().isoformat(),
                        "ttn_data_points": data_points,
                        "data_source": data_source
                    }
                }
                
                # Envoyer aux clients connectés
                message = json.dumps(monitoring_data)
                disconnected = []
                
                for connection in self.active_connections:
                    try:
                        await connection.send_text(message)
                    except:
                        disconnected.append(connection)
                
                # Nettoyer les connexions fermées
                for conn in disconnected:
                    self.disconnect(conn)
                
                # Attendre avant le prochain envoi (5 secondes pour analyses IA)
                await asyncio.sleep(5)
                
            except Exception as e:
                print(f"Erreur monitoring: {e}")
                await asyncio.sleep(1)
    
    def interpolate_ttn_data(self, ttn_values, target_length=1024):
        """Interpole les données TTN pour créer un signal plus dense"""
        if len(ttn_values) < 2:
            return np.zeros(target_length)
        
        # Interpolation linéaire
        x_original = np.linspace(0, 1, len(ttn_values))
        x_new = np.linspace(0, 1, target_length)
        interpolated = np.interp(x_new, x_original, ttn_values)
        
        # Ajouter un peu de bruit pour rendre plus réaliste
        noise = np.random.normal(0, 0.05, target_length)
        return interpolated + noise
    
    def generate_ttn_spectrogram(self, signal, ttn_points):
        """Génère un spectrogramme adapté aux données TTN (basse fréquence)"""
        spectrogram = []
        
        # Pour TTN (0.1 Hz), concentrer l'énergie dans les basses fréquences
        for i in range(32):  # 32 bandes de fréquence
            row = []
            for j in range(64):  # 64 points temporels
                if i < 5:  # Basses fréquences (0-0.05 Hz)
                    # Utiliser les données du signal
                    signal_index = int((j / 64) * len(signal))
                    base_intensity = abs(signal[signal_index]) if signal_index < len(signal) else 0
                    base_intensity = min(1.0, base_intensity * 2)  # Amplifier pour visibilité
                elif i < 10:  # Moyennes fréquences
                    base_intensity = random.uniform(0, 0.3)
                else:  # Hautes fréquences (très peu d'énergie)
                    base_intensity = random.uniform(0, 0.1)
                
                # Ajouter de la variation temporelle
                variation = random.uniform(-0.1, 0.1)
                intensity = max(0, min(1, base_intensity + variation))
                row.append(intensity)
            spectrogram.append(row)
        
        return spectrogram
    
    def generate_demo_data(self):
        """Génère des données de démonstration"""
        # Signal de démonstration
        t = np.linspace(0, 1, 1024)
        frequency = 0.1
        amplitude = 0.5 + random.uniform(-0.2, 0.2)
        noise = np.random.normal(0, 0.1, len(t))
        
        signal = (amplitude * np.sin(2 * np.pi * frequency * t) + 
                 0.3 * np.sin(2 * np.pi * frequency * 0.5 * t) + 
                 noise)
        
        # Spectrogramme de démonstration
        spectrogram = []
        for i in range(32):
            row = []
            for j in range(64):
                if i < 5:  # Basses fréquences
                    base_intensity = random.uniform(0.3, 0.8)
                elif i < 10:
                    base_intensity = random.uniform(0.1, 0.4)
                else:
                    base_intensity = random.uniform(0, 0.2)
                row.append(base_intensity)
            spectrogram.append(row)
        
        return signal, spectrogram
    
    def fallback_analysis(self, rms, peak):
        """Analyse de fallback pour démonstration"""
        if rms > 0.6 or peak > 0.9:
            return "anomaly", 0.85 + random.uniform(0, 0.1), 0.8 + random.uniform(0, 0.2)
        elif rms > 0.4:
            return "warning", 0.70 + random.uniform(0, 0.15), 0.5 + random.uniform(0, 0.3)
        else:
            return "normal", 0.90 + random.uniform(0, 0.08), 0.1 + random.uniform(0, 0.2)

monitoring_manager = MonitoringManager()

@router.websocket("/ws/sensor/{sensor_id}")
async def websocket_monitoring(websocket: WebSocket, sensor_id: int):
    """WebSocket pour données de monitoring temps réel"""
    await monitoring_manager.connect(websocket)
    try:
        while True:
            # Garder la connexion ouverte
            await websocket.receive_text()
    except WebSocketDisconnect:
        monitoring_manager.disconnect(websocket)
    except Exception as e:
        print(f"Erreur WebSocket monitoring: {e}")
        monitoring_manager.disconnect(websocket)