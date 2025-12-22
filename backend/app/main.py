from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .core.config import settings
from .db.database import engine, Base
from .api.auth_fixed import router as auth_router
from .api.sensors import router as sensors_router
from .api.websocket import router as websocket_router
from .api.websocket_acoustic import router as websocket_acoustic_router
from .api.dashboard import router as dashboard_router
from .api.reports import router as reports_router
from .api.alerts import router as alerts_router
from .api.dataset_real import router as dataset_router
from .api.spectrogram import router as spectrogram_router
from .api.sensor_history import router as sensor_history_router
from .api.monitoring import router as monitoring_router
from .api.history import router as history_router
from .api.ttn_integration import router as ttn_router
from .api.vibration_analysis import router as vibration_router
from .models import user, sensor, alert, activity, report, sensor_data, analysis_history
import asyncio

# Créer les tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="AquaGuard API", version="1.0.0")

@app.on_event("startup")
async def startup_event():
    from .websocket.manager import simulate_sensor_updates
    from .websocket.acoustic_manager import acoustic_background_task
    print("Démarrage des tâches de fond...")
    asyncio.create_task(simulate_sensor_updates())
    asyncio.create_task(acoustic_background_task())
    print("Tâches de fond démarrées")

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173", 
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# Routes
app.include_router(auth_router, prefix="/auth", tags=["authentication"])
app.include_router(sensors_router, prefix="/sensors", tags=["sensors"])
app.include_router(dashboard_router, prefix="/dashboard", tags=["dashboard"])
app.include_router(reports_router, prefix="/reports", tags=["reports"])
app.include_router(alerts_router, prefix="/alerts", tags=["alerts"])
app.include_router(dataset_router, prefix="/dataset", tags=["dataset"])
app.include_router(spectrogram_router, tags=["spectrogram"])
app.include_router(sensor_history_router, tags=["sensors"])
app.include_router(websocket_router, tags=["websocket"])
app.include_router(websocket_acoustic_router, tags=["websocket"])
app.include_router(monitoring_router, tags=["monitoring"])
app.include_router(history_router, tags=["history"])
app.include_router(ttn_router, prefix="/ttn", tags=["ttn"])
app.include_router(vibration_router, tags=["vibration"])

@app.get("/")
async def root():
    return {"message": "AquaGuard API - Système de détection de fuites"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "aquaguard-api"}