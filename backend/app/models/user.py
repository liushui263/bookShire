from sqlalchemy import Column, String, ARRAY
from app.db.base import Base
import uuid

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    preferences = Column(ARRAY(String))