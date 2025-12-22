from fastapi import APIRouter, HTTPException
import random
import numpy as np
import pandas as pd
from pathlib import Path
from scipy import signal as scipy_signal

router = APIRouter()

# Chemins vers les données CSV
DATA_DIR = Path(__file__).parent.parent.parent.parent / "Accelerometer"

# État des capteurs
SENSOR_STATES = {str(i): {"leak_mode": False, "files": [], "position": 0} for i in range(1, 11)}

def load_csv_files():
    """Charger les fichiers CSV disponibles"""
    try:
        normal_path = DATA_DIR / "Branched" / "No-leak"
        leak_path = DATA_DIR / "Branched" / "Gasket Leak"
        
        if normal_path.exists():
            normal_files = list(normal_path.glob("*.csv"))
            for i in range(1, 6):
                SENSOR_STATES[str(i)]["files"] = normal_files
                
    except Exception as e:
        print(f"Erreur chargement fichiers: {e}")

def get_real_data(sensor_id: str):
    """Récupérer de vraies données CSV"""
    state = SENSOR_STATES[sensor_id]
    
    if not state["files"]:
        load_csv_files()
    
    if not state["files"]:
        return generate_test_data(sensor_id)
    
    try:
        # Choisir un fichier aléatoirement
        csv_file = random.choice(state["files"])
        df = pd.read_csv(csv_file)
        
        # Prendre la première colonne numérique
        numeric_cols = df.select_dtypes(include=[np.number]).columns
        if len(numeric_cols) == 0:
            return generate_test_data(sensor_id)
        
        values = df[numeric_cols[0]].values
        
        # Prendre un segment aléatoire
        segment_size = min(2000, len(values) // 4)
        start_idx = random.randint(0, max(0, len(values) - segment_size))
        segment = values[start_idx:start_idx + segment_size]
        
        # Calculer spectrogramme avec scipy
        fs = 1000.0
        f, t, Sxx = scipy_signal.spectrogram(segment, fs=fs, nperseg=128, noverlap=64)
        Sxx_db = 10 * np.log10(Sxx + 1e-12)
        
        return {
            "signal": segment.tolist(),
            "spectrogram_matrix": Sxx_db.tolist(),
            "frequencies": f.tolist(),
            "times": t.tolist()
        }
        
    except Exception as e:
        print(f"Erreur lecture CSV: {e}")
        return generate_test_data(sensor_id)

def generate_test_data(sensor_id: str):
    """Générer des données de test"""
    t = np.linspace(0, 5, 1000)
    phase = np.random.random() * 2 * np.pi
    signal = (
        0.5 * np.sin(2 * np.pi * 50 * t + phase) +
        0.3 * np.sin(2 * np.pi * 120 * t + phase * 0.7) +
        0.1 * np.random.normal(0, 1, 1000)
    )
    
    fs = 200.0
    f, time_axis, Sxx = scipy_signal.spectrogram(signal, fs=fs, nperseg=64, noverlap=32)
    Sxx_db = 10 * np.log10(Sxx + 1e-12)
    
    return {
        "signal": signal.tolist(),
        "spectrogram_matrix": Sxx_db.tolist(),
        "frequencies": f.tolist(),
        "times": time_axis.tolist()
    }

@router.get("/sensor/{sensor_id}/next-segment")
async def get_next_segment(sensor_id: str):
    """Récupérer le prochain segment pour un capteur"""
    try:
        # Récupérer les données (CSV réels ou simulés)
        data = get_real_data(sensor_id)
        
        # Formater pour le frontend
        signal_data = [{"value": float(val)} for val in data["signal"]]
        
        # Calculer métriques
        signal_array = np.array(data["signal"])
        features = {
            "rms": float(np.sqrt(np.mean(signal_array**2))),
            "dominant_frequency": float(data["frequencies"][np.argmax(np.mean(data["spectrogram_matrix"], axis=1))]) if data["frequencies"] else 120.0,
            "energy_low_freq": float(np.sum(np.abs(signal_array[:len(signal_array)//3]))),
            "energy_mid_freq": float(np.sum(np.abs(signal_array[len(signal_array)//3:2*len(signal_array)//3]))),
            "energy_high_freq": float(np.sum(np.abs(signal_array[2*len(signal_array)//3:]))),
            "signal_mean": float(np.mean(signal_array)),
            "signal_std": float(np.std(signal_array))
        }
        
        return {
            "sensor_id": sensor_id,
            "signal_data": signal_data,
            "spectrogram": {
                "frequencies": data["frequencies"],
                "times": data["times"],
                "spectrogram": data["spectrogram_matrix"]
            },
            "features": features,
            "is_leak": random.choice([True, False]),
            "timestamp": "2024-01-15T10:30:00Z"
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur: {str(e)}")