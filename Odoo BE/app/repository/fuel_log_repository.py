from sqlalchemy.orm import Session
from app.db.models.fuel_log import FuelLog
from app.repository.base_repository import BaseRepository

class FuelLogRepository(BaseRepository[FuelLog]):
    def __init__(self, db: Session):
        super().__init__(FuelLog, db)
