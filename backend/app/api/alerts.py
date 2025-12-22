from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.schemas.alerts import AlertResponse, AlertStatusUpdate
from app.crud import alerts as crud_alerts

router = APIRouter()

@router.get("/{alert_id}", response_model=AlertResponse)
def get_alert(
    alert_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer les détails d'une alerte"""
    alert = crud_alerts.get_alert_by_id(db, alert_id=alert_id)
    if not alert:
        raise HTTPException(status_code=404, detail="Alerte non trouvée")
    
    return AlertResponse(
        id=alert.id,
        sensor_id=alert.sensor_id,
        sensor_name=alert.sensor.name,
        sensor_location=alert.sensor.location,
        severity=alert.severity,
        status=alert.status,
        type=alert.type,
        message=alert.message,
        confidence=alert.confidence,
        created_at=alert.created_at,
        resolved_at=alert.resolved_at,
        assigned_to=alert.assigned_to,
        assigned_user_name=alert.assigned_user.username if alert.assigned_user else None
    )

@router.put("/{alert_id}/status", response_model=AlertResponse)
def update_alert_status(
    alert_id: int,
    status_update: AlertStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mettre à jour le statut d'une alerte"""
    alert = crud_alerts.update_alert_status(db, alert_id=alert_id, status_update=status_update)
    if not alert:
        raise HTTPException(status_code=404, detail="Alerte non trouvée")
    
    return AlertResponse(
        id=alert.id,
        sensor_id=alert.sensor_id,
        sensor_name=alert.sensor.name,
        sensor_location=alert.sensor.location,
        severity=alert.severity,
        status=alert.status,
        type=alert.type,
        message=alert.message,
        confidence=alert.confidence,
        created_at=alert.created_at,
        resolved_at=alert.resolved_at,
        assigned_to=alert.assigned_to,
        assigned_user_name=alert.assigned_user.username if alert.assigned_user else None
    )