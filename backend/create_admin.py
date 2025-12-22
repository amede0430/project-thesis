from sqlalchemy.orm import Session
from app.db.database import SessionLocal, engine, Base
from app.models.user import User, UserRole
from app.core.security import get_password_hash

# Créer les tables
Base.metadata.create_all(bind=engine)

def create_admin_user():
    db = SessionLocal()
    try:
        # Vérifier si l'admin existe déjà
        admin = db.query(User).filter(User.username == "admin").first()
        if admin:
            print("Admin user already exists")
            return
        
        # Créer l'utilisateur admin
        admin_user = User(
            username="admin",
            password_hash=get_password_hash("admin123"),
            role=UserRole.ADMIN
        )
        db.add(admin_user)
        db.commit()
        print("Admin user created successfully")
        print("Username: admin")
        print("Password: admin123")
        
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_user()