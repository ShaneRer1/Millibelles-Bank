import json
from database import init_db, Expense, Budget, SessionLocal

init_db()
db = SessionLocal()

with open('expenses.json', 'r') as f:
    expenses = json.load(f)


for e in expenses:
    expense = Expense(
        id = e['id'],
        date=e['date'],
        category=e['category'],
        amount=e['amount'],
        description=e.get('description', '')
    )
    db.add(expense)

# Migrate budgets
with open('budgets.json', 'r') as f:
    budgets = json.load(f)

for category, amount in budgets.items():
    budget = Budget(category=category, amount=amount)
    db.add(budget)

db.commit()
db.close()
print("Migration complete!")
    