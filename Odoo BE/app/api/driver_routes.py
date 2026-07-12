from fastapi import APIRouter, Depends, status as http_status
from sqlalchemy.orm import Session

from app.core.dependecy import RoleCheck
from app.db.session import get_db
from app.core.response import success_response
from app.schema.driver import DriverCreate, DriverUpdate, DriverResponse
from app.services.driver_service import DriverService

router = APIRouter(
    prefix="/drivers",
    tags=["Drivers"],
    dependencies=[Depends(RoleCheck(["FLEET_MANAGER", "SAFETY_OFFICER"]))]
)

@router.post("/", summary="Create a new driver")
async def create_driver(payload: DriverCreate, db: Session = Depends(get_db)):
    service = DriverService(db)
    driver = await service.create_driver(payload)
    return success_response(
        status_code=http_status.HTTP_201_CREATED,
        msg="Driver created successfully",
        data=DriverResponse.model_validate(driver).model_dump(),
    )

@router.get("/", summary="Get all drivers")
async def get_all_drivers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    service = DriverService(db)
    drivers = await service.get_all_drivers(skip, limit)
    data = [DriverResponse.model_validate(d).model_dump() for d in drivers]
    return success_response(
        status_code=http_status.HTTP_200_OK,
        msg="Drivers fetched successfully",
        data=data,
    )

@router.get("/{id}", summary="Get driver by ID")
async def get_driver_by_id(id: str, db: Session = Depends(get_db)):
    service = DriverService(db)
    driver = await service.get_driver_by_id(id)
    return success_response(
        status_code=http_status.HTTP_200_OK,
        msg="Driver fetched successfully",
        data=DriverResponse.model_validate(driver).model_dump(),
    )

@router.put("/{id}", summary="Update a driver")
async def update_driver(id: str, payload: DriverUpdate, db: Session = Depends(get_db)):
    service = DriverService(db)
    driver = await service.update_driver(id, payload)
    return success_response(
        status_code=http_status.HTTP_200_OK,
        msg="Driver updated successfully",
        data=DriverResponse.model_validate(driver).model_dump(),
    )

@router.delete("/{id}", summary="Delete a driver")
async def delete_driver(id: str, db: Session = Depends(get_db)):
    service = DriverService(db)
    await service.delete_driver(id)
    return success_response(
        status_code=http_status.HTTP_200_OK,
        msg="Driver deleted successfully",
    )
