from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Enum as SEnum
from sqlalchemy import Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import TripStatus
from app.db.models.base import IdMixins, TimeMixins

if TYPE_CHECKING:
    from app.db.models.driver import Driver
    from app.db.models.expense import Expense
    from app.db.models.fuel_log import FuelLog
    from app.db.models.vehicle import Vehicle


class Trip(IdMixins, TimeMixins):
    """Tracks trip lifecycle workflows and aggregates trip closure data."""

    __tablename__ = "trips"

    source: Mapped[str] = mapped_column(String(255), nullable=False)
    destination: Mapped[str] = mapped_column(String(255), nullable=False)
    cargo_weight: Mapped[float] = mapped_column(Float, nullable=False)
    planned_distance: Mapped[float] = mapped_column(Float, nullable=False)
    status: Mapped[TripStatus] = mapped_column(
        SEnum(TripStatus), default=TripStatus.DRAFT, nullable=False
    )

    # Required parameters populated during Trip Completion
    actual_fuel_consumed: Mapped[float | None] = mapped_column(Float, nullable=True)
    final_odometer: Mapped[float | None] = mapped_column(Float, nullable=True)

    # Foreign Keys
    vehicle_id: Mapped[str] = mapped_column(
        String, ForeignKey("vehicles.id"), nullable=False
    )
    driver_id: Mapped[str] = mapped_column(
        String, ForeignKey("drivers.id"), nullable=False
    )

    # Relationships
    vehicle: Mapped[Vehicle] = relationship("Vehicle", back_populates="trips")
    driver: Mapped[Driver] = relationship("Driver", back_populates="trips")
    fuel_logs: Mapped[list[FuelLog]] = relationship("FuelLog", back_populates="trip")
    expenses: Mapped[list[Expense]] = relationship("Expense", back_populates="trip")
