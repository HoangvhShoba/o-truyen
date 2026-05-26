const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema(
  {
    story: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Story',
      required: [true, 'Story reference is required'],
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
      index: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    review: {
      type: String,
      trim: true,
      maxlength: [2000, 'Review cannot exceed 2000 characters'],
      default: '',
    },
    isDeleted: {
      type: Boolean,
      default: false,
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

ratingSchema.index({ story: 1, user: 1 }, { unique: true });
ratingSchema.index({ story: 1, rating: 1 });
ratingSchema.index({ user: 1, createdAt: -1 });

ratingSchema.statics.findByUserAndStory = function (userId, storyId) {
  return this.findOne({ user: userId, story: storyId, isDeleted: false });
};

ratingSchema.statics.getStoryRatingSummary = async function (storyId) {
  const result = await this.aggregate([
    { $match: { story: new mongoose.Types.ObjectId(storyId), isDeleted: false } },
    {
      $group: {
        _id: '$story',
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 },
        rating1: { $sum: { $cond: [{ $eq: ['$rating', 1] }, 1, 0] } },
        rating2: { $sum: { $cond: [{ $eq: ['$rating', 2] }, 1, 0] } },
        rating3: { $sum: { $cond: [{ $eq: ['$rating', 3] }, 1, 0] } },
        rating4: { $sum: { $cond: [{ $eq: ['$rating', 4] }, 1, 0] } },
        rating5: { $sum: { $cond: [{ $eq: ['$rating', 5] }, 1, 0] } },
      },
    },
  ]);

  if (result.length === 0) {
    return {
      averageRating: 0,
      totalRatings: 0,
      distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  }

  const data = result[0];
  return {
    averageRating: Math.round(data.averageRating * 10) / 10,
    totalRatings: data.totalRatings,
    distribution: {
      1: data.rating1,
      2: data.rating2,
      3: data.rating3,
      4: data.rating4,
      5: data.rating5,
    },
  };
};

ratingSchema.statics.updateStoryRating = async function (storyId) {
  const Story = mongoose.model('Story');
  const summary = await this.getStoryRatingSummary(storyId);

  await Story.findByIdAndUpdate(storyId, {
    'rating.average': summary.averageRating,
    'rating.count': summary.totalRatings,
  });

  return summary;
};

ratingSchema.statics.getTopRatedStories = function (limit = 10, minRatings = 5) {
  return this.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: '$story',
        averageRating: { $avg: '$rating' },
        totalRatings: { $sum: 1 },
      },
    },
    { $match: { totalRatings: { $gte: minRatings } } },
    { $sort: { averageRating: -1, totalRatings: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'stories',
        localField: '_id',
        foreignField: '_id',
        as: 'story',
      },
    },
    { $unwind: '$story' },
    {
      $project: {
        _id: 1,
        averageRating: 1,
        totalRatings: 1,
        story: {
          id: '$story._id',
          title: '$story.title',
          slug: '$story.slug',
          coverImage: '$story.coverImage',
          status: '$story.status',
        },
      },
    },
  ]);
};

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
