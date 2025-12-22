from sqlalchemy import Column, Integer, String, Float, DateTime, Enum
from sqlalchemy.sql import func
from ..db.database import Base
from sqlalchemy.orm import relationship
import enum

class SensorStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"
    ERROR = "error"
    LEAK_DETECTED = "leak_detected"

class Sensor(Base):
    __tablename__ = "sensors"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    location = Column(String(200), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    sector = Column(String(50), nullable=False)
    status = Column(Enum(SensorStatus), default=SensorStatus.ACTIVE)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_update = Column(DateTime(timezone=True), server_default=func.now())
    
    # Informations techniques
    model = Column(String(100), default="AquaGuard-Pro-v2")
    serial_number = Column(String(50))
    installation_date = Column(DateTime(timezone=True))
    last_maintenance = Column(DateTime(timezone=True))
    network_type = Column(String(50), default="distribution")
    installation_depth = Column(Float, default=1.5)
    pipe_diameter = Column(Float, default=200.0)
    pipe_material = Column(String(50), default="PVC")
    
    # Statut connexion
    signal_strength = Column(Integer, default=85)
    battery_level = Column(Integer, default=95)
    last_communication = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relations
    sensor_data = relationship("SensorData", back_populates="sensor")
    analysis_history = relationship("AnalysisHistory", back_populates="sensor")
    # alerts = relationship("Alert", back_populates="sensor")
    # activities = relationship("Activity", back_populates="sensor")