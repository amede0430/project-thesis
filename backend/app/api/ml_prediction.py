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
        
        print("\n" + "="*80)
        print("🔍 NOUVELLE ANALYSE ML - PRÉDICTION DE FUITE")
        print("="*80)
        
        # Convertir les données en arrays numpy
        acc_x = np.array([point.accX for point in request.data])
        acc_y = np.array([point.accY for point in request.data])
        acc_z = np.array([point.accZ for point in request.data])
        
        print(f"📊 Données reçues:")
        print(f"   - Nombre de points: {len(request.data)}")
        print(f"   - Fréquence d'échantillonnage: {request.sampling_rate} Hz")
        print(f"   - Plage AccX: [{acc_x.min():.3f}, {acc_x.max():.3f}]")
        print(f"   - Plage AccY: [{acc_y.min():.3f}, {acc_y.max():.3f}]")
        print(f"   - Plage AccZ: [{acc_z.min():.3f}, {acc_z.max():.3f}]")
        
        # Calculer le signal vibratoire
        vibration_signal = calculate_vibration_signal(acc_x, acc_y, acc_z)
        print(f"\n📈 Signal vibratoire:")
        print(f"   - Amplitude moyenne: {np.mean(vibration_signal):.3f}")
        print(f"   - Amplitude max: {np.max(vibration_signal):.3f}")
        print(f"   - Écart-type: {np.std(vibration_signal):.3f}")
        
        # Créer le spectrogramme 224x224
        spectrogram_grayscale, spectrogram_base64 = create_spectrogram_224x224(vibration_signal, request.sampling_rate)
        print(f"\n🖼️  Spectrogramme généré: 224x224 pixels")
        
        # Préparer l'input pour le modèle (normaliser entre 0 et 1)
        model_input = spectrogram_grayscale.astype(np.float32) / 255.0
        model_input = np.expand_dims(model_input, axis=0)  # Ajouter batch dimension -> (1, 224, 224, 1)
        
        print(f"\n🤖 Exécution du modèle ML...")
        print(f"   - Shape de l'input: {model_input.shape}")
        print(f"   - Min/Max de l'input: [{model_input.min():.3f}, {model_input.max():.3f}]")
        print(f"   - Moyenne de l'input: {model_input.mean():.3f}")
        
        # Faire la prédiction
        predictions = model.predict(model_input, verbose=0)
        print(f"   - Shape de la sortie: {predictions.shape}")
        print(f"   - Valeur brute de sortie: {predictions[0]}")
        
        # Le modèle peut avoir différentes sorties
        # Cas 1: Sortie binaire avec sigmoid (1 neurone) -> predictions shape: (1, 1)
        # Cas 2: Sortie multi-classe avec softmax (2+ neurones) -> predictions shape: (1, n_classes)
        
        if predictions.shape[1] == 1:
            # Sortie binaire (sigmoid)
            prob_fuite = float(predictions[0][0])
            prob_normal = 1.0 - prob_fuite
            
            # AJUSTEMENT: Le modèle a un biais fort vers "Fuite"
            # On utilise un seuil plus élevé pour compenser
            THRESHOLD = 0.95  # Au lieu de 0.5
            
            # Déterminer la classe prédite
            if prob_fuite > THRESHOLD:
                predicted_class = "Fuite"
                confidence = prob_fuite
            else:
                predicted_class = "Normal"
                confidence = prob_normal
            
            probabilities = {
                "Normal": prob_normal,
                "Fuite": prob_fuite
            }
            
            print(f"\n✅ RÉSULTAT DE LA PRÉDICTION (Binaire):")
            print(f"   - Prédiction: {predicted_class}")
            print(f"   - Confiance: {confidence*100:.2f}%")
            print(f"   - Probabilité Normal: {prob_normal*100:.2f}%")
            print(f"   - Probabilité Fuite: {prob_fuite*100:.2f}%")
        else:
            # Sortie multi-classe (softmax)
            classes = ["Normal", "Fuite"]  # Ajuster selon vos classes
            predicted_class_idx = np.argmax(predictions[0])
            predicted_class = classes[predicted_class_idx] if predicted_class_idx < len(classes) else f"Classe {predicted_class_idx}"
            confidence = float(predictions[0][predicted_class_idx])
            
            # Créer le dictionnaire des probabilités
            probabilities = {classes[i]: float(predictions[0][i]) for i in range(min(len(classes), predictions.shape[1]))}
            
            print(f"\n✅ RÉSULTAT DE LA PRÉDICTION (Multi-classe):")
            print(f"   - Prédiction: {predicted_class}")
            print(f"   - Confiance: {confidence*100:.2f}%")
            print(f"   - Probabilités:")
            for class_name, prob in probabilities.items():
                print(f"     • {class_name}: {prob*100:.2f}%")
        
        print("="*80 + "\n")
        
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
