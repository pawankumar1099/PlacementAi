const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET;

module.exports = (req, res, next) => {
  if (!JWT_SECRET) {
    return res.status(500).json({ message: "Server configuration error: JWT_SECRET not set" });
  }
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    next();

  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};
