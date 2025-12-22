from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..db.database import get_db
from ..models.sensor import Sensor
from ..schemas.sensor import SensorDetailResponse
from datetime import datetime

router = APIRouter()

@router.get("/{sensor_id}/details")
async def get_sensor_details(sensor_id: int, db: Session = Depends(get_db)):
    sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    
    return {
        "id": sensor.id,
        "name": sensor.name,
        "location": sensor.location,
        "latitude": sensor.latitude,
        "longitude": sensor.longitude,
        "sector": sensor.sector,
        "status": sensor.status.value,
        "created_at": sensor.created_at,
        "last_update": sensor.last_update,
        "model": sensor.model,
        "serial_number": sensor.serial_number,
        "installation_date": sensor.installation_date,
        "last_maintenance": sensor.last_maintenance,
        "network_type": sensor.network_type,
        "installation_depth": sensor.installation_depth,
        "pipe_diameter": sensor.pipe_diameter,
        "pipe_material": sensor.pipe_material,
        "signal_strength": sensor.signal_strength,
        "battery_level": sensor.battery_level,
        "last_communication": sensor.last_communication
    }

@router.get("/")
async def list_sensors(db: Session = Depends(get_db)):
    sensors = db.query(Sensor).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "location": s.location,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "sector": s.sector,
            "status": s.status.value,
            "created_at": s.created_at
        }
        for s in sensors
    ]