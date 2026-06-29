require('dotenv').config();
const pool = require('../config/db');

const createUsersTable = `
  CREATE TABLE IF NOT EXISTS users (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    email       VARCHAR(255) UNIQUE NOT NULL,
    password    VARCHAR(255),
    role        VARCHAR(20) DEFAULT 'TRADER' CHECK (role IN ('TRADER', 'ADMIN')),
    google_id   VARCHAR(255) UNIQUE,
    balance     DECIMAL(15, 2) DEFAULT 100000.00,
    is_active   BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT NOW()
  );
`;

const createStocksTable = `
  CREATE TABLE IF NOT EXISTS stocks (
    id            SERIAL PRIMARY KEY,
    ticker        VARCHAR(10) UNIQUE NOT NULL,
    name          VARCHAR(100) NOT NULL,
    sector        VARCHAR(50),
    current_price DECIMAL(10, 2) DEFAULT 0.00,
    created_at    TIMESTAMPTZ DEFAULT NOW()
  );
`;

const createPortfolioTable = `
  CREATE TABLE IF NOT EXISTS portfolio (
    id            SERIAL PRIMARY KEY,
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stock_id      INTEGER NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
    quantity      INTEGER NOT NULL DEFAULT 0,
    avg_buy_price DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    UNIQUE(user_id, stock_id)
  );
`;

const createOrdersTable = `
  CREATE TABLE IF NOT EXISTS orders (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stock_id    INTEGER NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
    type        VARCHAR(4) NOT NULL CHECK (type IN ('BUY', 'SELL')),
    quantity    INTEGER NOT NULL CHECK (quantity > 0),
    price       DECIMAL(10, 2) NOT NULL,
    status      VARCHAR(10) DEFAULT 'COMPLETED' CHECK (status IN ('COMPLETED', 'CANCELLED')),
    created_at  TIMESTAMPTZ DEFAULT NOW()
  );
`;

const createTransactionsTable = `
  CREATE TABLE IF NOT EXISTS transactions (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    order_id    INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    stock_id    INTEGER NOT NULL REFERENCES stocks(id) ON DELETE CASCADE,
    type        VARCHAR(4) NOT NULL CHECK (type IN ('BUY', 'SELL')),
    quantity    INTEGER NOT NULL,
    price       DECIMAL(10, 2) NOT NULL,
    total       DECIMAL(15, 2) NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
  );
`;


const initializeDatabase = async () => {
  try {
    await pool.query(createUsersTable);
    console.log('✅ Users table ready');

    await pool.query(createStocksTable);
    console.log('✅ Stocks table ready');

    await pool.query(createPortfolioTable);
    console.log('✅ Portfolio table ready');

    await pool.query(createOrdersTable);
    console.log('✅ Orders table ready');

    await pool.query(createTransactionsTable);
    console.log('✅ Transactions table ready');

  } catch (err) {
    console.error('❌ Database initialization failed:', err.message);
    process.exit(1);
  }
};

module.exports = { initializeDatabase };