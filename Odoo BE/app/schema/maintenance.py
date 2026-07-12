from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional
from app.core.enums import MaintenanceStatus

class MaintenanceBase(BaseModel):
    description: str
    cost: float = 0.0
    entry_date: date
    completion_date: Optional[date] = None
    status: MaintenanceStatus = MaintenanceStatus.OPEN
    vehicle_id: str

class MaintenanceCreate(MaintenanceBase):
    pass

class MaintenanceUpdate(BaseModel):
    description: Optional[str] = None
    cost: Optional[float] = None
    entry_date: Optional[date] = None
    completion_date: Optional[date] = None
    status: Optional[MaintenanceStatus] = None
    vehicle_id: Optional[str] = None
    is_active: Optional[bool] = None

class MaintenanceResponse(MaintenanceBase):
    id: str
    is_active: bool
    is_deleted: bool
    created_at: int
    updated_at: Optional[int] = None
    deleted_at: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
