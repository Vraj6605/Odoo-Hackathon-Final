from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import BigInteger, Boolean, ForeignKey, Integer, String
from sqlalchemy import Enum as SEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.db.models.base import IdMixins, TimeMixins

if TYPE_CHECKING:
    from app.db.models.role import Role
    from app.db.models.user_forgot_password_tracking import UserForgotPasswordTrack
    from app.db.models.user_session import UserSession


class User(IdMixins, TimeMixins):
    __tablename__ = "users"

    first_name: Mapped[str] = mapped_column(String, nullable=True, default=None)
    last_name: Mapped[str] = mapped_column(String, nullable=True, default=None)
    email: Mapped[str] = mapped_column(String, nullable=False)
    password: Mapped[str] = mapped_column(String, nullable=True, default=None)
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=True, default=False)
    otp: Mapped[int] = mapped_column(Integer, nullable=True, default=None)
    otp_expiry: Mapped[int] = mapped_column(BigInteger, nullable=True, default=None)

    # Foreign Keys
    role_id: Mapped[str] = mapped_column(ForeignKey("roles.id"), nullable=False)

    # Relationships
    user_sessions: Mapped[UserSession] = relationship(
        "UserSession", back_populates="user"
    )  # One to One
    role: Mapped[Role] = relationship("Role", back_populates="users")  # One to One
    forgot_password_liks: Mapped[UserForgotPasswordTrack] = relationship(
        "UserForgotPasswordTrack", back_populates="user"
    )
