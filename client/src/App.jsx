import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Stocks from './pages/Stocks';
import StockDetail from './pages/StockDetail';
import Portfolio from './pages/Portfolio';
import Admin from './pages/Admin';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
          path="/stocks"
          element={
            <ProtectedRoute>
              <Stocks />
            </ProtectedRoute>
          }
        />
        <Route
          path="/stocks/:ticker"
          element={
            <ProtectedRoute>
              <StockDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/portfolio"
          element={
            <ProtectedRoute>
              <Portfolio />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireAdmin={true}>
              <Admin />
            </ProtectedRoute>
          }
        />
    </Routes>
  );
}

export default App;