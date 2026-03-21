# main.py

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from file_ops import load_expenses, save_expenses, save_budgets, load_budgets
from datetime import datetime
import uuid

app = FastAPI()

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
def get_expenses():
    return load_expenses()


#POST a new expense

@app.post("/expenses")
def add_expense(expense: Expense):
    expenses = load_expenses()
    new_expense = {
        "id": str(uuid.uuid4()),
        "date": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "category": expense.category,
        "amount": expense.amount,
        "description": expense.description
        
    }
    expenses.append(new_expense)
    save_expenses(expenses)
    return {"message": "Expense added successfully", "expense": new_expense}


# GET totals by category
@app.get("/expenses/summary")
def get_expense_summary():
    expenses = load_expenses()
    summary = {}
    for expense in expenses:
        category = expense["category"]
        amount = expense["amount"]
        if category in summary:
            summary[category] += amount
        else:
            summary[category] = amount
    return summary

# DELETE expense by id
@app.delete("/expenses/{expense_id}")
def delete_expense(expense_id: str):
    expenses = load_expenses()
    expense_to_delete = next((e for e in expenses if e["id"] == expense_id), None)
    if expense_to_delete:
        expenses.remove(expense_to_delete)
        save_expenses(expenses)
        return {"message": f"Expense with id {expense_id} deleted successfully"}
    else:
        raise HTTPException(status_code=404, detail="Expense not found")
    
# PUT update expense by id
@app.put("/expenses/{expense_id}")
def edit_expense(expense_id: str, expense : Expense):
    expenses = load_expenses()
    expense_to_edit = next(( e for e in expenses if e["id"] == expense_id), None)

    if expense_to_edit:
        expense_to_edit["category"] = expense.category
        expense_to_edit["amount"] = expense.amount
        expense_to_edit["description"] = expense.description
        save_expenses(expenses)
        return {"message": "Expense updated successfully", "expense": expense_to_edit}
    else:
        raise HTTPException(status_code=404, detail="Expense not found")


# GET all budgets
@app.get("/budgets")
def get_budgets():
    return load_budgets()

#POST a new budget limit
@app.post("/budgets")
def set_budget(budget: Budget):
    budgets = load_budgets()
    budgets[budget.category] = budget.limit
    save_budgets(budgets)
    return {"message": f"Budget set for category {budget.category}" , "budgets": budgets}

#DELETE a budget limit
@app.delete("/budgets/{category}")
def delete_budget(category: str):
    budgets = load_budgets()
    if category in budgets:
        del budgets[category]
        save_budgets(budgets)
        return {"message": f"Budget for category {category} deleted successfully"}
    raise HTTPException(status_code=404, detail="Budget category not found")