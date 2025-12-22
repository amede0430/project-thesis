from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..websocket.manager import manager, simulate_sensor_updates
import asyncio

router = APIRouter()

@router.websocket("/ws/sensors")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Echo pour maintenir la connexion
            await websocket.send_text(f"Message reçu: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Démarrer la simulation en arrière-plan
async def start_simulation():
    from ..websocket.manager import simulate_sensor_updates
    asyncio.create_task(simulate_sensor_updates())