from sqlalchemy.orm import Session
from app.db.models.driver import Driver
from app.repository.base_repository import BaseRepository

class DriverRepository(BaseRepository[Driver]):
    def __init__(self, db: Session):
        super().__init__(Driver, db)
