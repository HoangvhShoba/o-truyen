const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      trim: true,
      maxlength: [100, 'Category name cannot exceed 100 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Category slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },
    coverImage: {
      type: String,
      default: '',
    },
    icon: {
      type: String,
      default: '',
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    storyCount: {
      type: Number,
      default: 0,
    },
    sourceId: {
      type: String,
      default: '',
      index: true,
    },
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

categorySchema.index({ name: 1 });
categorySchema.index({ order: 1, isActive: 1 });
categorySchema.index({ isFeatured: 1, isActive: 1 });

categorySchema.virtual('stories', {
  ref: 'Story',
  localField: '_id',
  foreignField: 'categories',
});

categorySchema.virtual('subcategories', {
  ref: 'Category',
  localField: '_id',
  foreignField: 'parent',
});

categorySchema.statics.findBySlug = function (slug) {
  return this.findOne({ slug, isActive: true });
};

categorySchema.statics.getAllActive = function () {
  return this.find({ isActive: true }).sort({ order: 1, name: 1 });
};

categorySchema.statics.getFeatured = function () {
  return this.find({ isFeatured: true, isActive: true }).sort({ order: 1 });
};

categorySchema.statics.getWithStories = function (limit = 10) {
  return this.aggregate([
    { $match: { isActive: true } },
    {
      $lookup: {
        from: 'stories',
        localField: '_id',
        foreignField: 'categories',
        as: 'stories',
        pipeline: [{ $match: { isHidden: false } }, { $limit: limit }],
      },
    },
    {
      $addFields: {
        storyCount: { $size: '$stories' },
      },
    },
    { $sort: { order: 1, name: 1 } },
  ]);
};

categorySchema.statics.findOrCreate = async function (data) {
  let category = await this.findOne({ slug: data.slug });
  if (!category) {
    category = await this.create(data);
  }
  return category;
};

categorySchema.methods.updateStoryCount = async function () {
  const Story = mongoose.model('Story');
  const count = await Story.countDocuments({ categories: this._id, isHidden: false });
  await this.updateOne({ storyCount: count });
  return count;
};

const Category = mongoose.model('Category', categorySchema);

module.exports = Category;
