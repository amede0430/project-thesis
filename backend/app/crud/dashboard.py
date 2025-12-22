from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from ..models.sensor import Sensor, SensorStatus
from ..models.alert import Alert, AlertStatus, AlertSeverity
from ..models.activity import Activity
from typing import List

def get_kpis(db: Session):
    total_sensors = db.query(Sensor).count()
    active_sensors = db.query(Sensor).filter(Sensor.status == SensorStatus.ACTIVE).count()
    alerts_count = db.query(Alert).filter(Alert.status == AlertStatus.OPEN).count()
    critical_alerts = db.query(Alert).filter(
        Alert.status == AlertStatus.OPEN,
        Alert.severity == AlertSeverity.CRITICAL
    ).count()
    
    # Calcul efficacité réseau (% capteurs actifs)
    network_efficiency = (active_sensors / total_sensors * 100) if total_sensors > 0 else 0
    
    return {
        "total_sensors": total_sensors,
        "active_sensors": active_sensors,
        "alerts_count": alerts_count,
        "critical_alerts": critical_alerts,
        "network_efficiency": round(network_efficiency, 1)
    }

def get_recent_alerts(db: Session, limit: int = 5) -> List[Alert]:
    return db.query(Alert).order_by(desc(Alert.created_at)).limit(limit).all()

def get_recent_activities(db: Session, limit: int = 10) -> List[Activity]:
    return db.query(Activity).order_by(desc(Activity.timestamp)).limit(limit).all()

def get_sensors_summary(db: Session):
    sensors = db.query(Sensor).all()
    summary = {
        "active": 0,
        "maintenance": 0,
        "error": 0,
        "inactive": 0,
        "leak_detected": 0
    }
    
    for sensor in sensors:
        status_key = sensor.status.value.lower()
        if status_key in summary:
            summary[status_key] += 1
    
    return summary