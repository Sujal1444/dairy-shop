const express = require("express");
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { authRateLimit } = require("../middleware/authRateLimit");

const router = express.Router();

// ✅ HANDLE PREFLIGHT (VERY IMPORTANT)
router.options("*", (req, res) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://dairy-shop-gray.vercel.app",
  );
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return res.sendStatus(200);
});

// ===============================
// 🔐 AUTH ROUTES
// ===============================
router.post("/register", authRateLimit, register);
router.post("/login", authRateLimit, login);
router.get("/me", protect, getMe);
router.post("/forgotpassword", authRateLimit, forgotPassword);
router.put("/resetpassword/:resettoken", authRateLimit, resetPassword);

module.exports = router;
