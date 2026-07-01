const WebSocket = require('ws');
const redis = require('../config/redis');
const { getIO } = require('../sockets/priceSocket');
require('dotenv').config();
const pool = require('../config/db');

const TICKERS = ['AAPL', 'TSLA', 'GOOGL', 'MSFT', 'AMZN', 'META', 'NVDA', 'JPM', 'GS', 'V'];

const connectToFinnhub = () => {
  const finnhubSocket = new WebSocket(
    `wss://ws.finnhub.io?token=${process.env.FINNHUB_API_KEY}`
  );

  finnhubSocket.on('open', () => {
    console.log('✅ Connected to Finnhub WebSocket');

    
    TICKERS.forEach((ticker) => {
      finnhubSocket.send(JSON.stringify({ type: 'subscribe', symbol: ticker }));
    });
  });

  finnhubSocket.on('message', async (data) => {
    const parsed = JSON.parse(data);

  
    if (parsed.type === 'trade' && parsed.data) {
      for (const trade of parsed.data) {
        const ticker = trade.s;
        const price = trade.p;

        
        await redis.set(`price:${ticker}`, price);

        await pool.query(
          'UPDATE stocks SET current_price = $1 WHERE ticker = $2',
          [price, ticker]
        );

        
        const io = getIO();
        io.emit('priceUpdate', { ticker, price });
      }
    }
  });

  finnhubSocket.on('error', (err) => {
    console.error('❌ Finnhub WebSocket error:', err.message);
  });

  finnhubSocket.on('close', () => {
    console.log('⚠️ Finnhub WebSocket closed, reconnecting in 5s...');
    setTimeout(connectToFinnhub, 5000); 
  });
};

const seedPricesFromDB = async () => {
  const result = await pool.query('SELECT ticker, current_price FROM stocks');

  for (const stock of result.rows) {
    await redis.set(`price:${stock.ticker}`, stock.current_price);
  }

  console.log('✅ Redis seeded with existing stock prices');
};

module.exports = { connectToFinnhub, seedPricesFromDB };