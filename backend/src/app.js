const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const { swaggerSpec } = require('./config/swagger.js');
const mongoose = require('mongoose');
const redis = require('./config/redis');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const passport = require('./config/passport.js');
const { generalLimiter, authLimiter } = require('./shared/middleware/rateLimiter');
const { generateCSRFToken, validateCSRFToken } = require('./shared/middleware/csrfProtection');
const errorHandler = require('./shared/middleware/errorHandler');
const authRoutes = require('./modules/auth/auth.routes');
const orgRoutes = require('./modules/org/org.routes');
const projectRoutes = require('./modules/project/project.routes');
const taskRoutes = require('./modules/task/task.routes');
const chatRoutes = require('./modules/chat/chat.routes');
const notificationRoutes = require('./modules/notification/notification.routes');
const fileRoutes = require('./modules/file/file.routes');
const commentRoutes = require('./modules/comment/comment.routes');
const activityRoutes = require('./modules/activity/activity.routes');
const aiRoutes = require('./modules/ai/ai.routes');
const searchRoutes = require('./modules/search/search.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');

const userRoutes = require('./modules/user/user.routes');

const app = express();

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"], // needed for Swagger UI
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://lh3.googleusercontent.com"],
      connectSrc: ["'self'", process.env.CLIENT_URL],
    }
  },
  crossOriginEmbedderPolicy: false // needed for Cloudinary images
}));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined', {
    skip: (req) => req.url === '/api/health',
    stream: { write: (message) => console.log(message.trim()) }
  }));
}
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, mobile apps)
    if (!origin) return callback(null, true);
    
    // In development, allow any localhost origin
    if (process.env.NODE_ENV === 'development' && /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    
    // In production, restrict to CLIENT_URL
    if (origin === process.env.CLIENT_URL) {
      return callback(null, true);
    }
    
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(cookieParser());
app.use(passport.initialize());
app.use(generateCSRFToken);

// Serve uploads statically
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', async (req, res) => {
  const checks = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: 'unknown',
    redis: 'unknown'
  }

  try {
    await mongoose.connection.db.admin().ping()
    checks.database = 'connected'
  } catch { checks.database = 'disconnected' }

  try {
    await redis.ping()
    checks.redis = 'connected'
  } catch { checks.redis = 'disconnected' }

  const statusCode = checks.database === 'connected' ? 200 : 503
  res.status(statusCode).json(checks)
})

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     tags: [Health]
 *     security: []
 *     responses:
 *       200:
 *         description: OK
 *       503:
 *         description: Service Unavailable
 */

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: `
    .swagger-ui .topbar { background: #0f1117; }
    .swagger-ui .topbar .download-url-wrapper { display: none; }
    body { background: #0f1117; }
    .swagger-ui { color: #f1f5f9; }
  `,
  customSiteTitle: 'NexaFlow API Docs',
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    filter: true,
    docExpansion: 'none'
  }
}))

app.get('/api/docs.json', (req, res) => res.json(swaggerSpec))

// Mount routes here
app.use('/api/auth', authLimiter, authRoutes);

// Apply generalLimiter to all other routes
app.use(generalLimiter);
app.use(validateCSRFToken);
app.use('/api/orgs', orgRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/users', userRoutes);

app.use(errorHandler);

module.exports = app;
