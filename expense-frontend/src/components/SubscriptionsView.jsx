import { CATEGORIES } from "../constants"

function SubscriptionsView({
  subscriptions,
  newSub, setNewSub,
  editSub, setEditSub,
  onAdd, onDelete, onEdit, onSave, onToggleActive, onCancelEdit
}) {

  // Normalise all subscriptions to monthly cost for the total
  const monthlyTotal = subscriptions
    .filter(sub => sub.active)
    .reduce((total, sub) => {
      if (sub.frequency === "weekly") return total + sub.amount * 52 / 12
      if (sub.frequency === "yearly") return total + sub.amount / 12
      return total + sub.amount
    }, 0)

  return (
    <div className="view-container" key="subscriptions">

      {/* Add subscription form */}
      <div className="form-container">
        <h2>Add Subscription</h2>
        <div className="form-fields">
          <select className="form-select" value={newSub.category} onChange={e => setNewSub(prev => ({ ...prev, category: e.target.value }))}>
            <option value="">Select a category</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <input className="form-input" type="number" placeholder="Amount" value={newSub.amount} onChange={e => setNewSub(prev => ({ ...prev, amount: e.target.value }))} />
          <input className="form-input" type="text" placeholder="Description (e.g. Netflix)" value={newSub.description} onChange={e => setNewSub(prev => ({ ...prev, description: e.target.value }))} />
          <select className="form-select" value={newSub.frequency} onChange={e => setNewSub(prev => ({ ...prev, frequency: e.target.value }))}>
            <option value="">Frequency</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          <input className="form-input" type="date" placeholder="Last paid date" value={newSub.lastRun} onChange={e => setNewSub(prev => ({ ...prev, lastRun: e.target.value }))} />
          <button className="btn-add" onClick={onAdd}>Add</button>
        </div>
      </div>

      {/* Subscriptions table */}
      <table className="expense-table">
        <thead>
          <tr>
            <th>Description</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Frequency</th>
            <th>Last paid</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {[...subscriptions]
            .sort((a, b) => new Date(b.last_run) - new Date(a.last_run))
            .map(sub => (
            <tr key={sub.id} className={sub.active ? "row-expense" : "row-inactive"}>
              {editSub.id === sub.id ? (
                <>
                  <td><input className="form-input" type="text" value={editSub.description} onChange={e => setEditSub(prev => ({ ...prev, description: e.target.value }))} /></td>
                  <td>
                    <select className="form-select" value={editSub.category} onChange={e => setEditSub(prev => ({ ...prev, category: e.target.value }))}>
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </td>
                  <td><input className="form-input" type="number" value={editSub.amount} onChange={e => setEditSub(prev => ({ ...prev, amount: e.target.value }))} /></td>
                  <td>
                    <select className="form-select" value={editSub.frequency} onChange={e => setEditSub(prev => ({ ...prev, frequency: e.target.value }))}>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                  </td>
                  <td><input className="form-input" type="date" value={editSub.lastRun} onChange={e => setEditSub(prev => ({ ...prev, lastRun: e.target.value }))} /></td>
                  <td>—</td>
                  <td>
                    <div className="subscriptions-action-cell">
                      <button className="btn-add" onClick={() => onSave(sub.id)}>Save</button>
                      <button className="btn-delete" onClick={onCancelEdit}>Cancel</button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td>{sub.description}</td>
                  <td>{sub.category}</td>
                  <td>{sub.amount} Geo</td>
                  <td style={{textTransform: "capitalize"}}>{sub.frequency}</td>
                  <td>{sub.last_run}</td>
                  <td>
                    <button
                      className={sub.active ? "btn-active" : "btn-inactive"}
                      onClick={() => onToggleActive(sub.id, sub.active)}
                    >
                      {sub.active ? "Active" : "Paused"}
                    </button>
                  </td>
                  <td>
                    <div className="subscriptions-action-cell">
                      <button className="btn-add" onClick={() => onEdit(sub)}>Edit</button>
                      <button className="btn-delete" onClick={() => onDelete(sub.id)}>Delete</button>
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Monthly total */}
      <div className="summary-row summary-total" style={{marginTop: "16px"}}>
        <span>Est. Monthly Cost (active only)</span>
        <span>{monthlyTotal.toFixed(2)} Geo</span>
      </div>

    </div>
  )
}

export default SubscriptionsView
