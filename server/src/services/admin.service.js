const pool = require('../config/db');
const { subscribeToTicker } = require('./price.service');


const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT id, name, email, role, balance, is_active, created_at 
     FROM users 
     ORDER BY created_at DESC`
  );
  return result.rows;
};

const getStats = async () => {
  const usersResult = await pool.query(
    `SELECT 
       COUNT(*) AS total_users,
       COUNT(*) FILTER (WHERE is_active = true) AS active_users,
       COUNT(*) FILTER (WHERE is_active = false) AS suspended_users
     FROM users`
  );

  const stocksResult = await pool.query('SELECT COUNT(*) AS total_stocks FROM stocks');
  const tradesResult = await pool.query('SELECT COUNT(*) AS total_trades FROM orders');

  return {
    totalUsers: parseInt(usersResult.rows[0].total_users),
    activeUsers: parseInt(usersResult.rows[0].active_users),
    suspendedUsers: parseInt(usersResult.rows[0].suspended_users),
    totalStocks: parseInt(stocksResult.rows[0].total_stocks),
    totalTrades: parseInt(tradesResult.rows[0].total_trades),
  };
};

const toggleUserStatus = async (userId) => {
  
  const result = await pool.query(
    `UPDATE users 
     SET is_active = NOT is_active 
     WHERE id = $1 
     RETURNING id, name, email, is_active`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw { statusCode: 404, message: 'User not found' };
  }

  return result.rows[0];
};


const addStock = async ({ ticker, name, sector, price }) => {

  const tickerRegex = /^[A-Za-z]{1,5}$/;
  if (!tickerRegex.test(ticker)) {
    const error = new Error('Ticker must be 1-5 letters only');
    error.statusCode = 400;
    throw error;
  }

  if (Number(price) <= 0) {
    const error = new Error('Price must be a positive number');
    error.statusCode = 400;
    throw error;
  }

  const result = await pool.query(
    `INSERT INTO stocks (ticker, name, sector, current_price)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [ticker.toUpperCase(), name, sector, price]
  );

  subscribeToTicker(ticker.toUpperCase());

  return result.rows[0];
};

const removeStock = async (stockId) => {

  
  const holdersCheck = await pool.query(
    'SELECT COUNT(*) FROM portfolio WHERE stock_id = $1 AND quantity > 0',
    [stockId]
  );

  const holderCount = parseInt(holdersCheck.rows[0].count);

  if (holderCount > 0) {
    throw {
      statusCode: 400,
      message: `Cannot remove stock — ${holderCount} user(s) currently hold shares of it`
    };
  }

  const result = await pool.query(
    'DELETE FROM stocks WHERE id = $1 RETURNING *',
    [stockId]
  );

  if (result.rows.length === 0) {
    throw { statusCode: 404, message: 'Stock not found' };
  }

  return result.rows[0];
};

module.exports = { getAllUsers, toggleUserStatus, addStock, getStats, removeStock };