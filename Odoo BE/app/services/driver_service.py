from fastapi import HTTPException, status as http_status
from sqlalchemy.orm import Session

from app.common.utils import get_unix_time
from app.core.enums import DriverStatus, TripStatus
from app.repository.driver_repository import DriverRepository
from app.repository.trip_repository import TripRepository
from app.schema.driver import DriverCreate, DriverUpdate

class DriverService:
    def __init__(self, db: Session):
        self.db = db
        self.driver_repo = DriverRepository(self.db)
        self.trip_repo = TripRepository(self.db)

    async def create_driver(self, payload: DriverCreate):
        # Validate license number uniqueness
        existing = self.driver_repo.get_by_field("license_number", payload.license_number)
        if existing and not existing.is_deleted:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail="Driver with this license number already exists",
            )
        elif existing and existing.is_deleted:
            # If deleted, we update the existing one and reactivate it
            update_data = payload.model_dump()
            update_data["is_deleted"] = False
            update_data["deleted_at"] = None
            update_data["is_active"] = True
            updated = self.driver_repo.update(existing, update_data)
            return updated

        return self.driver_repo.create(payload)

    async def get_driver_by_id(self, driver_id: str):
        driver = self.driver_repo.get(driver_id)
        if not driver or driver.is_deleted:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail="Driver not found",
            )
        return driver

    async def get_all_drivers(self, skip: int = 0, limit: int = 100):
        # We pass is_deleted: False filter
        return self.driver_repo.get_all(skip=skip, limit=limit, filters={"is_deleted": False})

    async def update_driver(self, driver_id: str, payload: DriverUpdate):
        driver = await self.get_driver_by_id(driver_id)
        
        # Check license uniqueness if it's being updated
        if payload.license_number and payload.license_number != driver.license_number:
            existing = self.driver_repo.get_by_field("license_number", payload.license_number)
            if existing and not existing.is_deleted:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail="Driver with this license number already exists",
                )

        update_data = payload.model_dump(exclude_unset=True)
        return self.driver_repo.update(driver, update_data)

    async def delete_driver(self, driver_id: str):
        driver = await self.get_driver_by_id(driver_id)

        # Check if driver has active trips (not COMPLETED or CANCELLED)
        active_trips = self.db.query(self.trip_repo.model).filter(
            self.trip_repo.model.driver_id == driver_id,
            self.trip_repo.model.status.in_([TripStatus.DRAFT, TripStatus.DISPATCHED]),
            self.trip_repo.model.is_deleted == False
        ).first()

        if active_trips:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete driver assigned to active trips",
            )

        # Soft delete
        update_data = {
            "is_deleted": True,
            "is_active": False,
            "deleted_at": get_unix_time()
        }
        self.driver_repo.update(driver, update_data)
        return True
