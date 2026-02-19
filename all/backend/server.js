const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
require('dotenv').config();

const app = express();
const server = http.createServer(app);

// Import terminal manager
const TerminalManager = require('./services/terminalManager');
const containerManager = require('./services/containerManager');
const { authMiddleware } = require('./middleware/auth');

// Middleware
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // Allow localhost and GitHub Codespaces domains
    if (origin.includes('localhost') || 
        origin.includes('github.dev') || 
        origin.includes('github.com')) {
      return callback(null, true);
    }
    
    // Allow any origin in development
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400,
};

app.use(cors(corsOptions));
// Handle preflight requests
app.options('*', cors(corsOptions));
app.use(express.json());

// Development-friendly CORS middleware: always send CORS headers and handle OPTIONS
app.use((req, res, next) => {
  // Allow any origin in development to avoid Codespaces proxy issues
  const allowOrigin = process.env.CORS_ALLOW_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }

  next();
});

// Debug middleware to log Origin and CORS decisions
app.use((req, res, next) => {
  try {
    const origin = req.headers.origin;
    console.log('CORS DEBUG - incoming origin:', origin);
  } catch (e) {
    console.error('CORS DEBUG error:', e && e.message);
  }
  next();
});

// Debug middleware to log Origin and CORS decision for troubleshooting
app.use((req, res, next) => {
  const origin = req.headers.origin || 'none';
  try {
    // Use corsOptions.origin to check
    corsOptions.origin(origin, (err, allow) => {
      console.log(`CORS DEBUG -> Path: ${req.path}, Origin: ${origin}, Allowed: ${!!allow}, Error: ${err ? err.message : 'none'}`);
      // proceed regardless; actual cors middleware will set headers
      next();
    });
  } catch (e) {
    console.log('CORS DEBUG error:', e.message);
    next();
  }
});

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.error('❌ MongoDB connection error:', err));

// Initialize Terminal Manager (WebSocket)
const terminalManager = new TerminalManager(server);
console.log('✅ WebSocket server initialized for terminal');

// Expose a simple endpoint to execute code for quick testing (dev-only)
app.post('/api/exec', async (req, res) => {
  try {
    const userId = (req.body && req.body.userId) || 'default-user';
    const code = (req.body && req.body.code) || 'console.log("hello from exec")';
    const language = (req.body && req.body.language) || 'javascript';

    // Map language to command
    let cmd = [];
    if (language === 'javascript') cmd = ['node', '-e', code];
    else if (language === 'python') cmd = ['python3', '-c', code];
    else cmd = ['sh', '-c', code];

    // executeInContainer was replaced by executeCode in containerManager
    const result = await containerManager.executeCode(userId, code, language);
    res.json({ success: true, output: result.output });
  } catch (err) {
    console.error('exec error:', err && err.message);
    res.status(500).json({ error: err.message || 'Execution failed' });
  }
});

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/files', authMiddleware, require('./routes/files'));
app.use('/api/projects', authMiddleware, require('./routes/projects'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Backend running', timestamp: new Date().toISOString() });
});

// Terminal status endpoint (REST)
app.get('/api/terminal/status', (req, res) => {
  res.json({
    containerCount: containerManager.containers.size,
    containers: Array.from(containerManager.containers.values()).map(c => ({
      userId: c.userId,
      createdAt: c.createdAt,
    })),
  });
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await containerManager.cleanup();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('SIGINT received, shutting down gracefully...');
  await containerManager.cleanup();
  process.exit(0);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket ready at ws://localhost:${PORT}`);
});

