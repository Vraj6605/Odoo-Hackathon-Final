from fastapi import HTTPException, status as http_status
from sqlalchemy.orm import Session

from app.common.utils import get_unix_time
from app.repository.expense_repository import ExpenseRepository
from app.repository.vehicle_repository import VehicleRepository
from app.repository.trip_repository import TripRepository
from app.schema.expense import ExpenseCreate, ExpenseUpdate

class ExpenseService:
    def __init__(self, db: Session):
        self.db = db
        self.expense_repo = ExpenseRepository(self.db)
        self.vehicle_repo = VehicleRepository(self.db)
        self.trip_repo = TripRepository(self.db)

    async def create_expense(self, payload: ExpenseCreate):
        # Verify vehicle exists
        vehicle = self.vehicle_repo.get(payload.vehicle_id)
        if not vehicle or vehicle.is_deleted:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail="Vehicle not found",
            )

        # Verify trip exists if provided
        if payload.trip_id:
            trip = self.trip_repo.get(payload.trip_id)
            if not trip or trip.is_deleted:
                raise HTTPException(
                    status_code=http_status.HTTP_404_NOT_FOUND,
                    detail="Trip not found",
                )

        return self.expense_repo.create(payload)

    async def get_expense_by_id(self, expense_id: str):
        expense = self.expense_repo.get(expense_id)
        if not expense or expense.is_deleted:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail="Expense record not found",
            )
        return expense

    async def get_all_expenses(self, skip: int = 0, limit: int = 100):
        return self.expense_repo.get_all(skip=skip, limit=limit, filters={"is_deleted": False})

    async def update_expense(self, expense_id: str, payload: ExpenseUpdate):
        expense = await self.get_expense_by_id(expense_id)

        if payload.vehicle_id:
            vehicle = self.vehicle_repo.get(payload.vehicle_id)
            if not vehicle or vehicle.is_deleted:
                raise HTTPException(
                    status_code=http_status.HTTP_404_NOT_FOUND,
                    detail="Vehicle not found",
                )

        if payload.trip_id:
            trip = self.trip_repo.get(payload.trip_id)
            if not trip or trip.is_deleted:
                raise HTTPException(
                    status_code=http_status.HTTP_404_NOT_FOUND,
                    detail="Trip not found",
                )

        update_data = payload.model_dump(exclude_unset=True)
        return self.expense_repo.update(expense, update_data)

    async def delete_expense(self, expense_id: str):
        expense = await self.get_expense_by_id(expense_id)

        # Soft delete
        update_data = {
            "is_deleted": True,
            "is_active": False,
            "deleted_at": get_unix_time()
        }
        self.expense_repo.update(expense, update_data)
        return True
