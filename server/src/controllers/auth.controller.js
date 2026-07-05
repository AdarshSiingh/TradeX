const authService = require('../services/auth.service');

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000
};

const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Name, email and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters'
      });
    }

    const { user, token } = await authService.signup({ name, email, password });

    res.cookie('token', token, cookieOptions);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user
    });

  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }

    const { user, token } = await authService.login({ email, password });

    res.cookie('token', token, cookieOptions);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      user
    });

  } catch (err) {
    next(err);
  }
};

const logout = (req, res) => {
  res.clearCookie('token', cookieOptions);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

const getMe = async (req, res) => {
  const result = await require('../config/db').query(
    'SELECT id, name, email, role, balance, created_at FROM users WHERE id = $1',
    [req.user.id]
  );

  res.status(200).json({
    success: true,
    user: result.rows[0]
  });
};

module.exports = { signup, login, logout, getMe };