from fastapi import FastAPI

from app.api.v1.books import router as books_router
from app.api.v1.recommendations import router as recommendations_router
from app.api.v1.user_books import router as user_books_router
from app.api.v1.reviews import router as reviews_router


app = FastAPI(title="BookShire API")

app.include_router(books_router, prefix="/api/v1")
app.include_router(recommendations_router, prefix="/api/v1")
app.include_router(user_books_router, prefix="/api/v1")
app.include_router(reviews_router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "BookShire API is running"}


@app.get("/health")
def health():
    return {"status": "ok"}