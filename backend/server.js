// server.js

const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// ======================
// ✅ CORS CONFIG (FIXED)
// ======================
const allowedOrigins = [
  "http://localhost:5173",
  "https://dairy-shop-gray.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (mobile apps, postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }
    },
    credentials: true,
  }),
);

// Handle preflight requests
app.options("*", cors());

// ======================
// MIDDLEWARE
// ======================
app.use(express.json());

// ======================
// ROUTES
// ======================
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/entries", require("./routes/entries"));

// ======================
// HEALTH CHECK
// ======================
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ======================
// ERROR HANDLER
// ======================
app.use((err, req, res, next) => {
  console.error(err.message);

  res.status(500).json({
    success: false,
    error: err.message || "Server Error",
  });
});

// ======================
// SERVER START
// ======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
