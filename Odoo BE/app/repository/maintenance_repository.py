from sqlalchemy.orm import Session
from app.db.models.maintenance import Maintenance
from app.repository.base_repository import BaseRepository

class MaintenanceRepository(BaseRepository[Maintenance]):
    def __init__(self, db: Session):
        super().__init__(Maintenance, db)
