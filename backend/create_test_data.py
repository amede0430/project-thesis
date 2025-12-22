from app.db.database import SessionLocal
from app.models.alert import Alert, AlertSeverity, AlertStatus, AlertType
from app.models.activity import Activity
from datetime import datetime, timedelta

def create_test_data():
    db = SessionLocal()
    
    # Créer quelques alertes de test
    alerts_data = [
        {
            "sensor_id": 2,
            "severity": AlertSeverity.CRITICAL,
            "type": AlertType.LEAK_DETECTED,
            "message": "Fuite détectée sur le capteur AQG-CTN-002",
            "status": AlertStatus.OPEN
        },
        {
            "sensor_id": 4,
            "severity": AlertSeverity.HIGH,
            "type": AlertType.SENSOR_OFFLINE,
            "message": "Capteur AQG-PNV-001 hors ligne depuis 15 minutes",
            "status": AlertStatus.ACKNOWLEDGED
        },
        {
            "sensor_id": 6,
            "severity": AlertSeverity.MEDIUM,
            "type": AlertType.MAINTENANCE_REQUIRED,
            "message": "Maintenance programmée pour AQG-ABM-001",
            "status": AlertStatus.OPEN
        }
    ]
    
    for alert_data in alerts_data:
        alert = Alert(**alert_data)
        db.add(alert)
    
    # Créer quelques activités de test
    activities_data = [
        {
            "type": "sensor_status_change",
            "title": "Statut capteur modifié",
            "description": "AQG-CTN-002 passé en mode fuite détectée",
            "sensor_id": 2
        },
        {
            "type": "alert_created",
            "title": "Nouvelle alerte critique",
            "description": "Fuite détectée nécessitant intervention immédiate",
            "sensor_id": 2
        },
        {
            "type": "user_login",
            "title": "Connexion utilisateur",
            "description": "Administrateur connecté au système",
            "user_id": 1
        },
        {
            "type": "sensor_maintenance",
            "title": "Maintenance capteur",
            "description": "Début maintenance préventive AQG-ABM-001",
            "sensor_id": 6
        }
    ]
    
    for activity_data in activities_data:
        activity = Activity(**activity_data)
        db.add(activity)
    
    db.commit()
    db.close()
    
    print("Données de test créées:")
    print("- 3 alertes (1 critique, 1 haute, 1 moyenne)")
    print("- 4 activités récentes")

if __name__ == "__main__":
    create_test_data()