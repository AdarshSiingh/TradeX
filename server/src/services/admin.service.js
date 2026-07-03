const pool = require('../config/db');


const getAllUsers = async () => {
  const result = await pool.query(
    `SELECT id, name, email, role, balance, is_active, created_at 
     FROM users 
     ORDER BY created_at DESC`
  );
  return result.rows;
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
  return result.rows[0];
};

module.exports = { getAllUsers, toggleUserStatus, addStock };