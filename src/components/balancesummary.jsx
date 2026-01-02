export default function BalanceSummary({ income, expense }) {
  const balance = income - expense;

  return (
    <div className="card">
      <h3>💰 Finance Balance</h3>
      <p>Total Income: ₹{income}</p>
      <p>Total Expenses: ₹{expense}</p>
      <h2>Available Balance: ₹{balance}</h2>
    </div>
  );
}
