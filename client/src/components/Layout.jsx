import Navbar from './Navbar';

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />
      <div className="max-w-6xl mx-auto px-8 py-8">
        {children}
      </div>
    </div>
  );
}

export default Layout;