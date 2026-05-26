# PROJECT_TASKS.md - Backend API Truyện

## Mục tiêu
Tạo backend hoàn chỉnh cho web đọc truyện với Node.js, Express.js, MongoDB, tích hợp OTruyen API.

---

## PHASE 1: Project Setup & Configuration

### 1.1 Initial Setup
- [x] Initialize npm project với package.json đầy đủ dependencies
- [x] Tạo cấu trúc thư mục clean architecture (src/config, src/modules, src/common, src/middlewares, src/utils, src/jobs, src/docs)
- [x] Tạo .env.example với tất cả environment variables cần thiết
- [x] Tạo .gitignore
- [x] Tạo eslint/prettier config

### 1.2 Core Configuration
- [x] Tạo src/config/index.js - Load và export config
- [x] Tạo src/config/database.js - MongoDB connection với Mongoose

---

## PHASE 2: Common Utilities & Middlewares

### 2.1 Common Utilities
- [x] Tạo src/common/ApiError.js - Custom error class
- [x] Tạo src/common/asyncHandler.js - Wrapper cho async handlers
- [x] Tạo src/common/constants.js - Các hằng số dùng chung
- [x] Tạo src/common/pagination.js - Pagination helper

### 2.2 Middlewares
- [x] Tạo src/middlewares/auth.js - JWT authentication middleware
- [x] Tạo src/middlewares/validate.js - Joi/Zod validation middleware
- [x] Tạo src/middlewares/errorHandler.js - Global error handler
- [x] Tạo src/middlewares/rateLimiter.js - Rate limiting middleware
- [x] Tạo src/middlewares/upload.js - Multer file upload middleware
- [x] Tạo src/middlewares/roleGuard.js - Role-based access control
- [x] Tạo src/middlewares/security.js - Security headers

### 2.3 Utils
- [x] Tạo src/utils/validators/ - Joi schemas cho validation
- [x] Tạo src/utils/helpers.js - Helper functions
- [x] Tạo src/utils/crypto.js - Encryption/decryption utilities
- [x] Tạo src/utils/email.js - Email sending utility
- [x] Tạo src/utils/logger.js - Winston logger

---

## PHASE 3: Database Schemas (MongoDB Models)

### 3.1 User Schema
- [x] Tạo src/modules/user/models/User.js - User schema với indexes, virtuals, methods

### 3.2 Story Schema
- [x] Tạo src/modules/story/models/Story.js - Story schema với indexes, virtuals

### 3.3 Chapter Schema
- [x] Tạo src/modules/chapter/models/Chapter.js - Chapter schema với compound index

### 3.4 Category Schema
- [x] Tạo src/modules/category/models/Category.js - Category schema

### 3.5 Comment Schema
- [x] Tạo src/modules/comment/models/Comment.js - Comment schema với soft delete

### 3.6 Rating Schema
- [x] Tạo src/modules/rating/models/Rating.js - Rating schema với aggregation

### 3.7 Bookmark Schema
- [x] Tạo src/modules/bookmark/models/Bookmark.js - Bookmark schema

### 3.8 ReadingHistory Schema
- [x] Tạo src/modules/reading-history/models/ReadingHistory.js - ReadingHistory schema

### 3.9 Notification Schema
- [x] Tạo src/modules/notification/models/Notification.js - Notification schema

### 3.10 Report Schema
- [x] Tạo src/modules/report/models/Report.js - Report schema

### 3.11 SyncLog Schema
- [x] Tạo src/modules/otruyen/models/SyncLog.js - Sync logging schema

---

## PHASE 4: Auth Module

### 4.1 Auth Services & Controllers
- [x] Tạo src/modules/auth/services/auth.service.js - Auth business logic
- [x] Tạo src/modules/auth/controllers/auth.controller.js - Auth endpoints
- [x] Tạo src/modules/auth/routes/auth.routes.js - Auth routes với Swagger docs

### 4.2 Auth Endpoints
- [x] POST /api/auth/register - User registration
- [x] POST /api/auth/login - User login (return access + refresh token)
- [x] POST /api/auth/refresh-token - Refresh access token
- [x] POST /api/auth/logout - User logout
- [x] POST /api/auth/forgot-password - Send reset password email
- [x] POST /api/auth/reset-password - Reset password with token
- [x] GET /api/auth/verify-email - Verify email address
- [x] POST /api/auth/resend-verification - Resend verification email
- [x] POST /api/auth/change-password - Change password (authenticated)
- [x] PUT /api/auth/update-profile - Update user profile
- [x] POST /api/auth/upload-avatar - Upload avatar
- [x] GET /api/auth/me - Get current user

