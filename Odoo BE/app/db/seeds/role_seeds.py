import logging
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')))

# Import all models to ensure SQLAlchemy mapper registry compiles successfully
from app.db.models import (
    Role,
    User,
    UserSession,
    UserForgotPasswordTrack,
    Vehicle,
    Driver,
    Trip,
    Maintenance,
    FuelLog,
    Expense,
)
from app.db.session import Session

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Roles data as per authorization matrix
ROLES_TO_SEED = [
    {
        "role_name": "SUPER_ADMIN",
        "description": "Super Administrator with full access to all system modules.",
        "manage_users": True,
        "dispatch_trips": True,
        "manage_vehicles_shop": True,
        "manage_drivers": True,
        "view_analytics_roi": True,
    },
    {
        "role_name": "FLEET_MANAGER",
        "description": "Fleet Manager responsible for vehicles and shop operations.",
        "manage_users": False,
        "dispatch_trips": False,
        "manage_vehicles_shop": True,
        "manage_drivers": False,
        "view_analytics_roi": False,
    },
    {
        "role_name": "DISPATCHER",
        "description": "Dispatcher responsible for scheduling and dispatching trips.",
        "manage_users": False,
        "dispatch_trips": True,
        "manage_vehicles_shop": False,
        "manage_drivers": False,
        "view_analytics_roi": False,
    },
    {
        "role_name": "SAFETY_OFFICER",
        "description": "Safety Officer responsible for driver compliance and safety scoring.",
        "manage_users": False,
        "dispatch_trips": False,
        "manage_vehicles_shop": False,
        "manage_drivers": True,
        "view_analytics_roi": False,
    },
    {
        "role_name": "FINANCIAL_ANALYST",
        "description": "Financial Analyst responsible for viewing analytics and ROI metrics.",
        "manage_users": False,
        "dispatch_trips": False,
        "manage_vehicles_shop": False,
        "manage_drivers": False,
        "view_analytics_roi": True,
    },
]


def seed_roles():
    db = Session()
    try:
        for r_data in ROLES_TO_SEED:
            existing_role = (
                db.query(Role).filter(Role.role_name == r_data["role_name"]).first()
            )
            if not existing_role:
                new_role = Role(
                    role_name=r_data["role_name"],
                    description=r_data["description"],
                    manage_users=r_data["manage_users"],
                    dispatch_trips=r_data["dispatch_trips"],
                    manage_vehicles_shop=r_data["manage_vehicles_shop"],
                    manage_drivers=r_data["manage_drivers"],
                    view_analytics_roi=r_data["view_analytics_roi"],
                )
                db.add(new_role)
                logger.info(f"Adding role: {r_data['role_name']}")
            else:
                existing_role.description = r_data["description"]
                existing_role.manage_users = r_data["manage_users"]
                existing_role.dispatch_trips = r_data["dispatch_trips"]
                existing_role.manage_vehicles_shop = r_data["manage_vehicles_shop"]
                existing_role.manage_drivers = r_data["manage_drivers"]
                existing_role.view_analytics_roi = r_data["view_analytics_roi"]
                logger.info(f"Updating role: {r_data['role_name']}")
        db.commit()
        logger.info("Database seeding completed successfully.")
    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    seed_roles()
