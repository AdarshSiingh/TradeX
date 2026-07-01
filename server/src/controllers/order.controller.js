const orderService = require('../services/order.service');

const buy = async (req, res, next) => {
  try {
    const { ticker, quantity } = req.body;
    const userId = req.user.id;

    if (!ticker || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Ticker and a valid quantity are required'
      });
    }

    const result = await orderService.buyStock({ userId, ticker, quantity });

    res.status(200).json({ success: true, ...result });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: err.message });
    }
    next(err);
  }
};

const sell = async (req, res, next) => {
  try {
    const { ticker, quantity } = req.body;
    const userId = req.user.id;

    if (!ticker || !quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Ticker and a valid quantity are required'
      });
    }

    const result = await orderService.sellStock({ userId, ticker, quantity });

    res.status(200).json({ success: true, ...result });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: err.message });
    }
    next(err);
  }
};

module.exports = { buy, sell };