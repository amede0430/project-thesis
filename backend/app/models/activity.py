from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..db.database import Base

class Activity(Base):
    __tablename__ = "activities"

    id = Column(Integer, primary_key=True, index=True)
    type = Column(String(50), nullable=False)  # "sensor_status_change", "alert_created", "user_login"
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    sensor_id = Column(Integer, ForeignKey("sensors.id"), nullable=True)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relations (temporairement désactivées)
    # user = relationship("User", back_populates="activities")
    # sensor = relationship("Sensor", back_populates="activities")