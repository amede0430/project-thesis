#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from app.db.database import get_db, SessionLocal
from app.models.user import User
from app.core.security import verify_password, create_access_token
import uvicorn

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/auth/login")
async def login_debug(form_data: OAuth2PasswordRequestForm = Depends()):
    try:
        print(f"Login attempt: {form_data.username}")
        
        db = SessionLocal()
        user = db.query(User).filter(User.username == form_data.username).first()
        
        if not user:
            print("User not found")
            raise HTTPException(status_code=401, detail="User not found")
        
        print(f"User found: {user.username}")
        print(f"Password hash: {user.password_hash}")
        
        # Test simple sans hachage
        if user.password_hash == form_data.password:
            print("Password match (plain)")
            return {
                "access_token": "test-token",
                "token_type": "bearer",
                "user": {"username": user.username, "role": user.role.value}
            }
        
        # Test avec hachage
        if verify_password(form_data.password, user.password_hash):
            print("Password match (hashed)")
            return {
                "access_token": "test-token", 
                "token_type": "bearer",
                "user": {"username": user.username, "role": user.role.value}
            }
        
        print("Password mismatch")
        raise HTTPException(status_code=401, detail="Wrong password")
        
    except Exception as e:
        print(f"Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8002)