import { useState } from "react"
import { CATEGORIES } from "../constants"

function ExpenseForm({
  newExpense, setNewExpense,
  filters, setFilters,
  newIncome, setNewIncome,
  newOneOff, setNewOneOff,
  onSubmit, onClearFilters,
  onAddIncome, onAddOneOff
}) {
  const [formMode, setFormMode] = useState("expense")
  const [incomeType, setIncomeType] = useState("pay")

  return (
    <div className="form-container">
      <h2>Search:</h2>
      <div className="filter-container">
        <div className="date-filter">
          <span className="filterLabel">From;</span>
          <input
            className="form-input"
            type="date"
            value={filters.dateA}
            onChange={(e) => setFilters(prev => ({ ...prev, dateA: e.target.value }))}
          />
        </div>

        <span className="date-separator">✦</span>

        <div className="date-filter">
          <span className="filterLabel">To;</span>
          <input
            className="form-input"
            type="date"
            value={filters.dateB}
            onChange={(e) => setFilters(prev => ({ ...prev, dateB: e.target.value }))}
          />
        </div>

        <input
          className="form-input"
          type="text"
          placeholder="Search description..."
          value={filters.desc}
          onChange={(e) => setFilters(prev => ({ ...prev, desc: e.target.value }))}
        />

        <select
          className="form-select"
          value={filters.category}
          onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
        >
          <option value="">All Categories</option>
          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          <option value="__income__">Income</option>
        </select>

        <button className="btn-add" onClick={onClearFilters}>Clear</button>
      </div>

      {/* Mode toggle */}
      <div className="form-mode-toggle">
        <button className={`toggle-btn ${formMode === "expense" ? "toggle-active" : ""}`} onClick={() => setFormMode("expense")}>Add Expense</button>
        <button className={`toggle-btn ${formMode === "income" ? "toggle-active" : ""}`} onClick={() => setFormMode("income")}>Add Income</button>

        {formMode === "income" && (
          <>
            <span className="toggle-separator">✦</span>
            <button className={`toggle-btn ${incomeType === "pay" ? "toggle-active" : ""}`} onClick={() => setIncomeType("pay")}>Pay</button>
            <button className={`toggle-btn ${incomeType === "oneoff" ? "toggle-active" : ""}`} onClick={() => setIncomeType("oneoff")}>One-Off</button>
          </>
        )}
      </div>

      {formMode === "expense" ? (
        <>
          <div className="form-fields">
            <select className="form-select" value={newExpense.category} onChange={(e) => setNewExpense(prev => ({ ...prev, category: e.target.value }))}>
              <option value="">Select a category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input className="form-input" type="number" placeholder="Amount" value={newExpense.amount} onChange={(e) => setNewExpense(prev => ({ ...prev, amount: e.target.value }))} />
            <input className="form-input" type="text" placeholder="Description" value={newExpense.description} onChange={(e) => setNewExpense(prev => ({ ...prev, description: e.target.value }))} />
            <button className="btn-add" onClick={onSubmit}>Add</button>
          </div>
        </>
      ) : (
        <>
          {incomeType === "pay" ? (
            <div className="form-fields">
              <input className="form-input" type="number" placeholder="Amount" value={newIncome.amount} onChange={(e) => setNewIncome(prev => ({ ...prev, amount: e.target.value }))} />
              <input className="form-input" type="text" placeholder="Source (e.g. Work)" value={newIncome.source} onChange={(e) => setNewIncome(prev => ({ ...prev, source: e.target.value }))} />
              <input className="form-input" type="text" placeholder="Notes (optional, e.g. 11hrs @ $24)" value={newIncome.notes} onChange={(e) => setNewIncome(prev => ({ ...prev, notes: e.target.value }))} />
              <button className="btn-add" onClick={onAddIncome}>Add</button>
            </div>
          ) : (
            <div className="form-fields">
              <input className="form-input" type="number" placeholder="Amount" value={newOneOff.amount} onChange={(e) => setNewOneOff(prev => ({ ...prev, amount: e.target.value }))} />
              <input className="form-input" type="text" placeholder="Description (e.g. Sold old laptop)" value={newOneOff.description} onChange={(e) => setNewOneOff(prev => ({ ...prev, description: e.target.value }))} />
              <button className="btn-add" onClick={onAddOneOff}>Add</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ExpenseForm
