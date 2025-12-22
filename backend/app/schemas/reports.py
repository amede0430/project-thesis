from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from app.models.report import ReportType, ReportStatus

class ReportBase(BaseModel):
    title: str
    type: ReportType
    start_date: datetime
    end_date: datetime

class ReportCreate(ReportBase):
    pass

class ReportResponse(ReportBase):
    id: int
    status: ReportStatus
    created_at: datetime
    completed_at: Optional[datetime] = None
    generated_by: int
    
    class Config:
        from_attributes = True

class ReportMetrics(BaseModel):
    total_reports: int
    pending_reports: int
    completed_reports: int
    failed_reports: int

class HistoryMetrics(BaseModel):
    total_alerts: int
    resolved_alerts: int
    active_sensors: int
    maintenance_sensors: int
    leak_detections: int
    system_uptime: str