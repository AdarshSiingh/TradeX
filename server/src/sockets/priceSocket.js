const { Server } = require('socket.io');
const redis = require('../config/redis');
const pool = require('../config/db');


let io; 


const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL,
      credentials: true,
    },
  });

  io.on('connection', async (socket) => {
    console.log('Client connected:', socket.id);

    const result = await pool.query('SELECT ticker FROM stocks');
    const tickers = result.rows.map((row) => row.ticker);
    
    for (const ticker of tickers) {
      const price = await redis.get(`price:${ticker}`);
      if (price) {
        socket.emit('priceUpdate', { ticker, price: parseFloat(price) });
      }
    }

    socket.on('disconnect', () => {
      console.log('❌ Client disconnected:', socket.id);
    });
  });

  return io;
};


const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

module.exports = { initSocket, getIO };