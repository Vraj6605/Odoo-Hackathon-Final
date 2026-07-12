from sqlalchemy.orm import Session
from app.db.models.trip import Trip
from app.repository.base_repository import BaseRepository

class TripRepository(BaseRepository[Trip]):
    def __init__(self, db: Session):
        super().__init__(Trip, db)
