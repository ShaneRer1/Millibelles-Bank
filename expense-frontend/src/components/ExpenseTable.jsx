import { CATEGORIES } from "../constants"

function ExpenseTable({
  filteredExpenses, income, oneOffIncome,
  editExpense, setEditExpense,
  editIncome, setEditIncome,
  editOneOff, setEditOneOff,
  onEdit, onSave, onDelete, onCancelEdit,
  onDeleteIncome, onDeleteOneOff,
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
            const isEditingThisIncome = row.rowType === "pay" && editIncome.id === row.id
            const isEditingThisOneOff = row.rowType === "oneoff" && editOneOff.id === row.id

            if (isEditingThisIncome) {
              return (
                <tr key={row.id} className="row-income">
                  <td>{row.date}</td>
                  <td><input className="form-input" type="text" value={editIncome.source} onChange={e => setEditIncome(prev => ({ ...prev, source: e.target.value }))} /></td>
                  <td><input className="form-input" type="number" value={editIncome.amount} onChange={e => setEditIncome(prev => ({ ...prev, amount: e.target.value }))} /></td>
                  <td><input className="form-input" type="text" value={editIncome.notes} onChange={e => setEditIncome(prev => ({ ...prev, notes: e.target.value }))} /></td>
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
                  <td><input className="form-input" type="number" value={editOneOff.amount} onChange={e => setEditOneOff(prev => ({ ...prev, amount: e.target.value }))} /></td>
                  <td><input className="form-input" type="text" value={editOneOff.description} onChange={e => setEditOneOff(prev => ({ ...prev, description: e.target.value }))} /></td>
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
              {editExpense.id === row.id ? (
                <>
                  <td>{row.date}</td>
                  <td>
                    <select className="form-select" value={editExpense.category} onChange={(e) => setEditExpense(prev => ({ ...prev, category: e.target.value }))}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </td>
                  <td><input className="form-input" type="number" value={editExpense.amount} onChange={(e) => setEditExpense(prev => ({ ...prev, amount: e.target.value }))} /></td>
                  <td><input className="form-input" type="text" value={editExpense.description} onChange={(e) => setEditExpense(prev => ({ ...prev, description: e.target.value }))} /></td>
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
