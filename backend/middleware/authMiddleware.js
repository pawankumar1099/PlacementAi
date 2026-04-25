const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "secret123";

module.exports = (req, res, next) => {
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
