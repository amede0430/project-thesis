from fastapi import APIRouter, HTTPException
import random
import numpy as np

router = APIRouter()

@router.get("/sensor/{sensor_id}/next-segment")
async def get_next_segment(sensor_id: str):
    """Génère des données simulées pour un capteur"""
    try:
        # Générer signal temporel simulé (5 secondes à 200Hz = 1000 points)
        t = np.linspace(0, 5, 1000)
        signal = (
            0.5 * np.sin(2 * np.pi * 50 * t) +  # 50Hz
            0.3 * np.sin(2 * np.pi * 120 * t) + # 120Hz  
            0.1 * np.random.normal(0, 1, 1000)   # Bruit
        )
        
        # Convertir en format attendu
        signal_data = [{"value": float(val)} for val in signal]
        
        # Spectrogramme simulé
        frequencies = list(range(0, 500, 10))  # 0-500Hz par pas de 10
        times = list(np.linspace(0, 5, 100))   # 5 secondes, 100 points
        spectrogram_matrix = []
        
        for freq in frequencies:
            row = []
            for time in times:
                # Simuler intensité basée sur fréquence et temps
                intensity = -60 + 40 * np.exp(-(freq - 120)**2 / 5000) + 10 * np.random.random()
                row.append(float(intensity))
            spectrogram_matrix.append(row)
        
        # Métriques calculées
        features = {
            "rms": float(np.sqrt(np.mean(signal**2))),
            "dominant_frequency": 120.0 + random.uniform(-10, 10),
            "energy_low_freq": float(np.sum(np.abs(signal[:200]))),
            "energy_mid_freq": float(np.sum(np.abs(signal[200:600]))),
            "energy_high_freq": float(np.sum(np.abs(signal[600:]))),
            "signal_mean": float(np.mean(signal)),
            "signal_std": float(np.std(signal))
        }
        
        return {
            "sensor_id": sensor_id,
            "signal_data": signal_data,
            "spectrogram": {
                "frequencies": frequencies,
                "times": times,
                "spectrogram": spectrogram_matrix
            },
            "features": features,
            "is_leak": random.choice([True, False]),
            "timestamp": "2024-01-15T10:30:00Z"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur génération données: {str(e)}")