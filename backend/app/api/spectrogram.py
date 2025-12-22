from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from app.services.dataset_service import DatasetService
from app.services.spectrogram_service import SpectrogramService
import base64

router = APIRouter(prefix="/spectrogram", tags=["spectrogram"])
dataset_service = DatasetService()

@router.get("/sensor/{sensor_id}/image")
async def get_spectrogram_image(sensor_id: str):
    """Génère l'image PNG du spectrogramme pour un capteur"""
    result = dataset_service.get_next_segment(sensor_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Aucune donnée disponible")
    
    # Récupérer les données du signal
    import pandas as pd
    signal_data = pd.DataFrame(result["signal_data"])
    
    try:
        image_base64 = SpectrogramService.generate_spectrogram_image(signal_data)
        image_bytes = base64.b64decode(image_base64)
        
        return Response(
            content=image_bytes,
            media_type="image/png",
            headers={"Content-Disposition": f"inline; filename=spectrogram_{sensor_id}.png"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erreur génération spectrogramme: {str(e)}")

@router.get("/sensor/{sensor_id}/data")
async def get_spectrogram_data(sensor_id: str):
    """Récupère les données brutes du spectrogramme"""
    result = dataset_service.get_next_segment(sensor_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Aucune donnée disponible")
    
    return {
        "sensor_id": sensor_id,
        "spectrogram": result["spectrogram"],
        "features": result["features"],
        "is_leak": result["is_leak"]
    }