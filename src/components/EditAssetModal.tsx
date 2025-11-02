import { useState } from 'react';
import { localDB } from '../utills/localDB';
import { X, Edit, TrendingUp } from 'lucide-react';
import { validateNumericInput } from '../utills/inputValidator';
import { logActivity } from '../utills/activityLogger';

interface Portfolio {
  id: string;
  user_id: string;
  symbol: string;
  asset_type: 'crypto' | 'stock';
  quantity: number;
  buy_price: number;
  created_at: string;
  updated_at: string;
  current_price?: number; // We'll add this field
}

interface EditAssetModalProps {
  portfolio: Portfolio;
  onClose: () => void;
  onSuccess: () => void;
}

export default function EditAssetModal({ portfolio, onClose, onSuccess }: EditAssetModalProps) {
  const [quantity, setQuantity] = useState(portfolio.quantity.toString());
  const [currentPrice, setCurrentPrice] = useState(
    portfolio.current_price?.toString() || portfolio.buy_price.toString()
  );
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Validate numeric inputs
      if (!validateNumericInput(quantity)) {
        setError('Quantity must be a valid number');
        return;
      }

      if (!validateNumericInput(currentPrice)) {
        setError('Current price must be a valid number');
        return;
      }

      const quantityNum = parseFloat(quantity);
      const currentPriceNum = parseFloat(currentPrice);

      // Validate positive numbers
      if (quantityNum <= 0) {
        setError('Quantity must be greater than 0');
        return;
      }

      if (currentPriceNum <= 0) {
        setError('Current price must be greater than 0');
        return;
      }

      setLoading(true);

      // Update portfolio with new current_price field
      const updatedPortfolio: Portfolio = {
        ...portfolio,
        quantity: quantityNum,
        current_price: currentPriceNum
      };

      await localDB.updatePortfolio(updatedPortfolio);

      await logActivity('ASSET_UPDATED', {
        symbol: portfolio.symbol,
        asset_type: portfolio.asset_type,
        quantity: quantityNum,
        current_price: currentPriceNum
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error updating asset:', err);
      setError('Failed to update asset. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
              <Edit className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Edit {portfolio.symbol}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div className="text-sm text-gray-600 mb-1">Asset Type</div>
            <div className="font-semibold text-gray-900 uppercase">{portfolio.asset_type}</div>
          </div>

          <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
            <div className="text-sm text-gray-600 mb-1">Buy Price (Original)</div>
            <div className="font-semibold text-gray-900">
              ${portfolio.buy_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quantity
            </label>
            <input
              type="text"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Price (USD)
              {portfolio.asset_type === 'stock' && (
                <span className="text-xs text-gray-500 ml-2">- Manual Update</span>
              )}
            </label>
            <input
              type="text"
              value={currentPrice}
              onChange={(e) => setCurrentPrice(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              placeholder="0.00"
              required
            />
            {portfolio.asset_type === 'crypto' && (
              <p className="text-xs text-gray-500 mt-1">
                Note: Crypto prices update automatically from API
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl font-semibold transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}