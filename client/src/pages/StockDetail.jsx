import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';

function StockDetail() {
  const { ticker } = useParams();
  const { user, checkAuth } = useAuth();

  const [stock, setStock] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

const SUPPORTED_TICKERS = ['AAPL', 'AMZN', 'GOOGL', 'GS', 'JPM', 'META', 'MSFT', 'NVDA', 'TSLA', 'V'];

  useEffect(() => {
    fetchStock();
   
    if (SUPPORTED_TICKERS.includes(ticker.toUpperCase())) {
      fetchAnalytics();
    } else {
      setAnalyticsLoading(false);
    }
  }, [ticker]);

  const fetchStock = async () => {
    const res = await api.get(`/stocks/${ticker}`);
    setStock(res.data.stock);
  };

  const fetchAnalytics = async () => {
    try {
      const res = await api.get(`/analytics/${ticker}`);
      setAnalytics(res.data.analytics);
    } catch (err) {
      console.error('Analytics not available:', err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const handleBuy = async () => {
    setLoading(true);
    setMessage('');

    try {
      const res = await api.post('/orders/buy', {
        ticker,
        quantity: Number(quantity),
      });

      setMessage(
        `Bought ${quantity} shares for $${res.data.totalCost.toFixed(2)}`
      );

      await checkAuth();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  const handleSell = async () => {
    setLoading(true);
    setMessage('');

    try {
      const res = await api.post('/orders/sell', {
        ticker,
        quantity: Number(quantity),
      });

      setMessage(
        `Sold ${quantity} shares for $${res.data.totalValue.toFixed(2)}`
      );

      await checkAuth();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (!stock) {
    return (
      <Layout>
        <p className="text-gray-400 text-sm">Loading...</p>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-md">

        <h2 className="text-2xl font-semibold">{stock.ticker}</h2>
        <p className="text-gray-400 text-sm mb-1">{stock.name}</p>
        <p className="text-3xl font-semibold mt-4 mb-6">
          ${stock.current_price}
        </p>

        <div className="border border-[#1a1a1a] rounded-lg p-5">

          <label className="block text-sm text-gray-400 mb-1">
            Quantity
          </label>

          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-sm mb-4 focus:outline-none focus:border-gray-500"
          />

          <p className="text-sm text-gray-400 mb-4">
            Estimated total: ${(stock.current_price * quantity).toFixed(2)}
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleBuy}
              disabled={loading}
              className="flex-1 bg-green-500 text-black font-medium rounded py-2 text-sm disabled:opacity-50"
            >
              Buy
            </button>

            <button
              onClick={handleSell}
              disabled={loading}
              className="flex-1 border border-[#2a2a2a] text-white rounded py-2 text-sm disabled:opacity-50 hover:border-gray-500"
            >
              Sell
            </button>
          </div>

          {message && (
            <p className="text-sm text-gray-400 mt-4">
              {message}
            </p>
          )}

        </div>

        {/* ─── ANALYTICS ───────────────────────────── */}
        {!analyticsLoading && analytics && (
          <div className="border border-[#1a1a1a] rounded-lg p-5 mt-6">

            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium">
                Technical Analysis
              </h3>

              <span
                className={`text-xs px-2 py-1 rounded ${
                  analytics.signal_current === 'buy'
                    ? 'bg-green-500 text-black'
                    : analytics.signal_current === 'sell'
                    ? 'bg-red-500 text-black'
                    : 'bg-[#2a2a2a] text-gray-300'
                }`}
              >
                {analytics.signal_current.toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">

              <div>
                <p className="text-xs text-gray-400 mb-1">RSI (14)</p>
                <p className="text-sm">{analytics.rsi_current}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">
                  Sharpe Ratio
                </p>
                <p className="text-sm">{analytics.sharpe_ratio}</p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">
                  Total Return
                </p>

                <p
                  className={`text-sm ${
                    analytics.total_return_pct >= 0
                      ? 'text-green-500'
                      : 'text-red-500'
                  }`}
                >
                  {analytics.total_return_pct >= 0 ? '+' : ''}
                  {analytics.total_return_pct}%
                </p>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-1">
                  Max Drawdown
                </p>

                <p className="text-sm text-red-500">
                  {analytics.max_drawdown_pct}%
                </p>
              </div>

            </div>

            <p className="text-xs text-gray-500 mt-4">
              Based on data from {analytics.data_from} to{' '}
              {analytics.data_to}
            </p>

          </div>
        )}

      </div>
    </Layout>
  );
}

export default StockDetail;