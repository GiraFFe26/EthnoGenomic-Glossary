from enum import Enum

from sqlalchemy import Column, Integer, String, Enum as PgEnum

from app.db.db import Base


class UserRole(str, Enum):
    admin = "admin"
    editor = "editor"
    viewer = "viewer"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(PgEnum(UserRole, name="user_role"), nullable=False, default=UserRole.viewer)
