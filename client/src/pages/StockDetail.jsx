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

  useEffect(() => {
    fetchStock();
  }, [ticker]);

  const fetchStock = async () => {
    const res = await api.get(`/stocks/${ticker}`);
    setStock(res.data.stock);
  };

  const handleBuy = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await api.post('/orders/buy', { ticker, quantity: Number(quantity) });
      setMessage(`Bought ${quantity} shares for $${res.data.totalCost.toFixed(2)}`);
      await checkAuth(); // refresh user balance in navbar/context
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
      const res = await api.post('/orders/sell', { ticker, quantity: Number(quantity) });
      setMessage(`Sold ${quantity} shares for $${res.data.totalValue.toFixed(2)}`);
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
        <p className="text-3xl font-semibold mt-4 mb-6">${stock.current_price}</p>

        <div className="border border-[#1a1a1a] rounded-lg p-5">

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
            <p className="text-sm text-gray-400 mt-4">{message}</p>
          )}

        </div>

      </div>
    </Layout>
  );
}

export default StockDetail;