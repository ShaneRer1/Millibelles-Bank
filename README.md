# Millibelle's Bank 🪙
A full-stack personal finance web app built with a Hollow Knight theme.
Track your Geo, manage subscriptions, and visualise your spending patterns.

## Tech Stack

**Backend**
- Python / FastAPI
- SQLAlchemy ORM
- SQLite database
- APScheduler (background job scheduling)

**Frontend**
- React (Vite)
- Recharts (data visualisation)
- CSS animations & canvas particle effects

## Features

### Expenses
- ✅ Add, edit and delete expenses
- ✅ Filter by date range, category and description
- ✅ Income filter to show only income rows in the ledger
- ✅ CSV export of expense ledger

### Income
- ✅ Log regular pay entries (amount, source, notes)
- ✅ Log one-off income (gifts, selling items, etc.)
- ✅ Edit and delete income entries
- ✅ Combined ledger — expenses and income in one timeline, colour coded

### Balance
- ✅ Net balance bar showing income, one-off income, expenses and net total
- ✅ Filterable by month

### Recurring Expenses
- ✅ Add subscriptions and recurring bills with weekly/monthly/yearly frequency
- ✅ Background scheduler auto-creates expense records when due
- ✅ Active/inactive toggle to pause subscriptions
- ✅ Estimated monthly cost calculated across all active subscriptions

### Summary & Analytics
- ✅ Category spending summary with budget limits and progress bars
- ✅ Pie chart spending breakdown
- ✅ Interactive 7-day spending trends line chart — click a data point to filter the pie chart to that day's breakdown

### UI
- ✅ Hollow Knight theme — Cinzel font, Millibelle banker image, corner decorations
- ✅ Animated particle background with glowing gold orbs and shifting gradient
- ✅ Responsive mobile design
- ✅ Frosted glass form containers

## How to Run

**Backend**
```bash
cd "Expense Tracker"
pip install fastapi uvicorn sqlalchemy apscheduler python-dateutil
python -m uvicorn main:app --reload
```

**Frontend**
```bash
cd "Expense Tracker/expense-frontend"
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.