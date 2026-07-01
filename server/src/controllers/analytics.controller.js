const { runPython } = require('../utils/runPython');


const SUPPORTED_TICKERS = ['AAPL', 'AMZN', 'GOOGL', 'GS', 'JPM', 'META', 'MSFT', 'NVDA', 'TSLA', 'V'];

const getAnalytics = async (req, res, next) => {
  try {
    const { ticker } = req.params;
    const upperTicker = ticker.toUpperCase();

    if (!SUPPORTED_TICKERS.includes(upperTicker)) {
      return res.status(404).json({
        success: false,
        error: 'Analytics not available for this stock yet'
      });
    }

    const result = await runPython('run.py', [upperTicker]);

    if (result.error) {
      return res.status(400).json({ success: false, error: result.error });
    }

    res.status(200).json({ success: true, analytics: result });

  } catch (err) {
    next(err);
  }
};

module.exports = { getAnalytics };