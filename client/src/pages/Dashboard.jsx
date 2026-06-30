import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-xl font-semibold">
          Trade<span className="text-green-500">X</span>
        </h1>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-white"
        >
          Logout
        </button>
      </div>

      <p className="text-gray-400">
        Welcome, <span className="text-white">{user?.name}</span>
      </p>
      <p className="text-gray-400 text-sm mt-1">
        Balance: <span className="text-green-500">${user?.balance}</span>
      </p>
    </div>
  );
}

export default Dashboard;