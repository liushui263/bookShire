from fastapi import FastAPI
from app.api.v1.books import router as books_router
from app.api.v1 import books, recommendations, user_books


app = FastAPI(title="BookShire API")

app.include_router(books.router, prefix="/api/v1")
app.include_router(recommendations.router, prefix="/api/v1")
app.include_router(user_books.router, prefix="/api/v1")

@app.get("/")
def root():
    return {"message": "BookShire API is running"}

@app.get("/")
def health():
    return {"status": "ok"}
