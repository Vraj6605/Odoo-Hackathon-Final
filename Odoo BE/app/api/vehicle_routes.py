from fastapi import APIRouter, Depends, status as http_status
from sqlalchemy.orm import Session

from app.core.dependecy import RoleCheck
from app.db.session import get_db
from app.core.response import success_response
from app.schema.vehicle import VehicleCreate, VehicleUpdate, VehicleResponse
from app.services.vehicle_service import VehicleService

router = APIRouter(prefix="/vehicles", tags=["Vehicles"])

@router.post("/", summary="Create a new vehicle", dependencies=[Depends(RoleCheck(["FLEET_MANAGER"]))])
async def create_vehicle(payload: VehicleCreate, db: Session = Depends(get_db)):
    service = VehicleService(db)
    vehicle = await service.create_vehicle(payload)
    return success_response(
        status_code=http_status.HTTP_201_CREATED,
        msg="Vehicle created successfully",
        data=VehicleResponse.model_validate(vehicle).model_dump(),
    )

@router.get("/", summary="Get all vehicles", dependencies=[Depends(RoleCheck(["FLEET_MANAGER", "DISPATCHER", "FINANCIAL_ANALYST"]))])
async def get_all_vehicles(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    service = VehicleService(db)
    vehicles = await service.get_all_vehicles(skip, limit)
    data = [VehicleResponse.model_validate(v).model_dump() for v in vehicles]
    return success_response(
        status_code=http_status.HTTP_200_OK,
        msg="Vehicles fetched successfully",
        data=data,
    )

@router.get("/{id}", summary="Get vehicle by ID", dependencies=[Depends(RoleCheck(["FLEET_MANAGER", "DISPATCHER", "FINANCIAL_ANALYST"]))])
async def get_vehicle_by_id(id: str, db: Session = Depends(get_db)):
    service = VehicleService(db)
    vehicle = await service.get_vehicle_by_id(id)
    return success_response(
        status_code=http_status.HTTP_200_OK,
        msg="Vehicle fetched successfully",
        data=VehicleResponse.model_validate(vehicle).model_dump(),
    )

@router.put("/{id}", summary="Update a vehicle", dependencies=[Depends(RoleCheck(["FLEET_MANAGER"]))])
async def update_vehicle(id: str, payload: VehicleUpdate, db: Session = Depends(get_db)):
    service = VehicleService(db)
    vehicle = await service.update_vehicle(id, payload)
    return success_response(
        status_code=http_status.HTTP_200_OK,
        msg="Vehicle updated successfully",
        data=VehicleResponse.model_validate(vehicle).model_dump(),
    )

@router.delete("/{id}", summary="Delete a vehicle", dependencies=[Depends(RoleCheck(["FLEET_MANAGER"]))])
async def delete_vehicle(id: str, db: Session = Depends(get_db)):
    service = VehicleService(db)
    await service.delete_vehicle(id)
    return success_response(
        status_code=http_status.HTTP_200_OK,
        msg="Vehicle deleted successfully",
    )
