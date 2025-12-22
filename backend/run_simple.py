#!/usr/bin/env python3
import uvicorn
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.user import User
from app.models.sensor import Sensor

app = FastAPI(title="AquaGuard API Simple", version="1.0.0")

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
    if not user or user.password_hash != form_data.password:
        raise HTTPException(status_code=401, detail="Identifiants incorrects")
    
    return {
        "access_token": "fake-token-for-dev",
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
        raise HTTPException(status_code=404, detail="Sensor not found")
    
    return {
        "id": sensor.id,
        "name": sensor.name,
        "location": sensor.location,
        "latitude": sensor.latitude,
        "longitude": sensor.longitude,
        "sector": sensor.sector,
        "status": sensor.status.value,
        "last_update": sensor.last_update,
        "model": sensor.model,
        "serial_number": sensor.serial_number,
        "installation_date": sensor.installation_date,
        "last_maintenance": sensor.last_maintenance,
        "network_type": sensor.network_type,
        "installation_depth": sensor.installation_depth,
        "pipe_diameter": sensor.pipe_diameter,
        "pipe_material": sensor.pipe_material,
        "signal_strength": sensor.signal_strength,
        "battery_level": sensor.battery_level,
        "last_communication": sensor.last_communication
    }

@app.get("/sensors/")
async def list_sensors(db: Session = Depends(get_db)):
    sensors = db.query(Sensor).all()
    return [
        {
            "id": s.id,
            "name": s.name,
            "location": s.location,
            "latitude": s.latitude,
            "longitude": s.longitude,
            "sector": s.sector,
            "status": s.status.value
        }
        for s in sensors
    ]

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "aquaguard-simple"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)