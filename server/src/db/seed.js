require('dotenv').config();
const pool = require('../config/db');

const stocks = [
  { ticker: 'AAPL', name: 'Apple Inc.', sector: 'Technology', price: 195.50 },
  { ticker: 'TSLA', name: 'Tesla Inc.', sector: 'Automotive', price: 248.30 },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology', price: 175.20 },
  { ticker: 'MSFT', name: 'Microsoft Corp.', sector: 'Technology', price: 420.80 },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', sector: 'E-Commerce', price: 186.40 },
  { ticker: 'META', name: 'Meta Platforms Inc.', sector: 'Technology', price: 565.10 },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', sector: 'Semiconductors', price: 138.90 },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Finance', price: 248.60 },
  { ticker: 'GS', name: 'Goldman Sachs Group', sector: 'Finance', price: 612.30 },
  { ticker: 'V', name: 'Visa Inc.', sector: 'Finance', price: 312.70 },
];

const seedStocks = async () => {
  try {
    for (const stock of stocks) {
      
      await pool.query(
        `INSERT INTO stocks (ticker, name, sector, current_price)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (ticker)
         DO UPDATE SET current_price = $4`,
        [stock.ticker, stock.name, stock.sector, stock.price]
      );
      console.log(`✅ ${stock.ticker} seeded`);
    }
    console.log(' All stocks seeded successfully');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
  } finally {
    process.exit();
  }
};

seedStocks();