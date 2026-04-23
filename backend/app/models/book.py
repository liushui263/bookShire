from sqlalchemy import Column, String, Text
from app.db.base import Base

class Book(Base):
    __tablename__ = "books"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    subtitle = Column(Text, nullable=True)
    original_language = Column(String, nullable=True)