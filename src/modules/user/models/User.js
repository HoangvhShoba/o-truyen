const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { USER_ROLES, USER_STATUS, NOTIFICATION_TYPES } = require('../../../common/constants');

const notificationSettingsSchema = new mongoose.Schema(
  {
    emailNotifications: { type: Boolean, default: true },
    pushNotifications: { type: Boolean, default: true },
    newChapterAlerts: { type: Boolean, default: true },
    followStoryAlerts: { type: Boolean, default: true },
    commentReplies: { type: Boolean, default: true },
    weeklyDigest: { type: Boolean, default: false },
  },
  { _id: false }
);

const socialLinksSchema = new mongoose.Schema(
  {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
      index: true,
    },
    username: {
      type: String,
      required: [true, 'Username is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Username must be at least 3 characters'],
      maxlength: [30, 'Username cannot exceed 30 characters'],
      match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'],
      index: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: [100, 'Display name cannot exceed 100 characters'],
      default: '',
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    dateOfBirth: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other', 'prefer-not-to-say'],
      default: 'prefer-not-to-say',
    },
    role: {
      type: String,
      enum: Object.values(USER_ROLES),
      default: USER_ROLES.USER,
    },
    status: {
      type: String,
      enum: Object.values(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    banReason: {
      type: String,
      default: '',
    },
    socialLinks: {
      type: socialLinksSchema,
      default: () => ({}),
    },
    website: {
      type: String,
      default: '',
    },
    notificationSettings: {
      type: notificationSettingsSchema,
      default: () => ({}),
    },
    favoriteStories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story',
      },
    ],
    followedStories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Story',
      },
    ],
    refreshTokens: [
      {
        token: { type: String },
        expiresAt: { type: Date },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    verificationToken: {
      type: String,
      select: false,
    },
    verificationTokenExpires: {
      type: Date,
      select: false,
    },
    resetPasswordToken: {
      type: String,
      select: false,
    },
    resetPasswordExpires: {
      type: Date,
      select: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        delete ret.password;
        delete ret.refreshTokens;
        delete ret.verificationToken;
        delete ret.verificationTokenExpires;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpires;
        delete ret.loginAttempts;
        delete ret.lockUntil;
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

userSchema.index({ createdAt: -1 });
userSchema.index({ role: 1, status: 1 });
userSchema.index({ favoriteStories: 1 });
userSchema.index({ followedStories: 1 });

userSchema.virtual('isLocked').get(function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.isPasswordChangedAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

userSchema.methods.incrementLoginAttempts = async function () {
  if (this.lockUntil && this.lockUntil < Date.now()) {
    await this.updateOne({
      $set: { loginAttempts: 1 },
      $unset: { lockUntil: 1 },
    });
    return;
  }

  const updates = { $inc: { loginAttempts: 1 } };
  if (this.loginAttempts + 1 >= 5 && !this.lockUntil) {
    updates.$set = { lockUntil: Date.now() + 15 * 60 * 1000 };
  }

  await this.updateOne(updates);
};

userSchema.methods.resetLoginAttempts = async function () {
  await this.updateOne({
    $set: { loginAttempts: 0, lastLogin: Date.now() },
    $unset: { lockUntil: 1 },
  });
};

userSchema.methods.addRefreshToken = async function (token, expiresIn = '7d') {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await this.updateOne({
    $push: {
      refreshTokens: {
        token,
        expiresAt,
        createdAt: Date.now(),
      },
    },
  });

  await this.cleanupExpiredTokens();
};

userSchema.methods.removeRefreshToken = async function (token) {
  await this.updateOne({
    $pull: { refreshTokens: { token } },
  });
};

userSchema.methods.removeAllRefreshTokens = async function () {
  await this.updateOne({
    $set: { refreshTokens: [] },
  });
};

userSchema.methods.cleanupExpiredTokens = async function () {
  await this.updateOne({
    $pull: { refreshTokens: { expiresAt: { $lt: Date.now() } } },
  });
};

userSchema.methods.addFavorite = async function (storyId) {
  if (!this.favoriteStories.includes(storyId)) {
    await this.updateOne({
      $addToSet: { favoriteStories: storyId },
    });
  }
};

userSchema.methods.removeFavorite = async function (storyId) {
  await this.updateOne({
    $pull: { favoriteStories: storyId },
  });
};

userSchema.methods.followStory = async function (storyId) {
  if (!this.followedStories.includes(storyId)) {
    await this.updateOne({
      $addToSet: { followedStories: storyId },
    });
  }
};

userSchema.methods.unfollowStory = async function (storyId) {
  await this.updateOne({
    $pull: { followedStories: storyId },
  });
};

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
