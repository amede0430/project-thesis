from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.alert import AlertSeverity, AlertStatus, AlertType

class AlertResponse(BaseModel):
    id: int
    sensor_id: int
    sensor_name: str
    sensor_location: str
    severity: AlertSeverity
    status: AlertStatus
    type: AlertType
    message: str
    confidence: float
    created_at: datetime
    resolved_at: Optional[datetime] = None
    assigned_to: Optional[int] = None
    assigned_user_name: Optional[str] = None
    
    class Config:
        from_attributes = True

class AlertStatusUpdate(BaseModel):
    status: AlertStatus
    assigned_to: Optional[int] = None

class AlertNote(BaseModel):
    content: str