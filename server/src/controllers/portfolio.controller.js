const portfolioService = require('../services/portfolio.service');

const getMyPortfolio = async (req, res, next) => {
  try {
    const portfolio = await portfolioService.getPortfolio(req.user.id);

   let totalValue = 0;
   let totalPL = 0;

    for (const item of portfolio) {
    totalValue += parseFloat(item.current_value);
    totalPL += parseFloat(item.profit_loss);
    }

    res.status(200).json({
      success: true,
      portfolio,
      totalValue,
      totalPL
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getMyPortfolio };