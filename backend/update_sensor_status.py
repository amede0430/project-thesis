#!/usr/bin/env python3
"""
Script pour mettre à jour le statut du capteur de Sakété
"""

from app.db.database import SessionLocal
from app.models.sensor import Sensor, SensorStatus

def update_sensor_status():
    """Met le capteur de Sakété en statut ACTIF"""
    db = SessionLocal()
    
    try:
        # Récupérer le capteur de Sakété
        sakete_sensor = db.query(Sensor).filter(Sensor.name == "AQG-SAK-001").first()
        
        if sakete_sensor:
            # Mettre à jour le statut
            sakete_sensor.status = SensorStatus.ACTIVE
            db.commit()
            
            print("✅ Statut du capteur mis à jour :")
            print(f"   - Nom: {sakete_sensor.name}")
            print(f"   - Localisation: {sakete_sensor.location}")
            print(f"   - Ancien statut: maintenance")
            print(f"   - Nouveau statut: {sakete_sensor.status.value}")
        else:
            print("❌ Capteur AQG-SAK-001 non trouvé")
            
    except Exception as e:
        print(f"❌ Erreur lors de la mise à jour: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    print("🔄 Mise à jour du statut du capteur Sakété\n")
    update_sensor_status()
    print("\n✅ Mise à jour terminée")