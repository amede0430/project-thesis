#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.models.user import User
from app.core.security import verify_password

def test_login():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == "admin").first()
        if user:
            print(f"✅ Utilisateur trouvé: {user.username}")
            print(f"Hash: {user.password_hash}")
            
            # Test du mot de passe
            is_valid = verify_password("admin123", user.password_hash)
            print(f"Mot de passe valide: {is_valid}")
        else:
            print("❌ Utilisateur admin non trouvé")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    test_login()