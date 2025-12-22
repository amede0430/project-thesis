from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.orm import relationship
from ..db.database import Base
from datetime import datetime

class AnalysisHistory(Base):
    __tablename__ = "analysis_history"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(Integer, ForeignKey("sensors.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # Résultats de l'analyse
    status = Column(String(20), nullable=False)  # normal, warning, anomaly
    confidence = Column(Float, nullable=False)   # 0.0 à 1.0
    severity = Column(Float, nullable=False)     # 0.0 à 1.0
    
    # Métriques du signal
    rms = Column(Float, nullable=False)
    peak = Column(Float, nullable=False)
    frequency = Column(Float, nullable=False)
    
    # Données brutes (optionnel)
    signal_data = Column(Text, nullable=True)    # JSON du signal
    spectrogram_data = Column(Text, nullable=True)  # JSON du spectrogramme
    
    # Métadonnées
    model_version = Column(String(50), default="v1.0")
    processing_time = Column(Float, nullable=True)  # Temps de traitement en ms
    is_significant = Column(Boolean, default=False)  # Marqué comme significatif
    
    # Relations
    sensor = relationship("Sensor", back_populates="analysis_history")
    
    def __repr__(self):
        return f"<AnalysisHistory(id={self.id}, status={self.status}, confidence={self.confidence})>"