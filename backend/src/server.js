require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');
const { logger } = require('./shared/utils/logger');
const http = require('http');
const { Server } = require('socket.io');
const { createAdapter } = require('@socket.io/redis-adapter');
const Redis = require('ioredis');
const { initSocket } = require('./shared/socket/socket');
const { initEventListeners } = require('./shared/utils/eventListeners');

const PORT = process.env.PORT || 5000;

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (process.env.NODE_ENV === 'development' && /^http:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      if (origin === process.env.CLIENT_URL) return callback(null, true);
      callback(new Error(`Socket CORS: origin ${origin} not allowed`));
    },
    credentials: true
  }
});

// Redis adapter enables socket events across multiple server instances
// Without this, sockets on different Render instances can't communicate
if (process.env.REDIS_URL || process.env.NODE_ENV !== 'production') {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const redisOptions = {
    maxRetriesPerRequest: null,
    retryStrategy(times) {
      return Math.min(times * 100, 3000);
    }
  };
  const pubClient = new Redis(redisUrl, redisOptions);
  const subClient = pubClient.duplicate();

  let pubHasLogged = false;
  pubClient.on('error', (err) => {
    if (!pubHasLogged) {
      logger.error('Socket Redis Pub connection failed (graceful degradation active).');
      pubHasLogged = true;
    }
  });

  let subHasLogged = false;
  subClient.on('error', (err) => {
    if (!subHasLogged) {
      logger.error('Socket Redis Sub connection failed (graceful degradation active).');
      subHasLogged = true;
    }
  });
  io.adapter(createAdapter(pubClient, subClient));
}

// Initialize Socket.io logic
initSocket(io);

// Export io (per requirements, though we will use getIO() internally to avoid circular deps)
module.exports = { io };

connectDB()
  .then(() => {
    // Initialize event listeners after DB connects
    initEventListeners();
    
    // Initialize deadline checker
    const { checkDeadlines } = require('./shared/utils/deadlineChecker');
    setInterval(checkDeadlines, 60 * 60 * 1000);
    checkDeadlines(); // run once on startup

    app.on('error', (err) => {
      logger.error("Express App Error:", err);
    });

    httpServer.listen(PORT, () => {
      logger.info(`Server is running at port : ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error("MongoDB connection failed !!! ", err);
  });
