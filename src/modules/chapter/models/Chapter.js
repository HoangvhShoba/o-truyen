const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema(
  {
    story: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Story',
      required: [true, 'Story reference is required'],
      index: true,
    },
    title: {
      type: String,
      trim: true,
      default: '',
    },
    number: {
      type: Number,
      required: [true, 'Chapter number is required'],
      min: [1, 'Chapter number must be at least 1'],
      index: true,
    },
    slug: {
      type: String,
      required: [true, 'Chapter slug is required'],
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      default: '',
    },
    images: [
      {
        type: String,
      },
    ],
    contentHtml: {
      type: String,
      default: '',
    },
    totalViews: {
      type: Number,
      default: 0,
    },
    totalLikes: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isDraft: {
      type: Boolean,
      default: false,
    },
    sourceUrl: {
      type: String,
      default: '',
    },
    sourceId: {
      type: String,
      default: '',
    },
    publishedAt: {
      type: Date,
      default: null,
    },
    prevChapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      default: null,
    },
    nextChapter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chapter',
      default: null,
    },
    wordCount: {
      type: Number,
      default: 0,
    },
    readingTime: {
      type: Number,
      default: 0,
    },
    translatedBy: {
      type: String,
      trim: true,
      default: '',
    },
    editedBy: {
      type: String,
      trim: true,
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

chapterSchema.index({ story: 1, number: 1 }, { unique: true });
chapterSchema.index({ story: 1, slug: 1 }, { unique: true });
chapterSchema.index({ publishedAt: -1 });
chapterSchema.index({ totalViews: -1 });
chapterSchema.index({ sourceId: 1, source: 1 });

chapterSchema.virtual('storyInfo', {
  ref: 'Story',
  localField: 'story',
  foreignField: '_id',
  justOne: true,
});

chapterSchema.pre('save', function (next) {
  if (this.isNew) {
    this.publishedAt = this.publishedAt || Date.now();
  }

  if (this.wordCount === 0 && this.content) {
    this.wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(this.wordCount / 200);
  }

  next();
});

chapterSchema.statics.findByStoryAndNumber = function (storySlug, number) {
  return this.findOne({
    story: storySlug,
    number: parseInt(number, 10),
    isPublished: true,
  }).populate('story');
};

chapterSchema.statics.findByStoryAndSlug = function (storySlug, chapterSlug) {
  return this.findOne({
    story: storySlug,
    slug: chapterSlug,
    isPublished: true,
  }).populate('story');
};

chapterSchema.statics.getChaptersByStory = function (storyId, options = {}) {
  const { page = 1, limit = 50, sortOrder = 'asc' } = options;
  const sort = sortOrder === 'desc' ? { number: -1 } : { number: 1 };

  return this.find({ story: storyId, isPublished: true, isDraft: false })
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(limit);
};

chapterSchema.statics.getPreviousChapter = function (storyId, currentNumber) {
  return this.findOne({
    story: storyId,
    number: { $lt: currentNumber },
    isPublished: true,
  }).sort({ number: -1 });
};

chapterSchema.statics.getNextChapter = function (storyId, currentNumber) {
  return this.findOne({
    story: storyId,
    number: { $gt: currentNumber },
    isPublished: true,
  }).sort({ number: 1 });
};

chapterSchema.methods.incrementViews = async function (amount = 1) {
  await this.updateOne({
    $inc: { totalViews: amount },
  });
};

const Chapter = mongoose.model('Chapter', chapterSchema);

module.exports = Chapter;
