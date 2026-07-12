from sqlalchemy.orm import Session
from app.db.models.vehicle import Vehicle
from app.repository.base_repository import BaseRepository

class VehicleRepository(BaseRepository[Vehicle]):
    def __init__(self, db: Session):
        super().__init__(Vehicle, db)
