from fastapi import APIRouter, HTTPException
from typing import Dict, List
from app.services.dataset_service import DatasetService

router = APIRouter(prefix="/dataset", tags=["dataset"])
dataset_service = DatasetService()

@router.get("/files")
async def get_available_files():
    """Liste tous les fichiers CSV disponibles"""
    return dataset_service.get_available_files()

@router.get("/config")
async def get_dataset_config():
    """Récupère la configuration complète du dataset"""
    return dataset_service.config

@router.get("/sensor/{sensor_id}/files")
async def get_sensor_files(sensor_id: str):
    """Récupère les fichiers associés à un capteur"""
    files = dataset_service.get_sensor_files(sensor_id)
    if not files:
        raise HTTPException(status_code=404, detail="Capteur non trouvé")
    return files

@router.post("/sensor/{sensor_id}/assign")
async def assign_files_to_sensor(
    sensor_id: str,
    normal_files: List[str],
    leak_files: List[str],
    network_type: str
):
    """Assigne des fichiers à un capteur"""
    dataset_service.assign_files_to_sensor(sensor_id, normal_files, leak_files, network_type)
    return {"message": f"Fichiers assignés au capteur {sensor_id}"}

@router.post("/sensor/{sensor_id}/leak-mode")
async def toggle_leak_mode(sensor_id: str, leak_mode: bool):
    """Active/désactive le mode fuite pour un capteur"""
    dataset_service.toggle_leak_mode(sensor_id, leak_mode)
    return {"message": f"Mode fuite {'activé' if leak_mode else 'désactivé'} pour le capteur {sensor_id}"}

@router.get("/sensor/{sensor_id}/next-segment")
async def get_next_segment(sensor_id: str):
    """Récupère le prochain segment avec spectrogramme pour un capteur"""
    result = dataset_service.get_next_segment(sensor_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Aucune donnée disponible pour ce capteur")
    
    return result