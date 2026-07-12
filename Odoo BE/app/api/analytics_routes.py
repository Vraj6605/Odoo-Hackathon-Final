from fastapi import APIRouter, Depends, Query, status as http_status
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.core.dependecy import current_user
from app.db.session import get_db
from app.core.response import success_response
from app.db.models.vehicle import Vehicle
from app.db.models.driver import Driver
from app.db.models.trip import Trip
from app.db.models.fuel_log import FuelLog
from app.db.models.maintenance import Maintenance
from app.db.models.expense import Expense
from app.core.enums import VehicleStatus, TripStatus, DriverStatus

router = APIRouter(prefix="", tags=["Analytics"])

@router.get("/api/dashboard/kpis", summary="Get dashboard KPIs")
async def get_dashboard_kpis(
    vehicle_type: str = Query(None),
    status: str = Query(None),
    region: str = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(current_user)
):
    # Base vehicle query
    v_query = db.query(Vehicle)
    if vehicle_type and vehicle_type != "All":
        v_query = v_query.filter(Vehicle.type == vehicle_type)
    if status and status != "All":
        v_query = v_query.filter(Vehicle.status == status)

    vehicles = v_query.all()
    
    total_vehicles = len(vehicles)
    active_vehicles = sum(1 for v in vehicles if v.status == VehicleStatus.ON_TRIP)
    available_vehicles = sum(1 for v in vehicles if v.status == VehicleStatus.AVAILABLE)
    in_maintenance = sum(1 for v in vehicles if v.status == VehicleStatus.IN_SHOP)

    # Trips query
    t_query = db.query(Trip)
    if vehicle_type and vehicle_type != "All":
        t_query = t_query.join(Vehicle).filter(Vehicle.type == vehicle_type)
    trips = t_query.all()
    
    active_trips = sum(1 for t in trips if t.status == TripStatus.DISPATCHED)
    pending_trips = sum(1 for t in trips if t.status == TripStatus.DRAFT)

    # Drivers query
    d_query = db.query(Driver)
    drivers = d_query.all()
    drivers_on_duty = sum(1 for d in drivers if d.status in [DriverStatus.AVAILABLE, DriverStatus.ON_TRIP])

    utilization = round((active_vehicles / (total_vehicles or 1)) * 100)

    data = {
        "totalVehicles": total_vehicles,
        "activeVehicles": active_vehicles,
        "availableVehicles": available_vehicles,
        "inMaintenance": in_maintenance,
        "activeTrips": active_trips,
        "pendingTrips": pending_trips,
        "driversOnDuty": drivers_on_duty,
        "utilization": utilization
    }

    return success_response(
        status_code=http_status.HTTP_200_OK,
        msg="KPIs fetched successfully",
        data=data
    )

@router.get("/api/reports/analytics", summary="Get financial cost analytics report")
async def get_reports_analytics(
    vehicle_type: str = Query(None),
    status: str = Query(None),
    region: str = Query(None),
    db: Session = Depends(get_db),
    current_user = Depends(current_user)
):
    # Fuel logs query
    fuel_query = db.query(func.sum(FuelLog.cost))
    if vehicle_type and vehicle_type != "All":
        fuel_query = fuel_query.join(Vehicle).filter(Vehicle.type == vehicle_type)
    fuel_costs = fuel_query.scalar() or 0.0

    # Maintenance costs query
    maint_query = db.query(func.sum(Maintenance.cost))
    if vehicle_type and vehicle_type != "All":
        maint_query = maint_query.join(Vehicle).filter(Vehicle.type == vehicle_type)
    maint_costs = maint_query.scalar() or 0.0

    # Expenses query
    misc_query = db.query(func.sum(Expense.amount))
    if vehicle_type and vehicle_type != "All":
        misc_query = misc_query.join(Vehicle).filter(Vehicle.type == vehicle_type)
    misc_costs = misc_query.scalar() or 0.0

    total_costs = fuel_costs + maint_costs + misc_costs

    data = {
        "fuel": fuel_costs,
        "maint": maint_costs,
        "misc": misc_costs,
        "total": total_costs
    }

    return success_response(
        status_code=http_status.HTTP_200_OK,
        msg="Analytics fetched successfully",
        data=data
    )
