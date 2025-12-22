from sqlalchemy import Column, Integer, String, DateTime, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from ..db.database import Base
import enum

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    OPERATOR = "operator"
    VIEWER = "viewer"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.VIEWER)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    is_active = Column(String, default=True)
    
    # Relations (à définir après création des autres modèles)
    # activities = relationship("Activity", back_populates="user")
    # reports = relationship("Report", back_populates="user")