const mongoose = require('mongoose');
const { COMMENT_STATUS } = require('../../../common/constants');

const commentSchema = new mongoose.Schema(
  {
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
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Comment content is required'],
      trim: true,
      maxlength: [5000, 'Comment cannot exceed 5000 characters'],
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
      default: null,
      index: true,
    },
    replyTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    status: {
      type: String,
      enum: Object.values(COMMENT_STATUS),
      default: COMMENT_STATUS.VISIBLE,
      index: true,
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedContent: {
      type: String,
      default: 'This comment has been deleted',
    },
    likeCount: {
      type: Number,
      default: 0,
    },
    replyCount: {
      type: Number,
      default: 0,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    editedAt: {
      type: Date,
      default: null,
    },
    ipAddress: {
      type: String,
      default: '',
    },
    userAgent: {
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
        if (ret.isDeleted) {
          ret.content = ret.deletedContent;
        }
        return ret;
      },
    },
  }
);

commentSchema.index({ story: 1, createdAt: -1 });
commentSchema.index({ story: 1, user: 1 });
commentSchema.index({ parent: 1, createdAt: 1 });
commentSchema.index({ user: 1, createdAt: -1 });
commentSchema.index({ likeCount: -1 });

commentSchema.virtual('replies', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'parent',
});

commentSchema.virtual('storyInfo', {
  ref: 'Story',
  localField: 'story',
  foreignField: '_id',
  justOne: true,
});

commentSchema.virtual('userInfo', {
  ref: 'User',
  localField: 'user',
  foreignField: '_id',
  justOne: true,
});

commentSchema.pre('save', function (next) {
  if (this.isModified('content') && !this.isNew) {
    this.isEdited = true;
    this.editedAt = Date.now();
  }
  next();
});

commentSchema.statics.findByStory = function (storyId, options = {}) {
  const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = options;
  const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

  return this.find({
    story: storyId,
    parent: null,
    isDeleted: false,
    status: COMMENT_STATUS.VISIBLE,
  })
    .populate('user', 'username displayName avatar role')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);
};

commentSchema.statics.findReplies = function (parentId, options = {}) {
  const { page = 1, limit = 10, sortOrder = 'asc' } = options;
  const sort = sortOrder === 'desc' ? { createdAt: -1 } : { createdAt: 1 };

  return this.find({
    parent: parentId,
    isDeleted: false,
    status: COMMENT_STATUS.VISIBLE,
  })
    .populate('user', 'username displayName avatar role')
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);
};

commentSchema.statics.countByStory = async function (storyId) {
  return this.countDocuments({
    story: storyId,
    isDeleted: false,
    status: COMMENT_STATUS.VISIBLE,
  });
};

commentSchema.methods.softDelete = async function () {
  await this.updateOne({
    $set: {
      isDeleted: true,
      content: this.deletedContent,
      status: COMMENT_STATUS.DELETED,
    },
  });
};

commentSchema.methods.incrementLikes = async function (amount = 1) {
  await this.updateOne({
    $inc: { likeCount: amount },
  });
};

commentSchema.methods.incrementReplies = async function (amount = 1) {
  await this.updateOne({
    $inc: { replyCount: amount },
  });
};

commentSchema.methods.hide = async function () {
  await this.updateOne({
    $set: { status: COMMENT_STATUS.HIDDEN },
  });
};

commentSchema.methods.pin = async function () {
  await this.updateOne({
    $set: { isPinned: true },
  });
};

commentSchema.methods.unpin = async function () {
  await this.updateOne({
    $set: { isPinned: false },
  });
};

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
