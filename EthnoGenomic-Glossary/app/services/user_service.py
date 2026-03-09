from typing import Optional

from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models.user import User, UserRole
from app.schemas.user import UserCreate


def get_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user_in: UserCreate) -> User:
    db_user = User(email=user_in.email, role=user_in.role, password_hash=get_password_hash(user_in.password))
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def authenticate(db: Session, email: str, password: str) -> Optional[User]:
    user = get_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def ensure_default_admin(db: Session) -> None:
    if db.query(User).filter(User.role == UserRole.admin).first():
        return
    # default admin for bootstrap
    default_email = "admin@ethnoglossary.org"
    default_password = "ChangeMe123!"
    if not get_by_email(db, default_email):
        create_user(db, UserCreate(email=default_email, password=default_password, role=UserRole.admin))
