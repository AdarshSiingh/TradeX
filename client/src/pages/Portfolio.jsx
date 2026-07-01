import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';
import { useSocket } from '../context/SocketContext';

function Portfolio() {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const { prices } = useSocket();

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const res = await api.get('/portfolio');
      setPortfolio(res.data.portfolio);
    } catch (err) {
      console.error('Failed to fetch portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

 
  const liveHoldings = portfolio.map((item) => {
    const livePrice = prices[item.ticker] || parseFloat(item.current_price);
    const quantity = item.quantity;
    const avgBuyPrice = parseFloat(item.avg_buy_price);

    const currentValue = livePrice * quantity;
    const profitLoss = currentValue - (avgBuyPrice * quantity);

    return { ...item, livePrice, currentValue, profitLoss };
  });

  const totalValue = liveHoldings.reduce((sum, item) => sum + item.currentValue, 0);
  const totalPL = liveHoldings.reduce((sum, item) => sum + item.profitLoss, 0);

  if (loading) {
    return (
      <Layout>
        <p className="text-gray-400 text-sm">Loading...</p>
      </Layout>
    );
  }

  return (
    <Layout>

      <div className="flex gap-8 mb-8">
        <div>
          <p className="text-xs text-gray-400 mb-1">Total Value</p>
          <p className="text-2xl font-semibold">${totalValue.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-400 mb-1">Total P&L</p>
          <p className={`text-2xl font-semibold ${totalPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)}
          </p>
        </div>
      </div>

      {liveHoldings.length === 0 ? (
        <p className="text-gray-400 text-sm">
          You don't own any stocks yet.{' '}
          <Link to="/stocks" className="text-green-500">Browse stocks</Link>
        </p>
      ) : (
        <div className="border border-[#1a1a1a] rounded-lg overflow-hidden">
          {liveHoldings.map((item) => (
            <Link
              to={`/stocks/${item.ticker}`}
              key={item.id}
              className="flex justify-between items-center px-4 py-3 border-b border-[#1a1a1a] last:border-b-0 hover:bg-[#1a1a1a]"
            >
              <div>
                <p className="text-sm font-medium">{item.ticker}</p>
                <p className="text-xs text-gray-400">{item.quantity} shares · avg ${item.avg_buy_price}</p>
              </div>
              <div className="text-right">
                <p className="text-sm">${item.currentValue.toFixed(2)}</p>
                <p className={`text-xs ${item.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {item.profitLoss >= 0 ? '+' : ''}${item.profitLoss.toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}

    </Layout>
  );
}

export default Portfolio;