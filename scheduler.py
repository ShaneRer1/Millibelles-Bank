from apscheduler.schedulers.background import BackgroundScheduler
from dateutil.relativedelta import relativedelta
from datetime import datetime
from database import SessionLocal, Expense as ExpenseModel, RecurringExpense as RecurringModel
import uuid

def check_recurring_expenses():
    db = SessionLocal()
    frequency_map = {
    "weekly": relativedelta(weeks=1),
    "monthly": relativedelta(months=1),
    "yearly": relativedelta(years=1)
    }
    try:
        subscriptions = db.query(RecurringModel).filter(RecurringModel.active == True).all()
        for subscription in subscriptions:
            last_run_date  = datetime.strptime(subscription.last_run, "%Y-%m-%d").date()
            due_date = last_run_date + frequency_map[subscription.frequency]
            today = datetime.now().date()
            if today >= due_date:
                new_expense = ExpenseModel(
                    id = str(uuid.uuid4()),
                    date = datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    category = subscription.category,
                    amount = subscription.amount,
                    description = subscription.description  
                )
                subscription.last_run = due_date.strftime("%Y-%m-%d")
                db.add(new_expense)
                db.commit()
                
    finally:
        db.close()

def start_scheduler():
    scheduler = BackgroundScheduler()
    scheduler.add_job(check_recurring_expenses, "interval", days=1)
    scheduler.start()
