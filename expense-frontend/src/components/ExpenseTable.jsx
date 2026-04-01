function ExpenseTable({ 
  filteredExpenses, income, oneOffIncome, 
  editingId, editCategory, editAmount, editDescription, 
  setEditCategory, setEditAmount, setEditDescription, 
  onEdit, onSave, onDelete, onCancelEdit, 
  onDeleteIncome, onDeleteOneOff,
  editingIncomeId, editIncomeAmount, setEditIncomeAmount,
  editIncomeSource, setEditIncomeSource,
  editIncomeNotes, setEditIncomeNotes,
  editingOneOffId, editOneOffAmount, setEditOneOffAmount,
  editOneOffDescription, setEditOneOffDescription,
  onEditIncome, onSaveIncome,
  onEditOneOff, onSaveOneOff,
  onCancelIncomeEdit, onCancelOneOffEdit
}) {
  const incomeRows = income.map(i => ({ ...i, rowType: "pay", displayLabel: "Pay", source: i.source, notes: i.notes }))
  const oneOffRows = oneOffIncome.map(i => ({ ...i, rowType: "oneoff", displayLabel: "One-Off", source: i.description }))
  const expenseRows = filteredExpenses.map(e => ({ ...e, rowType: "expense" }))

  const allRows = [...incomeRows, ...oneOffRows, ...expenseRows]
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  return (
    <table className="expense-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Category / Source</th>
          <th>Amount</th>
          <th>Description / Notes</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {allRows.map(row => {
          const isIncome = row.rowType === "pay" || row.rowType === "oneoff"

          if (isIncome) {
            const isEditingThisIncome = row.rowType === "pay" && editingIncomeId === row.id
            const isEditingThisOneOff = row.rowType === "oneoff" && editingOneOffId === row.id

            if (isEditingThisIncome) {
              return (
                <tr key={row.id} className="row-income">
                  <td>{row.date}</td>
                  <td><input className="form-input" type="text" value={editIncomeSource} onChange={e => setEditIncomeSource(e.target.value)} /></td>
                  <td><input className="form-input" type="number" value={editIncomeAmount} onChange={e => setEditIncomeAmount(e.target.value)} /></td>                  
                  <td><input className="form-input" type="text" value={editIncomeNotes} onChange={e => setEditIncomeNotes(e.target.value)} /></td>
                  <td>
                    <div className="subscriptions-action-cell">
                      <button className="btn-add" onClick={() => onSaveIncome(row.id)}>Save</button>
                      <button className="btn-delete" onClick={onCancelIncomeEdit}>Cancel</button>
                    </div>
                  </td>
                </tr>
              )
            }

            if (isEditingThisOneOff) {
              return (
                <tr key={row.id} className="row-income">
                  <td>{row.date}</td>
                  <td><input className="form-input" type="number" value={editOneOffAmount} onChange={e => setEditOneOffAmount(e.target.value)} /></td>
                  <td><input className="form-input" type="text" value={editOneOffDescription} onChange={e => setEditOneOffDescription(e.target.value)} /></td>
                  <td>—</td>
                  <td>
                    <div className="subscriptions-action-cell">
                      <button className="btn-add" onClick={() => onSaveOneOff(row.id)}>Save</button>
                      <button className="btn-delete" onClick={onCancelOneOffEdit}>Cancel</button>
                    </div>
                  </td>
                </tr>
              )
            }

            return (
              <tr key={row.id} className="row-income">
                <td>{row.date}</td>
                <td>{row.source}</td>
                <td className="income-positive">+{row.amount} Geo</td>                
                <td>{row.notes || "—"}</td>
                <td>
                  <div className="subscriptions-action-cell">
                    <button className="btn-add" onClick={() => row.rowType === "pay" ? onEditIncome(row.id) : onEditOneOff(row.id)}>Edit</button>
                    <button className="btn-delete" onClick={() => row.rowType === "pay" ? onDeleteIncome(row.id) : onDeleteOneOff(row.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            )
          }

          return (
            <tr key={row.id} className="row-expense">
              {editingId === row.id ? (
                <>
                  <td>{row.date}</td>
                  <td>
                    <select className="form-select" value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
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
                  <td><input className="form-input" type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} /></td>
                  <td><input className="form-input" type="text" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} /></td>
                  <td>
                    <button className="btn-add" onClick={() => onSave(row.id)}>Save</button>
                    <button className="btn-delete" onClick={onCancelEdit}>Cancel</button>
                  </td>
                </>
              ) : (
                <>
                  <td>{row.date}</td>
                  <td>{row.category}</td>
                  <td className="income-negative">-{row.amount} Geo</td>
                  <td>{row.description}</td>
                  <td>
                    <button className="btn-add" onClick={() => onEdit(row)}>Edit</button>
                    <button className="btn-delete" onClick={() => onDelete(row.id)}>Delete</button>
                  </td>
                </>
              )}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

export default ExpenseTable