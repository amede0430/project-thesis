import numpy as np
import pandas as pd
from scipy import signal
import base64
import io
import matplotlib
matplotlib.use('Agg')  # Backend non-interactif
import matplotlib.pyplot as plt
from typing import Dict, Tuple, List

class SpectrogramService:
    
    @staticmethod
    def generate_spectrogram(data: pd.DataFrame, fs: int = 1000) -> Dict:
        """
        Génère un spectrogramme à partir des données d'accéléromètre
        
        Args:
            data: DataFrame avec colonnes d'accélération (X, Y, Z)
            fs: Fréquence d'échantillonnage en Hz
            
        Returns:
            Dict contenant le spectrogramme et métadonnées
        """
        # Prendre la première colonne numérique comme signal principal
        numeric_cols = data.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) == 0:
            raise ValueError("Aucune colonne numérique trouvée")
        
        signal_data = data[numeric_cols[0]].values
        
        # Paramètres STFT
        nperseg = min(256, len(signal_data) // 4)  # Taille fenêtre
        noverlap = nperseg // 2  # Recouvrement 50%
        
        # Calcul spectrogramme
        f, t, Sxx = signal.spectrogram(
            signal_data, 
            fs=fs, 
            nperseg=nperseg, 
            noverlap=noverlap,
            window='hann'
        )
        
        # Conversion en dB
        Sxx_db = 10 * np.log10(Sxx + 1e-12)
        
        return {
            "frequencies": f.tolist(),
            "times": t.tolist(), 
            "spectrogram": Sxx_db.tolist(),
            "fs": fs,
            "signal_length": len(signal_data),
            "frequency_resolution": f[1] - f[0] if len(f) > 1 else 0,
            "time_resolution": t[1] - t[0] if len(t) > 1 else 0
        }
    
    @staticmethod
    def generate_spectrogram_image(data: pd.DataFrame, fs: int = 1000) -> str:
        """
        Génère une image PNG du spectrogramme encodée en base64
        
        Returns:
            String base64 de l'image PNG
        """
        numeric_cols = data.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) == 0:
            raise ValueError("Aucune colonne numérique trouvée")
        
        signal_data = data[numeric_cols[0]].values
        
        # Paramètres STFT
        nperseg = min(256, len(signal_data) // 4)
        noverlap = nperseg // 2
        
        # Calcul spectrogramme
        f, t, Sxx = signal.spectrogram(
            signal_data, 
            fs=fs, 
            nperseg=nperseg, 
            noverlap=noverlap,
            window='hann'
        )
        
        # Création du graphique
        plt.figure(figsize=(8, 4))
        plt.pcolormesh(t, f, 10 * np.log10(Sxx + 1e-12), shading='gouraud', cmap='viridis')
        plt.ylabel('Fréquence [Hz]')
        plt.xlabel('Temps [s]')
        plt.title('Spectrogramme')
        plt.colorbar(label='Puissance [dB]')
        plt.tight_layout()
        
        # Conversion en base64
        buffer = io.BytesIO()
        plt.savefig(buffer, format='png', dpi=100, bbox_inches='tight')
        buffer.seek(0)
        image_base64 = base64.b64encode(buffer.getvalue()).decode()
        plt.close()
        
        return image_base64
    
    @staticmethod
    def extract_features(data: pd.DataFrame, fs: int = 1000) -> Dict:
        """
        Extrait des caractéristiques du signal pour l'analyse IA
        
        Returns:
            Dict avec RMS, fréquences dominantes, etc.
        """
        numeric_cols = data.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) == 0:
            return {}
        
        signal_data = data[numeric_cols[0]].values
        
        # RMS
        rms = np.sqrt(np.mean(signal_data**2))
        
        # FFT pour fréquences dominantes
        fft = np.fft.fft(signal_data)
        freqs = np.fft.fftfreq(len(signal_data), 1/fs)
        magnitude = np.abs(fft)
        
        # Fréquence dominante
        dominant_freq_idx = np.argmax(magnitude[:len(magnitude)//2])
        dominant_freq = freqs[dominant_freq_idx]
        
        # Énergie par bandes de fréquence
        low_freq = np.sum(magnitude[(freqs >= 0) & (freqs < 100)])
        mid_freq = np.sum(magnitude[(freqs >= 100) & (freqs < 300)])
        high_freq = np.sum(magnitude[(freqs >= 300) & (freqs < 500)])
        
        return {
            "rms": float(rms),
            "dominant_frequency": float(dominant_freq),
            "energy_low_freq": float(low_freq),
            "energy_mid_freq": float(mid_freq), 
            "energy_high_freq": float(high_freq),
            "signal_mean": float(np.mean(signal_data)),
            "signal_std": float(np.std(signal_data)),
            "signal_max": float(np.max(signal_data)),
            "signal_min": float(np.min(signal_data))
        }