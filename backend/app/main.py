from fastapi import FastAPI
from app.api.v1.books import router as books_router

app = FastAPI(title="BookShire API")

app.include_router(books_router)

@app.get("/")
def health():
    return {"status": "ok"}