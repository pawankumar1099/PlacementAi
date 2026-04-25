const express = require("express");
const router = express.Router();
const { signup, login, logout, me } = require("../controllers/authControllers.js");
const authMiddleware = require("../middleware/authMiddleware.js");

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);
router.get("/me", authMiddleware, me);

module.exports = router;
