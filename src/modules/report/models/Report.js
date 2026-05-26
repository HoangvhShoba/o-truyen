const mongoose = require('mongoose');
const { REPORT_TYPES, REPORT_STATUS } = require('../../../common/constants');

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Reporter reference is required'],
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(REPORT_TYPES),
      required: [true, 'Report type is required'],
    },
    targetType: {
      type: String,
      enum: ['story', 'chapter', 'comment', 'user'],
      required: [true, 'Target type is required'],
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Target ID is required'],
      index: true,
    },
    reason: {
      type: String,
      required: [true, 'Report reason is required'],
      trim: true,
      maxlength: [2000, 'Reason cannot exceed 2000 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
      default: '',
    },
    evidence: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: Object.values(REPORT_STATUS),
      default: REPORT_STATUS.PENDING,
      index: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    resolution: {
      type: String,
      trim: true,
      maxlength: [2000, 'Resolution cannot exceed 2000 characters'],
      default: '',
    },
    actionTaken: {
      type: String,
      enum: ['none', 'warning', 'content_removed', 'user_banned', 'other'],
      default: 'none',
    },
    ipAddress: {
      type: String,
      default: '',
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

reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ type: 1, status: 1 });
reportSchema.index({ targetType: 1, targetId: 1 });
reportSchema.index({ reporter: 1, createdAt: -1 });
reportSchema.index({ reviewedBy: 1, reviewedAt: -1 });

reportSchema.virtual('target', {
  refPath: 'targetType',
  localField: 'targetId',
  foreignField: '_id',
  justOne: true,
});

reportSchema.virtual('reporterInfo', {
  ref: 'User',
  localField: 'reporter',
  foreignField: '_id',
  justOne: true,
});

reportSchema.virtual('reviewerInfo', {
  ref: 'User',
  localField: 'reviewedBy',
  foreignField: '_id',
  justOne: true,
});

reportSchema.statics.findByStatus = function (status, options = {}) {
  const { page = 1, limit = 20 } = options;

  return this.find({ status })
    .populate('reporter', 'username displayName email')
    .populate('reviewedBy', 'username displayName')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

reportSchema.statics.findByTarget = function (targetType, targetId, options = {}) {
  const { page = 1, limit = 20 } = options;

  return this.find({ targetType, targetId })
    .populate('reporter', 'username displayName email')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

reportSchema.statics.findByReporter = function (reporterId, options = {}) {
  const { page = 1, limit = 20 } = options;

  return this.find({ reporter: reporterId })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

reportSchema.statics.countByStatus = async function () {
  const counts = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
  ]);

  const result = {};
  counts.forEach((item) => {
    result[item._id] = item.count;
  });

  return result;
};

reportSchema.statics.getRecentReports = function (limit = 10) {
  return this.find()
    .populate('reporter', 'username displayName')
    .sort({ createdAt: -1 })
    .limit(limit);
};

reportSchema.methods.resolve = async function (reviewedBy, resolution, actionTaken = 'none') {
  await this.updateOne({
    $set: {
      status: REPORT_STATUS.RESOLVED,
      reviewedBy,
      reviewedAt: Date.now(),
      resolution,
      actionTaken,
    },
  });
};

reportSchema.methods.reject = async function (reviewedBy, reason) {
  await this.updateOne({
    $set: {
      status: REPORT_STATUS.REJECTED,
      reviewedBy,
      reviewedAt: Date.now(),
      resolution: reason,
    },
  });
};

reportSchema.statics.hasUserReported = async function (reporterId, targetType, targetId) {
  const existing = await this.findOne({
    reporter: reporterId,
    targetType,
    targetId,
    status: REPORT_STATUS.PENDING,
  });
  return !!existing;
};

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
