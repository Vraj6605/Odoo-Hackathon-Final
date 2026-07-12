from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models.base import IdMixins, TimeMixins

if TYPE_CHECKING:
    from app.db.models.user import User


class UserSession(IdMixins, TimeMixins):
    __tablename__ = "user_sessions"

    # Table fields
    session: Mapped[str] = mapped_column(String, nullable=True, default=None)
    refresh_token: Mapped[str] = mapped_column(String, nullable=True, default=None)
    fcm_token: Mapped[str] = mapped_column(String, nullable=True, default=None)

    # Foreign Keys
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"))

    # Relationships
    user: Mapped[User] = relationship(
        "User", back_populates="user_sessions"
    )  # One to One
