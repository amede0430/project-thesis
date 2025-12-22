#!/usr/bin/env python3
"""
Script pour nettoyer et recréer le capteur unique de Sakété
"""

from app.db.database import SessionLocal
from app.models.sensor import Sensor, SensorStatus
from datetime import datetime

def reset_sensors():
    """Supprime tous les capteurs et crée uniquement celui de Sakété"""
    db = SessionLocal()
    
    try:
        # Supprimer tous les capteurs existants
        deleted_count = db.query(Sensor).delete()
        print(f"Supprimé {deleted_count} capteurs existants")
        
        # Créer le capteur unique de Sakété
        sakete_sensor = Sensor(
            name="AQG-SAK-001",
            location="Site de Sakété",
            latitude=6.69168,
            longitude=2.64274,
            sector="Sakété",
            status=SensorStatus.ACTIVE,
            model="AquaGuard-Pro-v2",
            serial_number="SAK001-2024",
            installation_date=datetime.now(),
            network_type="distribution",
            installation_depth=1.5,
            pipe_diameter=200.0,
            pipe_material="PVC",
            signal_strength=85,
            battery_level=95
        )
        
        db.add(sakete_sensor)
        db.commit()
        
        print("✅ Capteur unique créé avec succès :")
        print(f"   - Nom: {sakete_sensor.name}")
        print(f"   - Localisation: {sakete_sensor.location}")
        print(f"   - Coordonnées: {sakete_sensor.latitude}°N, {sakete_sensor.longitude}°E")
        print(f"   - Secteur: {sakete_sensor.sector}")
        print(f"   - Statut: {sakete_sensor.status.value}")
        
    except Exception as e:
        print(f"❌ Erreur lors de la réinitialisation: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    reset_sensors()