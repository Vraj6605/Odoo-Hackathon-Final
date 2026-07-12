from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Date, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models.base import IdMixins, TimeMixins

if TYPE_CHECKING:
    from app.db.models.trip import Trip
    from app.db.models.vehicle import Vehicle


class Expense(IdMixins, TimeMixins):
    """Tracks generic operational expenses (e.g., tolls, permits, fines)."""

    __tablename__ = "expenses"

    category: Mapped[str] = mapped_column(String(100), nullable=False)
    amount: Mapped[float] = mapped_column(Float, nullable=False)
    expense_date: Mapped[date] = mapped_column(Date, default=date.today)

    # Foreign Keys
    vehicle_id: Mapped[str] = mapped_column(
        String, ForeignKey("vehicles.id"), nullable=False
    )
    trip_id: Mapped[str | None] = mapped_column(
        String, ForeignKey("trips.id"), nullable=True
    )

    # Relationships
    vehicle: Mapped[Vehicle] = relationship("Vehicle", back_populates="expenses")
    trip: Mapped[Trip | None] = relationship("Trip", back_populates="expenses")
