from fastapi import APIRouter

from app.api.user_routes import router as user_router
from app.api.driver_routes import router as driver_router
from app.api.vehicle_routes import router as vehicle_router
from app.api.trip_routes import router as trip_router
from app.api.maintenance_routes import router as maintenance_router
from app.api.expense_routes import router as expense_router
from app.api.fuel_log_routes import router as fuel_log_router

app_router = APIRouter()

# Add Routes with Module Wise
app_router.include_router(user_router)
app_router.include_router(driver_router)
app_router.include_router(vehicle_router)
app_router.include_router(trip_router)
app_router.include_router(maintenance_router)
app_router.include_router(expense_router)
app_router.include_router(fuel_log_router)
