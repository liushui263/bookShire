from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.book import BookCreate, BookOut
from app.services.book_service import BookService

router = APIRouter(prefix="/books", tags=["books"])
service = BookService()

@router.get("/", response_model=list[BookOut])
def list_books(db: Session = Depends(get_db)):
    return service.list_books(db)

@router.get("/{book_id}", response_model=BookOut)
def get_book(book_id: str, db: Session = Depends(get_db)):
    return service.get_book(db, book_id)

@router.post("/", response_model=BookOut)
def create_book(payload: BookCreate, db: Session = Depends(get_db)):
    return service.create_book(db, payload)