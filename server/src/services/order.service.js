const pool = require('../config/db');

const buyStock = async ({ userId, ticker, quantity }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const stockResult = await client.query(
      'SELECT * FROM stocks WHERE ticker = $1',
      [ticker.toUpperCase()]
    );

    if (stockResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Stock not found' };
    }

    const stock = stockResult.rows[0];
    const totalCost = stock.current_price * quantity;

    const userResult = await client.query(
      'SELECT balance FROM users WHERE id = $1',
      [userId]
    );
    const currentBalance = parseFloat(userResult.rows[0].balance);

    if (currentBalance < totalCost) {
      throw { statusCode: 400, message: 'Insufficient balance' };
    }

    await client.query(
      'UPDATE users SET balance = balance - $1 WHERE id = $2',
      [totalCost, userId]
    );

    const existingPosition = await client.query(
      'SELECT * FROM portfolio WHERE user_id = $1 AND stock_id = $2',
      [userId, stock.id]
    );

    if (existingPosition.rows.length > 0) {
      const position = existingPosition.rows[0];
      const oldQuantity = position.quantity;
      const oldAvgPrice = parseFloat(position.avg_buy_price);

      const newQuantity = oldQuantity + quantity;

      const newAvgPrice =
        (oldQuantity * oldAvgPrice + quantity * stock.current_price) / newQuantity;

      await client.query(
        'UPDATE portfolio SET quantity = $1, avg_buy_price = $2 WHERE id = $3',
        [newQuantity, newAvgPrice, position.id]
      );
    } else {
      await client.query(
        `INSERT INTO portfolio (user_id, stock_id, quantity, avg_buy_price)
         VALUES ($1, $2, $3, $4)`,
        [userId, stock.id, quantity, stock.current_price]
      );
    }

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, stock_id, type, quantity, price)
       VALUES ($1, $2, 'BUY', $3, $4)
       RETURNING id`,
      [userId, stock.id, quantity, stock.current_price]
    );

    await client.query(
      `INSERT INTO transactions (user_id, order_id, stock_id, type, quantity, price, total)
       VALUES ($1, $2, $3, 'BUY', $4, $5, $6)`,
      [userId, orderResult.rows[0].id, stock.id, quantity, stock.current_price, totalCost]
    );

    await client.query('COMMIT');

    return { message: 'Stock purchased successfully', totalCost };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

const sellStock = async ({ userId, ticker, quantity }) => {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const stockResult = await client.query(
      'SELECT * FROM stocks WHERE ticker = $1',
      [ticker.toUpperCase()]
    );

    if (stockResult.rows.length === 0) {
      throw { statusCode: 404, message: 'Stock not found' };
    }

    const stock = stockResult.rows[0];

    const positionResult = await client.query(
      'SELECT * FROM portfolio WHERE user_id = $1 AND stock_id = $2',
      [userId, stock.id]
    );

    if (positionResult.rows.length === 0 || positionResult.rows[0].quantity < quantity) {
      throw { statusCode: 400, message: 'Insufficient shares to sell' };
    }

    const position = positionResult.rows[0];
    const totalValue = stock.current_price * quantity;
    const remainingQuantity = position.quantity - quantity;

    await client.query(
      'UPDATE portfolio SET quantity = $1 WHERE id = $2',
      [remainingQuantity, position.id]
    );

    await client.query(
      'UPDATE users SET balance = balance + $1 WHERE id = $2',
      [totalValue, userId]
    );

    const orderResult = await client.query(
      `INSERT INTO orders (user_id, stock_id, type, quantity, price)
       VALUES ($1, $2, 'SELL', $3, $4)
       RETURNING id`,
      [userId, stock.id, quantity, stock.current_price]
    );

    await client.query(
      `INSERT INTO transactions (user_id, order_id, stock_id, type, quantity, price, total)
       VALUES ($1, $2, $3, 'SELL', $4, $5, $6)`,
      [userId, orderResult.rows[0].id, stock.id, quantity, stock.current_price, totalValue]
    );

    await client.query('COMMIT');

    return { message: 'Stock sold successfully', totalValue };

  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { buyStock, sellStock };