const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ✅ CORS (IMPORTANT)
app.use(cors({
  origin: "https://dairy-shop-gray.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true
}));

// ✅ Handle preflight (VERY IMPORTANT FIX)
app.options('*', cors());

// ✅ Body parser
app.use(express.json());

// ✅ Logging (optional but useful)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// ✅ Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/entries', require('./routes/entries'));

// ✅ Health check
app.get('/', (req, res) => {
  res.send("API is running");
});

// ❌ REMOVE your old 404 temporarily (to debug)
// We will add it later after everything works

// ✅ Connect DB
const connectDB = require('./config/db');
connectDB();

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});