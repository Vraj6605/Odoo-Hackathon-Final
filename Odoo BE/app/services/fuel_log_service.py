from fastapi import HTTPException, status as http_status
from sqlalchemy.orm import Session

from app.common.utils import get_unix_time
from app.repository.fuel_log_repository import FuelLogRepository
from app.repository.vehicle_repository import VehicleRepository
from app.repository.trip_repository import TripRepository
from app.schema.fuel_log import FuelLogCreate, FuelLogUpdate

class FuelLogService:
    def __init__(self, db: Session):
        self.db = db
        self.fuel_log_repo = FuelLogRepository(self.db)
        self.vehicle_repo = VehicleRepository(self.db)
        self.trip_repo = TripRepository(self.db)

    async def create_fuel_log(self, payload: FuelLogCreate):
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

        return self.fuel_log_repo.create(payload)

    async def get_fuel_log_by_id(self, fuel_log_id: str):
        log = self.fuel_log_repo.get(fuel_log_id)
        if not log or log.is_deleted:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail="Fuel log record not found",
            )
        return log

    async def get_all_fuel_logs(self, skip: int = 0, limit: int = 100):
        return self.fuel_log_repo.get_all(skip=skip, limit=limit, filters={"is_deleted": False})

    async def update_fuel_log(self, fuel_log_id: str, payload: FuelLogUpdate):
        log = await self.get_fuel_log_by_id(fuel_log_id)

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
        return self.fuel_log_repo.update(log, update_data)

    async def delete_fuel_log(self, fuel_log_id: str):
        log = await self.get_fuel_log_by_id(fuel_log_id)

        # Soft delete
        update_data = {
            "is_deleted": True,
            "is_active": False,
            "deleted_at": get_unix_time()
        }
        self.fuel_log_repo.update(log, update_data)
        return True
