from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Boolean, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models.base import IdMixins, TimeMixins

if TYPE_CHECKING:
    from app.db.models.user import User


class Role(IdMixins, TimeMixins):
    __tablename__ = "roles"

    role_name: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)

    # Permission Matrix
    manage_users: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    dispatch_trips: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    manage_vehicles_shop: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )
    manage_drivers: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    view_analytics_roi: Mapped[bool] = mapped_column(
        Boolean, default=False, nullable=False
    )

    # Relationships
    users: Mapped[list[User]] = relationship("User", back_populates="role")

    def __str__(self):
        return self.role_name
