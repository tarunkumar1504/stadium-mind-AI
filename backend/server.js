require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { connectDB } = require('./config/db');
const authRoutes = require('./routes/auth');
const stadiumRoutes = require('./routes/stadium');
const aiRoutes = require('./routes/ai');
const errorHandler = require('./middleware/errorHandler');
const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // needed to load assets if any in local dev
}));
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

app.use(express.json());

// Connect Database (MongoDB or JSON fallback)
connectDB();

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/stadium', stadiumRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint
app.use('/health', (req, res) => {
  res.json({
    status: 'UP',
    timestamp: new Date(),
    database: require('./config/db').isMockDB() ? 'JSON-Mock' : 'MongoDB'
  });
});

// Centralized Error Handling
app.use(errorHandler);

// Start Server
const server = app.listen(process.env.NODE_ENV === 'test' ? 0 : PORT, () => {
  if (process.env.NODE_ENV !== 'test') {
    console.log(`=================================================`);
    console.log(`StadiumPulse AI Backend Server started on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Access Health Check at http://localhost:${PORT}/health`);
    console.log(`=================================================`);
  }
});

module.exports = { app, server };
