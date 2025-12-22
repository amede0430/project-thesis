from typing import List
from fastapi import WebSocket
import json
import asyncio
import random
from ..crud.sensor import get_sensors
from sqlalchemy.orm import Session
from ..db.database import SessionLocal
from ..models.sensor import SensorStatus

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(message))
            except:
                pass
    
    async def broadcast_to_channel(self, channel: str, message: dict):
        # Pour l'instant, broadcast à tous (on peut filtrer plus tard)
        await self.broadcast(message)

manager = ConnectionManager()

async def simulate_sensor_updates():
    """Simule des changements de statut des capteurs toutes les 5 secondes"""
    while True:
        try:
            db = SessionLocal()
            sensors = get_sensors(db)
            
            # Simuler un changement de statut aléatoire
            if sensors:
                sensor = random.choice(sensors)
                statuses = [SensorStatus.ACTIVE, SensorStatus.MAINTENANCE, SensorStatus.ERROR]
                new_status = random.choice(statuses)
                
                # Mettre à jour le statut en base
                sensor.status = new_status
                db.commit()
                
                # Envoyer la mise à jour via WebSocket
                update_message = {
                    "type": "sensor_update",
                    "sensor_id": sensor.id,
                    "name": sensor.name,
                    "status": sensor.status.value,
                    "location": sensor.location,
                    "latitude": sensor.latitude,
                    "longitude": sensor.longitude,
                    "sector": sensor.sector
                }
                
                await manager.broadcast(update_message)
            
            db.close()
            
        except Exception as e:
            print(f"Erreur simulation: {e}")
        
        await asyncio.sleep(60)  # Attendre 60 secondes