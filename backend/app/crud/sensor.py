from sqlalchemy.orm import Session
from ..models.sensor import Sensor
from typing import List

def get_sensors(db: Session) -> List[Sensor]:
    return db.query(Sensor).all()

def get_sensor_by_id(db: Session, sensor_id: int) -> Sensor:
    return db.query(Sensor).filter(Sensor.id == sensor_id).first()