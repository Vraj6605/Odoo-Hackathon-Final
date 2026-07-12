from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Date, Float, String
from sqlalchemy import Enum as SEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import DriverStatus
from app.db.models.base import IdMixins, TimeMixins

if TYPE_CHECKING:
    from app.db.models.trip import Trip


class Driver(IdMixins, TimeMixins):
    """Maintains driver profiles, compliance tracking (safety metrics, license timelines)."""

    __tablename__ = "drivers"

    name: Mapped[str] = mapped_column(String(100), nullable=False)
    license_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    license_category: Mapped[str] = mapped_column(String(20), nullable=False)
    license_expiry: Mapped[date] = mapped_column(Date, nullable=False)
    contact_number: Mapped[str] = mapped_column(String(20), nullable=False)
    safety_score: Mapped[float] = mapped_column(Float, default=100.0)
    status: Mapped[DriverStatus] = mapped_column(
        SEnum(DriverStatus), default=DriverStatus.AVAILABLE, nullable=False
    )

    # Relationships
    trips: Mapped[list[Trip]] = relationship("Trip", back_populates="driver")
