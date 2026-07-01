import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';

function Dashboard() {
  const { user } = useAuth();

  return (
    <Layout>
      <h2 className="text-lg font-medium mb-1">
        Welcome, {user?.name}
      </h2>
      <p className="text-gray-400 text-sm">
        Balance: <span className="text-green-500">${user?.balance}</span>
      </p>
    </Layout>
  );
}

export default Dashboard;