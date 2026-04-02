// server.js

const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// CORS CONFIG (PERMISSIVE)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD",
  );
  res.header(
    "Access-Control-Allow-Headers",
    req.headers["access-control-request-headers"] || "Content-Type, Authorization",
  );
  res.header("Access-Control-Max-Age", "86400");
  res.header("Vary", "Origin, Access-Control-Request-Headers");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// MIDDLEWARE
app.use(express.json());

// REQUEST LOGGING (FOR DEBUGGING)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// ROUTES
app.use("/api/auth", require("./routes/auth"));
app.use("/api/products", require("./routes/products"));
app.use("/api/entries", require("./routes/entries"));

// HEALTH CHECK
app.get("/", (req, res) => {
  res.send("API is running...");
});

// ERROR HANDLER
app.use((err, req, res, next) => {
  console.error(err.message);

  res.status(500).json({
    success: false,
    error: err.message || "Server Error",
  });
});

// SERVER START
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
