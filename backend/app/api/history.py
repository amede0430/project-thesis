from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from typing import List, Optional
from datetime import datetime, timedelta
from ..db.database import get_db
from ..models.analysis_history import AnalysisHistory
from ..models.sensor import Sensor

router = APIRouter()

@router.get("/history/analyses")
async def get_analysis_history(
    db: Session = Depends(get_db),
    sensor_id: Optional[int] = Query(None, description="ID du capteur"),
    status: Optional[str] = Query(None, description="Statut (normal, warning, anomaly)"),
    days: Optional[int] = Query(7, description="Nombre de jours d'historique"),
    limit: Optional[int] = Query(50, description="Nombre maximum de résultats")
):
    """Récupère l'historique des analyses IA"""
    
    query = db.query(AnalysisHistory)
    
    # Filtrer par capteur si spécifié
    if sensor_id:
        query = query.filter(AnalysisHistory.sensor_id == sensor_id)
    
    # Filtrer par statut si spécifié
    if status:
        query = query.filter(AnalysisHistory.status == status)
    
    # Filtrer par période
    if days:
        start_date = datetime.utcnow() - timedelta(days=days)
        query = query.filter(AnalysisHistory.timestamp >= start_date)
    
    # Ordonner par date décroissante et limiter
    analyses = query.order_by(desc(AnalysisHistory.timestamp)).limit(limit).all()
    
    # Formater les résultats
    results = []
    for analysis in analyses:
        results.append({
            "id": analysis.id,
            "sensor_id": analysis.sensor_id,
            "timestamp": analysis.timestamp.isoformat(),
            "status": analysis.status,
            "confidence": analysis.confidence,
            "severity": analysis.severity,
            "rms": analysis.rms,
            "peak": analysis.peak,
            "frequency": analysis.frequency,
            "model_version": analysis.model_version,
            "processing_time": analysis.processing_time,
            "is_significant": analysis.is_significant
        })
    
    return results

@router.get("/history/analyses/{analysis_id}")
async def get_analysis_detail(analysis_id: int, db: Session = Depends(get_db)):
    """Récupère le détail d'une analyse spécifique"""
    
    analysis = db.query(AnalysisHistory).filter(AnalysisHistory.id == analysis_id).first()
    
    if not analysis:
        raise HTTPException(status_code=404, detail="Analyse non trouvée")
    
    return {
        "id": analysis.id,
        "sensor_id": analysis.sensor_id,
        "timestamp": analysis.timestamp.isoformat(),
        "status": analysis.status,
        "confidence": analysis.confidence,
        "severity": analysis.severity,
        "rms": analysis.rms,
        "peak": analysis.peak,
        "frequency": analysis.frequency,
        "signal_data": analysis.signal_data,
        "spectrogram_data": analysis.spectrogram_data,
        "model_version": analysis.model_version,
        "processing_time": analysis.processing_time,
        "is_significant": analysis.is_significant
    }

@router.get("/history/statistics")
async def get_history_statistics(
    db: Session = Depends(get_db),
    days: Optional[int] = Query(7, description="Nombre de jours pour les statistiques")
):
    """Récupère les statistiques de l'historique"""
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Compter par statut
    total_analyses = db.query(AnalysisHistory).filter(
        AnalysisHistory.timestamp >= start_date
    ).count()
    
    normal_count = db.query(AnalysisHistory).filter(
        AnalysisHistory.timestamp >= start_date,
        AnalysisHistory.status == "normal"
    ).count()
    
    warning_count = db.query(AnalysisHistory).filter(
        AnalysisHistory.timestamp >= start_date,
        AnalysisHistory.status == "warning"
    ).count()
    
    anomaly_count = db.query(AnalysisHistory).filter(
        AnalysisHistory.timestamp >= start_date,
        AnalysisHistory.status == "anomaly"
    ).count()
    
    significant_count = db.query(AnalysisHistory).filter(
        AnalysisHistory.timestamp >= start_date,
        AnalysisHistory.is_significant == True
    ).count()
    
    return {
        "period_days": days,
        "total_analyses": total_analyses,
        "normal_count": normal_count,
        "warning_count": warning_count,
        "anomaly_count": anomaly_count,
        "significant_count": significant_count,
        "normal_percentage": (normal_count / total_analyses * 100) if total_analyses > 0 else 0,
        "warning_percentage": (warning_count / total_analyses * 100) if total_analyses > 0 else 0,
        "anomaly_percentage": (anomaly_count / total_analyses * 100) if total_analyses > 0 else 0
    }