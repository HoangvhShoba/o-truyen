const mongoose = require('mongoose');
const { STORY_STATUS, STORY_TYPES } = require('../../../common/constants');

const genreSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
  },
  { _id: false }
);

const authorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true },
  },
  { _id: false }
);

const storySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [500, 'Title cannot exceed 500 characters'],
      index: true,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    originalTitle: {
      type: String,
      trim: true,
      default: '',
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, 'Description cannot exceed 5000 characters'],
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    coverImageOriginal: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: Object.values(STORY_STATUS),
      default: STORY_STATUS.ONGOING,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(STORY_TYPES),
      default: STORY_TYPES.TRUYEN_TRANH,
      index: true,
    },
    author: authorSchema,
    genres: [genreSchema],
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        index: true,
      },
    ],
    totalViews: {
      type: Number,
      default: 0,
      index: true,
    },
    monthlyViews: {
      type: Number,
      default: 0,
    },
    weeklyViews: {
      type: Number,
      default: 0,
    },
    dailyViews: {
      type: Number,
      default: 0,
    },
    totalChapters: {
      type: Number,
      default: 0,
    },
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    totalComments: {
      type: Number,
      default: 0,
    },
    totalFavorites: {
      type: Number,
      default: 0,
    },
    totalFollowers: {
      type: Number,
      default: 0,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    isPopular: {
      type: Boolean,
      default: false,
      index: true,
    },
    isTrending: {
      type: Boolean,
      default: false,
      index: true,
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
    isAdult: {
      type: Boolean,
      default: false,
    },
    alternativeTitles: [
      {
        type: String,
        trim: true,
      },
    ],
    releaseYear: {
      type: Number,
      min: 1900,
      max: 2100,
    },
    source: {
      type: String,
      default: 'otruyen',
    },
    sourceUrl: {
      type: String,
      default: '',
    },
    sourceId: {
      type: String,
      default: '',
      index: true,
    },
    lastChapterAt: {
      type: Date,
      default: null,
    },
    lastSyncedAt: {
      type: Date,
      default: null,
    },
    translators: [
      {
        type: String,
        trim: true,
      },
    ],
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    seoTitle: {
      type: String,
      trim: true,
    },
    seoDescription: {
      type: String,
      trim: true,
      maxlength: 160,
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

storySchema.index({ title: 'text', description: 'text', 'author.name': 'text' });
storySchema.index({ slug: 1, status: 1 });
storySchema.index({ totalViews: -1 });
storySchema.index({ 'rating.average': -1, 'rating.count': -1 });
storySchema.index({ createdAt: -1 });
storySchema.index({ updatedAt: -1 });
storySchema.index({ lastChapterAt: -1 });
storySchema.index({ isFeatured: 1, isHidden: 1 });
storySchema.index({ monthlyViews: -1 });
storySchema.index({ weeklyViews: -1 });
storySchema.index({ dailyViews: -1 });
storySchema.index({ sourceId: 1, source: 1 });

storySchema.virtual('chapters', {
  ref: 'Chapter',
  localField: '_id',
  foreignField: 'story',
});

storySchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'story',
});

storySchema.virtual('latestChapter', {
  ref: 'Chapter',
  localField: '_id',
  foreignField: 'story',
  justOne: true,
  options: { sort: { number: -1 } },
});

storySchema.pre('save', function (next) {
  if (this.isModified('status')) {
    this.isCompleted = this.status === STORY_STATUS.COMPLETED;
  }
  next();
});

storySchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug, isHidden: false });
};

storySchema.statics.findBySourceId = function (sourceId, source = 'otruyen') {
  return this.findOne({ sourceId, source });
};

storySchema.statics.getTrending = function (limit = 10) {
  return this.find({ isHidden: false })
    .sort({ monthlyViews: -1 })
    .limit(limit);
};

storySchema.statics.getPopular = function (limit = 10) {
  return this.find({ isHidden: false })
    .sort({ totalViews: -1 })
    .limit(limit);
};

storySchema.statics.getLatest = function (limit = 10) {
  return this.find({ isHidden: false })
    .sort({ updatedAt: -1 })
    .limit(limit);
};

storySchema.statics.searchStories = function (query, options = {}) {
  const { page = 1, limit = 20, status, category, genre } = options;

  const searchQuery = { isHidden: false };

  if (query) {
    searchQuery.$text = { $search: query };
  }

  if (status) {
    searchQuery.status = status;
  }

  if (category) {
    searchQuery.categories = category;
  }

  if (genre) {
    searchQuery['genres.slug'] = genre;
  }

  return this.find(searchQuery)
    .sort({ score: { $meta: 'textScore' } } || { updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

storySchema.methods.incrementViews = async function (amount = 1) {
  const now = new Date();
  const update = {
    $inc: {
      totalViews: amount,
      dailyViews: amount,
      weeklyViews: amount,
      monthlyViews: amount,
    },
  };

  if (!this.dailyViewsUpdatedAt || this.dailyViewsUpdatedAt < now.setHours(0, 0, 0, 0)) {
    update.$set = { dailyViewsUpdatedAt: now };
    update.$set.dailyViews = amount;
  }

  if (!this.weeklyViewsUpdatedAt || this.weeklyViewsUpdatedAt < now.setHours(0, 0, 0, 0) - 7 * 24 * 60 * 60 * 1000) {
    update.$set = update.$set || {};
    update.$set.weeklyViews = amount;
  }

  if (!this.monthlyViewsUpdatedAt || this.monthlyViewsUpdatedAt < now.setHours(0, 0, 0, 0) - 30 * 24 * 60 * 60 * 1000) {
    update.$set = update.$set || {};
    update.$set.monthlyViews = amount;
  }

  await this.updateOne(update);
};

const Story = mongoose.model('Story', storySchema);

module.exports = Story;
