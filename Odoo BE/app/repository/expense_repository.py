from sqlalchemy.orm import Session
from app.db.models.expense import Expense
from app.repository.base_repository import BaseRepository

class ExpenseRepository(BaseRepository[Expense]):
    def __init__(self, db: Session):
        super().__init__(Expense, db)
