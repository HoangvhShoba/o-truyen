const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    statusCode: 200,
    message: 'API Truyen is running',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/auth',
      users: '/api/users',
      stories: '/api/stories',
      chapters: '/api/chapters',
      categories: '/api/categories',
      comments: '/api/comments',
      ratings: '/api/ratings',
      bookmarks: '/api/bookmarks',
      notifications: '/api/notifications',
      search: '/api/search',
      analytics: '/api/analytics',
      otruyen: '/api/otruyen',
      admin: '/api/admin',
    },
  });
});

router.get('/ping', (req, res) => {
  res.json({ success: true, message: 'pong', timestamp: new Date().toISOString() });
});

module.exports = router;
