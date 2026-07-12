from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Enum as SEnum
from sqlalchemy import Float, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import VehicleStatus
from app.db.models.base import IdMixins, TimeMixins

if TYPE_CHECKING:
    from app.db.models.expense import Expense
    from app.db.models.fuel_log import FuelLog
    from app.db.models.maintenance import Maintenance
    from app.db.models.trip import Trip


class Vehicle(IdMixins, TimeMixins):
    """Maintains master list of vehicles with structural load constraints and status tracking."""

    __tablename__ = "vehicles"

    registration_number: Mapped[str] = mapped_column(
        String(50), unique=True, nullable=False, index=True
    )
    name_model: Mapped[str] = mapped_column(String(100), nullable=False)
    type: Mapped[str] = mapped_column(String(50), nullable=False)  # e.g., Van, Truck, Semi-Trailer
    max_load_capacity: Mapped[float] = mapped_column(Float, nullable=False)  # In kg
    odometer: Mapped[float] = mapped_column(Float, default=0.0)
    acquisition_cost: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[VehicleStatus] = mapped_column(
        SEnum(VehicleStatus), default=VehicleStatus.AVAILABLE, nullable=False
    )

    # Relationships for operational & financial logs
    trips: Mapped[list[Trip]] = relationship("Trip", back_populates="vehicle")
    maintenance_logs: Mapped[list[Maintenance]] = relationship(
        "Maintenance", back_populates="vehicle"
    )
    fuel_logs: Mapped[list[FuelLog]] = relationship(
        "FuelLog", back_populates="vehicle"
    )
    expenses: Mapped[list[Expense]] = relationship("Expense", back_populates="vehicle")
