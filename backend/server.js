const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middleware

app.use(cors({
  origin: "https://dairy-shop-gray.vercel.app",
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/entries', require('./routes/entries'));

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Dairy Shop API Root' });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Dairy Shop API is running' });
});

// Explicit OPTIONS handler for preflight
// Removed to avoid conflict with global cors settings.

// Catch-all route to log mismatched requests
app.use((req, res) => {
  console.log(`${new Date().toISOString()} - 404 NOT FOUND - ${req.method} ${req.url}`);
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.url} not found` });
});

// Serve frontend static assets in production
// if (process.env.NODE_ENV === 'production') {
//   app.use(express.static(path.join(__dirname, '../frontend/dist')));

//   app.get('*', (req, res) => {
//     res.sendFile(path.resolve(__dirname, '../frontend/dist', 'index.html'));
//   });
// }

const connectDB = require('./config/db');

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

