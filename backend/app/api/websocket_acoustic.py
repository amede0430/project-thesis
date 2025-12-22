from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from ..websocket.manager import manager
from ..websocket.acoustic_manager import acoustic_background_task
import asyncio

router = APIRouter()

@router.websocket("/ws/acoustic")
async def websocket_acoustic_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    
    try:
        while True:
            # Garder la connexion ouverte
            data = await websocket.receive_text()
            # Echo pour maintenir la connexion
            await websocket.send_text(f"Message reçu: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)