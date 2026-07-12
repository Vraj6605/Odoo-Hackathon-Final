from pydantic import BaseModel, ConfigDict
from typing import Optional
from app.core.enums import VehicleStatus

class VehicleBase(BaseModel):
    registration_number: str
    name_model: str
    type: str
    max_load_capacity: float
    odometer: float = 0.0
    acquisition_cost: float
    status: VehicleStatus = VehicleStatus.AVAILABLE

class VehicleCreate(VehicleBase):
    pass

class VehicleUpdate(BaseModel):
    registration_number: Optional[str] = None
    name_model: Optional[str] = None
    type: Optional[str] = None
    max_load_capacity: Optional[float] = None
    odometer: Optional[float] = None
    acquisition_cost: Optional[float] = None
    status: Optional[VehicleStatus] = None
    is_active: Optional[bool] = None

class VehicleResponse(VehicleBase):
    id: str
    is_active: bool
    is_deleted: bool
    created_at: int
    updated_at: Optional[int] = None
    deleted_at: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