---

## PHASE 5: User Module

### 5.1 User Services & Controllers
- [x] Tạo src/modules/user/controllers/user.controller.js - User endpoints
- [x] Tạo src/modules/user/routes/user.routes.js - User routes

### 5.2 User Endpoints
- [x] GET /api/users/profile - Get current user profile
- [x] PUT /api/users/profile - Update profile
- [x] DELETE /api/users/account - Delete account
- [x] GET /api/users/reading-history - Get reading history
- [x] GET /api/users/favorites - Get favorite stories
- [x] POST /api/users/favorites/:storyId - Follow/favorite a story
- [x] DELETE /api/users/favorites/:storyId - Unfavorite a story
- [x] GET /api/users/notifications/settings - Get notification settings
- [x] PUT /api/users/notifications/settings - Update notification settings

---

## PHASE 6: Story Module

### 6.1 Story Services & Controllers
- [x] Tạo src/modules/story/services/story.service.js - Story business logic
- [x] Tạo src/modules/story/controllers/story.controller.js - Story endpoints
- [x] Tạo src/modules/story/routes/story.routes.js - Story routes

### 6.2 Story Endpoints
- [x] GET /api/stories - List stories (paginated, filterable)
- [x] GET /api/stories/:slug - Get story detail
- [x] GET /api/stories/:slug/chapters - Get chapters list of story
- [x] GET /api/stories/latest - Get latest stories
- [x] GET /api/stories/trending - Get trending stories
- [x] GET /api/stories/hot - Get hot stories
- [x] GET /api/stories/completed - Get completed stories
- [x] GET /api/stories/ongoing - Get ongoing stories
- [x] GET /api/stories/featured - Get featured stories
- [x] GET /api/stories/recommend - Get recommended stories
- [x] GET /api/stories/:slug/related - Get related stories
- [x] GET /api/stories/search - Full text search
- [x] GET /api/stories/suggest - Search suggestions
- [x] GET /api/stories/ranking - Get ranking by type (day/week/month)
- [x] POST /api/stories/:slug/view - Increment view count
- [x] GET /api/stories/category/:slug - Get stories by category

---

## PHASE 7: Chapter Module

### 7.1 Chapter Services & Controllers
- [x] Tạo src/modules/chapter/services/chapter.service.js - Chapter business logic
- [x] Tạo src/modules/chapter/controllers/chapter.controller.js - Chapter endpoints
- [x] Tạo src/modules/chapter/routes/chapter.routes.js - Chapter routes

### 7.2 Chapter Endpoints
- [x] GET /api/chapters/:slug/:number - Get chapter content
- [x] GET /api/chapters/:slug/:number/prev - Get previous chapter
- [x] GET /api/chapters/:slug/:number/next - Get next chapter
- [x] POST /api/chapters/:id/mark-read - Mark chapter as read
- [x] GET /api/chapters/history - Get chapter reading history

---

## PHASE 8: Category Module

### 8.1 Category Services & Controllers
- [x] Tạo src/modules/category/controllers/category.controller.js - Category endpoints
- [x] Tạo src/modules/category/routes/category.routes.js - Category routes

### 8.2 Category Endpoints
- [x] GET /api/categories - List all categories
- [x] GET /api/categories/:slug - Get category detail
- [x] GET /api/categories/:slug/stories - Get stories by category

---

## PHASE 9: Comment Module

### 9.1 Comment Services & Controllers
- [x] Tạo src/modules/comment/controllers/comment.controller.js - Comment endpoints
- [x] Tạo src/modules/comment/routes/comment.routes.js - Comment routes

### 9.2 Comment Endpoints
- [x] GET /api/comments/story/:storySlug - Get comments by story
- [x] POST /api/comments/story/:storySlug - Create comment
- [x] PUT /api/comments/:id - Update own comment
- [x] DELETE /api/comments/:id - Delete own comment
- [x] POST /api/comments/:id/reply - Reply to comment
- [x] POST /api/comments/:id/like - Like comment
- [x] POST /api/comments/:id/report - Report comment

---

