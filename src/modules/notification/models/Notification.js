const mongoose = require('mongoose');
const { NOTIFICATION_TYPES } = require('../../../common/constants');

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: [true, 'Notification type is required'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    story: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Story',
      default: null,
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      default: null,
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
    },
    fromUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },
    readAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    actionUrl: {
      type: String,
      default: '',
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high'],
      default: 'normal',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ user: 1, type: 1, createdAt: -1 });
notificationSchema.index({ isDeleted: 1, createdAt: -1 });

notificationSchema.virtual('storyInfo', {
  ref: 'Story',
  localField: 'story',
  foreignField: '_id',
  justOne: true,
});

notificationSchema.virtual('chapterInfo', {
  ref: 'Chapter',
  localField: 'chapter',
  foreignField: '_id',
  justOne: true,
});

notificationSchema.virtual('fromUserInfo', {
  ref: 'User',
  localField: 'fromUser',
  foreignField: '_id',
  justOne: true,
});

notificationSchema.statics.findByUser = function (userId, options = {}) {
  const { page = 1, limit = 20, includeDeleted = false } = options;

  const query = { user: userId };
  if (!includeDeleted) {
    query.isDeleted = false;
  }

  return this.find(query)
    .populate('story', 'title slug coverImage')
    .populate('fromUser', 'username displayName avatar')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

notificationSchema.statics.getUnreadCount = async function (userId) {
  return this.countDocuments({ user: userId, isRead: false, isDeleted: false });
};

notificationSchema.statics.getUnreadNotifications = function (userId, limit = 10) {
  return this.find({ user: userId, isRead: false, isDeleted: false })
    .populate('story', 'title slug coverImage')
    .sort({ priority: -1, createdAt: -1 })
    .limit(limit);
};

notificationSchema.methods.markAsRead = async function () {
  if (!this.isRead) {
    await this.updateOne({
      $set: { isRead: true, readAt: Date.now() },
    });
  }
};

notificationSchema.methods.markAsUnread = async function () {
  await this.updateOne({
    $set: { isRead: false, readAt: null },
  });
};

notificationSchema.methods.delete = async function () {
  await this.updateOne({ $set: { isDeleted: true } });
};

notificationSchema.statics.markAllAsRead = async function (userId) {
  await this.updateMany(
    { user: userId, isRead: false, isDeleted: false },
    { $set: { isRead: true, readAt: Date.now() } }
  );
};

notificationSchema.statics.createNewChapterNotification = async function (userId, story, chapter) {
  return this.create({
    user: userId,
    type: NOTIFICATION_TYPES.NEW_CHAPTER,
    title: `New chapter: ${story.title}`,
    message: `Chapter ${chapter.number} has been released!`,
    story: story._id,
    chapter: chapter._id,
    actionUrl: `/stories/${story.slug}/chapters/${chapter.number}`,
    priority: 'high',
    data: {
      storySlug: story.slug,
      chapterNumber: chapter.number,
    },
  });
};

notificationSchema.statics.createCommentReplyNotification = async function (userId, reply, parentComment) {
  return this.create({
    user: userId,
    type: NOTIFICATION_TYPES.COMMENT_REPLY,
    title: 'New reply to your comment',
    message: `${reply.author?.displayName || 'Someone'} replied to your comment`,
    comment: parentComment._id,
    fromUser: reply.user,
    actionUrl: `/stories/${parentComment.story}/comments`,
    data: {
      replyId: reply._id,
      parentCommentId: parentComment._id,
    },
  });
};

notificationSchema.statics.cleanupOldNotifications = async function (daysOld = 30) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysOld);

  const result = await this.deleteMany({
    isDeleted: false,
    createdAt: { $lt: cutoffDate },
    isRead: true,
  });

  return result.deletedCount;
};

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
