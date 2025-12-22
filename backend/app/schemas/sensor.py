from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from ..models.sensor import SensorStatus

class SensorBase(BaseModel):
    name: str
    location: str
    latitude: float
    longitude: float
    sector: str
    status: SensorStatus

class SensorDetailResponse(SensorBase):
    id: int
    created_at: datetime
    last_update: Optional[datetime]
    
    # Informations techniques
    model: Optional[str]
    serial_number: Optional[str]
    installation_date: Optional[datetime]
    last_maintenance: Optional[datetime]
    network_type: Optional[str]
    installation_depth: Optional[float]
    pipe_diameter: Optional[float]
    pipe_material: Optional[str]
    
    # Statut connexion
    signal_strength: Optional[int]
    battery_level: Optional[int]
    last_communication: Optional[datetime]
    
    class Config:
        from_attributes = True

class SensorResponse(SensorBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True