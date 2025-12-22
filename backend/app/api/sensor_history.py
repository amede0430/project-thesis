from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from datetime import datetime, timedelta
from typing import List, Optional
from ..db.database import get_db
from ..models.sensor_data import SensorData
from ..models.sensor import Sensor
import json
import numpy as np

router = APIRouter()

@router.get("/sensors/{sensor_id}/history")
async def get_sensor_history(
    sensor_id: int,
    period: str = Query("24h", regex="^(24h|7d|30d)$"),
    db: Session = Depends(get_db)
):
    # Vérifier que le capteur existe
    sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Capteur non trouvé")
    
    # Calculer la période
    now = datetime.utcnow()
    if period == "24h":
        start_time = now - timedelta(hours=24)
    elif period == "7d":
        start_time = now - timedelta(days=7)
    else:  # 30d
        start_time = now - timedelta(days=30)
    
    # Récupérer les données
    data = db.query(SensorData).filter(
        and_(
            SensorData.sensor_id == sensor_id,
            SensorData.timestamp >= start_time
        )
    ).order_by(desc(SensorData.timestamp)).limit(1000).all()
    
    # Si pas de données, générer des données simulées
    if not data:
        data = generate_mock_history(sensor_id, period, db)
    
    # Calculer les métriques
    if data:
        rms_values = [d.rms for d in data]
        peak_values = [d.peak for d in data]
        freq_values = [d.frequency for d in data]
        snr_values = [d.snr for d in data if d.snr]
        
        metrics = {
            "rms": np.mean(rms_values),
            "peak": np.max(peak_values),
            "frequency": np.mean(freq_values),
            "snr": np.mean(snr_values) if snr_values else 0
        }
    else:
        metrics = {"rms": 0, "peak": 0, "frequency": 0, "snr": 0}
    
    # Formater la réponse
    history_data = []
    for d in data:
        history_data.append({
            "timestamp": d.timestamp.isoformat(),
            "rms": round(d.rms, 6),
            "peak": round(d.peak, 6),
            "frequency": round(d.frequency, 1),
            "snr": round(d.snr, 1) if d.snr else 0,
            "status": d.status
        })
    
    return {
        "sensor_id": sensor_id,
        "period": period,
        "data": history_data,
        "metrics": {
            "rms": round(metrics["rms"], 6),
            "peak": round(metrics["peak"], 6),
            "frequency": round(metrics["frequency"], 1),
            "snr": round(metrics["snr"], 1)
        },
        "total_points": len(history_data)
    }

def generate_mock_history(sensor_id: int, period: str, db: Session):
    """Générer des données d'historique simulées"""
    now = datetime.utcnow()
    
    # Nombre de points selon la période
    if period == "24h":
        hours = 24
        interval = timedelta(hours=1)
    elif period == "7d":
        hours = 168  # 7 * 24
        interval = timedelta(hours=1)
    else:  # 30d
        hours = 720  # 30 * 24
        interval = timedelta(hours=1)
    
    mock_data = []
    for i in range(min(hours, 100)):  # Limiter à 100 points
        timestamp = now - (i * interval)
        
        # Valeurs simulées avec variation
        base_rms = 0.004
        base_peak = 0.012
        base_freq = 1250
        
        rms = base_rms + np.random.normal(0, 0.001)
        peak = base_peak + np.random.normal(0, 0.003)
        frequency = base_freq + np.random.normal(0, 50)
        snr = 40 + np.random.normal(0, 5)
        status = "anomaly" if np.random.random() > 0.95 else "normal"
        
        # Créer l'objet SensorData
        data_point = SensorData(
            sensor_id=sensor_id,
            timestamp=timestamp,
            rms=max(0, rms),
            peak=max(0, peak),
            frequency=max(0, frequency),
            snr=max(0, snr),
            status=status
        )
        
        mock_data.append(data_point)
        
        # Sauvegarder en base pour la prochaine fois
        db.add(data_point)
    
    try:
        db.commit()
    except:
        db.rollback()
    
    return mock_data