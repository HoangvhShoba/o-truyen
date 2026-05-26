const jwt = require('jsonwebtoken');
const config = require('../../../config');
const User = require('../../user/models/User');
const ApiError = require('../../../common/ApiError');
const { HTTP_STATUS } = require('../../../common/constants');
const { generateToken } = require('../../../utils/crypto');
const { sendWelcomeEmail, sendVerificationEmail, sendPasswordResetEmail } = require('../../../utils/email');

class AuthService {
  async register(userData) {
    const existingUser = await User.findOne({
      $or: [{ email: userData.email }, { username: userData.username }],
    });

    if (existingUser) {
      if (existingUser.email === userData.email) {
        throw ApiError.conflict('Email already registered');
      }
      throw ApiError.conflict('Username already taken');
    }

    const verificationToken = generateToken(32);

    const user = await User.create({
      ...userData,
      verificationToken,
      verificationTokenExpires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    try {
      await sendWelcomeEmail(user);
      await sendVerificationEmail(user, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    await user.addRefreshToken(refreshToken);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async login(email, password) {
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (user.isLocked) {
      throw ApiError.unauthorized('Account is temporarily locked. Please try again later.');
    }

    if (user.isBanned) {
      throw ApiError.forbidden('Account has been banned');
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      await user.incrementLoginAttempts();
      throw ApiError.unauthorized('Invalid email or password');
    }

    if (!user.isEmailVerified) {
      throw ApiError.unauthorized('Please verify your email first');
    }

    await user.resetLoginAttempts();

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    await user.addRefreshToken(refreshToken);

    return {
      user,
      accessToken,
      refreshToken,
    };
  }

  async logout(userId, refreshToken) {
    if (refreshToken) {
      await User.findByIdAndUpdate(userId, {
        $pull: { refreshTokens: { token: refreshToken } },
      });
    } else {
      await User.findByIdAndUpdate(userId, {
        $set: { refreshTokens: [] },
      });
    }

    return { message: 'Logged out successfully' };
  }

  async refreshToken(refreshToken) {
    if (!refreshToken) {
      throw ApiError.unauthorized('Refresh token is required');
    }

    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
    const user = await User.findById(decoded.id).select('+refreshTokens');

    if (!user) {
      throw ApiError.unauthorized('User not found');
    }

    const tokenExists = user.refreshTokens.some((t) => t.token === refreshToken);
    if (!tokenExists) {
      throw ApiError.unauthorized('Invalid refresh token');
    }

    const isExpired = user.refreshTokens.find((t) => t.token === refreshToken)?.expiresAt < new Date();
    if (isExpired) {
      throw ApiError.unauthorized('Refresh token has expired');
    }

    await user.removeRefreshToken(refreshToken);

    const newAccessToken = this.generateAccessToken(user);
    const newRefreshToken = this.generateRefreshToken(user);

    await user.addRefreshToken(newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  async verifyEmail(token) {
    const user = await User.findOne({
      verificationToken: token,
      verificationTokenExpires: { $gt: new Date() },
    });

    if (!user) {
      throw ApiError.badRequest('Invalid or expired verification token');
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    return { message: 'Email verified successfully' };
  }

  async resendVerification(email) {
    const user = await User.findOne({ email });

    if (!user) {
      return { message: 'If the email exists, a verification link has been sent' };
    }

    if (user.isEmailVerified) {
      throw ApiError.badRequest('Email already verified');
    }

    const verificationToken = generateToken(32);
    user.verificationToken = verificationToken;
    user.verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    try {
      await sendVerificationEmail(user, verificationToken);
    } catch (emailError) {
      console.error('Failed to send verification email:', emailError);
    }

    return { message: 'Verification email sent if account exists' };
  }

  async forgotPassword(email) {
    const user = await User.findOne({ email });

    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = generateToken(32);
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    try {
      await sendPasswordResetEmail(user, resetToken);
    } catch (emailError) {
      console.error('Failed to send password reset email:', emailError);
    }

    return { message: 'Password reset email sent if account exists' };
  }

  async resetPassword(token, newPassword) {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw ApiError.badRequest('Invalid or expired reset token');
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.refreshTokens = [];
    await user.save();

    return { message: 'Password reset successfully' };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await User.findById(userId).select('+password');

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const isPasswordValid = await user.comparePassword(currentPassword);
    if (!isPasswordValid) {
      throw ApiError.badRequest('Current password is incorrect');
    }

    user.password = newPassword;
    user.refreshTokens = [];
    await user.save();

    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    await user.addRefreshToken(refreshToken);

    return {
      message: 'Password changed successfully',
      accessToken,
      refreshToken,
    };
  }

  async updateProfile(userId, profileData) {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    const allowedFields = ['displayName', 'bio', 'dateOfBirth', 'gender', 'website', 'socialLinks'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (profileData[field] !== undefined) {
        updates[field] = profileData[field];
      }
    });

    Object.assign(user, updates);
    await user.save();

    return user;
  }

  async uploadAvatar(userId, avatarUrl) {
    const user = await User.findById(userId);

    if (!user) {
      throw ApiError.notFound('User not found');
    }

    user.avatar = avatarUrl;
    await user.save();

    return user;
  }

  generateAccessToken(user) {
    return jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      config.jwt.accessSecret,
      { expiresIn: config.jwt.accessExpiresIn }
    );
  }

  generateRefreshToken(user) {
    return jwt.sign({ id: user._id }, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });
  }
}

module.exports = new AuthService();
