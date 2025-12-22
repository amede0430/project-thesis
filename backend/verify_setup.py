#!/usr/bin/env python3
"""
Script de vérification de la configuration Sakété
"""

from app.db.database import SessionLocal
from app.models.sensor import Sensor
from app.models.user import User

def verify_setup():
    """Vérifie que la configuration est correcte"""
    db = SessionLocal()
    
    try:
        # Vérifier les utilisateurs
        users = db.query(User).all()
        print(f"👥 Utilisateurs: {len(users)}")
        for user in users:
            print(f"   - {user.username} ({user.role})")
        
        # Vérifier les capteurs
        sensors = db.query(Sensor).all()
        print(f"\n📡 Capteurs: {len(sensors)}")
        
        if len(sensors) == 1:
            sensor = sensors[0]
            print(f"   ✅ Capteur unique configuré:")
            print(f"      - Nom: {sensor.name}")
            print(f"      - Localisation: {sensor.location}")
            print(f"      - Coordonnées: {sensor.latitude}°N, {sensor.longitude}°E")
            print(f"      - Secteur: {sensor.sector}")
            print(f"      - Statut: {sensor.status.value}")
            
            # Vérifier les coordonnées de Sakété
            if abs(sensor.latitude - 6.69168) < 0.001 and abs(sensor.longitude - 2.64274) < 0.001:
                print("   ✅ Coordonnées de Sakété correctes")
            else:
                print("   ❌ Coordonnées incorrectes")
        else:
            print(f"   ❌ Nombre de capteurs incorrect: {len(sensors)} (attendu: 1)")
            
    except Exception as e:
        print(f"❌ Erreur lors de la vérification: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    print("🔍 Vérification de la configuration AquaGuard Sakété\n")
    verify_setup()
    print("\n✅ Vérification terminée")