#file_ops.py

import json
def save_expenses(expenses):
    try:
        with open('expenses.json', 'w') as file:
            json.dump(expenses, file)
    except Exception as e:
        print(f"Error saving file{e}")

def load_expenses():
    try:
        with open('expenses.json', 'r') as file:
            content = file.read()
            if not content:
                return []
            return json.loads(content)
    except FileNotFoundError:
        return []
    except Exception as e:
        print(f"Error loading existing expenses: {e}")
        return []
    
def delete_last_expense(expenses):
    if expenses:
        last_expense = expenses[-1]
        confirm = input(f"Last expense: \n"
                         f"Date: {last_expense['date']}\n"
                         f"Category: {last_expense['category']}\n"
                         f"Amount: ${last_expense['amount']}\n"
                         f"Description: {last_expense['description']}\n"
                         f"Press n to cancel, any other key to confirm deletion: ")
        if confirm.lower() != 'n':
            expenses.pop()
            print(f"Deleted last expense: {last_expense}")
            save_expenses(expenses)
    else:
        print("No expenses to delete.")

def save_budgets(budgets):
    try:
        with open('budgets.json', 'w') as file:
            json.dump(budgets, file)
    except Exception as e:
        print(f"Error saving budgets: {e}")

def load_budgets():
    try:
        with open('budgets.json', 'r') as file:
            content = file.read()
            if not content:
                return {}
            return json.loads(content)
    except FileNotFoundError:
        return {}
    except Exception as e:
        print(f"Error loading budgets: {e}")
        return {}