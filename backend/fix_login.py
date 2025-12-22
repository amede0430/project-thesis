#!/usr/bin/env python3
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal
from app.models.user import User
from app.core.security import get_password_hash

def fix_admin_password():
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.username == "admin").first()
        if user:
            # Hacher correctement le mot de passe
            user.password_hash = get_password_hash("admin123")
            db.commit()
            print("✅ Mot de passe admin corrigé")
        else:
            print("❌ Utilisateur admin non trouvé")
    except Exception as e:
        print(f"❌ Erreur: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    fix_admin_password()