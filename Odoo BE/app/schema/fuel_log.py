from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional

class FuelLogBase(BaseModel):
    liters: float
    cost: float
    log_date: date
    vehicle_id: str
    trip_id: Optional[str] = None

class FuelLogCreate(FuelLogBase):
    pass

class FuelLogUpdate(BaseModel):
    liters: Optional[float] = None
    cost: Optional[float] = None
    log_date: Optional[date] = None
    vehicle_id: Optional[str] = None
    trip_id: Optional[str] = None
    is_active: Optional[bool] = None

class FuelLogResponse(FuelLogBase):
    id: str
    is_active: bool
    is_deleted: bool
    created_at: int
    updated_at: Optional[int] = None
    deleted_at: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
