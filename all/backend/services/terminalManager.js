const socketIO = require('socket.io');
const containerManager = require('./containerManager');

class TerminalManager {
  constructor(server) {
    // Configure Socket.io CORS to match backend CORS policy
    const corsOrigin = process.env.CORS_ORIGIN || '';
    this.io = socketIO(server, {
      cors: {
        origin: function (origin, callback) {
          if (!origin) return callback(null, true);
          if (origin.includes('localhost') || origin.includes('github.dev') || origin.includes('github.com')) {
            return callback(null, true);
          }
          if (process.env.NODE_ENV === 'development') return callback(null, true);
          return callback(new Error('Not allowed by CORS'));
        },
        methods: ['GET', 'POST'],
      },
    });

    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      const userId = socket.handshake.query.userId || 'default-user';
      console.log(`✅ Terminal connected for user: ${userId}`);

      socket.on('terminal:init', async (data) => {
        try {
          const containerInfo = await containerManager.getOrCreateContainer(userId);
          socket.emit('terminal:ready', {
            success: true,
            containerId: containerInfo.id,
            message: 'Terminal ready for code execution',
          });
        } catch (error) {
          socket.emit('terminal:error', {
            error: error.message,
          });
        }
      });

      socket.on('terminal:execute', async (data) => {
        try {
          const { code, language = 'javascript' } = data;
          
          // Emit status update
          socket.emit('terminal:status', {
            status: 'running',
            message: `Executing ${language} code...`,
          });

          const result = await containerManager.executeCode(userId, code, language);

          socket.emit('terminal:output', {
            type: 'result',
            output: result.output,
            error: result.error,
            exitCode: result.exitCode,
          });

          socket.emit('terminal:status', {
            status: 'ready',
            message: 'Ready for next execution',
          });
        } catch (error) {
          socket.emit('terminal:error', {
            error: error.message,
          });
          
          socket.emit('terminal:status', {
            status: 'error',
            message: 'Execution failed',
          });
        }
      });

      socket.on('terminal:stop', async (data) => {
        try {
          await containerManager.stopContainer(userId);
          socket.emit('terminal:stopped', {
            success: true,
            message: 'Terminal stopped',
          });
        } catch (error) {
          socket.emit('terminal:error', {
            error: error.message,
          });
        }
      });

      socket.on('terminal:logs', async (data) => {
        try {
          const logs = await containerManager.getContainerLogs(userId);
          socket.emit('terminal:logs', {
            logs: logs,
          });
        } catch (error) {
          socket.emit('terminal:error', {
            error: error.message,
          });
        }
      });

      socket.on('disconnect', () => {
        console.log(`❌ Terminal disconnected for user: ${userId}`);
      });
    });
  }

  getIO() {
    return this.io;
  }
}

module.exports = TerminalManager;
