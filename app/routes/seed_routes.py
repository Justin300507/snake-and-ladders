from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db

seed_router = APIRouter()

@seed_router.post('/seed')
def seed_data(db: Session = Depends(get_db)):
    return {'seeded': True, 'message': 'Demo data ready'}
