const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
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
    note: {
      type: String,
      trim: true,
      maxlength: [500, 'Note cannot exceed 500 characters'],
      default: '',
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
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    isFavorite: {
      type: Boolean,
      default: true,
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

bookmarkSchema.index({ user: 1, story: 1 }, { unique: true });
bookmarkSchema.index({ user: 1, createdAt: -1 });
bookmarkSchema.index({ user: 1, isFavorite: 1 });

bookmarkSchema.virtual('storyInfo', {
  ref: 'Story',
  localField: 'story',
  foreignField: '_id',
  justOne: true,
});

bookmarkSchema.virtual('chapterInfo', {
  ref: 'Chapter',
  localField: 'chapter',
  foreignField: '_id',
  justOne: true,
});

bookmarkSchema.statics.findByUserAndStory = function (userId, storyId) {
  return this.findOne({ user: userId, story: storyId }).populate('story');
};

bookmarkSchema.statics.findByUser = function (userId, options = {}) {
  const { page = 1, limit = 20 } = options;

  return this.find({ user: userId })
    .populate('story', 'title slug coverImage status author totalChapters rating')
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

bookmarkSchema.statics.countByUser = async function (userId) {
  return this.countDocuments({ user: userId });
};

bookmarkSchema.statics.isBookmarked = async function (userId, storyId) {
  const bookmark = await this.findOne({ user: userId, story: storyId });
  return !!bookmark;
};

bookmarkSchema.statics.toggleBookmark = async function (userId, storyId, note = '') {
  const existing = await this.findOne({ user: userId, story: storyId });

  if (existing) {
    await existing.deleteOne();
    return { bookmarked: false };
  }

  const bookmark = await this.create({ user: userId, story: storyId, note });
  return { bookmarked: true, bookmark };
};

bookmarkSchema.statics.updateBookmarkNote = async function (userId, storyId, note) {
  const bookmark = await this.findOneAndUpdate(
    { user: userId, story: storyId },
    { note },
    { new: true }
  );
  return bookmark;
};

const Bookmark = mongoose.model('Bookmark', bookmarkSchema);

module.exports = Bookmark;
