const _ = require('lodash');

const slugify = (text) => {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

const slugifyOptions = {
  lower: true,
  strict: true,
  trim: true,
};

const createSlug = (text) => {
  if (!text) return '';
  return slugify(text, slugifyOptions);
};

const pickFields = (obj, fields) => {
  return _.pick(obj, fields);
};

const omitFields = (obj, fields) => {
  return _.omit(obj, fields);
};

const isEmptyObject = (obj) => {
  return _.isEmpty(obj);
};

const cleanObject = (obj) => {
  return _.omitBy(obj, _.isNil);
};

const capitalizeFirstLetter = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

const removeAccents = (str) => {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

const parseIntOrDefault = (value, defaultValue = 0) => {
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
};

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const randomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const groupBy = (array, key) => {
  return _.groupBy(array, key);
};

const uniqBy = (array, key) => {
  return _.uniqBy(array, key);
};

const sortBy = (array, keys) => {
  return _.sortBy(array, keys);
};

const chunk = (array, size) => {
  return _.chunk(array, size);
};

const flatten = (array) => {
  return _.flatten(array);
};

const getNestedValue = (obj, path, defaultValue = undefined) => {
  return _.get(obj, path, defaultValue);
};

const setNestedValue = (obj, path, value) => {
  _.set(obj, path, value);
  return obj;
};

module.exports = {
  createSlug,
  pickFields,
  omitFields,
  isEmptyObject,
  cleanObject,
  capitalizeFirstLetter,
  truncateText,
  removeAccents,
  parseIntOrDefault,
  sleep,
  randomString,
  groupBy,
  uniqBy,
  sortBy,
  chunk,
  flatten,
  getNestedValue,
  setNestedValue,
};
