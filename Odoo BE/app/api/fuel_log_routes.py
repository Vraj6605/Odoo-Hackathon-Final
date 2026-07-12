from fastapi import APIRouter, Depends, status as http_status
from sqlalchemy.orm import Session

from app.core.dependecy import RoleCheck
from app.db.session import get_db
from app.core.response import success_response
from app.schema.fuel_log import FuelLogCreate, FuelLogUpdate, FuelLogResponse
from app.services.fuel_log_service import FuelLogService

router = APIRouter(
    prefix="/fuel-logs",
    tags=["Fuel Logs"],
    dependencies=[Depends(RoleCheck(["FINANCIAL_ANALYST"]))]
)

@router.post("/", summary="Create a new fuel log record")
async def create_fuel_log(payload: FuelLogCreate, db: Session = Depends(get_db)):
    service = FuelLogService(db)
    log = await service.create_fuel_log(payload)
    return success_response(
        status_code=http_status.HTTP_201_CREATED,
        msg="Fuel log created successfully",
        data=FuelLogResponse.model_validate(log).model_dump(),
    )

@router.get("/", summary="Get all fuel logs")
async def get_all_fuel_logs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    service = FuelLogService(db)
    logs = await service.get_all_fuel_logs(skip, limit)
    data = [FuelLogResponse.model_validate(l).model_dump() for l in logs]
    return success_response(
        status_code=http_status.HTTP_200_OK,
        msg="Fuel logs fetched successfully",
        data=data,
    )

@router.get("/{id}", summary="Get fuel log by ID")
async def get_fuel_log_by_id(id: str, db: Session = Depends(get_db)):
    service = FuelLogService(db)
    log = await service.get_fuel_log_by_id(id)
    return success_response(
        status_code=http_status.HTTP_200_OK,
        msg="Fuel log fetched successfully",
        data=FuelLogResponse.model_validate(log).model_dump(),
    )

@router.put("/{id}", summary="Update a fuel log record")
async def update_fuel_log(id: str, payload: FuelLogUpdate, db: Session = Depends(get_db)):
    service = FuelLogService(db)
    log = await service.update_fuel_log(id, payload)
    return success_response(
        status_code=http_status.HTTP_200_OK,
        msg="Fuel log updated successfully",
        data=FuelLogResponse.model_validate(log).model_dump(),
    )

@router.delete("/{id}", summary="Delete a fuel log record")
async def delete_fuel_log(id: str, db: Session = Depends(get_db)):
    service = FuelLogService(db)
    await service.delete_fuel_log(id)
    return success_response(
        status_code=http_status.HTTP_200_OK,
        msg="Fuel log deleted successfully",
    )
