from fastapi import FastAPI
from app.api.v1.books import router as books_router
from app.api.v1 import recommendations

app = FastAPI(title="BookShire API")

app.include_router(books_router)
app.include_router(
    recommendations.router,
    prefix="/api/v1/recommendations",
    tags=["recommendations"]
)

@app.get("/")
def health():
    return {"status": "ok"}