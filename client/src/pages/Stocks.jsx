import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import Layout from '../components/Layout';
import { useSocket } from '../context/SocketContext';

function Stocks() {
  const { prices } = useSocket();   // ✅ now inside the component
  const [stocks, setStocks] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStocks();
  }, [search]);

  const fetchStocks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/stocks', {
        params: search ? { search } : {}
      });
      setStocks(res.data.stocks);
    } catch (err) {
      console.error('Failed to fetch stocks:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search stocks..."
        className="w-full max-w-sm bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-sm mb-6 focus:outline-none focus:border-gray-500"
      />
      {loading ? (
        <p className="text-gray-400 text-sm">Loading...</p>
      ) : (
        <div className="border border-[#1a1a1a] rounded-lg overflow-hidden">
          {stocks.map((stock) => (
            <Link
              to={`/stocks/${stock.ticker}`}
              key={stock.id}
              className="flex justify-between items-center px-4 py-3 border-b border-[#1a1a1a] last:border-b-0 hover:bg-[#1a1a1a]"
            >
              <div>
                <p className="text-sm font-medium">{stock.ticker}</p>
                <p className="text-xs text-gray-400">{stock.name}</p>
              </div>
              <p className="text-sm">
                ${prices[stock.ticker] || stock.current_price}
              </p>
            </Link>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default Stocks;