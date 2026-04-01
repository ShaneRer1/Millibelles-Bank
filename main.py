# main.py

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime
import uuid
from database import get_db, init_db, Expense as ExpenseModel, Budget as BudgetModel, Income as IncomeModel, OneOffIncome as OneOffIncomeModel, RecurringExpense as RecurringModel
from sqlalchemy.orm import Session
from typing import Literal, Optional
from scheduler import start_scheduler 


app = FastAPI()
@app.on_event("startup")
def startup():
    init_db()
    start_scheduler()

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

class IncomeEntry(BaseModel):
    amount: float = Field(gt=0, description="Amount must be positive")
    source: str
    notes: str= ""

class OneOffIncomeEntry(BaseModel):
    amount: float = Field(gt=0, description="Amount must be positive")
    description: str

class RecurringExpense(BaseModel):
    category: str
    amount: float = Field(gt=0, description="Amount must be positive")
    description: str
    frequency: Literal["weekly", "monthly", "yearly"]
    last_run: Optional[str] = None


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

#GET all income entries
@app.get("/income")
def get_income(db: Session = Depends(get_db)):
    return db.query(IncomeModel).order_by(IncomeModel.date.desc()).all()

#GET all OO Incomes
@app.get("/income/one-off")
def get_one_off_income( db: Session = Depends(get_db)):
    return db.query(OneOffIncomeModel).order_by(OneOffIncomeModel.date.desc()).all()


