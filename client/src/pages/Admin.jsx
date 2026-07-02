import { useState, useEffect } from 'react';
import api from '../services/api';
import Layout from '../components/Layout';

function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

 
  const [ticker, setTicker] = useState('');
  const [name, setName] = useState('');
  const [sector, setSector] = useState('');
  const [price, setPrice] = useState('');
  const [stockMessage, setStockMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await api.patch(`/admin/users/${userId}/toggle-status`);
      fetchUsers(); 
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const handleAddStock = async (e) => {
    e.preventDefault();
    setStockMessage('');
    try {
      await api.post('/admin/stocks', {
        ticker,
        name,
        sector,
        price: Number(price)
      });
      setStockMessage(`${ticker.toUpperCase()} added successfully`);
      setTicker('');
      setName('');
      setSector('');
      setPrice('');
    } catch (err) {
      setStockMessage(err.response?.data?.error || 'Failed to add stock');
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

      
      <h2 className="text-sm font-medium mb-3">Add New Stock</h2>
      <form onSubmit={handleAddStock} className="border border-[#1a1a1a] rounded-lg p-5 mb-8 max-w-md">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <input
            type="text"
            placeholder="Ticker (e.g. NFLX)"
            value={ticker}
            onChange={(e) => setTicker(e.target.value)}
            required
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Price"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
            className="bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-sm focus:outline-none focus:border-gray-500"
          />
        </div>
        <input
          type="text"
          placeholder="Company name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-sm mb-3 focus:outline-none focus:border-gray-500"
        />
        <input
          type="text"
          placeholder="Sector (optional)"
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          className="w-full bg-[#1a1a1a] border border-[#2a2a2a] rounded px-3 py-2 text-sm mb-4 focus:outline-none focus:border-gray-500"
        />
        <button
          type="submit"
          className="bg-green-500 text-black font-medium rounded px-4 py-2 text-sm"
        >
          Add Stock
        </button>
        {stockMessage && (
          <p className="text-sm text-gray-400 mt-3">{stockMessage}</p>
        )}
      </form>

      <h2 className="text-sm font-medium mb-3">Users</h2>
      <div className="border border-[#1a1a1a] rounded-lg overflow-hidden">
        {users.map((user) => (
          <div
            key={user.id}
            className="flex justify-between items-center px-4 py-3 border-b border-[#1a1a1a] last:border-b-0"
          >
            <div>
              <p className="text-sm font-medium">
                {user.name} <span className="text-gray-500 text-xs">({user.role})</span>
              </p>
              <p className="text-xs text-gray-400">{user.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-xs ${user.is_active ? 'text-green-500' : 'text-red-500'}`}>
                {user.is_active ? 'Active' : 'Suspended'}
              </span>
              <button
                onClick={() => handleToggleStatus(user.id)}
                className="text-xs text-gray-400 hover:text-white border border-[#2a2a2a] rounded px-3 py-1"
              >
                {user.is_active ? 'Suspend' : 'Unsuspend'}
              </button>
            </div>
          </div>
        ))}
      </div>

    </Layout>
  );
}

export default Admin;