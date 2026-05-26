const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const config = require('./config');
const logger = require('./utils/logger');
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const { globalLimiter } = require('./middlewares/rateLimiter');

const authRoutes = require('./modules/auth/routes/auth.routes');
const userRoutes = require('./modules/user/routes/user.routes');
const storyRoutes = require('./modules/story/routes/story.routes');
const chapterRoutes = require('./modules/chapter/routes/chapter.routes');
const categoryRoutes = require('./modules/category/routes/category.routes');
const commentRoutes = require('./modules/comment/routes/comment.routes');
const ratingRoutes = require('./modules/rating/routes/rating.routes');
const bookmarkRoutes = require('./modules/bookmark/routes/bookmark.routes');
const notificationRoutes = require('./modules/notification/routes/notification.routes');
const otruyenRoutes = require('./modules/otruyen/routes/sync.routes');
const adminRoutes = require('./modules/admin/routes/admin.routes');
const searchRoutes = require('./modules/search/routes/search.routes');
const analyticsRoutes = require('./modules/analytics/routes/analytics.routes');
const healthRoutes = require('./modules/system/routes/health.routes');

const app = express();

app.use(helmet());

app.use(
  cors({
    origin: config.cors.origin,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true,
    maxAge: 86400,
  })
);

app.use(compression());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

const logStream = fs.createWriteStream(path.join(__dirname, '..', 'logs', 'access.log'), {
  flags: 'a',
});
app.use(morgan('combined', { stream: logStream }));
app.use(morgan('dev'));

app.use('/api/health', healthRoutes);

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: config.swagger.title,
      version: config.swagger.version,
      description: config.swagger.description,
    },
    servers: [
      {
        url: config.baseUrl,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/modules/*/routes/*.js'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use(config.swagger.url, swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/stories', storyRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/otruyen', otruyenRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

module.exports = app;
