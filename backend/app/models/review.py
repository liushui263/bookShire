from sqlalchemy import Column, String, Integer, ForeignKey, Text
from app.db.base import Base
import uuid

class Review(Base):
    __tablename__ = "reviews"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"))
    book_id = Column(String, ForeignKey("books.id"))
    rating = Column(Integer)
    content = Column(Text)