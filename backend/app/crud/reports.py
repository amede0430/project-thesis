from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.models.report import Report, ReportStatus
from app.models.alert import Alert, AlertStatus
from app.models.sensor import Sensor, SensorStatus
from app.schemas.reports import ReportCreate, ReportMetrics, HistoryMetrics
from datetime import datetime, timedelta

def get_reports(db: Session, skip: int = 0, limit: int = 10):
    return db.query(Report).order_by(desc(Report.created_at)).offset(skip).limit(limit).all()

def create_report(db: Session, report: ReportCreate, user_id: int):
    db_report = Report(
        title=report.title,
        type=report.type,
        start_date=report.start_date,
        end_date=report.end_date,
        generated_by=user_id,
        status=ReportStatus.PENDING
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    return db_report

def get_report_metrics(db: Session) -> ReportMetrics:
    total = db.query(Report).count()
    pending = db.query(Report).filter(Report.status == ReportStatus.PENDING).count()
    completed = db.query(Report).filter(Report.status == ReportStatus.COMPLETED).count()
    failed = db.query(Report).filter(Report.status == ReportStatus.FAILED).count()
    
    return ReportMetrics(
        total_reports=total,
        pending_reports=pending,
        completed_reports=completed,
        failed_reports=failed
    )

def get_history_metrics(db: Session) -> HistoryMetrics:
    total_alerts = db.query(Alert).count()
    resolved_alerts = db.query(Alert).filter(Alert.status == AlertStatus.RESOLVED).count()
    active_sensors = db.query(Sensor).filter(Sensor.status == SensorStatus.ACTIVE).count()
    maintenance_sensors = db.query(Sensor).filter(Sensor.status == SensorStatus.MAINTENANCE).count()
    leak_detections = db.query(Alert).filter(Alert.type.like('%LEAK%')).count()
    
    return HistoryMetrics(
        total_alerts=total_alerts,
        resolved_alerts=resolved_alerts,
        active_sensors=active_sensors,
        maintenance_sensors=maintenance_sensors,
        leak_detections=leak_detections,
        system_uptime="Pas disponible"
    )