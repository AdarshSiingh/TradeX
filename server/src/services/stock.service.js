const pool = require('../config/db');


const getAllStocks = async () => {
  const result = await pool.query(
    'SELECT * FROM stocks ORDER BY ticker ASC'
  );
  return result.rows;
};


const searchStocks = async (query) => {
  const result = await pool.query(
    `SELECT * FROM stocks 
     WHERE ticker ILIKE $1 OR name ILIKE $1
     ORDER BY ticker ASC`,
    [`%${query}%`]
  );
  return result.rows;
};


const getStockByTicker = async (ticker) => {
  const result = await pool.query(
    'SELECT * FROM stocks WHERE ticker = $1',
    [ticker.toUpperCase()]
  );
  return result.rows[0];
};

module.exports = { getAllStocks, searchStocks, getStockByTicker };