export const authorize = (...roles) => {
  return (req, res, next) => {

    // Safety check (should already exist because protect runs first)
    if (!req.user) {
      return res.status(401).json({
        message: "Not authorized"
      });
    }

    // Check if user's role is allowed
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied. Insufficient permissions."
      });
    }

    next();
  };
};