from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List
import numpy as np
from scipy import signal
import librosa
import cv2
from tensorflow import keras
import base64
from io import BytesIO
from PIL import Image

router = APIRouter()

# Charger le modèle au démarrage
MODEL_PATH = "transfer_learning_adxl345_model.h5"
try:
    model = keras.models.load_model(MODEL_PATH)
    print(f"✅ Modèle chargé: {MODEL_PATH}")
except Exception as e:
    print(f"❌ Erreur chargement modèle: {e}")
    model = None

class AcousticDataPoint(BaseModel):
    timestamp: str
    accX: float
    accY: float
    accZ: float

class MLPredictionRequest(BaseModel):
    data: List[AcousticDataPoint]
    sampling_rate: float = 100.0

class MLPredictionResponse(BaseModel):
    prediction: str
    confidence: float
    spectrogram_image: str  # Base64 encoded image 224x224
    probabilities: dict

def calculate_vibration_signal(acc_x: np.ndarray, acc_y: np.ndarray, acc_z: np.ndarray) -> np.ndarray:
    """Calcule le signal vibratoire"""
    return np.sqrt(acc_x**2 + acc_y**2 + acc_z**2)

def create_spectrogram_224x224(vibration_signal: np.ndarray, sampling_rate: float) -> tuple:
    """
    Crée un spectrogramme 224x224 pour le modèle de deep learning
    Retourne: (spectrogram_array, spectrogram_image_base64)
    """
    # Normaliser le signal
    vibration_normalized = vibration_signal / (np.max(np.abs(vibration_signal)) + 1e-10)
    
    # Paramètres STFT
    n_fft = min(512, len(vibration_normalized))
    n_fft = 2 ** int(np.log2(n_fft))
    hop_length = max(1, n_fft // 16)
    
    # Calculer le spectrogramme
    D = librosa.stft(vibration_normalized, n_fft=n_fft, hop_length=hop_length, window='hann')
    S_db = librosa.amplitude_to_db(np.abs(D), ref=np.max)
    
    # Normaliser entre 0 et 255
    S_normalized = ((S_db - S_db.min()) / (S_db.max() - S_db.min() + 1e-10) * 255).astype(np.uint8)
    
    # Redimensionner à 224x224
    S_resized = cv2.resize(S_normalized, (224, 224), interpolation=cv2.INTER_LINEAR)
    
    # Pour le modèle: garder en niveaux de gris (1 canal)
    S_grayscale = np.expand_dims(S_resized, axis=-1)  # Shape: (224, 224, 1)
    
    # Pour l'affichage: convertir en RGB avec colormap
    S_rgb_display = cv2.applyColorMap(S_resized, cv2.COLORMAP_JET)
    S_rgb_display = cv2.cvtColor(S_rgb_display, cv2.COLOR_BGR2RGB)
    
    # Encoder en base64 pour l'envoyer au frontend
    img = Image.fromarray(S_rgb_display)
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_base64 = base64.b64encode(buffered.getvalue()).decode()
    
    return S_grayscale, img_base64

@router.post("/api/ml/predict", response_model=MLPredictionResponse)
async def predict_leak(request: MLPredictionRequest):
    """
    Analyse les données acoustiques et prédit s'il y a une fuite
    """
    try:
        if model is None:
            raise HTTPException(status_code=500, detail="Modèle non chargé")
        
        if len(request.data) < 16:
            raise HTTPException(status_code=400, detail="Pas assez de données (minimum 16 points)")
        
        # Convertir les données en arrays numpy
        acc_x = np.array([point.accX for point in request.data])
        acc_y = np.array([point.accY for point in request.data])
        acc_z = np.array([point.accZ for point in request.data])
        
        # Calculer le signal vibratoire
        vibration_signal = calculate_vibration_signal(acc_x, acc_y, acc_z)
        
        # Créer le spectrogramme 224x224
        spectrogram_grayscale, spectrogram_base64 = create_spectrogram_224x224(vibration_signal, request.sampling_rate)
        
        # Préparer l'input pour le modèle (normaliser entre 0 et 1)
        model_input = spectrogram_grayscale.astype(np.float32) / 255.0
        model_input = np.expand_dims(model_input, axis=0)  # Ajouter batch dimension -> (1, 224, 224, 1)
        
        # Faire la prédiction
        predictions = model.predict(model_input, verbose=0)
        
        # Le modèle peut avoir différentes sorties
        # Cas 1: Sortie binaire avec sigmoid (1 neurone) -> predictions shape: (1, 1)
        # Cas 2: Sortie multi-classe avec softmax (2+ neurones) -> predictions shape: (1, n_classes)
        
        if predictions.shape[1] == 1:
            # Sortie binaire (sigmoid)
            prob_fuite = float(predictions[0][0])
            prob_normal = 1.0 - prob_fuite
            
            # Déterminer la classe prédite
            if prob_fuite > 0.5:
                predicted_class = "Fuite"
                confidence = prob_fuite
            else:
                predicted_class = "Normal"
                confidence = prob_normal
            
            probabilities = {
                "Normal": prob_normal,
                "Fuite": prob_fuite
            }
        else:
            # Sortie multi-classe (softmax)
            classes = ["Normal", "Fuite"]  # Ajuster selon vos classes
            predicted_class_idx = np.argmax(predictions[0])
            predicted_class = classes[predicted_class_idx] if predicted_class_idx < len(classes) else f"Classe {predicted_class_idx}"
            confidence = float(predictions[0][predicted_class_idx])
            
            # Créer le dictionnaire des probabilités
            probabilities = {classes[i]: float(predictions[0][i]) for i in range(min(len(classes), predictions.shape[1]))}
        
        return MLPredictionResponse(
            prediction=predicted_class,
            confidence=confidence,
            spectrogram_image=spectrogram_base64,
            probabilities=probabilities
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur prédiction: {str(e)}")

@router.get("/api/ml/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "ok" if model is not None else "error",
        "model_loaded": model is not None,
        "model_path": MODEL_PATH
    }
