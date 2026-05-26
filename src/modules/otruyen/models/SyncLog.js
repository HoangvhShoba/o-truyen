const mongoose = require('mongoose');
const { SYNC_STATUS } = require('../../../common/constants');

const syncLogSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['categories', 'stories', 'chapters', 'full', 'home'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(SYNC_STATUS),
      default: SYNC_STATUS.IDLE,
      index: true,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    duration: {
      type: Number,
      default: 0,
    },
    totalItems: {
      type: Number,
      default: 0,
    },
    processedItems: {
      type: Number,
      default: 0,
    },
    createdItems: {
      type: Number,
      default: 0,
    },
    updatedItems: {
      type: Number,
      default: 0,
    },
    skippedItems: {
      type: Number,
      default: 0,
    },
    failedItems: {
      type: Number,
      default: 0,
    },
    errors: [
      {
        itemId: { type: String },
        message: { type: String },
        timestamp: { type: Date, default: Date.now },
      },
    ],
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    triggeredBy: {
      type: String,
      enum: ['manual', 'scheduled', 'api'],
      default: 'manual',
    },
    triggeredByUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    nextScheduledAt: {
      type: Date,
      default: null,
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

syncLogSchema.index({ createdAt: -1 });
syncLogSchema.index({ status: 1, createdAt: -1 });
syncLogSchema.index({ type: 1, status: 1, createdAt: -1 });

syncLogSchema.virtual('isRunning').get(function () {
  return this.status === SYNC_STATUS.RUNNING;
});

syncLogSchema.virtual('isCompleted').get(function () {
  return this.status === SYNC_STATUS.COMPLETED;
});

syncLogSchema.virtual('isFailed').get(function () {
  return this.status === SYNC_STATUS.FAILED;
});

syncLogSchema.virtual('progress').get(function () {
  if (this.totalItems === 0) return 0;
  return Math.round((this.processedItems / this.totalItems) * 100);
});

syncLogSchema.methods.start = async function () {
  await this.updateOne({
    $set: {
      status: SYNC_STATUS.RUNNING,
      startedAt: Date.now(),
    },
  });
};

syncLogSchema.methods.complete = async function (stats = {}) {
  const duration = Date.now() - this.startedAt.getTime();

  await this.updateOne({
    $set: {
      status: SYNC_STATUS.COMPLETED,
      completedAt: Date.now(),
      duration,
      ...stats,
    },
  });
};

syncLogSchema.methods.fail = async function (error) {
  const duration = this.startedAt ? Date.now() - this.startedAt.getTime() : 0;

  await this.updateOne({
    $set: {
      status: SYNC_STATUS.FAILED,
      completedAt: Date.now(),
      duration,
    },
    $push: {
      errors: {
        itemId: 'system',
        message: error.message || String(error),
        timestamp: Date.now(),
      },
    },
  });
};

syncLogSchema.methods.addError = async function (itemId, message) {
  await this.updateOne({
    $push: {
      errors: {
        itemId,
        message,
        timestamp: Date.now(),
      },
    },
    $inc: { failedItems: 1 },
  });
};

syncLogSchema.methods.incrementProgress = async function (type = 'processed') {
  const increment = { processedItems: 1 };
  if (type === 'created') increment.createdItems = 1;
  if (type === 'updated') increment.updatedItems = 1;
  if (type === 'skipped') increment.skippedItems = 1;

  await this.updateOne({ $inc: increment });
};

syncLogSchema.statics.getLatestByType = function (type) {
  return this.findOne({ type }).sort({ createdAt: -1 });
};

syncLogSchema.statics.getRunningSync = function () {
  return this.findOne({ status: SYNC_STATUS.RUNNING }).sort({ startedAt: -1 });
};

syncLogSchema.statics.isRunning = async function (type = null) {
  const query = { status: SYNC_STATUS.RUNNING };
  if (type) {
    query.type = type;
  }
  const running = await this.findOne(query);
  return !!running;
};

syncLogSchema.statics.getHistory = function (options = {}) {
  const { page = 1, limit = 20, type } = options;

  const query = {};
  if (type) {
    query.type = type;
  }

  return this.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

syncLogSchema.statics.getStats = async function (days = 7) {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - days);

  const stats = await this.aggregate([
    { $match: { createdAt: { $gte: cutoffDate } } },
    {
      $group: {
        _id: '$type',
        total: { $sum: 1 },
        completed: { $sum: { $cond: [{ $eq: ['$status', SYNC_STATUS.COMPLETED] }, 1, 0] } },
        failed: { $sum: { $cond: [{ $eq: ['$status', SYNC_STATUS.FAILED] }, 1, 0] } },
        totalItems: { $sum: '$totalItems' },
        createdItems: { $sum: '$createdItems' },
        updatedItems: { $sum: '$updatedItems' },
        failedItems: { $sum: '$failedItems' },
      },
    },
  ]);

  return stats;
};

const SyncLog = mongoose.model('SyncLog', syncLogSchema);

module.exports = SyncLog;
