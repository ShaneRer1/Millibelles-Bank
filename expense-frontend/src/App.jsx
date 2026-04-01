import {useState, useEffect} from "react"
import './App.css'
import ParticleBackground from "./ParticleBackground"
import banker from "./banker.webp"
import cornerTL from "./corner-tl.png"
import cornerBR from "./corner-br.png"
import SummaryView from "./components/SummaryView"
import ExpenseTable from "./components/ExpenseTable"
import ExpenseForm from "./components/ExpenseForm"
import BalanceBar from "./components/BalanceBar"
import SubscriptionsView from "./components/SubscriptionsView"

function App() {
  // Data
  const [expenses, setExpenses] = useState([])
  const [income, setIncome] = useState([])
  const [oneOffIncome, setOneOffIncome] = useState([])
  const [subscriptions, setSubscriptions] = useState([])
  const [summary, setSummary] = useState({})
  const [budgets, setBudgets] = useState({})
  const [budgetInputs, setBudgetInputs] = useState({})
  const [balance, setBalance] = useState(null)

  // UI
  const [showView, setShowView] = useState("expenses")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)
  const [balanceMonth, setBalanceMonth] = useState("")
  const [selectedDay, setSelectedDay] = useState(null)

  // Forms
  const [newExpense, setNewExpense] = useState({ category: "", amount: "", description: "" })
  const [filters, setFilters] = useState({ category: "", desc: "", dateA: "", dateB: "" })
  const [editExpense, setEditExpense] = useState({ id: null, category: "", amount: "", description: "" })
  const [newIncome, setNewIncome] = useState({ amount: "", source: "", notes: "" })
  const [newOneOff, setNewOneOff] = useState({ amount: "", description: "" })
  const [editIncome, setEditIncome] = useState({ id: null, amount: "", source: "", notes: "" })
  const [editOneOff, setEditOneOff] = useState({ id: null, amount: "", description: "" })
  const [newSub, setNewSub] = useState({ category: "", amount: "", description: "", frequency: "", lastRun: "" })
  const [editSub, setEditSub] = useState({ id: null, category: "", amount: "", description: "", frequency: "", lastRun: "" })

  async function handleSubmit() {
    if (!newExpense.category) {
      setError("Please select a category")
      return
    }
    if (!newExpense.amount || parseFloat(newExpense.amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }
    if (!newExpense.description.trim()) {
      setError("Please enter a description")
      return
    }
    setError("")
    try {
      const response = await fetch("http://localhost:8000/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newExpense.category, amount: parseFloat(newExpense.amount), description: newExpense.description })
      })
      if (!response.ok) throw new Error("")
      const data = await response.json()
      setExpenses([data.expense, ...expenses])
      setNewExpense(prev => ({ ...prev, amount: "", description: "" }))
      fetchSummary()
    } catch (error) {
      setError("Failed to connect to Back end, is the Server Running?")
      return
    }
  }

  async function handleDelete(id) {
    try {
      const response = await fetch(`http://localhost:8000/expenses/${id}`, {
        method: "DELETE"
      })
      if (!response.ok) throw new Error("Failed to delete expense")
      setExpenses(expenses.filter(expense => expense.id !== id))
      fetchSummary()
    } catch (error) {
      setError("Failed to connect to Back end, is the Server Running?")
      return
    }
  }

  useEffect(() => {
    async function fetchExpenses() {
      try {
        const response = await fetch("http://localhost:8000/expenses")
        if (!response.ok) throw new Error("Failed to fetch expenses")
        const data = await response.json()
        data.sort((a, b) => new Date(b.date) - new Date(a.date))
        setExpenses(data)
      } catch (error) {
        setError("Failed to connect to Back end, is the Server Running?")
      } finally {
        setLoading(false)
      }
    }

    fetchExpenses()
    fetchSummary()
    fetchBudgets()
    fetchIncome()
    fetchBalance("")
    fetchSubscriptions()
  }, [])

  async function fetchSummary() {
    try {
      const response = await fetch("http://localhost:8000/expenses/summary")
      if (!response.ok) throw new Error("Failed to fetch summary")
      const summary = await response.json()
      setSummary(summary)
    } catch (error) {
      setError("Failed to connect to Back end, is the Server Running?")
    }
  }

  function handleEdit(expense) {
    setEditExpense({ id: expense.id, category: expense.category, amount: expense.amount, description: expense.description })
  }

  async function handleSave(id) {
    if (!editExpense.category) {
      setError("Please select a category")
      return
    }
    if (!editExpense.amount || parseFloat(editExpense.amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }
    if (!editExpense.description.trim()) {
      setError("Please enter a description")
      return
    }
    setError("")
    try {
      const response = await fetch(`http://localhost:8000/expenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: editExpense.category, amount: parseFloat(editExpense.amount), description: editExpense.description })
      })
      if (!response.ok) throw new Error("")
      const data = await response.json()
      setExpenses(expenses.map(expense => expense.id === id ? data.expense : expense))
      setEditExpense({ id: null, category: "", amount: "", description: "" })
      fetchSummary()
    } catch (error) {
      setError("Failed to connect to Back end, is the Server Running?")
      return
    }
  }

  const filteredExpenses = filters.category === "__income__" ? [] : expenses.filter(expense => {
    const matchesDate =
      (filters.dateA === "" || new Date(expense.date) >= new Date(filters.dateA)) &&
      (filters.dateB === "" || new Date(expense.date) <= new Date(filters.dateB))
    const matchesDesc = expense.description.toLowerCase().includes(filters.desc.toLowerCase())
    const matchesCategory = filters.category === "" || expense.category === filters.category
    return matchesDate && matchesDesc && matchesCategory
  })

  const fillMissingDates = (data) => {
    if (data.length == 0) return data
    const filled = []
    const start = new Date(data[0].date)
    const end = new Date(data[data.length - 1].date)
    const dateMap = Object.fromEntries(data.map(d => [d.date, d.total]))

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0]
      filled.push({
        date: dateStr.slice(5),
        fullDate: dateStr,
        total: dateMap[dateStr] || 0
      })
    }
    return filled
  }

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const selectedDaySummary = selectedDay
    ? expenses
        .filter(e => e.date.startsWith(selectedDay))
        .reduce((acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + e.amount
          return acc
        }, {})
    : null

  const recentExpenses = expenses.filter(expense =>
    new Date(expense.date) >= sevenDaysAgo
  )

  const trendData = fillMissingDates(
    Object.entries(
      recentExpenses.reduce((acc, expense) => {
        const date = expense.date.split(" ")[0]
        acc[date] = (acc[date] || 0) + expense.amount
        return acc
      }, {})
    ).map(([date, total]) => ({ date, total }))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  )

  function exportToCSV() {
    const headers = ["Date", "Category", "Amount", "Description"]
    const rows = expenses.map(e => [e.date, e.category, e.amount, e.description])
    const csvContent = [headers, ...rows]
      .map(row => row.join(","))
      .join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "millebelles_ledger.csv"
    link.click()
    URL.revokeObjectURL(url)
  }

  async function fetchBudgets() {
    try {
      const response = await fetch("http://localhost:8000/budgets")
      if (!response.ok) throw new Error("")
      const data = await response.json()
      setBudgets(data)
    } catch (error) {
      setError("Could not load budgets")
      return
    }
  }

  async function handleSetBudget(category, limit) {
    if (!limit || parseFloat(limit) <= 0) return
    try {
      const response = await fetch("http://localhost:8000/budgets/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, limit: parseFloat(limit) })
      })
      if (!response.ok) throw new Error("")
      fetchBudgets()
    } catch (error) {
      setError("Could not update budget")
    }
  }

  async function handleRemoveBudget(category) {
    try {
      const response = await fetch(`http://localhost:8000/budgets/${category}`, {
        method: "DELETE"
      })
      if (!response.ok) throw new Error("")
      fetchBudgets()
      setBudgetInputs({ ...budgetInputs, [category]: "" })
    } catch (error) {
      setError("could not remove budget")
    }
  }

  async function fetchIncome() {
    try {
      const [incomeRes, oneOffRes] = await Promise.all([
        fetch("http://localhost:8000/income"),
        fetch("http://localhost:8000/income/one-off")
      ])
      const incomeData = await incomeRes.json()
      const oneOffData = await oneOffRes.json()
      setIncome(incomeData)
      setOneOffIncome(oneOffData)
    } catch (error) {
      setError("Failed to fetch income data")
    }
  }

  async function fetchBalance(month) {
    try {
      const url = month
        ? `http://localhost:8000/balance?month=${month}`
        : "http://localhost:8000/balance"
      const res = await fetch(url)
      const data = await res.json()
      setBalance(data)
    } catch (error) {
      setError("Failed to fetch balance")
    }
  }

  async function handleAddIncome() {
    if (!newIncome.amount || parseFloat(newIncome.amount) <= 0) { setError("Please enter a valid amount"); return }
    if (!newIncome.source.trim()) { setError("Please enter a source"); return }
    setError("")
    try {
      const res = await fetch("http://localhost:8000/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(newIncome.amount), source: newIncome.source, notes: newIncome.notes })
      })
      if (!res.ok) throw new Error("")
      const data = await res.json()
      setIncome(prev => [data.income, ...prev])
      setNewIncome({ amount: "", source: "", notes: "" })
      fetchBalance(balanceMonth)
    } catch { setError("Failed to add income") }
  }

  async function handleAddOneOff() {
    if (!newOneOff.amount || parseFloat(newOneOff.amount) <= 0) { setError("Please enter a valid amount"); return }
    if (!newOneOff.description.trim()) { setError("Please enter a description"); return }
    setError("")
    try {
      const res = await fetch("http://localhost:8000/income/one-off", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(newOneOff.amount), description: newOneOff.description })
      })
      if (!res.ok) throw new Error("")
      const data = await res.json()
      setOneOffIncome(prev => [data.income, ...prev])
      setNewOneOff({ amount: "", description: "" })
      fetchBalance(balanceMonth)
    } catch { setError("Failed to add one-off income") }
  }

  async function handleDeleteIncome(id) {
    try {
      await fetch(`http://localhost:8000/income/${id}`, { method: "DELETE" })
      setIncome(prev => prev.filter(i => i.id !== id))
      fetchBalance(balanceMonth)
    } catch { setError("Failed to delete income entry") }
  }

  async function handleDeleteOneOff(id) {
    try {
      await fetch(`http://localhost:8000/income/one-off/${id}`, { method: "DELETE" })
      setOneOffIncome(prev => prev.filter(i => i.id !== id))
      fetchBalance(balanceMonth)
    } catch { setError("Failed to delete one-off income entry") }
  }

  async function fetchSubscriptions() {
    try {
      const response = await fetch("http://localhost:8000/recurring_expenses")
      if (!response.ok) throw new Error("failed to fetch subscriptions")
      const subs = await response.json()
      setSubscriptions(subs)
    } catch (error) {
      setError("Failed to connect to Back end, is the Server Running?")
    }
  }

  function handleEditIncome(id) {
    const entry = income.find(i => i.id === id)
    if (entry) {
      setEditIncome({ id, amount: entry.amount.toString(), source: entry.source, notes: entry.notes })
    }
  }

  function handleEditOneOff(id) {
    const oneOff = oneOffIncome.find(i => i.id === id)
    if (oneOff) {
      setEditOneOff({ id, amount: oneOff.amount.toString(), description: oneOff.description })
    }
  }

  async function handleSaveIncome(id) {
    if (!editIncome.amount || parseFloat(editIncome.amount) <= 0) { setError("Please enter a valid amount"); return }
    if (!editIncome.source.trim()) { setError("Please enter a source"); return }
    setError("")
    try {
      const res = await fetch(`http://localhost:8000/income/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(editIncome.amount), source: editIncome.source, notes: editIncome.notes })
      })
      if (!res.ok) throw new Error("")
      const data = await res.json()
      setIncome(income.map(i => i.id === id ? data.income : i))
      setEditIncome({ id: null, amount: "", source: "", notes: "" })
      fetchBalance(balanceMonth)
    } catch { setError("Failed to update income entry") }
  }

  async function handleSaveOneOff(id) {
    if (!editOneOff.amount || parseFloat(editOneOff.amount) <= 0) { setError("Please enter a valid amount"); return }
    if (!editOneOff.description.trim()) { setError("Please enter a description"); return }
    setError("")
    try {
      const res = await fetch(`http://localhost:8000/income/one-off/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(editOneOff.amount), description: editOneOff.description })
      })
      if (!res.ok) throw new Error("")
      const data = await res.json()
      setOneOffIncome(oneOffIncome.map(i => i.id === id ? data.income : i))
      setEditOneOff({ id: null, amount: "", description: "" })
      fetchBalance(balanceMonth)
    } catch { setError("Failed to update one-off income entry") }
  }

  async function handleAddSubscription() {
    if (!newSub.category) {
      setError("Please select a category")
      return
    }
    if (!newSub.amount || parseFloat(newSub.amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }
    if (!newSub.description.trim()) {
      setError("Please enter a description")
      return
    }
    if (!newSub.frequency) {
      setError("Please select a frequency")
      return
    }
    setError("")
    try {
      const response = await fetch("http://localhost:8000/recurring_expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: newSub.category,
          amount: parseFloat(newSub.amount),
          description: newSub.description,
          frequency: newSub.frequency,
          last_run: newSub.lastRun || null
        })
      })
      if (!response.ok) throw new Error("")
      const data = await response.json()
      setSubscriptions([data.sub, ...subscriptions])
      setNewSub({ category: "", amount: "", description: "", frequency: "", lastRun: "" })
    } catch (error) {
      setError("Failed to connect to Back end, is the Server Running?")
      return
    }
  }

  async function handleDeleteSubscription(id) {
    try {
      const response = await fetch(`http://localhost:8000/recurring_expenses/${id}`, {
        method: "DELETE"
      })
      if (!response.ok) throw new Error("failed to delete subscription")
      setSubscriptions(subscriptions.filter(subs => subs.id !== id))
    } catch (error) {
      setError("Failed to connect to Back end, is the Server Running?")
      return
    }
  }

  async function handleSaveSubscription(id) {
    if (!editSub.category) {
      setError("Please select a category")
      return
    }
    if (!editSub.amount || parseFloat(editSub.amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }
    if (!editSub.description.trim()) {
      setError("Please enter a description")
      return
    }
    if (!editSub.frequency) {
      setError("Please select a frequency")
      return
    }
    if (!editSub.lastRun) {
      setError("Please select a start date")
      return
    }
    setError("")
    try {
      const response = await fetch(`http://localhost:8000/recurring_expenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: editSub.category,
          amount: parseFloat(editSub.amount),
          description: editSub.description,
          frequency: editSub.frequency,
          last_run: editSub.lastRun
        })
      })
      if (!response.ok) throw new Error("")
      const data = await response.json()
      setSubscriptions(subscriptions.map(subs => subs.id === id ? data.subscription : subs))
      setEditSub({ id: null, category: "", amount: "", description: "", frequency: "", lastRun: "" })
    } catch (error) {
      setError("Failed to connect to Back end, is the Server Running?")
      return
    }
  }

  function handleEditSub(subscription) {
    setEditSub({
      id: subscription.id,
      category: subscription.category,
      amount: subscription.amount,
      description: subscription.description,
      frequency: subscription.frequency,
      lastRun: subscription.last_run
    })
  }

  async function handleToggleActive(id, currentActive) {
    try {
      const response = await fetch(`http://localhost:8000/recurring_expenses/${id}/toggle`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive })
      })
      if (!response.ok) throw new Error("")
      const data = await response.json()
      setSubscriptions(subscriptions.map(sub => sub.id === id ? data.subscription : sub))
    } catch {
      setError("Failed to toggle subscription")
    }
  }

  return (
    <div className="container">
      <ParticleBackground />

      <div className="header">
        <img src={banker} alt="Banker" className="banker-img" />
        <h1> Millibelles Bank </h1>
      </div>

      <div className="table-wrapper">
        <img src={cornerTL} alt="Corner TL" className="corner-tl" />
        <img src={cornerBR} alt="Corner BR" className="corner-br" />

        <BalanceBar
          balance={balance}
          balanceMonth={balanceMonth}
          onMonthChange={(month) => { setBalanceMonth(month); fetchBalance(month) }}
          onClearMonth={() => { setBalanceMonth(""); fetchBalance("") }}
        />

        <ExpenseForm
          newExpense={newExpense} setNewExpense={setNewExpense}
          filters={filters} setFilters={setFilters}
          newIncome={newIncome} setNewIncome={setNewIncome}
          newOneOff={newOneOff} setNewOneOff={setNewOneOff}
          onSubmit={handleSubmit}
          onClearFilters={() => setFilters({ category: "", desc: "", dateA: "", dateB: "" })}
          onAddIncome={handleAddIncome}
          onAddOneOff={handleAddOneOff}
        />

        <div className="view-toggle-group">
          <button className={`toggle-btn ${showView === "expenses" ? "toggle-active" : ""}`} onClick={() => setShowView("expenses")}>Ledger</button>
          <button className={`toggle-btn ${showView === "summary" ? "toggle-active" : ""}`} onClick={() => setShowView("summary")}>Summary</button>
          <button className={`toggle-btn ${showView === "subscriptions" ? "toggle-active" : ""}`} onClick={() => setShowView("subscriptions")}>Subscriptions</button>
          {showView === "expenses" && <button className="toggle-btn" onClick={exportToCSV}>Export CSV ↓</button>}
        </div>

        {error && <p className="error-message">{error}</p>}

        {showView === "summary" ? (
          <SummaryView
            summary={summary}
            budgets={budgets}
            budgetInputs={budgetInputs}
            setBudgetInputs={setBudgetInputs}
            trendData={trendData}
            sevenDaysAgo={sevenDaysAgo}
            onSetBudget={handleSetBudget}
            onRemoveBudget={handleRemoveBudget}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            selectedDaySummary={selectedDaySummary}
          />
        ) : showView === "subscriptions" ? (
          <SubscriptionsView
            subscriptions={subscriptions}
            newSub={newSub} setNewSub={setNewSub}
            editSub={editSub} setEditSub={setEditSub}
            onAdd={handleAddSubscription}
            onDelete={handleDeleteSubscription}
            onEdit={handleEditSub}
            onSave={handleSaveSubscription}
            onToggleActive={handleToggleActive}
            onCancelEdit={() => setEditSub({ id: null, category: "", amount: "", description: "", frequency: "", lastRun: "" })}
          />
        ) : (
          loading ? (
            <p className="loading-message">Loading expenses...</p>
          ) : (
            <div className="view-container" key="table">
              <ExpenseTable
                filteredExpenses={filteredExpenses}
                income={filters.category === "__income__" ? income : filters.category ? [] : income}
                oneOffIncome={filters.category === "__income__" ? oneOffIncome : filters.category ? [] : oneOffIncome}
                editExpense={editExpense} setEditExpense={setEditExpense}
                editIncome={editIncome} setEditIncome={setEditIncome}
                editOneOff={editOneOff} setEditOneOff={setEditOneOff}
                onEdit={handleEdit}
                onSave={handleSave}
                onDelete={handleDelete}
                onCancelEdit={() => setEditExpense({ id: null, category: "", amount: "", description: "" })}
                onDeleteIncome={handleDeleteIncome}
                onDeleteOneOff={handleDeleteOneOff}
                onEditIncome={handleEditIncome}
                onSaveIncome={handleSaveIncome}
                onEditOneOff={handleEditOneOff}
                onSaveOneOff={handleSaveOneOff}
                onCancelIncomeEdit={() => setEditIncome({ id: null, amount: "", source: "", notes: "" })}
                onCancelOneOffEdit={() => setEditOneOff({ id: null, amount: "", description: "" })}
              />
            </div>
          )
        )}

      </div>
    </div>
  )
}

export default App
