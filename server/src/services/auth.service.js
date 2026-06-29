const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { generateToken } = require('../utils/jwt');

const signup = async ({ name, email, password }) => {

  const existingUser = await pool.query(
    'SELECT id FROM users WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    const error = new Error('Email already registered');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (name, email, password)
     VALUES ($1, $2, $3)
     RETURNING id, name, email, role, balance, created_at`,
    [name, email, hashedPassword]
  );

  const user = result.rows[0];

  const token = generateToken(user);

  return { user, token };
};

const login = async ({ email, password }) => {

  const result = await pool.query(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );

  if (result.rows.length === 0) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const user = result.rows[0];

  if (!user.is_active) {
    const error = new Error('Account suspended. Contact support.');
    error.statusCode = 403;
    throw error;
  }

  const isMatch = await bcrypt.compare(password, user.password);

  if (!isMatch) {
    const error = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = generateToken(user);

  const { password: _, ...userWithoutPassword } = user;

  return { user: userWithoutPassword, token };
};

const googleAuth = async ({ googleId, email, name }) => {

  let result = await pool.query(
    'SELECT * FROM users WHERE google_id = $1 OR email = $2',
    [googleId, email]
  );

  let user;

  if (result.rows.length === 0) {
    const newUser = await pool.query(
      `INSERT INTO users (name, email, google_id)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, role, balance, created_at`,
      [name, email, googleId]
    );
    user = newUser.rows[0];
  } else {
    user = result.rows[0];
    if (!user.google_id) {
      await pool.query(
        'UPDATE users SET google_id = $1 WHERE id = $2',
        [googleId, user.id]
      );
    }
  }

  const token = generateToken(user);
  return { user, token };
};

module.exports = { signup, login, googleAuth };