import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/localAuthContext';
import { localDB } from '../utills/localDB';
import { LogOut, Plus, TrendingUp, Wallet, BarChart3, Activity, User } from 'lucide-react';
import AddAssetModal from './AddAssetModal';
import PortfolioList from './PortfolioList';
import PortfolioChart from './PortfolioChart';
import ActivityLogsViewer from '../components/activityLogsViewer';
import ProfileUpdate from './ProfileUpdate';
import EncryptionDemo from './EncryptionDemo';
import { fetchCryptoPrices } from '../services/cryptoService';
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
}

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showActivityLogs, setShowActivityLogs] = useState(false);
  const [showProfileUpdate, setShowProfileUpdate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cryptoPrices, setCryptoPrices] = useState<Record<string, number>>({});
  const [totalValue, setTotalValue] = useState(0);
  const [totalInvested, setTotalInvested] = useState(0);

  useEffect(() => {
    fetchPortfolios();
  }, [user]);

  useEffect(() => {
    if (portfolios.length > 0) {
      loadCryptoPrices();
    }
  }, [portfolios]);

  const fetchPortfolios = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const data = await localDB.getPortfolios(user.id);
      setPortfolios(data);
    } catch (error) {
      console.error('Error fetching portfolios:', error);
    }
    setLoading(false);
  };

  const loadCryptoPrices = async () => {
    const cryptoSymbols = portfolios
      .filter(p => p.asset_type === 'crypto')
      .map(p => p.symbol.toLowerCase());

    if (cryptoSymbols.length > 0) {
      const prices = await fetchCryptoPrices(cryptoSymbols);
      setCryptoPrices(prices);
    }
  };

  useEffect(() => {
    let total = 0;
    let invested = 0;

    portfolios.forEach(portfolio => {
      const currentPrice = portfolio.asset_type === 'crypto'
        ? (cryptoPrices[portfolio.symbol.toLowerCase()] || portfolio.buy_price)
        : portfolio.buy_price;

      total += currentPrice * portfolio.quantity;
      invested += portfolio.buy_price * portfolio.quantity;
    });

    setTotalValue(total);
    setTotalInvested(invested);
  }, [portfolios, cryptoPrices]);

  const handleSignOut = async () => {
    await logActivity('LOGOUT', { email: user?.email });
    await signOut();
  };

  const profitLoss = totalValue - totalInvested;
  const profitLossPercent = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 via-purple-400/10 to-pink-400/10 backdrop-blur-3xl"></div>

      <div className="relative">
        <nav className="bg-white/40 backdrop-blur-xl border-b border-white/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2">
                <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Investify
                </span>
              </div>

              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowProfileUpdate(true)}
                  className="flex items-center space-x-2 bg-purple-500/90 hover:bg-purple-600 text-white px-4 py-2 rounded-xl transition"
                >
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline">Profile</span>
                </button>
                <button
                  onClick={() => setShowActivityLogs(!showActivityLogs)}
                  className="flex items-center space-x-2 bg-indigo-500/90 hover:bg-indigo-600 text-white px-4 py-2 rounded-xl transition"
                >
                  <Activity className="w-4 h-4" />
                  <span className="hidden sm:inline">Activity</span>
                </button>
                <span className="text-gray-700 hidden sm:block">{user?.email}</span>
                <button
                  onClick={handleSignOut}
                  className="flex items-center space-x-2 bg-red-500/90 hover:bg-red-600 text-white px-4 py-2 rounded-xl transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">Total Value</span>
                <Wallet className="w-5 h-5 text-blue-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                ${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">Total Invested</span>
                <BarChart3 className="w-5 h-5 text-purple-500" />
              </div>
              <div className="text-3xl font-bold text-gray-900">
                ${totalInvested.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>

            <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600 text-sm font-medium">Profit/Loss</span>
                <TrendingUp className={`w-5 h-5 ${profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`} />
              </div>
              <div className={`text-3xl font-bold ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {profitLoss >= 0 ? '+' : ''}${profitLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                <span className="text-lg ml-2">
                  ({profitLoss >= 0 ? '+' : ''}{profitLossPercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          </div>

          {showActivityLogs && (
            <>
              <ActivityLogsViewer />
              <EncryptionDemo />
            </>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Your Portfolio</h2>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-xl hover:from-blue-600 hover:to-purple-700 transition shadow-lg"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Add Asset</span>
                  </button>
                </div>

                <PortfolioList
                  portfolios={portfolios}
                  cryptoPrices={cryptoPrices}
                  onRefresh={fetchPortfolios}
                  loading={loading}
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white/40 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Portfolio Distribution</h2>
                <PortfolioChart portfolios={portfolios} cryptoPrices={cryptoPrices} />
              </div>
            </div>
          </div>
        </main>
      </div>

      {showAddModal && (
        <AddAssetModal
          onClose={() => setShowAddModal(false)}
          onSuccess={fetchPortfolios}
        />
      )}

      {showProfileUpdate && (
        <ProfileUpdate onClose={() => setShowProfileUpdate(false)} />
      )}
    </div>
  );
}