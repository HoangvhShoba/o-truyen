const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

const USER_ROLES = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
};

const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BANNED: 'banned',
  PENDING: 'pending',
};

const STORY_STATUS = {
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  HIATUS: 'hiatus',
  CANCELLED: 'cancelled',
};

const STORY_TYPES = {
  TRUYEN_TRANH: 'truyen-tranh',
  TRUYEN_CHU: 'truyen-chu',
  SANG_TAC: 'sang-tac',
  TRINH_THAM: 'trinh-tham',
  NGUNG: 'ngung',
};

const NOTIFICATION_TYPES = {
  NEW_CHAPTER: 'new_chapter',
  STORY_UPDATE: 'story_update',
  FOLLOW_STORY: 'follow_story',
  COMMENT_REPLY: 'comment_reply',
  COMMENT_LIKE: 'comment_like',
  SYSTEM: 'system',
};

const REPORT_TYPES = {
  SPAM: 'spam',
  HARASSMENT: 'harassment',
  INAPPROPRIATE: 'inappropriate',
  COPYRIGHT: 'copyright',
  OTHER: 'other',
};

const REPORT_STATUS = {
  PENDING: 'pending',
  REVIEWED: 'reviewed',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
};

const COMMENT_STATUS = {
  VISIBLE: 'visible',
  HIDDEN: 'hidden',
  DELETED: 'deleted',
};

const SYNC_STATUS = {
  IDLE: 'idle',
  RUNNING: 'running',
  COMPLETED: 'completed',
  FAILED: 'failed',
};

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

const CACHE_KEYS = {
  STORY_PREFIX: 'story:',
  CHAPTER_PREFIX: 'chapter:',
  CATEGORY_PREFIX: 'category:',
  HOME_DATA: 'home:data',
  SEARCH_PREFIX: 'search:',
  USER_PREFIX: 'user:',
};

const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  VERIFY_EMAIL: 'verify_email',
  RESET_PASSWORD: 'reset_password',
};

module.exports = {
  HTTP_STATUS,
  USER_ROLES,
  USER_STATUS,
  STORY_STATUS,
  STORY_TYPES,
  NOTIFICATION_TYPES,
  REPORT_TYPES,
  REPORT_STATUS,
  COMMENT_STATUS,
  SYNC_STATUS,
  PAGINATION,
  CACHE_KEYS,
  TOKEN_TYPES,
};
