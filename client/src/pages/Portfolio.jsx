import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';

function Portfolio() {
  const [portfolio, setPortfolio] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [totalPL, setTotalPL] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      const res = await api.get('/portfolio');
      setPortfolio(res.data.portfolio);
      setTotalValue(res.data.totalValue);
      setTotalPL(res.data.totalPL);
    } catch (err) {
      console.error('Failed to fetch portfolio:', err);
    } finally {
      setLoading(false);
    }
  };

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

      
      {portfolio.length === 0 ? (
        <p className="text-gray-400 text-sm">
          You don't own any stocks yet.{' '}
          <Link to="/stocks" className="text-green-500">Browse stocks</Link>
        </p>
      ) : (
        <div className="border border-[#1a1a1a] rounded-lg overflow-hidden">
          {portfolio.map((item) => {
            const pl = parseFloat(item.profit_loss);
            return (
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
                  <p className="text-sm">${item.current_value}</p>
                  <p className={`text-xs ${pl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {pl >= 0 ? '+' : ''}${pl.toFixed(2)}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}

    </Layout>
  );
}

export default Portfolio;