from pydantic import BaseModel, ConfigDict
from typing import Optional
from app.core.enums import TripStatus

class TripBase(BaseModel):
    source: str
    destination: str
    cargo_weight: float
    planned_distance: float
    status: TripStatus = TripStatus.DRAFT
    actual_fuel_consumed: Optional[float] = None
    final_odometer: Optional[float] = None
    vehicle_id: str
    driver_id: str

class TripCreate(TripBase):
    pass

class TripUpdate(BaseModel):
    source: Optional[str] = None
    destination: Optional[str] = None
    cargo_weight: Optional[float] = None
    planned_distance: Optional[float] = None
    status: Optional[TripStatus] = None
    actual_fuel_consumed: Optional[float] = None
    final_odometer: Optional[float] = None
    vehicle_id: Optional[str] = None
    driver_id: Optional[str] = None
    is_active: Optional[bool] = None

class TripResponse(TripBase):
    id: str
    is_active: bool
    is_deleted: bool
    created_at: int
    updated_at: Optional[int] = None
    deleted_at: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
