const axios = require('axios');
const config = require('../../../config');
const logger = require('../../../utils/logger');

class OtruyenClient {
  constructor() {
    this.baseUrl = config.otruyen.baseUrl;
    this.timeout = 30000;
    this.retryAttempts = 3;
    this.retryDelay = 1000;
  }

  async request(method, endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    const defaultOptions = {
      method,
      url,
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; API-Truyen/1.0)',
        ...options.headers,
      },
      ...options,
    };

    for (let attempt = 1; attempt <= this.retryAttempts; attempt++) {
      try {
        const response = await axios(defaultOptions);
        return response.data;
      } catch (error) {
        if (attempt === this.retryAttempts) {
          logger.error(`OTruyen API Error [${method} ${endpoint}]:`, error.message);
          throw error;
        }

        logger.warn(`OTruyen API attempt ${attempt} failed, retrying in ${this.retryDelay}ms...`);
        await this.sleep(this.retryDelay * attempt);
      }
    }
  }

  async get(endpoint, params = {}) {
    return this.request('GET', endpoint, { params });
  }

  async post(endpoint, data = {}) {
    return this.request('POST', endpoint, { data });
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getHome() {
    try {
      return await this.get('/home');
    } catch (error) {
      logger.error('Failed to fetch home data:', error.message);
      throw error;
    }
  }

  async getStoryList(type = 'truyen-tranh', page = 1) {
    try {
      return await this.get(`/danh-sach/${type}`, { page });
    } catch (error) {
      logger.error(`Failed to fetch story list (type: ${type}, page: ${page}):`, error.message);
      throw error;
    }
  }

  async getCategories() {
    try {
      return await this.get('/the-loai');
    } catch (error) {
      logger.error('Failed to fetch categories:', error.message);
      throw error;
    }
  }

  async getStoriesByCategory(slug, page = 1) {
    try {
      return await this.get(`/the-loai/${slug}`, { page });
    } catch (error) {
      logger.error(`Failed to fetch stories by category (${slug}):`, error.message);
      throw error;
    }
  }

  async getStoryDetail(slug) {
    try {
      return await this.get(`/truyen-tranh/${slug}`);
    } catch (error) {
      logger.error(`Failed to fetch story detail (${slug}):`, error.message);
      throw error;
    }
  }

  async search(keyword, page = 1) {
    try {
      return await this.get('/tim-kiem', { keyword, page });
    } catch (error) {
      logger.error(`Failed to search (${keyword}):`, error.message);
      throw error;
    }
  }
}

module.exports = new OtruyenClient();
