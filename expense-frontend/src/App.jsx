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

function App() {
  const [expenses, setExpenses] = useState([])

  const [category, setCategory] = useState("")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")

  const[showSummary, setShowSummary] = useState(false)
  const [summary, setSummary] = useState({})

  const [editingId, setEditingId] = useState(null)
  const [editCategory, setEditCategory] = useState("")
  const [editAmount, setEditAmount] = useState("")
  const [editDescription, setEditDescription] = useState("")

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(true)

  const [filterCategory, setFilterCategory] = useState("")
  const [filterDesc, setFilterDesc] = useState("")

  const [filterDateA, setFilterDateA] = useState("")
  const [filterDateB, setFilterDateB] = useState("")

  const [budgets, setBudgets] = useState({})
  const [budgetInputs, setBudgetInputs] = useState({})
  

  const [income, setIncome] = useState([])
  const [oneOffIncome, setOneOffIncome] = useState([])
  const [balance, setBalance] = useState(null)
  const [balanceMonth, setBalanceMonth] = useState("")
  const [incomeAmount, setIncomeAmount] = useState("")
  const [incomeSource, setIncomeSource] = useState("")
  const [incomeNotes, setIncomeNotes] = useState("")
  const [oneOffAmount, setOneOffAmount] = useState("")
  const [oneOffDescription, setOneOffDescription] = useState("")


  async function handleSubmit() {

      if (!category) {
      setError("Please select a category")
      return
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError("Please enter a valid amount")
      return
    }

    if (!description.trim()) {
      setError("Please enter a description")
      return
    }

    setError("")

    try{
      const response = await fetch("http://localhost:8000/expenses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, amount: parseFloat(amount), description })
      })
      if (!response.ok) throw new Error("")
      const data = await response.json()
      setExpenses([data.expense, ...expenses])
      setAmount("")
      setDescription("")
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
    
    async function fetchExpenses(){
       try {
        const response = await fetch("http://localhost:8000/expenses")
        if (!response.ok) throw new Error("Failed to fetch expenses")
        const data = await response.json()
        data.sort((a, b) => new Date(b.date) -new Date(a.date))
        setExpenses(data)
       }
       catch (error) {
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
    setEditingId(expense.id)
    setEditCategory(expense.category)
    setEditAmount(expense.amount)
    setEditDescription(expense.description)
  }

  async function handleSave(id) {
    if (!editCategory) {
      setError("Please select a category")
      return
    }
    
    if (!editAmount || parseFloat(editAmount) <= 0) {
      setError("Please enter a valid amount")
      return
    }
    if (!editDescription.trim()) {
      setError("Please enter a description")
      return
    }

    setError("")

    try {
      const response = await fetch(`http://localhost:8000/expenses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: editCategory, amount: parseFloat(editAmount), description: editDescription })
    })

    if (!response.ok) throw new Error("")
      const data = await response.json()
      setExpenses(expenses.map(expense => expense.id === id ? data.expense : expense))
      setEditingId(null)
      fetchSummary()
    }catch (error) {
      setError("Failed to connect to Back end, is the Server Running?")
      return
    }
  }

  const filteredExpenses = expenses.filter(expense => {
    const matchesDate = 
      (filterDateA === "" || new Date(expense.date) >= new Date(filterDateA)) &&
      (filterDateB === "" || new Date(expense.date) <= new Date(filterDateB))
    const matchesDesc = expense.description.toLowerCase().includes(filterDesc.toLowerCase())
    const matchesCategory = filterCategory === "" || expense.category === filterCategory

    return matchesDate && matchesDesc && matchesCategory
  })

  const fillMissingDates = (data) => {
    if (data.length == 0) return data
    const filled =[]
    const start = new Date(data[0].date)
    const end = new Date(data[data.length - 1].date)
    const dateMap = Object.fromEntries(data.map(d =>[d.date, d.total]))

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0]
      filled.push({date: dateStr.slice(5), total: dateMap[dateStr] || 0})
    }
    return filled
  }

const sevenDaysAgo = new Date ()
sevenDaysAgo.setDate(sevenDaysAgo.getDate()-7)

const recentExpenses = expenses.filter( expense =>
  new Date(expense.date) >= sevenDaysAgo
  )

  const trendData = fillMissingDates(
    Object.entries(
      recentExpenses.reduce((acc, expense) =>{
        const date = expense.date.split( " ")[0]
        acc[date] = (acc[date] || 0) + expense.amount
        return acc
      }, {})
    ).map(([date, total]) => ({ date, total}))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  )


  function exportToCSV() {
    const headers = ["Date", "Category", "Amount", "Description"]
    const rows = expenses.map( e=> [e.date, e.category, e.amount, e.description])

    const csvContent = [headers,...rows]
      .map( row => row.join(","))
      .join("\n")

    const blob = new Blob([csvContent], {type: "text/csv"})
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
      setBudgetInputs({...budgetInputs, [category]: ""})
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
    if (!incomeAmount || parseFloat(incomeAmount) <= 0) { setError("Please enter a valid amount"); return }
    if (!incomeSource.trim()) { setError("Please enter a source"); return }
    setError("")
    try {
      const res = await fetch("http://localhost:8000/income", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(incomeAmount), source: incomeSource, notes: incomeNotes })
      })
      
      if (!res.ok) throw new Error("")
      const data = await res.json()
      setIncome(prev => [data.income, ...prev])
      setIncomeAmount(""); setIncomeSource(""); setIncomeNotes("")
      fetchBalance(balanceMonth)
    } catch { setError("Failed to add income") }
  }

  async function handleAddOneOff() {
    if (!oneOffAmount || parseFloat(oneOffAmount) <= 0) { setError("Please enter a valid amount"); return }
    if (!oneOffDescription.trim()) { setError("Please enter a description"); return }
    setError("")
    try {
      const res = await fetch("http://localhost:8000/income/one-off", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: parseFloat(oneOffAmount), description: oneOffDescription })
      })
      if (!res.ok) throw new Error("")
      const data = await res.json()
      setOneOffIncome(prev => [data.income, ...prev])
      setOneOffAmount(""); setOneOffDescription("")
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

  return ( 
    <div className = "container">
      <ParticleBackground />
      
      
      
      <div className = "header">
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
          category={category} setCategory={setCategory}
          amount={amount} setAmount={setAmount}
          description={description} setDescription={setDescription}
          filterCategory={filterCategory} setFilterCategory={setFilterCategory}
          filterDesc={filterDesc} setFilterDesc={setFilterDesc}
          filterDateA={filterDateA} setFilterDateA={setFilterDateA}
          filterDateB={filterDateB} setFilterDateB={setFilterDateB}
          onSubmit={handleSubmit}
          onClearFilters={() => { setFilterCategory(""); setFilterDesc(""); setFilterDateA(""); setFilterDateB("") }}
          incomeAmount={incomeAmount} setIncomeAmount={setIncomeAmount}
          incomeSource={incomeSource} setIncomeSource={setIncomeSource}
          incomeNotes={incomeNotes} setIncomeNotes={setIncomeNotes}
          oneOffAmount={oneOffAmount} setOneOffAmount={setOneOffAmount}
          oneOffDescription={oneOffDescription} setOneOffDescription={setOneOffDescription}
          onAddIncome={handleAddIncome}
          onAddOneOff={handleAddOneOff}
        />


      <button className = "toggle-btn" onClick={() => setShowSummary(!showSummary)}>
        {showSummary ? "◀ View Expenses" : "View Summary ▶"}
      </button>

      <button className="toggle-btn" onClick={exportToCSV}>
        Export CSV ↓
      </button>

      { error && <p className = "error-message">{error}</p> }

      {showSummary ? (
        <SummaryView
          summary={summary}
          budgets={budgets}
          budgetInputs={budgetInputs}
          setBudgetInputs={setBudgetInputs}
          trendData={trendData}
          sevenDaysAgo={sevenDaysAgo}
          onSetBudget={handleSetBudget}
          onRemoveBudget={handleRemoveBudget}
        />
) : (
          loading ? (
            <p className = 'loading-message'>Loading expenses...</p>
          ) : (
          
        <div className="view-container" key = "table">
          <ExpenseTable
            filteredExpenses={filteredExpenses}
            income={income}
            oneOffIncome={oneOffIncome}
            editingId={editingId}
            editCategory={editCategory}
            editAmount={editAmount}
            editDescription={editDescription}
            setEditCategory={setEditCategory}
            setEditAmount={setEditAmount}
            setEditDescription={setEditDescription}
            onEdit={handleEdit}
            onSave={handleSave}
            onDelete={handleDelete}
            onCancelEdit={() => setEditingId(null)}
            onDeleteIncome={handleDeleteIncome}
            onDeleteOneOff={handleDeleteOneOff}
          />
        </div>
          )
        )}
      
      </div>
  </div>
  )
}

export default App