const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Forbidden: You do not have permission to perform this action',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }
    next();
  };
};

module.exports = { authorize };

