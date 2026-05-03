from uuid import UUID

from sqlalchemy.orm import Session

from app.models.user_book import UserBook


def list_user_books(db: Session, user_id: UUID):
    return (
        db.query(UserBook)
        .filter(UserBook.user_id == user_id)
        .filter(UserBook.deleted_at.is_(None))
        .order_by(UserBook.created_at.desc())
        .all()
    )


def get_user_book(db: Session, user_id: UUID, user_book_id: UUID):
    return (
        db.query(UserBook)
        .filter(UserBook.id == user_book_id)
        .filter(UserBook.user_id == user_id)
        .filter(UserBook.deleted_at.is_(None))
        .first()
    )


def create_user_book(db: Session, user_book: UserBook):
    db.add(user_book)
    db.commit()
    db.refresh(user_book)
    return user_book


def update_user_book(db: Session, user_book: UserBook, data: dict):
    for key, value in data.items():
        setattr(user_book, key, value)

    db.commit()
    db.refresh(user_book)
    return user_book


def soft_delete_user_book(db: Session, user_book: UserBook):
    from datetime import datetime, timezone

    user_book.deleted_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(user_book)
    return user_book
