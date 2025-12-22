from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import numpy as np
from scipy import signal
import pandas as pd
import librosa
import librosa.display

router = APIRouter()

class AcousticDataPoint(BaseModel):
    timestamp: str
    accX: float
    accY: float
    accZ: float

class VibrationAnalysisRequest(BaseModel):
    data: List[AcousticDataPoint]
    sampling_rate: float = 100.0  # Hz, ajuster selon vos données

class VibrationAnalysisResponse(BaseModel):
    vibration_signal: List[float]
    timestamps: List[str]
    rms: float
    peak: float
    frequency: float
    status: str
    spectrogram: List[List[float]]  # Spectrogramme 2D
    spectrogram_freqs: List[float]  # Fréquences du spectrogramme
    spectrogram_times: List[float]  # Temps du spectrogramme

def calculate_vibration_signal(acc_x: np.ndarray, acc_y: np.ndarray, acc_z: np.ndarray) -> np.ndarray:
    """
    Calcule le signal vibratoire à partir des trois axes d'accélération
    Signal vibratoire = magnitude du vecteur d'accélération
    """
    # Calculer la magnitude du vecteur d'accélération
    vibration = np.sqrt(acc_x**2 + acc_y**2 + acc_z**2)
    return vibration

def calculate_spectrogram(vibration_signal: np.ndarray, sampling_rate: float) -> tuple:
    """
    Calcule le spectrogramme du signal vibratoire avec librosa
    Filtre les fréquences entre 100Hz et 2000Hz
    """
    # Vérifier qu'on a assez de données
    if len(vibration_signal) < 16:
        # Pas assez de données, retourner un spectrogramme vide
        return np.array([[]]), np.array([100.0, 2000.0]), np.array([0.0])
    
    # Normaliser le signal
    vibration_normalized = vibration_signal / (np.max(np.abs(vibration_signal)) + 1e-10)
    
    # Calculer le spectrogramme avec librosa
    # STFT (Short-Time Fourier Transform)
    # Adapter n_fft à la taille des données pour meilleure résolution
    n_fft = min(512, len(vibration_normalized))  # Augmenté à 512
    # S'assurer que n_fft est une puissance de 2
    n_fft = 2 ** int(np.log2(n_fft))
    hop_length = max(1, n_fft // 16)  # Réduit à //16 pour beaucoup plus de résolution temporelle
    
    try:
        D = librosa.stft(vibration_normalized, n_fft=n_fft, hop_length=hop_length, window='hann')
        S_db = librosa.amplitude_to_db(np.abs(D), ref=np.max)
        
        # Calculer les axes de fréquence et temps
        freqs = librosa.fft_frequencies(sr=sampling_rate, n_fft=n_fft)
        times = librosa.frames_to_time(np.arange(S_db.shape[1]), sr=sampling_rate, hop_length=hop_length)
        
        # Filtrer les fréquences entre 100Hz et 2000Hz
        freq_mask = (freqs >= 100) & (freqs <= 2000)
        
        # Vérifier qu'on a des fréquences dans cette plage
        if not np.any(freq_mask):
            # Si aucune fréquence dans la plage, prendre toutes les fréquences disponibles
            return S_db, freqs, times
        
        S_db_filtered = S_db[freq_mask, :]
        freqs_filtered = freqs[freq_mask]
        
        return S_db_filtered, freqs_filtered, times
    except Exception as e:
        # En cas d'erreur, retourner un spectrogramme vide
        print(f"Erreur calcul spectrogramme: {e}")
        return np.array([[]]), np.array([100.0, 2000.0]), np.array([0.0])

def analyze_vibration(vibration_signal: np.ndarray, sampling_rate: float) -> dict:
    """
    Analyse le signal vibratoire pour extraire des métriques
    """
    # RMS (Root Mean Square)
    rms = np.sqrt(np.mean(vibration_signal**2))
    
    # Peak (valeur maximale)
    peak = np.max(np.abs(vibration_signal))
    
    # Analyse fréquentielle
    freqs, psd = signal.periodogram(vibration_signal, fs=sampling_rate)
    
    # Fréquence dominante
    dominant_freq_idx = np.argmax(psd)
    dominant_frequency = freqs[dominant_freq_idx]
    
    # Déterminer le statut basé sur les seuils
    if rms > 0.5 or peak > 1.0:
        status = "anomaly"
    elif rms > 0.3 or peak > 0.7:
        status = "warning"
    else:
        status = "normal"
    
    return {
        "rms": float(rms),
        "peak": float(peak),
        "frequency": float(dominant_frequency),
        "status": status
    }

@router.post("/api/vibration/analyze", response_model=VibrationAnalysisResponse)
async def analyze_acoustic_data(request: VibrationAnalysisRequest):
    """
    Analyse les données acoustiques de ThingSpeak et calcule le signal vibratoire + spectrogramme
    """
    try:
        if len(request.data) == 0:
            raise HTTPException(status_code=400, detail="No data provided")
        
        # Convertir les données en arrays numpy
        acc_x = np.array([point.accX for point in request.data])
        acc_y = np.array([point.accY for point in request.data])
        acc_z = np.array([point.accZ for point in request.data])
        timestamps = [point.timestamp for point in request.data]
        
        # Calculer le signal vibratoire
        vibration_signal = calculate_vibration_signal(acc_x, acc_y, acc_z)
        
        # Analyser le signal
        analysis = analyze_vibration(vibration_signal, request.sampling_rate)
        
        # Calculer le spectrogramme
        S_db, freqs, times = calculate_spectrogram(vibration_signal, request.sampling_rate)
        
        return VibrationAnalysisResponse(
            vibration_signal=vibration_signal.tolist(),
            timestamps=timestamps,
            rms=analysis["rms"],
            peak=analysis["peak"],
            frequency=analysis["frequency"],
            status=analysis["status"],
            spectrogram=S_db.tolist(),
            spectrogram_freqs=freqs.tolist(),
            spectrogram_times=times.tolist()
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing data: {str(e)}")

@router.get("/api/vibration/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "ok", "service": "vibration_analysis"}
