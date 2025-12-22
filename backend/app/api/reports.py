from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db.database import get_db
from app.api.auth import get_current_user
from app.models.user import User
from app.schemas.reports import ReportResponse, ReportCreate, ReportMetrics, HistoryMetrics
from app.crud import reports as crud_reports

router = APIRouter()

@router.get("/", response_model=List[ReportResponse])
def get_reports(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer la liste des rapports"""
    return crud_reports.get_reports(db, skip=skip, limit=limit)

@router.post("/", response_model=ReportResponse)
def create_report(
    report: ReportCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Créer un nouveau rapport"""
    return crud_reports.create_report(db, report=report, user_id=current_user.id)

@router.get("/metrics", response_model=ReportMetrics)
def get_report_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer les métriques des rapports"""
    return crud_reports.get_report_metrics(db)

@router.get("/history/metrics", response_model=HistoryMetrics)
def get_history_metrics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Récupérer les métriques de l'historique"""
    return crud_reports.get_history_metrics(db)