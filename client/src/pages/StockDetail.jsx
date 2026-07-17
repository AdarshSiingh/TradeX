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
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    fetchStock();
  }, [ticker]);

  const fetchStock = async () => {
    const res = await api.get(`/stocks/${ticker}`);
    setStock(res.data.stock);
  };

  const confirmBuy = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/orders/buy', { ticker, quantity: Number(quantity) });
      setMessage(`Bought ${quantity} shares for $${res.data.totalCost.toFixed(2)}`);
      await checkAuth();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
      setPendingAction(null);
    }
  };

  const confirmSell = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/orders/sell', { ticker, quantity: Number(quantity) });
      setMessage(`Sold ${quantity} shares for $${res.data.totalValue.toFixed(2)}`);
      await checkAuth();
    } catch (err) {
      setMessage(err.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
      setPendingAction(null);
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

      <div className="mb-16">
        <h2 className="text-4xl font-semibold">{stock.ticker}</h2>
        <p className="text-gray-400 text-base mb-3">{stock.name}</p>
        <p className="text-4xl font-semibold">${stock.current_price}</p>
      </div>

      <div className="max-w-md">

        <div className="border border-[#1a1a1a] rounded-lg p-8">

          <label className="block text-sm text-gray-400 mb-1">Quantity</label>
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
              onClick={() => setPendingAction('buy')}
              disabled={loading}
              className="flex-1 bg-green-500 text-black font-medium rounded py-2 text-sm disabled:opacity-50"
            >
              Buy
            </button>
            <button
              onClick={() => setPendingAction('sell')}
              disabled={loading}
              className="flex-1 border border-[#2a2a2a] text-white rounded py-2 text-sm disabled:opacity-50 hover:border-gray-500"
            >
              Sell
            </button>
          </div>

          {message && (
            <p className="text-sm text-gray-400 mt-4">{message}</p>
          )}

        </div>

      </div>

      {pendingAction && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#0f0f0f] border border-[#2a2a2a] rounded-lg p-6 w-full max-w-sm mx-4">

            <h3 className="text-lg font-medium mb-4">
              Confirm {pendingAction === 'buy' ? 'Purchase' : 'Sale'}
            </h3>

            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Stock</span>
                <span>{stock.ticker}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Quantity</span>
                <span>{quantity} shares</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Price per share</span>
                <span>${stock.current_price}</span>
              </div>
              <div className="flex justify-between text-sm font-medium pt-2 border-t border-[#2a2a2a]">
                <span>Estimated Total</span>
                <span>${(stock.current_price * quantity).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setPendingAction(null)}
                disabled={loading}
                className="flex-1 border border-[#2a2a2a] text-white rounded py-2 text-sm hover:border-gray-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={pendingAction === 'buy' ? confirmBuy : confirmSell}
                disabled={loading}
                className={`flex-1 font-medium rounded py-2 text-sm disabled:opacity-50 ${
                  pendingAction === 'buy' ? 'bg-green-500 text-black' : 'bg-red-500 text-white'
                }`}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>

          </div>
        </div>
      )}
    </Layout>
  );
}

export default StockDetail;