## PHASE 10: Rating Module

### 10.1 Rating Services & Controllers
- [x] Tạo src/modules/rating/controllers/rating.controller.js - Rating endpoints
- [x] Tạo src/modules/rating/routes/rating.routes.js - Rating routes

### 10.2 Rating Endpoints
- [x] POST /api/ratings/stories/:slug - Rate a story
- [x] PUT /api/ratings/stories/:slug - Update rating
- [x] GET /api/ratings/stories/:slug - Get rating summary

---

## PHASE 11: Bookmark Module

### 11.1 Bookmark Services & Controllers
- [x] Tạo src/modules/bookmark/controllers/bookmark.controller.js - Bookmark endpoints
- [x] Tạo src/modules/bookmark/routes/bookmark.routes.js - Bookmark routes

### 11.2 Bookmark Endpoints
- [x] GET /api/bookmarks - List all bookmarks
- [x] POST /api/bookmarks/:storyId - Add bookmark
- [x] DELETE /api/bookmarks/:storyId - Remove bookmark

---

## PHASE 12: Notification Module

### 12.1 Notification Services & Controllers
- [x] Tạo src/modules/notification/controllers/notification.controller.js - Notification endpoints
- [x] Tạo src/modules/notification/routes/notification.routes.js - Notification routes

### 12.2 Notification Endpoints
- [x] GET /api/notifications - Get user notifications
- [x] PUT /api/notifications/:id/read - Mark notification as read
- [x] PUT /api/notifications/read-all - Mark all as read
- [x] DELETE /api/notifications/:id - Delete notification

---

## PHASE 13: OTruyen Integration Module

### 13.1 OTruyen Client & Service
- [x] Tạo src/modules/otruyen/client/otruyen.client.js - HTTP client for OTruyen API
- [x] Tạo src/modules/otruyen/mapper/otruyen.mapper.js - Map OTruyen data to our schemas
- [x] Tạo src/modules/otruyen/services/otruyen.service.js - OTruyen service layer

### 13.2 OTruyen Sync Controllers & Routes
- [x] Tạo src/modules/otruyen/controllers/sync.controller.js - Sync endpoints
- [x] Tạo src/modules/otruyen/routes/sync.routes.js - Sync routes

### 13.3 OTruyen Sync Endpoints
- [x] POST /api/otruyen/sync/categories - Sync categories from OTruyen
- [x] POST /api/otruyen/sync/home - Sync home page data
- [x] POST /api/otruyen/sync/stories/:slug - Sync single story
- [x] POST /api/otruyen/sync/stories - Sync multiple stories
- [x] POST /api/otruyen/sync/all - Full sync
- [x] GET /api/otruyen/sync/status - Get sync status

---

## PHASE 14: Admin Module

### 14.1 Admin Services & Controllers
- [x] Tạo src/modules/admin/controllers/admin.controller.js - Admin endpoints
- [x] Tạo src/modules/admin/routes/admin.routes.js - Admin routes (protected)

### 14.2 Admin Endpoints
- [x] GET /api/admin/dashboard/stats - Dashboard statistics
- [x] GET /api/admin/users - List all users
- [x] PUT /api/admin/users/:id/role - Update user role
- [x] DELETE /api/admin/users/:id - Ban/delete user
- [x] GET /api/admin/stories - List all stories
- [x] DELETE /api/admin/stories/:id - Hide story
- [x] GET /api/admin/comments - List all comments
- [x] DELETE /api/admin/comments/:id - Delete comment
- [x] GET /api/admin/reports - List reports
- [x] PUT /api/admin/reports/:id/resolve - Resolve report

---

## PHASE 15: Analytics Module

### 15.1 Analytics Services & Controllers
- [x] Tạo src/modules/analytics/controllers/analytics.controller.js - Analytics endpoints
- [x] Tạo src/modules/analytics/routes/analytics.routes.js - Analytics routes

### 15.2 Analytics Endpoints
- [x] POST /api/analytics/track/view - Track story view
- [x] GET /api/analytics/stories/:slug/stats - Get story analytics
- [x] GET /api/analytics/popular - Get popular stories
- [x] GET /api/analytics/daily - Get daily statistics

---

## PHASE 16: Search Module

### 16.1 Search Services & Controllers
- [x] Tạo src/modules/search/controllers/search.controller.js - Search endpoints
- [x] Tạo src/modules/search/routes/search.routes.js - Search routes

