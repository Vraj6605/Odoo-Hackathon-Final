from fastapi import APIRouter, Depends, status as http_status
from sqlalchemy.orm import Session

from app.core.dependecy import RoleCheck
from app.db.session import get_db
from app.core.response import success_response
from app.schema.trip import TripCreate, TripUpdate, TripResponse
from app.services.trip_service import TripService

router = APIRouter(prefix="/trips", tags=["Trips"])

@router.post("/", summary="Create a new trip", dependencies=[Depends(RoleCheck(["DISPATCHER"]))])
async def create_trip(payload: TripCreate, db: Session = Depends(get_db)):
    service = TripService(db)
    trip = await service.create_trip(payload)
    return success_response(
        status_code=http_status.HTTP_201_CREATED,
        msg="Trip created successfully",
        data=TripResponse.model_validate(trip).model_dump(),
    )

@router.get("/", summary="Get all trips", dependencies=[Depends(RoleCheck(["DISPATCHER", "SAFETY_OFFICER"]))])
async def get_all_trips(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    service = TripService(db)
    trips = await service.get_all_trips(skip, limit)
    data = [TripResponse.model_validate(t).model_dump() for t in trips]
    return success_response(
        status_code=http_status.HTTP_200_OK,
        msg="Trips fetched successfully",
        data=data,
    )

@router.get("/{id}", summary="Get trip by ID", dependencies=[Depends(RoleCheck(["DISPATCHER", "SAFETY_OFFICER"]))])
async def get_trip_by_id(id: str, db: Session = Depends(get_db)):
    service = TripService(db)
    trip = await service.get_trip_by_id(id)
    return success_response(
        status_code=http_status.HTTP_200_OK,
        msg="Trip fetched successfully",
        data=TripResponse.model_validate(trip).model_dump(),
    )

@router.put("/{id}", summary="Update a trip", dependencies=[Depends(RoleCheck(["DISPATCHER"]))])
async def update_trip(id: str, payload: TripUpdate, db: Session = Depends(get_db)):
    service = TripService(db)
    trip = await service.update_trip(id, payload)
    return success_response(
        status_code=http_status.HTTP_200_OK,
        msg="Trip updated successfully",
        data=TripResponse.model_validate(trip).model_dump(),
    )

@router.delete("/{id}", summary="Delete a trip", dependencies=[Depends(RoleCheck(["DISPATCHER"]))])
async def delete_trip(id: str, db: Session = Depends(get_db)):
    service = TripService(db)
    await service.delete_trip(id)
    return success_response(
        status_code=http_status.HTTP_200_OK,
        msg="Trip deleted successfully",
    )
