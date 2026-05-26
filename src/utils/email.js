const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('./logger');

const transporter = nodemailer.createTransport({
  host: config.email.smtp.host,
  port: config.email.smtp.port,
  secure: config.email.smtp.secure,
  auth: {
    user: config.email.smtp.user,
    pass: config.email.smtp.pass,
  },
});

let emailEnabled = false;

transporter.verify((error, success) => {
  if (error) {
    logger.warn('Email transporter verification failed:', error.message);
    logger.warn('Email sending will be disabled. Set valid SMTP credentials to enable.');
    emailEnabled = false;
  } else {
    logger.info('Email transporter is ready to send emails');
    emailEnabled = true;
  }
});

const sendEmail = async ({ to, subject, html, text, attachments = [] }) => {
  if (!emailEnabled) {
    logger.warn('Email sending is disabled due to transporter error');
    return { success: false, message: 'Email disabled' };
  }

  try {
    const mailOptions = {
      from: `"${config.email.from.name}" <${config.email.from.email}>`,
      to,
      subject,
      html,
      text,
      attachments,
    };

    const info = await Promise.race([
      transporter.sendMail(mailOptions),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Email timeout')), 10000))
    ]);
    logger.info(`Email sent: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    logger.error('Failed to send email:', error.message);
    return { success: false, message: error.message };
  }
};

const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to API Truyen!';
  const html = `
    <h1>Welcome, ${user.displayName || user.username}!</h1>
    <p>Thank you for registering with API Truyen.</p>
    <p>Start exploring amazing stories today!</p>
  `;

  return sendEmail({ to: user.email, subject, html });
};

const sendVerificationEmail = async (user, verificationToken) => {
  const verifyUrl = `${config.baseUrl}/api/auth/verify-email?token=${verificationToken}`;
  const subject = 'Verify your email address';
  const html = `
    <h1>Email Verification</h1>
    <p>Hi ${user.displayName || user.username},</p>
    <p>Please click the link below to verify your email address:</p>
    <a href="${verifyUrl}">${verifyUrl}</a>
    <p>This link will expire in 24 hours.</p>
    <p>If you did not create an account, please ignore this email.</p>
  `;

  return sendEmail({ to: user.email, subject, html });
};

const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${config.baseUrl}/api/auth/reset-password?token=${resetToken}`;
  const subject = 'Reset your password';
  const html = `
    <h1>Password Reset Request</h1>
    <p>Hi ${user.displayName || user.username},</p>
    <p>You requested a password reset. Please click the link below to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>This link will expire in 1 hour.</p>
    <p>If you did not request a password reset, please ignore this email and your password will remain unchanged.</p>
  `;

  return sendEmail({ to: user.email, subject, html });
};

const sendNewChapterNotification = async (user, story, chapter) => {
  const storyUrl = `${config.baseUrl}/stories/${story.slug}/chapters/${chapter.number}`;
  const subject = `New chapter released: ${story.title} - Chapter ${chapter.number}`;
  const html = `
    <h1>New Chapter Available!</h1>
    <p>Hi ${user.displayName || user.username},</p>
    <p>The story you follow has a new chapter:</p>
    <h2>${story.title} - Chapter ${chapter.number}</h2>
    <p>${chapter.title || `Chapter ${chapter.number}`}</p>
    <a href="${storyUrl}">Read now</a>
  `;

  return sendEmail({ to: user.email, subject, html });
};

const sendCommentReplyNotification = async (user, reply, parentComment) => {
  const subject = 'Someone replied to your comment';
  const html = `
    <h1>New Reply to Your Comment</h1>
    <p>Hi ${user.displayName || user.username},</p>
    <p>${reply.author.displayName || reply.author.username} replied to your comment:</p>
    <blockquote>${parentComment.content}</blockquote>
    <p><strong>Reply:</strong> ${reply.content}</p>
  `;

  return sendEmail({ to: user.email, subject, html });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendNewChapterNotification,
  sendCommentReplyNotification,
};
