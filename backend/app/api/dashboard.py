from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from ..db.database import get_db
from ..crud.dashboard import get_kpis, get_recent_alerts, get_recent_activities, get_sensors_summary
from ..schemas.dashboard import KPIResponse, AlertResponse, ActivityResponse, SensorSummaryResponse

router = APIRouter()

@router.get("/kpis", response_model=KPIResponse)
async def dashboard_kpis(db: Session = Depends(get_db)):
    return get_kpis(db)

@router.get("/alerts", response_model=List[AlertResponse])
async def dashboard_alerts(limit: int = 5, db: Session = Depends(get_db)):
    alerts = get_recent_alerts(db, limit)
    return [
        AlertResponse(
            id=alert.id,
            sensor_id=alert.sensor_id,
            sensor_name=alert.sensor.name,
            severity=alert.severity,
            type=alert.type,
            message=alert.message,
            status=alert.status,
            created_at=alert.created_at
        )
        for alert in alerts
    ]

@router.get("/activities", response_model=List[ActivityResponse])
async def dashboard_activities(limit: int = 10, db: Session = Depends(get_db)):
    activities = get_recent_activities(db, limit)
    return [
        ActivityResponse(
            id=activity.id,
            type=activity.type,
            title=activity.title,
            description=activity.description,
            sensor_name=activity.sensor.name if activity.sensor else None,
            timestamp=activity.timestamp
        )
        for activity in activities
    ]

@router.get("/sensors-summary", response_model=SensorSummaryResponse)
async def dashboard_sensors_summary(db: Session = Depends(get_db)):
    return get_sensors_summary(db)