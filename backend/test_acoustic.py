#!/usr/bin/env python3

import asyncio
import json
import numpy as np
from pathlib import Path
from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Données de test simples
def generate_test_data():
    # Signal sinusoïdal simple
    t = np.linspace(0, 2, 1000)
    signal = np.sin(2 * np.pi * 50 * t) + 0.5 * np.sin(2 * np.pi * 120 * t)
    
    # Spectrogramme simple (matrice aléatoire)
    spectrogram = np.random.randint(0, 255, (64, 32)).tolist()
    frequencies = np.linspace(0, 4000, 64).tolist()
    times = np.linspace(0, 2, 32).tolist()
    
    return {
        "waveform": {
            "samples": t.tolist(),
            "values": signal.tolist()
        },
        "spectrogram": spectrogram,
        "spectrogram_meta": {
            "frequencies": frequencies,
            "times": times
        }
    }

connections = []

@app.websocket("/ws/acoustic")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connections.append(websocket)
    print(f"Client connecté. Total: {len(connections)}")
    
    try:
        while True:
            await websocket.receive_text()
    except:
        connections.remove(websocket)
        print(f"Client déconnecté. Total: {len(connections)}")

async def broadcast_data():
    while True:
        if connections:
            data = generate_test_data()
            
            # Envoyer waveform_update
            waveform_msg = {
                "type": "waveform_update",
                "waveform": data["waveform"],
                "spectrogram_meta": data["spectrogram_meta"]
            }
            
            # Envoyer spectrogram_update
            spectrogram_msg = {
                "type": "spectrogram_update",
                "spectrogram": data["spectrogram"],
                "spectrogram_meta": data["spectrogram_meta"]
            }
            
            for ws in connections.copy():
                try:
                    await ws.send_text(json.dumps(waveform_msg))
                    await ws.send_text(json.dumps(spectrogram_msg))
                except:
                    connections.remove(ws)
            
            print(f"Données envoyées à {len(connections)} clients")
        
        await asyncio.sleep(2)

@app.on_event("startup")
async def startup():
    asyncio.create_task(broadcast_data())
    print("Serveur de test acoustique démarré")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)