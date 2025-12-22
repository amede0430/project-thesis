from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from ..db.database import get_db
from ..models.user import User
from ..core.security import verify_password, create_access_token
from datetime import timedelta

router = APIRouter()

@router.post("/login")
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    try:
        # Chercher l'utilisateur
        user = db.query(User).filter(User.username == form_data.username).first()
        
        if not user or not verify_password(form_data.password, user.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Nom d'utilisateur ou mot de passe incorrect"
            )
        
        # Créer le token
        access_token = create_access_token(
            data={"sub": user.username, "role": user.role.value},
            expires_delta=timedelta(hours=24)
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "id": user.id,
                "username": user.username,
                "role": user.role.value
            }
        }
    except Exception as e:
        print(f"Erreur login: {e}")
        raise HTTPException(status_code=500, detail="Erreur serveur")

@router.post("/logout")
async def logout():
    return {"message": "Déconnexion réussie"}