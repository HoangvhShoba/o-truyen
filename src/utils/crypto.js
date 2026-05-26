const crypto = require('crypto');
const CryptoJS = require('crypto-js');
const config = require('../config');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

const generateRandomBytes = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('base64url');
};

const hashString = (text) => {
  return crypto.createHash('sha256').update(text).digest('hex');
};

const encryptAES = (text) => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = crypto.scryptSync(config.jwt.accessSecret, 'salt', 32);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  return iv.toString('hex') + ':' + encrypted;
};

const decryptAES = (encryptedText) => {
  const parts = encryptedText.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted text format');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const encrypted = parts[1];
  const key = crypto.scryptSync(config.jwt.accessSecret, 'salt', 32);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
};

const encryptCryptoJS = (text) => {
  return CryptoJS.AES.encrypt(text, config.jwt.accessSecret).toString();
};

const decryptCryptoJS = (encryptedText) => {
  const bytes = CryptoJS.AES.decrypt(encryptedText, config.jwt.accessSecret);
  return bytes.toString(CryptoJS.enc.Utf8);
};

const hashPassword = (password) => {
  return CryptoJS.PBKDF2(password, config.jwt.accessSecret, {
    keySize: 256 / 32,
    iterations: 10000,
  }).toString();
};

const verifyPassword = (password, hash) => {
  const computedHash = CryptoJS.PBKDF2(password, config.jwt.accessSecret, {
    keySize: 256 / 32,
    iterations: 10000,
  }).toString();
  return computedHash === hash;
};

const generateOTP = (length = 6) => {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits.charAt(Math.floor(Math.random() * digits.length));
  }
  return otp;
};

const generateToken = (length = 64) => {
  return crypto.randomBytes(length).toString('base64url');
};

module.exports = {
  generateRandomBytes,
  generateRandomString,
  hashString,
  encryptAES,
  decryptAES,
  encryptCryptoJS,
  decryptCryptoJS,
  hashPassword,
  verifyPassword,
  generateOTP,
  generateToken,
};
