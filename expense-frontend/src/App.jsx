import {useState, useEffect} from "react"
import './App.css'
import ParticleBackground from "./ParticleBackground"
import banker from "./banker.webp"
import cornerTL from "./corner-tl.png"
import cornerBR from "./corner-br.png"
import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell } from "recharts"



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
      setExpenses([ data.expense, ...expenses])
      setCategory("")
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
  
    useEffect(() => {    
    fetchSummary()
  }, [])

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
  
  useEffect(() => {
    fetchBudgets()
  }, [])

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

      

        <div className = "form-container">
          <h2> Search: </h2>
          <div className = "filter-container">
            <div className = "date-filter">
              <span className = "filterLabel"> From; </span>
              <input
                className = "form-input"
                type = "date"
                value = {filterDateA}
                onChange = {(e) => setFilterDateA(e.target.value)}
                />
            </div>

            <span className="date-separator"> ✦ </span>

            <div className = "date-filter">
              <span className = "filterLabel"> To; </span>
              <input 
                className = "form-input"
                type = "date"
                value = {filterDateB}
                onChange = {(e) => setFilterDateB(e.target.value)}
                />
            </div>
            <input
              className = "form-input"
              type = "text"
              placeholder = "Search description..."
              value = {filterDesc}
              onChange = {(e) => setFilterDesc(e.target.value)}
              />
            <select className = "form-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              >
              <option value="">All Categories</option>
              <option value="Food and Dining">Food and Dining</option>
              <option value="Travel">Travel</option>
              <option value="Utilities">Utilities</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Upgrades">Upgrades</option>
              <option value="Health and Fitness">Health and Fitness</option>
              <option value="Education">Education</option>
              <option value="Shopping">Shopping</option>
              <option value="Groceries">Groceries</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>

            <button className = "btn-add" onClick={() => {setFilterCategory(""); setFilterDesc(""); setFilterDateA(""); setFilterDateB("")}}>Clear</button>
          </div>
          <h2> Add Expense</h2>  
          <div className = "form-fields">
            <select className = "form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
              <option value="">Select a category</option>
              <option value="Food and Dining">Food and Dining</option>
              <option value="Travel">Travel</option>
              <option value="Utilities">Utilities</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Upgrades">Upgrades</option>
              <option value="Health and Fitness">Health and Fitness</option>
              <option value="Education">Education</option>
              <option value="Shopping">Shopping</option>
              <option value="Groceries">Groceries</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>

            <input 
              className = "form-input"
              type = "number"
              placeholder = "Amount"
              value = {amount}
              onChange = {(e) => setAmount(e.target.value)}
            />

            <input 
              className = "form-input"
              type = "text"
              placeholder = "Description"
              value = {description}
              onChange = {(e) => setDescription(e.target.value)}
            />

            <button className = "btn-add" onClick={handleSubmit}>Add</button>
          </div>
      </div>


      <button className = "toggle-btn" onClick={() => setShowSummary(!showSummary)}>
        {showSummary ? "◀ View Expenses" : "View Summary ▶"}
      </button>

      { error && <p className = "error-message">{error}</p> }

      {showSummary ? (
        <div className="view-container" key="summary">
          <div className="summary-container">
            <h2> Summary </h2>

            {Object.entries(summary).map(([category, total]) => {
             const budget = budgets[category]
             const percentage = budget ? Math.round((total / budget) * 100) : null
             const barColor = percentage >= 100 ? "#c0392b" : percentage >=75 ? "#e67e22" : "#4a3f6b"

             return (
              <div key={category} className="summary-row">
                <div className="summary-row-info">
                  <span>{category}</span>
                  <div className="budget-input-row">
                  <span>{total} Geo {budget ? ` / ${budget} Geo` : ""}</span>
                
                  <input 
                    className="budget-input"
                    type="number"
                    placeholder="Limit"
                    value={budgetInputs[category] || ""}
                    onChange={(e) => setBudgetInputs({...budgetInputs, [category]: e.target.value})}
                  />
                  <button className="btn-add" onClick={() => handleSetBudget(category, budgetInputs[category])}>✓</button>
                  
                    <button className="btn-delete" onClick={() => handleRemoveBudget(category)}
                    disabled = {!budgets[category]}
                    style={{ opacity: budgets[category] ?1: 0.2, cursor: budgets[category] ? "pointer" : "default"}}>✕</button>
                  
                </div>
              </div>
                {percentage !== null && (
                  <div className = "progress-bar-container">
                    <div className = "progress-bar" style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: barColor }}></div>
                  </div>
                )}
              </div>
             )
            })}


            <div className="summary-row summary-total">
              <span>Total</span>
              <span>{Object.values(summary).reduce((total, amount) => total + amount, 0)} Geo</span>
            </div>
            <div className="chart-container">
              <h2> Spending Breakdown</h2>
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={Object.entries(summary).map(([category, total]) => ({ name: category, value: total }))}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine = {{ stroke: "#9b8fc4"}}
                    style = {{ fontSize: "23px", fontFamily: "Cinzel, serif"}}
                  >
                    {Object.entries(summary).map(([category], index) => (
                      <Cell
                        key={category}
                        fill={["#7c6fa0", "#9b8fc4", "#b8aed4", "#6b5a9e", "#c4b8e0", "#4a3f6b"][index % 6]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111128", border: "1px solid #4a3f6b", fontFamily: "Cinzel" }}
                    formatter={(value) => [`${value} Geo`, "Amount"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

                

          </div>
        </div>
        ) : (
          loading ? (
            <p className = 'loading-message'>Loading expenses...</p>
          ) : (
          
        <div className="view-container" key = "table">
          <table className="expense-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Category</th>
                <th> Amount</th>
                <th> Description</th>
                <th> Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredExpenses.map(expense => (
                <tr key ={expense.id}>
                  {editingId == expense.id ? (
                    <>
                      <td> {expense.date}</td>
                      <td>
                        <select className = "form-select" value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                            <option value="Food and Dining">Food and Dining</option>
                            <option value="Travel">Travel</option>
                            <option value="Utilities">Utilities</option>
                            <option value="Entertainment">Entertainment</option>
                            <option value="Upgrades">Upgrades</option>
                            <option value="Health and Fitness">Health and Fitness</option>
                            <option value="Education">Education</option>
                            <option value="Shopping">Shopping</option>
                            <option value="Groceries">Groceries</option>
                            <option value="Miscellaneous">Miscellaneous</option>
                        </select>
                        </td>
                      <td><input className = "form-input" type = "number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)}></input></td>
                      <td> <input className = "form-input" type = "text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)}></input></td>
                      <td>
                        <button className = "btn-add" onClick={() => handleSave(expense.id)}>Save</button>
                        <button className = "btn-delete" onClick={() => setEditingId(null)}>Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td> {expense.date}</td>
                      <td> {expense.category}</td>
                      <td> {expense.amount} Geo</td>
                      <td> {expense.description}</td>
                      <td>
                        <button className = "btn-add" onClick={() => handleEdit(expense)}>Edit</button>
                        <button className = "btn-delete" onClick={() => handleDelete(expense.id)}>Delete</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
          )
        )}
      
      </div>
  </div>
  )
}

export default App