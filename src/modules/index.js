const authRoutes = require('./auth/routes/auth.routes');
const userRoutes = require('./user/routes/user.routes');
const storyRoutes = require('./story/routes/story.routes');
const chapterRoutes = require('./chapter/routes/chapter.routes');
const categoryRoutes = require('./category/routes/category.routes');
const commentRoutes = require('./comment/routes/comment.routes');
const ratingRoutes = require('./rating/routes/rating.routes');
const bookmarkRoutes = require('./bookmark/routes/bookmark.routes');
const notificationRoutes = require('./notification/routes/notification.routes');
const otruyenRoutes = require('./otruyen/routes/sync.routes');
const adminRoutes = require('./admin/routes/admin.routes');
const searchRoutes = require('./search/routes/search.routes');
const analyticsRoutes = require('./analytics/routes/analytics.routes');
const healthRoutes = require('./system/routes/health.routes');

module.exports = {
  authRoutes,
  userRoutes,
  storyRoutes,
  chapterRoutes,
  categoryRoutes,
  commentRoutes,
  ratingRoutes,
  bookmarkRoutes,
  notificationRoutes,
  otruyenRoutes,
  adminRoutes,
  searchRoutes,
  analyticsRoutes,
  healthRoutes,
};
