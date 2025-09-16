const jwt = require("jsonwebtoken");
const User = require("../models/user"); // adjust if your User model path differs

// Middleware to protect routes
const protect = async (req, res, next) => {
  let token;

  try {
    // Expecting token in Authorization header: "Bearer <token>"
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach user (excluding password) to request
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        return res
          .status(401)
          .json({ message: "User not found, unauthorized" });
      }

      next();
    } else {
      return res.status(401).json({ message: "No token, unauthorized" });
    }
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = protect;
