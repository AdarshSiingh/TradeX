require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const passport = require('./config/passport');
const authRoutes = require('./routes/auth.routes');
const stockRoutes = require('./routes/stock.routes');
const orderRoutes = require('./routes/order.routes');
const portfolioRoutes = require('./routes/portfolio.routes');
const pool = require('./config/db');
const { initializeDatabase } = require('./db/queries');
const http = require('http');
const { initSocket } = require('./sockets/priceSocket');
const { connectToFinnhub, seedPricesFromDB } = require('./services/price.service');
const analyticsRoutes = require('./routes/analytics.routes');
const adminRoutes = require('./routes/admin.routes');


app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api/', limiter);


app.get('/', (req, res) => {
  res.json({ message: 'TradeX API is running ✅' });
});

app.use('/api/auth', authRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin', adminRoutes);

const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);


const server = http.createServer(app); 
initSocket(server); 

const PORT = process.env.PORT || 5000;

server.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  await initializeDatabase();
  await seedPricesFromDB();
  connectToFinnhub();
});

module.exports = app;