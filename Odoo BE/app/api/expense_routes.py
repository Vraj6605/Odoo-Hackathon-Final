from fastapi import APIRouter, Depends, status as http_status
from sqlalchemy.orm import Session

from app.core.dependecy import RoleCheck
from app.db.session import get_db
from app.core.response import success_response
from app.schema.expense import ExpenseCreate, ExpenseUpdate, ExpenseResponse
from app.services.expense_service import ExpenseService

router = APIRouter(
    prefix="/expenses",
    tags=["Expenses"],
    dependencies=[Depends(RoleCheck(["FINANCIAL_ANALYST"]))]
)

@router.post("/", summary="Create a new expense record")
async def create_expense(payload: ExpenseCreate, db: Session = Depends(get_db)):
    service = ExpenseService(db)
    expense = await service.create_expense(payload)
    return success_response(
        status_code=http_status.HTTP_201_CREATED,
        msg="Expense record created successfully",
        data=ExpenseResponse.model_validate(expense).model_dump(),
    )

@router.get("/", summary="Get all expense records")
async def get_all_expenses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    service = ExpenseService(db)
    expenses = await service.get_all_expenses(skip, limit)
    data = [ExpenseResponse.model_validate(e).model_dump() for e in expenses]
    return success_response(
        status_code=http_status.HTTP_200_OK,
        msg="Expenses fetched successfully",
        data=data,
    )

@router.get("/{id}", summary="Get expense by ID")
async def get_expense_by_id(id: str, db: Session = Depends(get_db)):
    service = ExpenseService(db)
    expense = await service.get_expense_by_id(id)
    return success_response(
        status_code=http_status.HTTP_200_OK,
        msg="Expense fetched successfully",
        data=ExpenseResponse.model_validate(expense).model_dump(),
    )

@router.put("/{id}", summary="Update an expense record")
async def update_expense(id: str, payload: ExpenseUpdate, db: Session = Depends(get_db)):
    service = ExpenseService(db)
    expense = await service.update_expense(id, payload)
    return success_response(
        status_code=http_status.HTTP_200_OK,
        msg="Expense updated successfully",
        data=ExpenseResponse.model_validate(expense).model_dump(),
    )

@router.delete("/{id}", summary="Delete an expense record")
async def delete_expense(id: str, db: Session = Depends(get_db)):
    service = ExpenseService(db)
    await service.delete_expense(id)
    return success_response(
        status_code=http_status.HTTP_200_OK,
        msg="Expense deleted successfully",
    )
