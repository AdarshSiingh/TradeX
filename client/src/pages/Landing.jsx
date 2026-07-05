import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="min-h-dvh bg-black text-white">

     
      <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between px-6 sm:px-8">
        <h1 className="text-lg font-semibold">
          Trade<span className="text-green-500">X</span>
        </h1>
        <div className="flex gap-6 text-sm text-gray-400">
          <Link to="/login" className="hover:text-white">Log In</Link>
          <Link to="/signup" className="hover:text-white">Sign Up</Link>
        </div>
      </div>

    
      <main className="mx-auto flex min-h-[calc(100dvh-80px)] w-full max-w-6xl flex-col px-6 sm:px-8">
        <div className="flex flex-1 flex-col items-center justify-center text-center py-8 sm:py-10">


          <h2 className="text-4xl md:text-5xl font-semibold leading-tight mb-4">
            Trade like it's real.<br />
            Because the data is.
          </h2>

          <p className="text-gray-400 text-sm max-w-md mb-8">
            Build and test your trading strategies with live market prices —
            without risking a single rupee.
          </p>

          <div className="flex flex-wrap justify-center gap-3 mb-4">
            <Link
              to="/signup"
              className="min-w-32 bg-green-500 text-black font-medium rounded px-6 py-2 text-sm"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="min-w-28 border border-[#2a2a2a] text-white rounded px-6 py-2 text-sm hover:border-gray-500"
            >
              Log In
            </Link>
          </div>

          <a
            href={`${import.meta.env.VITE_API_URL}/auth/google`}
            className="w-full max-w-64 border border-[#2a2a2a] text-white rounded px-6 py-2 text-sm hover:border-gray-500 mb-6"
          >
            Continue with Google
          </a>

          <p className="text-xs text-gray-500">
            $100,000 virtual balance · Live prices · No risk
          </p>

        </div>

     
      <div className="border-t border-[#1a1a1a]" />

     
     
      <div className="grid grid-cols-1 gap-4 py-8 md:grid-cols-3">

        <div className="min-h-32 border border-[#1a1a1a] rounded-lg p-5">
          <h3 className="text-sm font-medium mb-2">Live Prices</h3>
          <p className="text-gray-400 text-sm">
            Real-time stock prices streamed directly via WebSocket — no refreshing required.
          </p>
        </div>

        <div className="min-h-32 border border-[#1a1a1a] rounded-lg p-5">
          <h3 className="text-sm font-medium mb-2">Real Portfolio Tracking</h3>
          <p className="text-gray-400 text-sm">
            Track your holdings, profit & loss, and full transaction history.
          </p>
        </div>

        <div className="min-h-32 border border-[#1a1a1a] rounded-lg p-5">
          <h3 className="text-sm font-medium mb-2">Built-in Analytics</h3>
          <p className="text-gray-400 text-sm">
            RSI and MACD signals computed for every stock to guide your decisions.
          </p>
        </div>

      </div>
      </main>

    </div>
  );
}

export default Landing;
