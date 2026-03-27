import { PieChart, Pie, Tooltip, ResponsiveContainer, Cell, LineChart, Line, XAxis, YAxis, CartesianGrid } from "recharts"

function SummaryView({ summary, budgets, budgetInputs, setBudgetInputs, trendData, sevenDaysAgo, onSetBudget, onRemoveBudget }) {
  return (
    <div className="view-container" key="summary">
      <div className="summary-container">
        <h2>Summary</h2>

        {Object.entries(summary).map(([category, total]) => {
          const budget = budgets[category]
          const percentage = budget ? Math.round((total / budget) * 100) : null
          const barColor = percentage >= 100 ? "#c0392b" : percentage >= 75 ? "#e67e22" : "#4a3f6b"

          return (
            <div key={category} className="summary-row">
              <div className="summary-row-info">
                <span>{category}</span>
                <div className="budget-input-row">
                  <span>{total.toFixed(2)} Geo {budget ? ` / ${budget} Geo` : ""}</span>
                  <input
                    className="budget-input"
                    type="number"
                    placeholder="Limit"
                    value={budgetInputs[category] || ""}
                    onChange={(e) => setBudgetInputs(prev => ({ ...prev, [category]: e.target.value }))}
                  />
                  <button className="btn-add" onClick={() => onSetBudget(category, budgetInputs[category])}>✓</button>
                  <button
                    className="btn-delete"
                    onClick={() => onRemoveBudget(category)}
                    disabled={!budgets[category]}
                    style={{ opacity: budgets[category] ? 1 : 0.2, cursor: budgets[category] ? "pointer" : "default" }}
                  >✕</button>
                </div>
              </div>
              {percentage !== null && (
                <div className="progress-bar-container">
                  <div className="progress-bar" style={{ width: `${Math.min(percentage, 100)}%`, backgroundColor: barColor }}></div>
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
          <h2>Spending Breakdown</h2>
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
                labelLine={{ stroke: "#9b8fc4" }}
                style={{ fontSize: "23px", fontFamily: "Cinzel, serif" }}
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

        <div className="chart-container">
          <h2>Spending Trends — {sevenDaysAgo.toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit' })} to {new Date().toLocaleDateString('en-AU', { day: '2-digit', month: '2-digit' })}</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={trendData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#4a3f6b" />
              <XAxis dataKey="date" tick={{ fill: "#D4C9A8", fontFamily: "Cinzel", fontSize: 17 }} />
              <YAxis tick={{ fill: "#D4C9A8", fontFamily: "Cinzel", fontSize: 18 }} />
              <Tooltip
                contentStyle={{ backgroundColor: "#111128", border: "1px solid #4a3f6b", fontFamily: "Cinzel" }}
                labelStyle={{ color: "#9b8fc4" }}
                itemStyle={{ color: "d4c9a8" }}
                formatter={(value) => [`${value} Geo`, "Spent"]}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#D4C9A8"
                strokeWidth={2}
                dot={{ fill: "9b8f4c", r: 4 }}
                activeDot={{ fill: "#D4C9A8", r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

export default SummaryView