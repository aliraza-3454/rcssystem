'use strict';
const path   = require('path');
const dotenv = require('dotenv');

// Load .env FIRST — before everything else
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors    = require('cors');

// Register all models + associations BEFORE connectDB
require('./models/index');
const { connectDB } = require('./config/db');

const app = express();

// ── CORS — allow browser from www.rcs.com AND localhost ──────
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5000',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5000',
    'http://rcs.com',
    'http://rcs.com:3000',
    'http://rcs.com:5000',
    'http://www.rcs.com',
    'http://www.rcs.com:3000',
    'http://www.rcs.com:5000',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Health check endpoint ─────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'RCS API is running',
    domain:  'www.rcs.com',
    version: '2.0.0',
  });
});

// ── API Routes (MUST come BEFORE static files) ────────────────
app.use('/api/auth',   require('./routes/auth'));
app.use('/api/topics', require('./routes/topics'));
app.use('/api/users',  require('./routes/users'));

// ── Serve React build files ───────────────────────────────────
const buildPath = path.join(__dirname, '..', '..', 'frontend', 'build');
app.use(express.static(buildPath));

// ── All other routes → React app (for React Router) ──────────
app.get('*', (_req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

// ── Global error handler ──────────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error('[SERVER ERROR]', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ── Start server AFTER DB connects ───────────────────────────
const PORT = parseInt(process.env.PORT) || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log('\n==========================================');
      console.log('   RCS — Research Coordination System');
      console.log('   PMAS-Arid Agriculture University');
      console.log('==========================================');
      console.log('✅ Server started successfully!');
      console.log('');
      console.log('🌐 Open in browser (any of these):');
      console.log('   http://www.rcs.com:' + PORT);
      console.log('   http://localhost:'   + PORT);
      console.log('');
      console.log('📡 API endpoints:');
      console.log('   http://www.rcs.com:' + PORT + '/api/health');
      console.log('   http://www.rcs.com:' + PORT + '/api/auth/login');
      console.log('==========================================\n');
    });
  })
  .catch((err) => {
    console.error('\n❌ Fatal startup error:', err.message);
    process.exit(1);
  });