#POST a new OO income entry
@app.post("/income/one-off")
def add_one_off_income(entry: OneOffIncomeEntry, db: Session = Depends(get_db)):
    new_entry = OneOffIncomeModel(
        id = str(uuid.uuid4()),
        amount = entry.amount,
        description = entry.description,
        date = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return {"message": "Income added successfully", "income": new_entry}


#POST a new income entry
@app.post("/income")
def add_income(entry: IncomeEntry, db : Session = Depends(get_db)):
    new_income = IncomeModel(
        id = str(uuid.uuid4()),
        amount = entry.amount,
        source = entry.source,
        date = datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        notes = entry.notes
    )
    db.add(new_income)
    db.commit()
    db.refresh(new_income)
    return {"message": "Income added successfully", "income": new_income}


#DELETE a OO Income entry
@app.delete("/income/one-off/{entry_id}")
def delete_one_off_income( entry_id: str, db: Session = Depends(get_db)):
    entry = db.query(OneOffIncomeModel).filter(OneOffIncomeModel.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="One Off Income entry not found")
    db.delete(entry)
    db.commit()
    return {"message": f"Income entry {entry_id} deleted successfully"}

#DELETE an income entry
@app.delete("/income/{income_id}")
def delete_income( income_id: str, db: Session = Depends(get_db)):
    entry = db.query(IncomeModel).filter(IncomeModel.id == income_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Income entry not found")
    db.delete(entry)
    db.commit()
    return {"message": f"Income entry {income_id} deleted successfully"}


#PUT edit a OO Income entry
@app.put("/income/one-off/{entry_id}")
def edit_one_off_income(entry_id: str, entry: OneOffIncomeEntry, db: Session = Depends(get_db)):
    income_to_edit = db.query(OneOffIncomeModel).filter(OneOffIncomeModel.id == entry_id).first()
    if not income_to_edit:
        raise HTTPException(status_code=404, detail="One Off Income entry not found")
    income_to_edit.amount = entry.amount
    income_to_edit.description = entry.description
    db.commit()
    db.refresh(income_to_edit)
    return {"message": "One Off Income entry updated successfully", "income": income_to_edit}

#PUT edit an income entry
@app.put("/income/{income_id}")
def edit_income(income_id: str, entry: IncomeEntry, db: Session = Depends(get_db)):
    income_to_edit = db.query(IncomeModel).filter(IncomeModel.id == income_id).first()
    if not income_to_edit:
        raise HTTPException(status_code=404, detail="Income entry not found")
    income_to_edit.amount = entry.amount
    income_to_edit.source = entry.source
    income_to_edit.notes = entry.notes
    db.commit()
    db.refresh(income_to_edit)
    return {"message": "Income entry updated successfully", "income": income_to_edit}








#   BALANCE----------------------------------------------------------------------------------

#GET new balance, filterable by month
@app.get("/balance")
def get_balance(month: str = None, db: Session = Depends(get_db)):
    income_query = db.query(IncomeModel).all()
    one_off_query = db.query(OneOffIncomeModel).all()
    expense_query = db.query(ExpenseModel).all()

    if month:
        income_query= [i for i in income_query if i.date.startswith(month)]
        one_off_query= [i for i in one_off_query if i.date.startswith(month)]
        expense_query= [e for e in expense_query if e.date.startswith(month)]

    total_income = round(sum(i.amount for i in income_query), 2)
    total_one_off = round(sum(i.amount for i in one_off_query), 2)
    total_expenses = round(sum(e.amount for e in expense_query), 2)

    net_balance = round(total_income + total_one_off - total_expenses, 2)

    return {
        "month": month or "all-time",
        "total_income" : total_income,
        "total_one_off": total_one_off,
        "total_expenses":total_expenses,
        "net_balance" : net_balance
    }


#RECURRING EXPENSES-------------------------------------------------------------------------

#GET a recurring expense
@app.get("/recurring_expenses")
def get_subscriptions(db: Session = Depends(get_db)):
    subscriptions = db.query(RecurringModel).all()
    return subscriptions

#POST a recurring expense
@app.post("/recurring_expenses")
def add_subscription( subscription : RecurringExpense, db: Session = Depends(get_db)):
    new_subscription = RecurringModel(
        id = str(uuid.uuid4()),
        last_run = subscription.last_run if subscription.last_run else datetime.now().strftime("%Y-%m-%d"),
        active = True,
        category = subscription.category,
        amount = subscription.amount,
        description = subscription.description,
        frequency = subscription.frequency

    )
    db.add(new_subscription)
    db.commit()
    db.refresh(new_subscription)
    return { "message": "Subscription added successfully", "sub":new_subscription}


#DELETE a subscription
@app.delete("/recurring_expenses/{subscription_id}")
def delete_subscription(subscription_id: str, db: Session = Depends(get_db)):
    subscription = db.query(RecurringModel).filter(RecurringModel.id == subscription_id).first()
    if not subscription:
        raise HTTPException(status_code = 404, detail="Subscription not found")
    db.delete(subscription)
    db.commit()
    return{ "message": f"Subscription with id {subscription_id} deleted successfully"}


#PUT edit Subscriptions
@app.put("/recurring_expenses/{subscription_id}")
def edit_subscription(subscription_id: str, subscription: RecurringExpense, db: Session = Depends(get_db)):
    sub_to_edit = db.query(RecurringModel).filter(RecurringModel.id == subscription_id).first()
    if not sub_to_edit:
        raise HTTPException(status_code = 404, detail="Subscription not found")
    sub_to_edit.category = subscription.category
    sub_to_edit.amount = subscription.amount
    sub_to_edit.description = subscription.description
    sub_to_edit.frequency = subscription.frequency
    if subscription.last_run:
        sub_to_edit.last_run = subscription.last_run
    db.commit()
    db.refresh(sub_to_edit)
    return{"message": "Subscription updated Succesfully", "subscription": sub_to_edit}

 # PATCH edit active status   
@app.patch("/recurring_expenses/{subscription_id}/toggle")
def toggle_subscription(subscription_id: str, db: Session = Depends(get_db)):
    sub = db.query(RecurringModel).filter(RecurringModel.id == subscription_id).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    sub.active = not sub.active
    db.commit()
    db.refresh(sub)
    return {"message": "Subscription toggled", "subscription": sub}