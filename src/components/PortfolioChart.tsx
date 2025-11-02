import { Portfolio } from '../lib/supabase';

interface PortfolioChartProps {
  portfolios: Portfolio[];
  cryptoPrices: Record<string, number>;
}

export default function PortfolioChart({ portfolios, cryptoPrices }: PortfolioChartProps) {
  if (portfolios.length === 0) {
    return (
      <div className="text-center py-8 text-gray-600">
        Add assets to see distribution
      </div>
    );
  }

  const chartData = portfolios.map(portfolio => {
    const currentPrice = portfolio.asset_type === 'crypto'
      ? (cryptoPrices[portfolio.symbol.toLowerCase()] || portfolio.buy_price)
      : portfolio.buy_price;

    return {
      symbol: portfolio.symbol,
      value: currentPrice * portfolio.quantity,
      type: portfolio.asset_type,
    };
  });

  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);

  const colors = [
    'from-blue-500 to-blue-600',
    'from-purple-500 to-purple-600',
    'from-pink-500 to-pink-600',
    'from-indigo-500 to-indigo-600',
    'from-cyan-500 to-cyan-600',
    'from-violet-500 to-violet-600',
  ];

  return (
    <div className="space-y-4">
      {chartData.map((item, index) => {
        const percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
        const colorClass = colors[index % colors.length];

        return (
          <div key={item.symbol} className="space-y-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <span className="font-semibold text-gray-900">{item.symbol}</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">
                  {item.type}
                </span>
              </div>
              <span className="text-sm font-semibold text-gray-700">
                {percentage.toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r ${colorClass} transition-all duration-500`}
                style={{ width: `${percentage}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600">
              ${item.value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
