from app.db.database import SessionLocal
from app.models.sensor import Sensor, SensorStatus

def create_sensors():
    db = SessionLocal()
    
    # Supprimer tous les capteurs existants
    db.query(Sensor).delete()
    
    # Un seul capteur à Sakété
    sensor_data = {
        "name": "AQG-SAK-001",
        "location": "Site de Sakété",
        "latitude": 6.69168,
        "longitude": 2.64274,
        "sector": "Sakété"
    }
    
    sensor = Sensor(**sensor_data, status=SensorStatus.ACTIVE)
    db.add(sensor)
    
    db.commit()
    db.close()
    
    print("Capteur unique créé avec succès à Sakété")
    print(f"- {sensor_data['name']}: {sensor_data['location']} ({sensor_data['latitude']}, {sensor_data['longitude']})")

if __name__ == "__main__":
    create_sensors()