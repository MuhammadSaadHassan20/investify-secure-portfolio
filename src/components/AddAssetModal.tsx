import { useState } from 'react';
import { useAuth } from '../contexts/localAuthContext';
import { localDB } from '../utills/localDB';
import { X, TrendingUp } from 'lucide-react';
import { validateNumericInput, sanitizeInput } from '../utills/inputValidator';
import { logActivity } from '../utills/activityLogger';

interface AddAssetModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddAssetModal({ onClose, onSuccess }: AddAssetModalProps) {
  const { user } = useAuth();
  const [assetType, setAssetType] = useState<'crypto' | 'stock'>('crypto');
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Validate inputs
      if (!symbol.trim()) {
        setError('Symbol is required');
        return;
      }

      // Sanitize symbol
      const sanitizedSymbol = sanitizeInput(symbol.trim().toUpperCase());

      // Validate numeric inputs
      if (!validateNumericInput(quantity)) {
        setError('Quantity must be a valid number');
        await logActivity('INVALID_INPUT', { field: 'quantity', value: quantity });
        return;
      }

      if (!validateNumericInput(buyPrice)) {
        setError('Buy price must be a valid number');
        await logActivity('INVALID_INPUT', { field: 'buyPrice', value: buyPrice });
        return;
      }

      const quantityNum = parseFloat(quantity);
      const buyPriceNum = parseFloat(buyPrice);

      // Validate positive numbers
      if (quantityNum <= 0) {
        setError('Quantity must be greater than 0');
        return;
      }

      if (buyPriceNum <= 0) {
        setError('Buy price must be greater than 0');
        return;
      }

      // Validate reasonable limits
      if (quantityNum > 1000000) {
        setError('Quantity is too large');
        return;
      }

      if (buyPriceNum > 10000000) {
        setError('Buy price is too large');
        return;
      }

      setLoading(true);

      await localDB.addPortfolio({
        user_id: user!.id,
        symbol: sanitizedSymbol,
        asset_type: assetType,
        quantity: quantityNum,
        buy_price: buyPriceNum
      });

      await logActivity('ASSET_ADDED', {
        symbol: sanitizedSymbol,
        asset_type: assetType,
        quantity: quantityNum
      });

      onSuccess();
      onClose();
    } catch (err) {
      console.error('Error adding asset:', err);
      setError('Failed to add asset. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white/90 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Add Asset</h2>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Asset Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAssetType('crypto')}
                className={`px-4 py-3 rounded-xl font-semibold transition ${
                  assetType === 'crypto'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Crypto
              </button>
              <button
                type="button"
                onClick={() => setAssetType('stock')}
                className={`px-4 py-3 rounded-xl font-semibold transition ${
                  assetType === 'stock'
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Stock
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Symbol
            </label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              maxLength={10}
              className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition uppercase"
              placeholder={assetType === 'crypto' ? 'BTC, ETH, SOL' : 'AAPL, GOOGL, MSFT'}
              required
            />
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
              Buy Price (USD)
            </label>
            <input
              type="text"
              value={buyPrice}
              onChange={(e) => setBuyPrice(e.target.value)}
              className="w-full px-4 py-3 bg-white/50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition"
              placeholder="0.00"
              required
            />
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
              {loading ? 'Adding...' : 'Add Asset'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}