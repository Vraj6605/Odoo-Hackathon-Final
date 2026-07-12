from fastapi import APIRouter, Depends, status as http_status
from sqlalchemy.orm import Session

from app.core.dependecy import RoleCheck
from app.db.session import get_db
from app.core.response import success_response
from app.schema.maintenance import MaintenanceCreate, MaintenanceUpdate, MaintenanceResponse
from app.services.maintenance_service import MaintenanceService

router = APIRouter(prefix="/maintenance", tags=["Maintenance"])

@router.post("/", summary="Create a new maintenance log", dependencies=[Depends(RoleCheck(["FLEET_MANAGER"]))])
async def create_maintenance(payload: MaintenanceCreate, db: Session = Depends(get_db)):
    service = MaintenanceService(db)
    log = await service.create_maintenance(payload)
    return success_response(
        status_code=http_status.HTTP_201_CREATED,
        msg="Maintenance log created successfully",
        data=MaintenanceResponse.model_validate(log).model_dump(),
    )

@router.get("/", summary="Get all maintenance logs", dependencies=[Depends(RoleCheck(["FLEET_MANAGER", "DISPATCHER", "FINANCIAL_ANALYST"]))])
async def get_all_maintenances(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    service = MaintenanceService(db)
    logs = await service.get_all_maintenances(skip, limit)
    data = [MaintenanceResponse.model_validate(l).model_dump() for l in logs]
    return success_response(
        status_code=http_status.HTTP_200_OK,
        msg="Maintenance logs fetched successfully",
        data=data,
    )

@router.get("/{id}", summary="Get maintenance log by ID", dependencies=[Depends(RoleCheck(["FLEET_MANAGER", "DISPATCHER", "FINANCIAL_ANALYST"]))])
async def get_maintenance_by_id(id: str, db: Session = Depends(get_db)):
    service = MaintenanceService(db)
    log = await service.get_maintenance_by_id(id)
    return success_response(
        status_code=http_status.HTTP_200_OK,
        msg="Maintenance log fetched successfully",
        data=MaintenanceResponse.model_validate(log).model_dump(),
    )

@router.put("/{id}", summary="Update a maintenance log", dependencies=[Depends(RoleCheck(["FLEET_MANAGER"]))])
async def update_maintenance(id: str, payload: MaintenanceUpdate, db: Session = Depends(get_db)):
    service = MaintenanceService(db)
    log = await service.update_maintenance(id, payload)
    return success_response(
        status_code=http_status.HTTP_200_OK,
        msg="Maintenance log updated successfully",
        data=MaintenanceResponse.model_validate(log).model_dump(),
    )

@router.delete("/{id}", summary="Delete a maintenance log", dependencies=[Depends(RoleCheck(["FLEET_MANAGER"]))])
async def delete_maintenance(id: str, db: Session = Depends(get_db)):
    service = MaintenanceService(db)
    await service.delete_maintenance(id)
    return success_response(
        status_code=http_status.HTTP_200_OK,
        msg="Maintenance log deleted successfully",
    )
