#File for expense operations
from input_functions import get_Category

def edit_expense(expenses):
    if not expenses:
        print("No expenses to edit.")
        return

    # Show last 10 expenses

    last_expenses = expenses[-10:]
    print(f"{'Index':<6} | {'Date':<20} | {'Category':<20} | {'Amount':<10} | {'Description':<30}")
    print("-" * 90)
    for idx, expense in enumerate(last_expenses):
        print(f"{idx:<6} | {expense['date']:<20} | {expense['category']:<20} | ${expense['amount']:<10.2f} | {expense['description']:<30}")

    # Get user input
    while True:
        try:
            index = input("Enter the index of the expense you want to edit, blank to exit: ")
            if index.strip() == "":
                return
            index = int(index)  
            if index < 0 or index >= len(last_expenses):
                print("Invalid index.")
                continue
            break
        except ValueError:
            print("Please enter a valid number.")
            return
    
    real_index = len(expenses) - len(last_expenses) + index
    expense_to_edit = expenses[real_index]
    print("Leave a field blank to keep it unchanged.")

    #new_date = input(f"Enter new date (current: {expense_to_edit['date']}): ") or expense_to_edit['date']
    print(f"Enter new category (current: {expense_to_edit['category']}): ")
    new_category = get_Category()

    while True:
        new_amount_input = input(f"Enter new amount (current: {expense_to_edit['amount']}): ")
        if new_amount_input == "":
            new_amount = expense_to_edit['amount']
            break
        try:
            new_amount = float(new_amount_input)
            if new_amount <= 0:
                print("Amount must be positive. Try again.")
                continue
            break
        except ValueError:
            print("Please enter a valid number.")

    new_description = input(f"Enter new description (current: {expense_to_edit['description']}): ") or expense_to_edit['description']

    expenses[index] = {
        "date": expense_to_edit['date'],
        "category": new_category,
        "amount": new_amount,
        "description": new_description
    }

    print("Expense updated successfully!")