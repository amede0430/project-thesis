from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..db.database import get_db
from ..models.user import User

router = APIRouter()

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # Chercher l'utilisateur
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

@router.post("/logout")
async def logout():
    return {"message": "Déconnexion réussie"}