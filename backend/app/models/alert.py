from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..db.database import Base
import enum

class AlertSeverity(enum.Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class AlertStatus(enum.Enum):
    OPEN = "open"
    ACKNOWLEDGED = "acknowledged"
    RESOLVED = "resolved"

class AlertType(enum.Enum):
    LEAK_DETECTED = "leak_detected"
    SENSOR_OFFLINE = "sensor_offline"
    MAINTENANCE_REQUIRED = "maintenance_required"
    SYSTEM_ERROR = "system_error"

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(Integer, primary_key=True, index=True)
    sensor_id = Column(Integer, ForeignKey("sensors.id"), nullable=False)
    severity = Column(Enum(AlertSeverity), nullable=False)
    type = Column(Enum(AlertType), nullable=False)
    message = Column(Text, nullable=False)
    status = Column(Enum(AlertStatus), default=AlertStatus.OPEN)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    resolved_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relation avec Sensor (temporairement désactivée)
    # sensor = relationship("Sensor", back_populates="alerts")