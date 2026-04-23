from app.repositories.book_repo import BookRepository

class BookService:

    def __init__(self):
        self.repo = BookRepository()

    def list_books(self, db):
        return self.repo.get_all(db)

    def get_book(self, db, book_id):
        return self.repo.get(db, book_id)

    def create_book(self, db, data):
        return self.repo.create(db, data)