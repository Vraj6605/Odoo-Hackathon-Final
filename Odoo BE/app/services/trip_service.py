from fastapi import HTTPException, status as http_status
from sqlalchemy.orm import Session

from app.common.utils import get_unix_time
from app.core.enums import TripStatus, DriverStatus, VehicleStatus
from app.repository.trip_repository import TripRepository
from app.repository.driver_repository import DriverRepository
from app.repository.vehicle_repository import VehicleRepository
from app.schema.trip import TripCreate, TripUpdate

class TripService:
    def __init__(self, db: Session):
        self.db = db
        self.trip_repo = TripRepository(self.db)
        self.driver_repo = DriverRepository(self.db)
        self.vehicle_repo = VehicleRepository(self.db)

    async def create_trip(self, payload: TripCreate):
        # Verify driver exists
        driver = self.driver_repo.get(payload.driver_id)
        if not driver or driver.is_deleted or not driver.is_active:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail="Active driver not found",
            )

        # Verify vehicle exists
        vehicle = self.vehicle_repo.get(payload.vehicle_id)
        if not vehicle or vehicle.is_deleted or not vehicle.is_active:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail="Active vehicle not found",
            )

        # Check load capacity
        if payload.cargo_weight > vehicle.max_load_capacity:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail=f"Cargo weight ({payload.cargo_weight} kg) exceeds vehicle maximum capacity ({vehicle.max_load_capacity} kg)",
            )

        # If dispatched initially, check availability
        if payload.status == TripStatus.DISPATCHED:
            if driver.status != DriverStatus.AVAILABLE:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail=f"Driver is currently not available (status: {driver.status.value})",
                )
            if vehicle.status != VehicleStatus.AVAILABLE:
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail=f"Vehicle is currently not available (status: {vehicle.status.value})",
                )

            # Change statuses to ON_TRIP
            driver.status = DriverStatus.ON_TRIP
            vehicle.status = VehicleStatus.ON_TRIP

        trip = self.trip_repo.create(payload)
        self.db.commit()
        return trip

    async def get_trip_by_id(self, trip_id: str):
        trip = self.trip_repo.get(trip_id)
        if not trip or trip.is_deleted:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail="Trip not found",
            )
        return trip

    async def get_all_trips(self, skip: int = 0, limit: int = 100):
        return self.trip_repo.get_all(skip=skip, limit=limit, filters={"is_deleted": False})

    async def update_trip(self, trip_id: str, payload: TripUpdate):
        trip = await self.get_trip_by_id(trip_id)
        
        # Load driver and vehicle objects
        driver = self.driver_repo.get(payload.driver_id or trip.driver_id)
        vehicle = self.vehicle_repo.get(payload.vehicle_id or trip.vehicle_id)

        # If changing vehicle/cargo weight, re-verify capacity
        new_weight = payload.cargo_weight if payload.cargo_weight is not None else trip.cargo_weight
        if vehicle and new_weight > vehicle.max_load_capacity:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail=f"Cargo weight ({new_weight} kg) exceeds vehicle capacity ({vehicle.max_load_capacity} kg)",
            )

        # Handle status state transitions
        old_status = trip.status
        new_status = payload.status if payload.status is not None else old_status

        if old_status != new_status:
            # DRAFT -> DISPATCHED
            if new_status == TripStatus.DISPATCHED:
                if driver.status != DriverStatus.AVAILABLE:
                    raise HTTPException(
                        status_code=http_status.HTTP_400_BAD_REQUEST,
                        detail="Driver is currently not available",
                    )
                if vehicle.status != VehicleStatus.AVAILABLE:
                    raise HTTPException(
                        status_code=http_status.HTTP_400_BAD_REQUEST,
                        detail="Vehicle is currently not available",
                    )
                driver.status = DriverStatus.ON_TRIP
                vehicle.status = VehicleStatus.ON_TRIP

            # ANY -> COMPLETED
            elif new_status == TripStatus.COMPLETED:
                fuel = payload.actual_fuel_consumed if payload.actual_fuel_consumed is not None else trip.actual_fuel_consumed
                odometer = payload.final_odometer if payload.final_odometer is not None else trip.final_odometer

                if fuel is None or odometer is None:
                    raise HTTPException(
                        status_code=http_status.HTTP_400_BAD_REQUEST,
                        detail="Completing a trip requires actual_fuel_consumed and final_odometer",
                    )

                if odometer < vehicle.odometer:
                    raise HTTPException(
                        status_code=http_status.HTTP_400_BAD_REQUEST,
                        detail=f"Final odometer ({odometer}) cannot be less than vehicle's current odometer ({vehicle.odometer})",
                    )

                # Update vehicle odometer and status
                vehicle.odometer = odometer
                vehicle.status = VehicleStatus.AVAILABLE
                driver.status = DriverStatus.AVAILABLE

            # ANY -> CANCELLED
            elif new_status == TripStatus.CANCELLED:
                # Release driver and vehicle if they were on trip
                if old_status == TripStatus.DISPATCHED:
                    vehicle.status = VehicleStatus.AVAILABLE
                    driver.status = DriverStatus.AVAILABLE

        update_data = payload.model_dump(exclude_unset=True)
        updated_trip = self.trip_repo.update(trip, update_data)
        self.db.commit()
        return updated_trip

    async def delete_trip(self, trip_id: str):
        trip = await self.get_trip_by_id(trip_id)

        # Cannot delete active dispatched trips
        if trip.status == TripStatus.DISPATCHED:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete a trip that is currently dispatched",
            )

        # Release driver and vehicle if deleting a dispatched trip (shouldn't happen due to check above, but for safety)
        if trip.status == TripStatus.DISPATCHED:
            driver = self.driver_repo.get(trip.driver_id)
            vehicle = self.vehicle_repo.get(trip.vehicle_id)
            if driver:
                driver.status = DriverStatus.AVAILABLE
            if vehicle:
                vehicle.status = VehicleStatus.AVAILABLE

        # Soft delete
        update_data = {
            "is_deleted": True,
            "is_active": False,
            "deleted_at": get_unix_time()
        }
        self.trip_repo.update(trip, update_data)
        self.db.commit()
        return True
