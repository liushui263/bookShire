from sqlalchemy import Column, String, Text, Float, Integer, ARRAY
from app.db.base import Base

class Book(Base):
    __tablename__ = "books"

    id = Column(String, primary_key=True)
    title = Column(String, nullable=False)
    subtitle = Column(Text, nullable=True)
    original_language = Column(String, nullable=True)
    rating_avg = Column(Float, default=0)
    rating_count = Column(Integer, default=0)
    tags = Column(ARRAY(String))