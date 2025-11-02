import { useState } from 'react';
import { Trash2, TrendingUp, TrendingDown, Edit } from 'lucide-react';
import { localDB } from '../utills/localDB';
import { logActivity } from '../utills/activityLogger';
import EditAssetModal from './EditAssetModal';

interface Portfolio {
  id: string;
  user_id: string;
  symbol: string;
  asset_type: 'crypto' | 'stock';
  quantity: number;
  buy_price: number;
  created_at: string;
  updated_at: string;
  current_price?: number;
}

interface PortfolioListProps {
  portfolios: Portfolio[];
  cryptoPrices: Record<string, number>;
  onRefresh: () => void;
  loading: boolean;
}

export default function PortfolioList({ portfolios, cryptoPrices, onRefresh, loading }: PortfolioListProps) {
  const [editingPortfolio, setEditingPortfolio] = useState<Portfolio | null>(null);
  
  const handleDelete = async (portfolio: Portfolio) => {
    if (!confirm(`Are you sure you want to delete ${portfolio.symbol}?`)) {
      return;
    }

    try {
      await localDB.deletePortfolio(portfolio.id);
      await logActivity('ASSET_DELETED', {
        symbol: portfolio.symbol,
        asset_type: portfolio.asset_type
      });
      onRefresh();
    } catch (error) {
      console.error('Error deleting portfolio:', error);
      alert('Failed to delete asset. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
      </div>
    );
  }

  if (portfolios.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-2">
          <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-50" />
        </div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No assets yet</h3>
        <p className="text-gray-500">Add your first crypto or stock to get started!</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {portfolios.map((portfolio) => {
          // For crypto: use API price, for stock: use manual current_price or buy_price
          const currentPrice = portfolio.asset_type === 'crypto'
            ? (cryptoPrices[portfolio.symbol.toLowerCase()] || portfolio.buy_price)
            : (portfolio.current_price || portfolio.buy_price);

          const totalValue = currentPrice * portfolio.quantity;
          const totalCost = portfolio.buy_price * portfolio.quantity;
          const profitLoss = totalValue - totalCost;
          const profitLossPercent = totalCost > 0 ? (profitLoss / totalCost) * 100 : 0;

          return (
            <div
              key={portfolio.id}
              className="bg-white/50 backdrop-blur-sm rounded-xl p-4 border border-gray-200 hover:border-purple-300 transition"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white px-3 py-1 rounded-lg font-bold text-sm">
                      {portfolio.symbol}
                    </div>
                    <span className="text-xs px-2 py-1 bg-gray-200 rounded-full text-gray-600 uppercase">
                      {portfolio.asset_type}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Quantity:</span>
                      <span className="ml-2 font-semibold text-gray-900">{portfolio.quantity}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Buy Price:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        ${portfolio.buy_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Current Price:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        ${currentPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Total Value:</span>
                      <span className="ml-2 font-semibold text-gray-900">
                        ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs text-gray-600">P/L:</span>
                    <div className={`flex items-center gap-1 font-semibold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {profitLoss >= 0 ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : (
                        <TrendingDown className="w-4 h-4" />
                      )}
                      <span>
                        {profitLoss >= 0 ? '+' : ''}${Math.abs(profitLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs">
                        ({profitLoss >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => setEditingPortfolio(portfolio)}
                    className="p-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
                    title="Edit Asset"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(portfolio)}
                    className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
                    title="Delete Asset"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editingPortfolio && (
        <EditAssetModal
          portfolio={editingPortfolio}
          onClose={() => setEditingPortfolio(null)}
          onSuccess={() => {
            setEditingPortfolio(null);
            onRefresh();
          }}
        />
      )}
    </>
  );
}