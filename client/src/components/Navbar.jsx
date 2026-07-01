import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const linkClass = (path) =>
    `text-sm ${isActive(path) ? 'text-white' : 'text-gray-400 hover:text-white'}`;

  return (
    <div className="border-b border-[#1a1a1a] px-8 py-4 flex justify-between items-center">

      <div className="flex items-center gap-8">
        <h1 className="text-lg font-semibold">
          Trade<span className="text-green-500">X</span>
        </h1>

        <div className="flex gap-6">
          <Link to="/dashboard" className={linkClass('/dashboard')}>Dashboard</Link>
          <Link to="/stocks" className={linkClass('/stocks')}>Stocks</Link>
          <Link to="/portfolio" className={linkClass('/portfolio')}>Portfolio</Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-400">{user?.name}</span>
        <button
          onClick={handleLogout}
          className="text-sm text-gray-400 hover:text-white"
        >
          Logout
        </button>
      </div>

    </div>
  );
}

export default Navbar;