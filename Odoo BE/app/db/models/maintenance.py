from __future__ import annotations

from datetime import date
from typing import TYPE_CHECKING

from sqlalchemy import Date, Float, ForeignKey, String
from sqlalchemy import Enum as SEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.enums import MaintenanceStatus
from app.db.models.base import IdMixins, TimeMixins

if TYPE_CHECKING:
    from app.db.models.vehicle import Vehicle


class Maintenance(IdMixins, TimeMixins):
    """Automates vehicle service logging. Entry forces vehicle status to 'In Shop'."""

    __tablename__ = "maintenance_logs"

    description: Mapped[str] = mapped_column(String(255), nullable=False)
    cost: Mapped[float] = mapped_column(Float, default=0.0)
    entry_date: Mapped[date] = mapped_column(Date, default=date.today)
    completion_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[MaintenanceStatus] = mapped_column(
        SEnum(MaintenanceStatus), default=MaintenanceStatus.OPEN, nullable=False
    )

    # Foreign Keys
    vehicle_id: Mapped[str] = mapped_column(
        String, ForeignKey("vehicles.id"), nullable=False
    )

    # Relationships
    vehicle: Mapped[Vehicle] = relationship(
        "Vehicle", back_populates="maintenance_logs"
    )
