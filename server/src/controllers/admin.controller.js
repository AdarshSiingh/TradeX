const adminService = require('../services/admin.service');

const getUsers = async (req, res, next) => {
  try {
    const users = await adminService.getAllUsers();
    res.status(200).json({ success: true, users });
  } catch (err) {
    next(err);
  }
};

const suspendUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const user = await adminService.toggleUserStatus(userId);
    res.status(200).json({ success: true, user });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: err.message });
    }
    next(err);
  }
};

const createStock = async (req, res, next) => {
  try {
    const { ticker, name, sector, price } = req.body;

    if (!ticker || !name || !price) {
      return res.status(400).json({
        success: false,
        error: 'Ticker, name, and price are required'
      });
    }

    const stock = await adminService.addStock({ ticker, name, sector, price });
    res.status(201).json({ success: true, stock });
  } catch (err) {
    if (err.statusCode) {
      return res.status(err.statusCode).json({ success: false, error: err.message });
    }
    next(err);
  }
};

module.exports = { getUsers, suspendUser, createStock };