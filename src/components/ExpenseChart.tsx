import { useEffect, useRef } from 'react';
import type { Transaction } from '../types/transaction';
import { CATEGORY_TYPE_MAP, SPENDING_RULES } from '../utils/financerules';


interface ExpenseChartProps {
  transactions: Transaction[];
}

const COLORS = [
  '#EF4444',
  '#F59E0B',
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#EC4899',
  '#14B8A6',
];

export default function ExpenseChart({ transactions }: ExpenseChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
    const incomeTotal = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const unnecessaryExpenseTotal = transactions
    .filter((t) => t.type === 'expense')
    .filter(
      (t) =>
        (t.spendType ||
          CATEGORY_TYPE_MAP[t.category]) === 'unnecessary'
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const unnecessaryLimit = incomeTotal * SPENDING_RULES.unnecessaryLimit;
  const isWaste = unnecessaryExpenseTotal > unnecessaryLimit;


  const expensesByCategory = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const chartData = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  const totalExpenses = chartData.reduce((sum, item) => sum + item.amount, 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || chartData.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let currentAngle = -Math.PI / 2;

    chartData.forEach((item, index) => {
      const sliceAngle = (item.amount / totalExpenses) * 2 * Math.PI;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      ctx.closePath();
      ctx.fillStyle = COLORS[index % COLORS.length];
      ctx.fill();

      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.stroke();

      currentAngle += sliceAngle;
    });
  }, [chartData, totalExpenses]);

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatPercentage = (amount: number) => {
    return ((amount / totalExpenses) * 100).toFixed(1);
  };

  if (chartData.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Expenses by Category</h2>
        <p className="text-gray-500 text-center py-8">No expense data to display</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Expenses by Category</h2>
      {isWaste && (
  <div className="mb-4 p-4 rounded-lg bg-red-50 border border-red-300 text-red-700 text-sm">
    ⚠️ Warning: You are spending too much on unnecessary things.
    <br />
    Limit exceeded:{' '}
    {new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(unnecessaryLimit)}
  </div>
)}


      <div className="flex flex-col md:flex-row items-center gap-8">
        <div className="flex-shrink-0">
          <canvas ref={canvasRef} width={300} height={300} />
        </div>

        <div className="flex-1 w-full">
          <div className="space-y-3">
            {chartData.map((item, index) => (
              <div key={item.category} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="text-sm font-medium text-gray-700">{item.category}</span>
                  <span
  className={`text-sm font-medium ${
    CATEGORY_TYPE_MAP[item.category] === 'unnecessary'
      ? 'text-red-600'
      : 'text-gray-700'
  }`}
>
  {item.category}
</span>

                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    {formatAmount(item.amount)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatPercentage(item.amount)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
