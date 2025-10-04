# expense_views.py
from datetime import datetime

def filter_expenses_by_date(expenses):
    while True: 
        date_str = input("Enter date (DD-MM-YYYY) or Leave empty for today's expenses: ")
        date_str = date_str.strip()
        try:
            if not date_str:
                filtered_expenses = todays_expenses(expenses)
                print("\nToday's Expenses:")
            else:
                filter_date = datetime.strptime(date_str, "%d-%m-%Y").date()
                filtered_expenses = [expense for expense in expenses if datetime.strptime(expense['date'], "%d-%m-%Y %H:%M:%S").date() == filter_date]
                print(f"\nExpenses on '{date_str}':")
            if filtered_expenses:
                
                print(f"{'Date':<20} | {'Category':<20} | {'Amount':<10} | {'Description':<30}")
                print("-" * 80)
                for expense in filtered_expenses:
                    print(f"{expense['date']:<20} | {expense['category']:<20} | ${expense['amount']:<10.2f} | {expense['description']:<30}")
                input("\nPress Enter to continue...")
                break
            else:
                print(f"No expenses found on '{date_str}'.")
                break
        except ValueError:
            print("Invalid date format. Please enter the date in DD-MM-YYYY format.")

def todays_expenses(expenses):
    today = datetime.now().date()
    todays_expenses = [expense for expense in expenses if datetime.strptime(expense['date'], "%d-%m-%Y %H:%M:%S").date() == today]
    return todays_expenses

def category_expenses(expenses):
    category_totals = {}
    for expense in expenses:
        category = expense['category']
        amount = expense['amount']
        if category in category_totals:
            category_totals[category] += amount
        else:
            category_totals[category] = amount
    
    print(f"{'Category':<20} | {'Total Amount':<15}")
    print("-" * 40)
    for category, total in category_totals.items():
        print(f"{category:<20} | ${total:<15.2f}")

    print("-" * 40)
    total_expenses = sum(category_totals.values())
    print(f"{'Total':<20} | ${total_expenses:<15.2f}")
    input("\nPress Enter to continue...")
