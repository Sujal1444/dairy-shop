const express = require("express");
const {
  register,
  login,
  getMe,
  forgotPassword,
  resetPassword,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

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
router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resettoken", resetPassword);

module.exports = router;
