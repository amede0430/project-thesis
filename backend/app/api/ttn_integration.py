from fastapi import APIRouter
import asyncio
from datetime import datetime

router = APIRouter()

class TTNIntegration:
    def __init__(self):
        self.data_buffer = []
        self.is_running = False
        self.latest_analysis = None

    async def start_ttn_listener(self):
        if self.is_running:
            return
        self.is_running = True
        print("🔄 Démarrage de l'intégration ThingSpeak...")
        
        while self.is_running:
            try:
                print("⏳ En attente de l'API ThingSpeak...")
                await asyncio.sleep(30)
            except Exception as e:
                print(f"❌ Erreur: {e}")
                await asyncio.sleep(60)

    def get_recent_data(self, minutes: int = 10):
        return []

    async def get_latest_analysis(self):
        return None

# Instance globale
ttn_integration = TTNIntegration()

@router.on_event("startup")
async def start_integration():
    asyncio.create_task(ttn_integration.start_ttn_listener())

@router.get("/status")
async def get_integration_status():
    return {
        "is_running": ttn_integration.is_running,
        "buffer_size": len(ttn_integration.data_buffer),
        "ready_for_thingspeak": True
    }
