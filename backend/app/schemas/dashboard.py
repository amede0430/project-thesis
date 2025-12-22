from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from ..models.alert import AlertSeverity, AlertStatus, AlertType

class KPIResponse(BaseModel):
    total_sensors: int
    active_sensors: int
    alerts_count: int
    critical_alerts: int
    network_efficiency: float

class AlertResponse(BaseModel):
    id: int
    sensor_id: int
    sensor_name: str
    severity: AlertSeverity
    type: AlertType
    message: str
    status: AlertStatus
    created_at: datetime
    
    class Config:
        from_attributes = True

class ActivityResponse(BaseModel):
    id: int
    type: str
    title: str
    description: Optional[str]
    sensor_name: Optional[str]
    timestamp: datetime
    
    class Config:
        from_attributes = True

class SensorSummaryResponse(BaseModel):
    active: int
    maintenance: int
    error: int
    inactive: int
    leak_detected: int