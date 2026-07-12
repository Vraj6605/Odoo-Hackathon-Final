from fastapi import HTTPException, status as http_status
from sqlalchemy.orm import Session

from app.common.utils import get_unix_time
from app.core.enums import VehicleStatus, TripStatus
from app.repository.vehicle_repository import VehicleRepository
from app.repository.trip_repository import TripRepository
from app.schema.vehicle import VehicleCreate, VehicleUpdate

class VehicleService:
    def __init__(self, db: Session):
        self.db = db
        self.vehicle_repo = VehicleRepository(self.db)
        self.trip_repo = TripRepository(self.db)

    async def create_vehicle(self, payload: VehicleCreate):
        # Validate registration number uniqueness
        existing = self.vehicle_repo.get_by_field("registration_number", payload.registration_number)
        if existing and not existing.is_deleted:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail="Vehicle with this registration number already exists",
            )
        elif existing and existing.is_deleted:
            update_data = payload.model_dump()
            update_data["is_deleted"] = False
            update_data["deleted_at"] = None
            update_data["is_active"] = True
            updated = self.vehicle_repo.update(existing, update_data)
            return updated

        return self.vehicle_repo.create(payload)

    async def get_vehicle_by_id(self, vehicle_id: str):
        vehicle = self.vehicle_repo.get(vehicle_id)
        if not vehicle or vehicle.is_deleted:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail="Vehicle not found",
            )
        return vehicle

    async def get_all_vehicles(self, skip: int = 0, limit: int = 100):
        return self.vehicle_repo.get_all(skip=skip, limit=limit, filters={"is_deleted": False})

    async def update_vehicle(self, vehicle_id: str, payload: VehicleUpdate):
        vehicle = await self.get_vehicle_by_id(vehicle_id)

        # Check registration number uniqueness if updated
        if payload.registration_number and payload.registration_number != vehicle.registration_number:
            existing = self.vehicle_repo.get_by_field("registration_number", payload.registration_number)
            if existing and not existing.is_deleted:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail="Vehicle with this registration number already exists",
                )

        update_data = payload.model_dump(exclude_unset=True)
        return self.vehicle_repo.update(vehicle, update_data)

    async def delete_vehicle(self, vehicle_id: str):
        vehicle = await self.get_vehicle_by_id(vehicle_id)

        # Check if vehicle has active trips
        active_trips = self.db.query(self.trip_repo.model).filter(
            self.trip_repo.model.vehicle_id == vehicle_id,
            self.trip_repo.model.status.in_([TripStatus.DRAFT, TripStatus.DISPATCHED]),
            self.trip_repo.model.is_deleted == False
        ).first()

        if active_trips:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete vehicle assigned to active trips",
            )

        # Soft delete
        update_data = {
            "is_deleted": True,
            "is_active": False,
            "deleted_at": get_unix_time()
        }
        self.vehicle_repo.update(vehicle, update_data)
        return True
