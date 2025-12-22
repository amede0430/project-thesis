from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from ..db.database import get_db
from ..crud.sensor import get_sensors, get_sensor_by_id
from ..schemas.sensor import SensorResponse, SensorDetailResponse

router = APIRouter()

@router.get("/", response_model=List[SensorResponse])
async def list_sensors(db: Session = Depends(get_db)):
    sensors = get_sensors(db)
    return sensors

@router.get("/{sensor_id}", response_model=SensorResponse)
async def get_sensor(sensor_id: int, db: Session = Depends(get_db)):
    sensor = get_sensor_by_id(db, sensor_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    return sensor

@router.get("/{sensor_id}/details", response_model=SensorDetailResponse)
async def get_sensor_details(sensor_id: int, db: Session = Depends(get_db)):
    sensor = get_sensor_by_id(db, sensor_id)
    if not sensor:
        raise HTTPException(status_code=404, detail="Sensor not found")
    return sensor