require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');
const passport = require('./config/passport');
const authRoutes = require('./routes/auth.routes');

const pool = require('./config/db');
const { initializeDatabase } = require('./db/queries');

const app = express();

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

// ─── ROUTES ──────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({ message: 'Stock Trading Platform API is running ✅' });
});

app.use('/api/auth', authRoutes);

// ─── ERROR HANDLER ───────────────────────────────────────────
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

// ─── START SERVER ────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  await initializeDatabase();
});

module.exports = app;