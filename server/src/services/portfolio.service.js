const pool = require('../config/db');


const getPortfolio = async (userId) => {
  const result = await pool.query(
    `SELECT 
       p.id,
       s.ticker,
       s.name,
       p.quantity,
       p.avg_buy_price,
       s.current_price,
       (p.quantity * s.current_price) AS current_value,
       (p.quantity * s.current_price) - (p.quantity * p.avg_buy_price) AS profit_loss
     FROM portfolio p
     JOIN stocks s ON p.stock_id = s.id
     WHERE p.user_id = $1 AND p.quantity > 0
     ORDER BY current_value DESC`,
    [userId]
  );
  return result.rows;
};

module.exports = { getPortfolio };