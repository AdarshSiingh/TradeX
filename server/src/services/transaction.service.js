const pool = require('../config/db');

const getUserTransactions = async (userId) => {
  const result = await pool.query(
    `SELECT 
       t.id,
       s.ticker,
       s.name,
       t.type,
       t.quantity,
       t.price,
       t.total,
       t.created_at
     FROM transactions t
     JOIN stocks s ON t.stock_id = s.id
     WHERE t.user_id = $1
     ORDER BY t.created_at DESC`,
    [userId]
  );
  return result.rows;
};

module.exports = { getUserTransactions };