const transactionService = require('../services/transaction.service');

const getTransactions = async (req, res, next) => {
  try {
    const transactions = await transactionService.getUserTransactions(req.user.id);
    res.status(200).json({ success: true, transactions });
  } catch (err) {
    next(err);
  }
};

module.exports = { getTransactions };