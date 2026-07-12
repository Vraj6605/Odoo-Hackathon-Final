from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Date, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models.base import IdMixins, TimeMixins

if TYPE_CHECKING:
    from app.db.models.trip import Trip
    from app.db.models.vehicle import Vehicle


class FuelLog(IdMixins, TimeMixins):
    """Stores fuel logs for precise efficiency calculations (Distance / Fuel)."""

    __tablename__ = "fuel_logs"

    liters: Mapped[float] = mapped_column(Float, nullable=False)
    cost: Mapped[float] = mapped_column(Float, nullable=False)
    log_date: Mapped[date] = mapped_column(Date, default=date.today)

    # Foreign Keys
    vehicle_id: Mapped[str] = mapped_column(
        String, ForeignKey("vehicles.id"), nullable=False
    )
    trip_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("trips.id"), nullable=True
    )

    # Relationships
    vehicle: Mapped[Vehicle] = relationship("Vehicle", back_populates="fuel_logs")
    trip: Mapped[Trip | None] = relationship("Trip", back_populates="fuel_logs")
