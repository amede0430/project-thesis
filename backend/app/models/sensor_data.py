from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from ..db.database import Base
from datetime import datetime

class SensorData(Base):
    __tablename__ = "sensor_data"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(Integer, ForeignKey("sensors.id"), nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    rms = Column(Float, nullable=False)
    peak = Column(Float, nullable=False)
    frequency = Column(Float, nullable=False)
    snr = Column(Float, nullable=True)
    status = Column(String(20), default="normal")  # normal, anomaly
    raw_data = Column(Text, nullable=True)  # JSON des données brutes
    
    # Relation
    sensor = relationship("Sensor", back_populates="sensor_data")