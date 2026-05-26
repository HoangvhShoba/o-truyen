const mongoose = require('mongoose');

const readingHistorySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    story: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Story',
      required: [true, 'Story reference is required'],
      index: true,
    },
    chapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      default: null,
    },
    chapterNumber: {
      type: Number,
      default: null,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    readingTime: {
      type: Number,
      default: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    lastReadAt: {
      type: Date,
      default: Date.now,
    },
    startedAt: {
      type: Date,
      default: Date.now,
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

readingHistorySchema.index({ user: 1, story: 1 }, { unique: true });
readingHistorySchema.index({ user: 1, lastReadAt: -1 });
readingHistorySchema.index({ user: 1, isCompleted: 1 });

readingHistorySchema.virtual('storyInfo', {
  ref: 'Story',
  localField: 'story',
  foreignField: '_id',
  justOne: true,
});

readingHistorySchema.virtual('chapterInfo', {
  ref: 'Chapter',
  localField: 'chapter',
  foreignField: '_id',
  justOne: true,
});

readingHistorySchema.statics.findByUserAndStory = function (userId, storyId) {
  return this.findOne({ user: userId, story: storyId })
    .populate('story', 'title slug coverImage status author totalChapters')
    .populate('chapter', 'title number slug');
};

readingHistorySchema.statics.findByUser = function (userId, options = {}) {
  const { page = 1, limit = 20, includeCompleted = false } = options;

  const query = { user: userId };
  if (!includeCompleted) {
    query.isCompleted = false;
  }

  return this.find(query)
    .populate('story', 'title slug coverImage status author totalChapters rating')
    .populate('chapter', 'title number slug')
    .sort({ lastReadAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

readingHistorySchema.statics.continueReading = function (userId, options = {}) {
  const { limit = 10 } = options;

  return this.find({ user: userId, isCompleted: false })
    .populate('story', 'title slug coverImage status author totalChapters')
    .populate('chapter', 'title number slug')
    .sort({ lastReadAt: -1 })
    .limit(limit);
};

readingHistorySchema.statics.updateProgress = async function (userId, storyId, chapterId, chapterNumber, progress = 0) {
  const existing = await this.findOne({ user: userId, story: storyId });

  if (existing) {
    existing.chapter = chapterId;
    existing.chapterNumber = chapterNumber;
    existing.progress = Math.max(existing.progress, progress);
    existing.lastReadAt = Date.now();
    await existing.save();
    return existing;
  }

  const history = await this.create({
    user: userId,
    story: storyId,
    chapter: chapterId,
    chapterNumber,
    progress,
  });

  return history;
};

readingHistorySchema.statics.markAsCompleted = async function (userId, storyId) {
  await this.findOneAndUpdate(
    { user: userId, story: storyId },
    { isCompleted: true, lastReadAt: Date.now() }
  );
};

readingHistorySchema.statics.removeHistory = async function (userId, storyId) {
  await this.deleteOne({ user: userId, story: storyId });
};

readingHistorySchema.statics.clearAllHistory = async function (userId) {
  await this.deleteMany({ user: userId });
};

readingHistorySchema.statics.getReadingStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalStories: { $sum: 1 },
        completedStories: { $sum: { $cond: ['$isCompleted', 1, 0] } },
        inProgressStories: { $sum: { $cond: [{ $not: '$isCompleted' }, 1, 0] } },
        totalReadingTime: { $sum: '$readingTime' },
      },
    },
  ]);

  return stats[0] || {
    totalStories: 0,
    completedStories: 0,
    inProgressStories: 0,
    totalReadingTime: 0,
  };
};

const ReadingHistory = mongoose.model('ReadingHistory', readingHistorySchema);

module.exports = ReadingHistory;
