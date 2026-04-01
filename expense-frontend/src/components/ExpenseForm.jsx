import { useState } from "react"

function ExpenseForm({
  category, setCategory,
  amount, setAmount,
  description, setDescription,
  filterCategory, setFilterCategory,
  filterDesc, setFilterDesc,
  filterDateA, setFilterDateA,
  filterDateB, setFilterDateB,
  onSubmit, onClearFilters,
  incomeAmount, setIncomeAmount,
  incomeSource, setIncomeSource,
  incomeNotes, setIncomeNotes,
  oneOffAmount, setOneOffAmount,
  oneOffDescription, setOneOffDescription,
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
            value={filterDateA}
            onChange={(e) => setFilterDateA(e.target.value)}
          />
        </div>

        <span className="date-separator">✦</span>

        <div className="date-filter">
          <span className="filterLabel">To;</span>
          <input
            className="form-input"
            type="date"
            value={filterDateB}
            onChange={(e) => setFilterDateB(e.target.value)}
          />
        </div>

        <input
          className="form-input"
          type="text"
          placeholder="Search description..."
          value={filterDesc}
          onChange={(e) => setFilterDesc(e.target.value)}
        />

        <select
          className="form-select"
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
            <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
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
            <input className="form-input" type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
            <input className="form-input" type="text" placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
            <button className="btn-add" onClick={onSubmit}>Add</button>
          </div>
        </>
      ) : (
        <>
          

          {incomeType === "pay" ? (
            <div className="form-fields">
              <input className="form-input" type="number" placeholder="Amount" value={incomeAmount} onChange={(e) => setIncomeAmount(e.target.value)} />
              <input className="form-input" type="text" placeholder="Source (e.g. Work)" value={incomeSource} onChange={(e) => setIncomeSource(e.target.value)} />
              <input className="form-input" type="text" placeholder="Notes (optional, e.g. 11hrs @ $24)" value={incomeNotes} onChange={(e) => setIncomeNotes(e.target.value)} />
              <button className="btn-add" onClick={onAddIncome}>Add</button>
            </div>
          ) : (
            <div className="form-fields">
              <input className="form-input" type="number" placeholder="Amount" value={oneOffAmount} onChange={(e) => setOneOffAmount(e.target.value)} />
              <input className="form-input" type="text" placeholder="Description (e.g. Sold old laptop)" value={oneOffDescription} onChange={(e) => setOneOffDescription(e.target.value)} />
              <button className="btn-add" onClick={onAddOneOff}>Add</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default ExpenseForm