from datetime import date
from fastapi import HTTPException, status as http_status
from sqlalchemy.orm import Session

from app.common.utils import get_unix_time
from app.core.enums import MaintenanceStatus, VehicleStatus
from app.repository.maintenance_repository import MaintenanceRepository
from app.repository.vehicle_repository import VehicleRepository
from app.schema.maintenance import MaintenanceCreate, MaintenanceUpdate

class MaintenanceService:
    def __init__(self, db: Session):
        self.db = db
        self.maintenance_repo = MaintenanceRepository(self.db)
        self.vehicle_repo = VehicleRepository(self.db)

    async def create_maintenance(self, payload: MaintenanceCreate):
        # Verify vehicle exists
        vehicle = self.vehicle_repo.get(payload.vehicle_id)
        if not vehicle or vehicle.is_deleted:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail="Vehicle not found",
            )

        # If maintenance is OPEN, update vehicle status to IN_SHOP
        if payload.status == MaintenanceStatus.OPEN:
            vehicle.status = VehicleStatus.IN_SHOP

        log = self.maintenance_repo.create(payload)
        self.db.commit()
        return log

    async def get_maintenance_by_id(self, maintenance_id: str):
        log = self.maintenance_repo.get(maintenance_id)
        if not log or log.is_deleted:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail="Maintenance log not found",
            )
        return log

    async def get_all_maintenances(self, skip: int = 0, limit: int = 100):
        return self.maintenance_repo.get_all(skip=skip, limit=limit, filters={"is_deleted": False})

    async def update_maintenance(self, maintenance_id: str, payload: MaintenanceUpdate):
        log = await self.get_maintenance_by_id(maintenance_id)
        vehicle = self.vehicle_repo.get(payload.vehicle_id or log.vehicle_id)

        old_status = log.status
        new_status = payload.status if payload.status is not None else old_status

        if old_status != new_status:
            if new_status == MaintenanceStatus.CLOSED:
                if vehicle:
                    vehicle.status = VehicleStatus.AVAILABLE
                if not payload.completion_date and not log.completion_date:
                    log.completion_date = date.today()
            elif new_status == MaintenanceStatus.OPEN:
                if vehicle:
                    vehicle.status = VehicleStatus.IN_SHOP

        update_data = payload.model_dump(exclude_unset=True)
        updated_log = self.maintenance_repo.update(log, update_data)
        self.db.commit()
        return updated_log

    async def delete_maintenance(self, maintenance_id: str):
        log = await self.get_maintenance_by_id(maintenance_id)

        # If it was open, restore vehicle status
        if log.status == MaintenanceStatus.OPEN:
            vehicle = self.vehicle_repo.get(log.vehicle_id)
            if vehicle:
                vehicle.status = VehicleStatus.AVAILABLE

        # Soft delete
        update_data = {
            "is_deleted": True,
            "is_active": False,
            "deleted_at": get_unix_time()
        }
        self.maintenance_repo.update(log, update_data)
        self.db.commit()
        return True
