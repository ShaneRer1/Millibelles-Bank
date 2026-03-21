from datetime import datetime
import os
import json

from input_functions import get_Category, get_Amount, get_Description
from file_ops import save_expenses, load_expenses, delete_last_expense
from expense_views import filter_expenses_by_date, todays_expenses, category_expenses
from expense_operations import edit_expense

#expenses = [{'date': '08-09-2025 23:57:42', 'category': 'Groceries', 'amount': 87.99, 'description': 'Grocery shop at coles'}, 
            #{'date': '08-09-2025 23:58:33', 'category': 'Travel', 'amount': 12.65, 'description': 'Uber to work'}]
def clear_console():
    os.system('cls' if os.name == 'nt' else 'clear')

# Daily Expense Tracker, refreshes each day to 0 expenses function
while True:
    expenses = load_expenses()

    print("\nTrack your stuff boss\n" \
    "Options:\n" \
    "1. Add expense\n" \
    "2. View expenses\n" \
    "3. Total expenses\n" \
    "4. View expense by category\n" \
    "5. View expense by date\n" \
    "6. Delete last expense\n" \
    "7. Edit expense\n" \
    "8. Exit\n")
    choice = input("Enter Choice: ")

    if choice == '1': #Add expense
        now = datetime.now()
        date = now.strftime("%d-%m-%Y %H:%M:%S")
        
        category = get_Category()
        amount = get_Amount()          

        description = get_Description()
        print("\nReview your expense:")
        print(f"Date: {date}\nCategory: {category}\nAmount: ${amount}\nDescription: {description}")
        while True:
            confirm = input("\nDo you want to save this expense? (y/n)").lower()
            if confirm in ['y', 'yes', '']:
                expenses.append({"date": date, "category": category, "amount": amount, "description": description})
                print("Expense saved successfully!")
                save_expenses(expenses)
                clear_console()
                break

            elif confirm in ['n', 'no']:
                print("Expense not saved.")
                break
            else:
                print("Try again, Invalid Input")

    elif choice == '2': #View expenses
        clear_console()
        print(f"{'Date':<20} | {'Category':<20} | {'Amount':<10} | {'Description':<30}")
        print("-" * 80)
        for expense in expenses:
            print(f"{expense['date']:<20} | {expense['category']:<20} | ${expense['amount']:<9.2f} | {expense['description']:<30}")
            #print(expense)
        input("\nPress Enter to continue...")

    elif choice == '3': #Total expenses
        clear_console()
        category_expenses(expenses)

    elif choice == '4': #View expense by category
        clear_console()
        category = get_Category()
        filtered_expenses = [expense for expense in expenses if expense['category'] == category]
        if filtered_expenses:
            print(f"\nExpenses in category '{category}':")
            print(f"{'Date':<20} | {'Category':<20} | {'Amount':<10} | {'Description':<30}")
            print("-" * 80)
            for expense in filtered_expenses:
                print(f"{expense['date']:<20} | {expense['category']:<20} | ${expense['amount']:<10.2f} | {expense['description']:<30}")
            input("\nPress Enter to continue...")
        else:
            print(f"No expenses found in category '{category}'.")        
    
    elif choice == '5': #View expense by date
        clear_console()
        filter_expenses_by_date(expenses)

    elif choice == '6': #Delete last expense
        clear_console()
        delete_last_expense(expenses)
        save_expenses(expenses)

    elif choice == '7': #Edit expense
        clear_console()
        edit_expense(expenses)
        save_expenses(expenses)

    
    elif choice == '8': #Exit
        save_expenses(expenses)
        print("See ya later samurai")
        break

    else:
        print("Invalid Input")


