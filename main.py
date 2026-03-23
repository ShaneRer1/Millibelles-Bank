# main.py

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
#from file_ops import load_expenses, save_expenses, save_budgets, load_budgets
from datetime import datetime
import uuid
from database import get_db, init_db, Expense as ExpenseModel, Budget as BudgetModel
from sqlalchemy.orm import Session

app = FastAPI()
@app.on_event("startup")
def startup():
    init_db()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class Expense(BaseModel):
    category: str
    amount: float = Field(gt = 0, description="Amount must be a positive number")
    description: str

class Budget(BaseModel):
    category: str
    limit: float = Field(gt = 0, description="Budget limit must be a positive number")


#GET all expenses
@app.get("/expenses")
def get_expenses(db: Session = Depends(get_db)):
    expenses = db.query(ExpenseModel).all()
    return expenses


#POST a new expense

@app.post("/expenses")
def add_expense(expense: Expense, db: Session = Depends(get_db)):
    new_expense = ExpenseModel(
        id = str(uuid.uuid4()),
        date = datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        category = expense.category,
        amount = expense.amount,
        description = expense.description

    )
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return { "messafe": "Expense added successfully", "expense":new_expense}


# GET totals by category
@app.get("/expenses/summary")
def get_expense_summary(db : Session = Depends(get_db)):
    expenses = db.query(ExpenseModel).all()
    summary = {}
    for expense in expenses:
        category = expense.category
        amount = expense.amount
        if category in summary:
            summary[category] += amount
        else:
            summary[category] = amount
    return summary

# DELETE expense by id
@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: str, db: Session = Depends(get_db)):
    expense = db.query(ExpenseModel).filter(ExpenseModel.id == expense_id).first()
    if not expense:
        raise HTTPException(status_code = 404, detail="Expense not found")
    db.delete(expense)
    db.commit()
    return{ "message": f"Expense with id {expense_id} deleted successfully"}
    
# PUT update expense by id
@app.put("/expenses/{expense_id}")
def edit_expense(expense_id: str, expense : Expense, db : Session = Depends(get_db)):
    expense_to_edit = db.query(ExpenseModel).filter(ExpenseModel.id == expense_id).first()
    if not expense_to_edit:
        raise HTTPException(status_code=404, detail="Expense not found")
    expense_to_edit.category = expense.category
    expense_to_edit.amount = expense.amount
    expense_to_edit.description = expense.description
    db.commit()
    db.refresh(expense_to_edit)
    return{"message": "Expense updated Succesfully", "expense": expense_to_edit}

# GET all budgets
@app.get("/budgets")
def get_budgets(db : Session = Depends(get_db)):
    budgets = db.query(BudgetModel).all()
    return{b.category: b.amount for b in budgets}


#POST a new budget limit
@app.post("/budgets")
def set_budget(budget: Budget, db: Session = Depends(get_db)):
    existing = db.query(BudgetModel).filter(BudgetModel.category == budget.category).first()
    if existing:
        existing.amount = budget.limit
        db.commit()
        db.refresh(existing)
    else:
        new_budget = BudgetModel(category=budget.category, amount=budget.limit)
        db.add(new_budget)
        db.commit()
    budgets = db.query(BudgetModel).all()
    return {"message": f"Budget set for {budget.category}", "budgets": {b.category: b.amount for b in budgets}}

#DELETE a budget limit
@app.delete("/budgets/{category}")
def delete_budget(category: str, db : Session = Depends(get_db)):
    budget = db.query(BudgetModel).filter(BudgetModel.category == category).first()
    if not budget:
        raise HTTPException( status_code = 404, detail="Budget not found")
    db.delete(budget)
    db.commit()
    return { "message": f"Budget removed for {category}"}