from pydantic import BaseModel
from typing import Optional

class BookCreate(BaseModel):
    title: str
    subtitle: Optional[str] = None
    original_language: Optional[str] = None

class BookOut(BaseModel):
    id: str
    title: str
    subtitle: Optional[str]
    original_language: Optional[str]

    class Config:
        from_attributes = True
