from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.models.base import IdMixins, TimeMixins

if TYPE_CHECKING:
    from app.db.models.user import User


class UserForgotPasswordTrack(IdMixins, TimeMixins):
    __tablename__ = "user_forgot_password_track"

    user_id: Mapped[str] = mapped_column(ForeignKey("users.id"))
    link_expiry: Mapped[int] = mapped_column(BigInteger, nullable=False)

    # Relationships
    user: Mapped[User] = relationship(
        "User", back_populates="forgot_password_liks"
    )
