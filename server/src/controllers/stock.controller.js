const stockService = require('../services/stock.service');

const getStocks = async (req, res, next) => {
  try {
    const { search } = req.query;

    let stocks;
    if (search) {
      stocks = await stockService.searchStocks(search);
    } else {
      stocks = await stockService.getAllStocks();
    }

    res.status(200).json({
      success: true,
      count: stocks.length,
      stocks
    });
  } catch (err) {
    next(err);
  }
};

const getStock = async (req, res, next) => {
  try {
    const { ticker } = req.params;
    const stock = await stockService.getStockByTicker(ticker);

    if (!stock) {
      return res.status(404).json({
        success: false,
        error: 'Stock not found'
      });
    }

    res.status(200).json({
      success: true,
      stock
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getStocks, getStock };