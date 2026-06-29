const { verifyToken } = require('../utils/jwt');


const authenticate = (req, res, next) => {
  try {
    
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access denied. Please login.'
      });
    }

    const decoded = verifyToken(token);


    req.user = decoded;

    next(); 

  } catch (err) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired token. Please login again.'
    });
  }
};

module.exports = authenticate;