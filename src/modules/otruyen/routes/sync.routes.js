const express = require('express');
const syncController = require('../controllers/sync.controller');
const { authenticate } = require('../../../middlewares/auth');
const { isAdmin } = require('../../../middlewares/roleGuard');

const router = express.Router();

/**
 * @swagger
 * /api/otruyen/sync/categories:
 *   post:
 *     summary: Sync categories from OTruyen API
 *     tags: [OTruyen Sync]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Categories synced successfully
 */
router.post('/sync/categories', authenticate, isAdmin, syncController.syncCategories);

/**
 * @swagger
 * /api/otruyen/sync/home:
 *   post:
 *     summary: Sync home page data from OTruyen API
 *     tags: [OTruyen Sync]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Home data synced successfully
 */
router.post('/sync/home', authenticate, isAdmin, syncController.syncHomeData);

/**
 * @swagger
 * /api/otruyen/sync/stories/{slug}:
 *   post:
 *     summary: Sync a single story by slug
 *     tags: [OTruyen Sync]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Story synced successfully
 */
router.post('/sync/stories/:slug', authenticate, isAdmin, syncController.syncStory);

/**
 * @swagger
 * /api/otruyen/sync/stories:
 *   post:
 *     summary: Sync multiple stories by type
 *     tags: [OTruyen Sync]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           default: truyen-tranh
 *       - in: query
 *         name: startPage
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: endPage
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Stories synced successfully
 */
router.post('/sync/stories', authenticate, isAdmin, syncController.syncStories);

/**
 * @swagger
 * /api/otruyen/sync/all:
 *   post:
 *     summary: Full sync - categories and home data
 *     tags: [OTruyen Sync]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Full sync completed successfully
 */
router.post('/sync/all', authenticate, isAdmin, syncController.syncAll);

/**
 * @swagger
 * /api/otruyen/sync/status:
 *   get:
 *     summary: Get sync status
 *     tags: [OTruyen Sync]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sync status retrieved
 */
router.get('/sync/status', authenticate, isAdmin, syncController.getSyncStatus);

module.exports = router;
