# Millibelle's Bank 🪙

A full-stack expense tracking web app built with a Hollow Knight theme. 
Track your Geo spending, set budgets, and visualise your spending patterns.

## Tech Stack

**Backend**
- Python / FastAPI
- SQLAlchemy ORM
- SQLite database

**Frontend**
- React (Vite)
- Recharts (data visualisation)
- CSS animations & canvas particle effects

## Features

- ✅ Add, edit and delete expenses
- ✅ Filter by date range, category and description
- ✅ Category spending summary with budget limits and progress bars
- ✅ Pie chart spending breakdown
- ✅ 7-day spending trends line chart
- ✅ Animated particle background with glowing orbs
- ✅ Hollow Knight theme with Cinzel font and custom imagery

## How to Run

**Backend**
```bash
cd "Expense Tracker"
pip install fastapi uvicorn sqlalchemy
python -m uvicorn main:app --reload
```

**Frontend**
```bash
cd "Expense Tracker/expense-frontend"
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.