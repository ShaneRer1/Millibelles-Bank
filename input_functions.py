#inputfunctions.py


def get_Category(): #Function to get category of expensesfrom user
    categories = [
        "Food and Dining",
        "Travel",
        "Utilities",
        "Entertainment",
        "Upgrades",
        "Health and Fitness",
        "Education",
        "Shopping",
        "Groceries",
        "Miscellaneous"
    ]

    for i, category in enumerate(categories, start=1):
        print(f"{i}. {category}")

    while True:
        try:
            choice = int(input("\nSelect a category: "))
            if 1<= choice <= len(categories):
                print(f"You selected: {categories[choice - 1]}")
                return categories[choice - 1]
            else:
                raise ValueError("Invalid option. Please select a valid category number.")
        except ValueError:
            print("Invalid input, please enter a number corresponding to a category instead.")


def get_Amount():
    while True:
        try:
            amount = float(input("Enter Amount: "))
            if amount <0:
                raise ValueError("Amount cannot be negative. Please enter a valid amount.")
            return amount
        except ValueError:
            print("Invalid amount. Please enter a numeric value.")

def get_Description():
    description = input("Enter short description: ")
    description = description.strip()
    if not description:
        description = "No Description"
    return description
