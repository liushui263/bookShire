from sqlalchemy.orm import Session
from app.models.book import Book
import uuid

class BookRepository:

    def get_all(self, db: Session):
        return db.query(Book).all()

    def get(self, db: Session, book_id: str):
        return db.query(Book).filter(Book.id == book_id).first()

    def create(self, db: Session, data):
        book = Book(
            id=str(uuid.uuid4()),
            **data.model_dump()
        )
        db.add(book)
        db.commit()
        db.refresh(book)
        return book