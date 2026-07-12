from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional

class ExpenseBase(BaseModel):
    category: str
    amount: float
    expense_date: date
    vehicle_id: str
    trip_id: Optional[str] = None

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    category: Optional[str] = None
    amount: Optional[float] = None
    expense_date: Optional[date] = None
    vehicle_id: Optional[str] = None
    trip_id: Optional[str] = None
    is_active: Optional[bool] = None

class ExpenseResponse(ExpenseBase):
    id: str
    is_active: bool
    is_deleted: bool
    created_at: int
    updated_at: Optional[int] = None
    deleted_at: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
