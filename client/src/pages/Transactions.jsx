import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/transactions');
      setTransactions(res.data.transactions);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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

      {transactions.length === 0 ? (
        <p className="text-gray-400 text-sm">No transactions yet.</p>
      ) : (
        <div className="border border-[#1a1a1a] rounded-lg overflow-hidden">
          {transactions.map((tx) => (
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
                <p className="text-xs text-gray-400">
                  {tx.quantity} shares @ ${tx.price} · {formatDate(tx.created_at)}
                </p>
              </div>
              <p className="text-sm">${tx.total}</p>
            </div>
          ))}
        </div>
      )}

    </Layout>
  );
}

export default Transactions;