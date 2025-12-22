from sqlalchemy.orm import Session, joinedload
from app.models.alert import Alert
from app.models.sensor import Sensor
from app.models.user import User
from app.schemas.alerts import AlertStatusUpdate
from datetime import datetime

def get_alert_by_id(db: Session, alert_id: int):
    return db.query(Alert).options(
        joinedload(Alert.sensor),
        joinedload(Alert.assigned_user)
    ).filter(Alert.id == alert_id).first()

def update_alert_status(db: Session, alert_id: int, status_update: AlertStatusUpdate):
    alert = db.query(Alert).filter(Alert.id == alert_id).first()
    if alert:
        alert.status = status_update.status
        if status_update.assigned_to:
            alert.assigned_to = status_update.assigned_to
        if status_update.status.value == "RESOLVED":
            alert.resolved_at = datetime.utcnow()
        db.commit()
        db.refresh(alert)
    return alert