### 16.2 Search Endpoints
- [x] GET /api/search - Full text search
- [x] GET /api/search/suggest - Get search suggestions
- [x] GET /api/search/trending - Get trending keywords

---

## PHASE 17: System & Health

### 17.1 System Routes
- [x] Tạo src/modules/system/routes/health.routes.js - Health check routes

### 17.2 System Endpoints
- [x] GET /api/health - Health check endpoint
- [x] GET /api/health/ping - Simple ping endpoint

---

## PHASE 18: Main App Entry Point

### 18.1 App Setup
- [x] Tạo src/app.js - Express app setup (middlewares, routes)
- [x] Tạo src/server.js - Server entry point

---

## Task Checklist Summary

| Phase | Tổng số | Hoàn thành |
|-------|---------|------------|
| 1. Project Setup | 7 | 7 |
| 2. Common & Middlewares | 14 | 14 |
| 3. Database Schemas | 11 | 11 |
| 4. Auth Module | 15 | 15 |
| 5. User Module | 10 | 10 |
| 6. Story Module | 17 | 17 |
| 7. Chapter Module | 8 | 8 |
| 8. Category Module | 4 | 4 |
| 9. Comment Module | 8 | 8 |
| 10. Rating Module | 4 | 4 |
| 11. Bookmark Module | 4 | 4 |
| 12. Notification Module | 4 | 4 |
| 13. OTruyen Integration | 10 | 10 |
| 14. Admin Module | 11 | 11 |
| 15. Analytics Module | 5 | 5 |
| 16. Search Module | 4 | 4 |
| 17. System & Health | 2 | 2 |
| 18. Main App | 2 | 2 |
| **TỔNG CỘNG** | **140** | **140** |

---

## Còn lại cần hoàn thành

### Cần bổ sung:
- [ ] Cron jobs (src/jobs/) - Scheduled sync jobs
- [ ] Swagger documentation chi tiết
- [ ] Unit tests
- [ ] Redis cache implementation
- [ ] Cloudinary upload implementation
- [ ] README.md

---

## Dependencies đã cài đặt

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mongoose": "^8.0.0",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "joi": "^17.11.0",
    "multer": "^1.4.5-lts.1",
    "cloudinary": "^1.41.0",
    "morgan": "^1.10.0",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "compression": "^1.7.4",
    "express-rate-limit": "^7.1.5",
    "ioredis": "^5.3.2",
    "node-cron": "^3.0.3",
    "nodemailer": "^6.9.7",
    "swagger-jsdoc": "^6.2.8",
    "swagger-ui-express": "^5.0.0",
    "dotenv": "^16.3.1",
    "winston": "^3.11.0",
    "crypto-js": "^4.2.0",
    "axios": "^1.6.2",
    "lodash": "^4.17.21",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "nodemon": "^3.0.2",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0",
    "jest": "^29.7.0",
    "supertest": "^6.3.3"
  }
}
```

---

## Cách chạy project

```bash
# Clone repository
git clone <repo-url>
cd api-truyen

# Install dependencies
npm install

# Copy và update .env
cp .env.example .env
# Chỉnh sửa .env với MongoDB URI và các config khác

# Start development server
npm run dev

# Production
npm start
```

---

## API Endpoints Overview

### Public Routes
- GET /api/health - Health check
- GET /api/stories - List stories
- GET /api/stories/:slug - Story detail
- GET /api/stories/latest - Latest stories
- GET /api/categories - List categories
- GET /api/search - Search stories
- GET /api/chapters/:slug/:number - Chapter content

### Auth Routes
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/refresh-token
- POST /api/auth/logout
- POST /api/auth/forgot-password
- POST /api/auth/reset-password
- GET /api/auth/verify-email

### User Routes (Authenticated)
- GET /api/users/profile
- PUT /api/users/profile
- GET /api/users/reading-history
- GET /api/users/favorites
- POST /api/users/favorites/:storyId

### Story Routes
- POST /api/stories/:slug/rating - Rate story
- POST /api/comments/story/:slug - Comment
- POST /api/bookmarks/:storyId - Bookmark

### Admin Routes (Admin role)
- GET /api/admin/dashboard/stats
- POST /api/otruyen/sync/all
- POST /api/otruyen/sync/stories
- DELETE /api/admin/users/:id
