function BalanceBar({ balance, balanceMonth, onMonthChange, onClearMonth }) {
  return (
    <div className="balance-bar">
      <div className="balance-month-picker">
        <span className="balance-month-label">Balance</span>
        <input
          className="form-input"
          type="month"
          value={balanceMonth}
          onChange={(e) => onMonthChange(e.target.value)}
        />
        {balanceMonth && (
          <button className="toggle-btn" onClick={onClearMonth}>Clear</button>
        )}
      </div>

      {balance && (
        <div className="balance-figures">
          <div className="balance-figure">
            <span className="balance-label">Regular Income</span>
            <span className="balance-value income-positive">{balance.total_income ?? 0} Geo</span>
          </div>
          <div className="balance-figure">
            <span className="balance-label">One-Off Income</span>
            <span className="balance-value income-positive">{balance.total_one_off ?? 0} Geo</span>
          </div>
          <div className="balance-figure">
            <span className="balance-label">Expenses</span>
            <span className="balance-value income-negative">{balance.total_expenses ?? 0} Geo</span>
          </div>
          <div className="balance-figure balance-net">
            <span className="balance-label">Net Balance</span>
            <span className={`balance-value ${balance.net_balance >= 0 ? "income-positive" : "income-negative"}`}>
              {balance.net_balance ?? 0} Geo
            </span>
          </div>
        </div>
      )}
    </div>
  )
}

export default BalanceBar