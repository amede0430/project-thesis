#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.models.sensor import Sensor
import uvicorn

app = FastAPI(title="AquaGuard Simple")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/auth/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == form_data.username).first()
    
    if not user:
        raise HTTPException(status_code=401, detail="Utilisateur non trouvé")
    
    # Login simple : mot de passe en clair pour debug
    if user.password_hash != form_data.password:
        raise HTTPException(status_code=401, detail="Mot de passe incorrect")
    
    return {
        "access_token": "fake-jwt-token",
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "username": user.username,
            "role": user.role.value
        }
    }

@app.get("/sensors/{sensor_id}/details")
async def get_sensor_details(sensor_id: int, db: Session = Depends(get_db)):
    sensor = db.query(Sensor).filter(Sensor.id == sensor_id).first()
    if not sensor:
        raise HTTPException(status_code=404, detail="Capteur non trouvé")
    
    return {
        "id": sensor.id,
        "name": sensor.name,
        "location": sensor.location,
        "status": sensor.status.value,
        "model": sensor.model,
        "serial_number": sensor.serial_number,
        "signal_strength": sensor.signal_strength,
        "battery_level": sensor.battery_level
    }

@app.get("/health")
async def health():
    return {"status": "ok"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)