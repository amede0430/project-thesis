import asyncio
import json
import numpy as np
from pathlib import Path
from scipy import signal as scipy_signal
from ..services.signal_stream import SignalStream
from .manager import manager

# Initialiser le stream de données
DATA_DIR = Path(__file__).parent.parent.parent.parent / "Accelerometer"
stream = SignalStream(DATA_DIR) if DATA_DIR.exists() else None

def compute_spectrogram(segment: np.ndarray, fs: float):
    """Calculer le spectrogramme d'un segment"""
    # Filtrage passe-bande comme dans l'ancien projet
    from scipy.signal import butter, filtfilt
    
    def bandpass_filter(data, lowcut=200.0, highcut=4000.0, fs=51200.0, order=4):
        nyquist = 0.5 * fs
        low = lowcut / nyquist
        high = highcut / nyquist
        b, a = butter(order, [low, high], btype='band')
        return filtfilt(b, a, data)
    
    filtered = bandpass_filter(segment, fs=fs)
    
    # Paramètres STFT
    n_fft = 512
    hop_length = 256
    win_length = 512
    
    f, t, Sxx = scipy_signal.spectrogram(
        filtered, 
        fs=fs, 
        nperseg=win_length, 
        noverlap=win_length - hop_length,
        nfft=n_fft
    )
    
    # Limiter aux fréquences d'intérêt (0-4000 Hz)
    freq_mask = f <= 4000.0
    f_limited = f[freq_mask]
    Sxx_limited = Sxx[freq_mask, :]
    
    # Convertir en dB
    Sxx_db = 10 * np.log10(Sxx_limited + 1e-12)
    
    return Sxx_db, f_limited, t

def spec_for_visualization(spec_raw: np.ndarray, freq_axis: np.ndarray):
    """Préparer le spectrogramme pour visualisation"""
    min_val = float(spec_raw.min())
    max_val = float(spec_raw.max())
    
    if max_val - min_val < 1e-6:
        norm = np.zeros_like(spec_raw)
    else:
        norm = (spec_raw - min_val) / (max_val - min_val)
    
    scaled = (norm * 255.0).clip(0, 255).astype(np.uint8)
    
    return {
        "matrix": scaled.tolist(),
        "frequencies": freq_axis.astype(float).tolist()
    }

def build_payload():
    """Construire le payload comme dans l'ancien projet"""
    if not stream:
        return generate_fallback_payload()
    
    try:
        segment = stream.next_segment()
        spec_raw, freq_axis, time_axis = compute_spectrogram(segment.values, segment.fs)
        visual_spec = spec_for_visualization(spec_raw, freq_axis)
        
        return {
            "waveform": {
                "samples": segment.samples.astype(float).tolist(),
                "values": segment.values.astype(float).tolist(),
            },
            "spectrogram": visual_spec["matrix"],
            "spectrogram_meta": {
                "frequencies": visual_spec["frequencies"],
                "times": time_axis.astype(float).tolist(),
            },
            "source": {
                "file": str(segment.file_path.name),
                "fs": segment.fs,
                "start_index": segment.start_idx,
                "end_index": segment.end_idx,
            }
        }
    except Exception as e:
        print(f"Erreur génération payload: {e}")
        return generate_fallback_payload()

def generate_fallback_payload():
    """Générer des données de fallback si pas de CSV"""
    t = np.linspace(0, 2, 2000)
    signal = (
        0.5 * np.sin(2 * np.pi * 50 * t) +
        0.3 * np.sin(2 * np.pi * 120 * t) +
        0.1 * np.random.normal(0, 1, 2000)
    )
    
    f, time_axis, Sxx = scipy_signal.spectrogram(signal, fs=1000, nperseg=128, noverlap=64)
    Sxx_db = 10 * np.log10(Sxx + 1e-12)
    scaled = ((Sxx_db - Sxx_db.min()) / (Sxx_db.max() - Sxx_db.min()) * 255).astype(np.uint8)
    
    return {
        "waveform": {
            "samples": t.tolist(),
            "values": signal.tolist(),
        },
        "spectrogram": scaled.tolist(),
        "spectrogram_meta": {
            "frequencies": f.tolist(),
            "times": time_axis.tolist(),
        },
        "source": {
            "file": "simulated.csv",
            "fs": 1000.0,
            "start_index": 0,
            "end_index": 2000,
        }
    }

async def acoustic_background_task():
    """Tâche de fond pour envoyer les données acoustiques"""
    print("Démarrage de la tâche acoustique...")
    
    while True:
        try:
            payload = build_payload()
            print(f"Payload généré: waveform={len(payload['waveform']['values'])} points, spectrogram={len(payload['spectrogram'])}x{len(payload['spectrogram'][0]) if payload['spectrogram'] else 0}")
            
            # Envoyer waveform_update
            await manager.broadcast({
                "type": "waveform_update",
                "waveform": payload["waveform"],
                "spectrogram_meta": payload["spectrogram_meta"],
                "source": payload["source"]
            })
            
            # Envoyer spectrogram_update
            await manager.broadcast({
                "type": "spectrogram_update", 
                "spectrogram": payload["spectrogram"],
                "spectrogram_meta": payload["spectrogram_meta"],
                "source": payload["source"]
            })
            
            print("Données acoustiques envoyées")
            
        except Exception as e:
            print(f"Erreur dans acoustic_background_task: {e}")
            import traceback
            traceback.print_exc()
        
        await asyncio.sleep(2)  # Toutes les 2 secondes comme l'ancien projet