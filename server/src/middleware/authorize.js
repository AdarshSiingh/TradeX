

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Forbidden. You do not have permission to do this.'
      });
    }
    next();
  };
};

module.exports = authorize;