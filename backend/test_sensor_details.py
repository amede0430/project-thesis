#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.models.sensor import Sensor
import json

def test_sensor_details():
    db = SessionLocal()
    try:
        sensor = db.query(Sensor).first()
        if sensor:
            print("✅ Capteur trouvé:")
            print(f"ID: {sensor.id}")
            print(f"Nom: {sensor.name}")
            print(f"Modèle: {sensor.model}")
            print(f"Série: {sensor.serial_number}")
            print(f"Signal: {sensor.signal_strength}%")
            print(f"Batterie: {sensor.battery_level}%")
        else:
            print("❌ Aucun capteur trouvé")
    except Exception as e:
        print(f"❌ Erreur: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_sensor_details()