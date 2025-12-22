from sqlalchemy.orm import Session
from ..models.user import User

def get_user_by_username(db: Session, username: str):
    return db.query(User).filter(User.username == username).first()

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user:
        return False
    # Comparaison simple pour debug
    if user.password_hash == password:
        return user
    return False