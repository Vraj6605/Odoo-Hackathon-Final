from pydantic import BaseModel, ConfigDict
from datetime import date
from typing import Optional
from app.core.enums import DriverStatus

class DriverBase(BaseModel):
    name: str
    license_number: str
    license_category: str
    license_expiry: date
    contact_number: str
    safety_score: float = 100.0
    status: DriverStatus = DriverStatus.AVAILABLE

class DriverCreate(DriverBase):
    pass

class DriverUpdate(BaseModel):
    name: Optional[str] = None
    license_number: Optional[str] = None
    license_category: Optional[str] = None
    license_expiry: Optional[date] = None
    contact_number: Optional[str] = None
    safety_score: Optional[float] = None
    status: Optional[DriverStatus] = None
    is_active: Optional[bool] = None

class DriverResponse(DriverBase):
    id: str
    is_active: bool
    is_deleted: bool
    created_at: int
    updated_at: Optional[int] = None
    deleted_at: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)
