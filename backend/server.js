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
const staticAllowedOrigins = new Set([
  "http://localhost:5173",
  "https://dairy-shop-gray.vercel.app",
]);

if (process.env.CORS_ORIGINS) {
  process.env.CORS_ORIGINS.split(",")
    .map((value) => value.trim())
    .filter(Boolean)
    .forEach((origin) => staticAllowedOrigins.add(origin));
}

function isAllowedOrigin(origin) {
  if (!origin) return true;

  const normalizedOrigin = origin.replace(/\/$/, "");
  if (staticAllowedOrigins.has(normalizedOrigin)) return true;

  return /^https:\/\/dairy-shop-.*\.vercel\.app$/i.test(normalizedOrigin);
}

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error(`CORS not allowed for origin: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

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
