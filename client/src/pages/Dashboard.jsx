import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import api from '../services/api';
import Layout from '../components/Layout';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

function Dashboard() {
  const { user } = useAuth();
  const { prices } = useSocket();

  const [portfolio, setPortfolio] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [portfolioRes, transactionsRes] = await Promise.all([
        api.get('/portfolio'),
        api.get('/transactions')
      ]);
      setPortfolio(portfolioRes.data.portfolio);
      setTransactions(transactionsRes.data.transactions);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  
  const liveHoldings = portfolio.map((item) => {
    const livePrice = prices[item.ticker] || parseFloat(item.current_price);
    const currentValue = livePrice * item.quantity;
    const profitLoss = currentValue - (parseFloat(item.avg_buy_price) * item.quantity);
    return { ...item, currentValue, profitLoss };
  });

  const totalValue = liveHoldings.reduce((sum, item) => sum + item.currentValue, 0);
  const totalPL = liveHoldings.reduce((sum, item) => sum + item.profitLoss, 0);

  
  const topHoldings = [...liveHoldings]
    .sort((a, b) => b.currentValue - a.currentValue)
    .slice(0, 4);

  
  const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#a855f7', '#06b6d4'];

  const pieData = liveHoldings.map((item) => ({
    name: item.ticker,
    value: item.currentValue
  }));

  
  const recentTransactions = transactions.slice(0, 4);

  if (loading) {
    return (
      <Layout>
        <p className="text-gray-400 text-sm">Loading...</p>
      </Layout>
    );
  }

  return (
    <Layout>

      <h2 className="text-lg font-medium mb-1">Welcome, {user?.name}</h2>
      <p className="text-gray-400 text-sm mb-8">
        Cash Balance: <span className="text-white">${user?.balance}</span>
      </p>

     
      <div className="grid grid-cols-3 gap-6 mb-30">
        <div className="border border-[#1a1a1a] rounded-lg p-5">
          <p className="text-xs text-gray-400 mb-1">Portfolio Value</p>
          <p className="text-2xl font-semibold">${totalValue.toFixed(2)}</p>
        </div>
        <div className="border border-[#1a1a1a] rounded-lg p-5">
          <p className="text-xs text-gray-400 mb-1">Total P&L</p>
          <p className={`text-2xl font-semibold ${totalPL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {totalPL >= 0 ? '+' : ''}${totalPL.toFixed(2)}
          </p>
        </div>
        <div className="border border-[#1a1a1a] rounded-lg p-5">
          <p className="text-xs text-gray-400 mb-1">Net Worth</p>
          <p className="text-2xl font-semibold">
            ${(parseFloat(user?.balance) + totalValue).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-10">
        <div>
          <h3 className="text-sm font-medium mb-3">Allocation</h3>

          {pieData.length === 0 ? (
            <p className="text-gray-400 text-sm">No holdings yet.</p>
          ) : (
            <div className="border border-[#1a1a1a] rounded-lg p-4">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: '6px' }}
                    labelStyle={{ color: '#fff' }}
                    formatter={(value) => `$${value.toFixed(2)}`}
                  />
                </PieChart>
              </ResponsiveContainer>

              
              <div className="flex flex-wrap gap-3 mt-2">
                {pieData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center gap-1.5">
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-xs text-gray-400">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium">Top Holdings</h3>
            <Link to="/portfolio" className="text-xs text-gray-400 hover:text-white">
              View all
            </Link>
          </div>

          {topHoldings.length === 0 ? (
            <p className="text-gray-400 text-sm">
              No holdings yet.{' '}
              <Link to="/stocks" className="text-green-500">Browse stocks</Link>
            </p>
          ) : (
            <div className="border border-[#1a1a1a] rounded-lg overflow-hidden">
              {topHoldings.map((item) => (
                <Link
                  to={`/stocks/${item.ticker}`}
                  key={item.id}
                  className="flex justify-between items-center px-4 py-3 border-b border-[#1a1a1a] last:border-b-0 hover:bg-[#1a1a1a]"
                >
                  <div>
                    <p className="text-sm font-medium">{item.ticker}</p>
                    <p className="text-xs text-gray-400">{item.quantity} shares</p>
                  </div>
                  <p className="text-sm">${item.currentValue.toFixed(2)}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        
        <div>
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-sm font-medium">Recent Activity</h3>
            <Link to="/transactions" className="text-xs text-gray-400 hover:text-white">
              View all
            </Link>
          </div>

          {recentTransactions.length === 0 ? (
            <p className="text-gray-400 text-sm">No transactions yet.</p>
          ) : (
            <div className="border border-[#1a1a1a] rounded-lg overflow-hidden">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex justify-between items-center px-4 py-3 border-b border-[#1a1a1a] last:border-b-0"
                >
                  <div>
                    <p className="text-sm font-medium">
                      <span className={tx.type === 'BUY' ? 'text-green-500' : 'text-red-500'}>
                        {tx.type}
                      </span>{' '}
                      {tx.ticker}
                    </p>
                    <p className="text-xs text-gray-400">{tx.quantity} shares</p>
                  </div>
                  <p className="text-sm">${tx.total}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </Layout>
  );
}

export default Dashboard;