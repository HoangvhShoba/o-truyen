const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../../../middlewares/auth');

router.get('/profile', authenticate, userController.getProfile);
router.put('/profile', authenticate, userController.updateProfile);
router.delete('/account', authenticate, userController.deleteAccount);
router.get('/reading-history', authenticate, userController.getReadingHistory);
router.get('/favorites', authenticate, userController.getFavorites);
router.post('/favorites/:storyId', authenticate, userController.addFavorite);
router.delete('/favorites/:storyId', authenticate, userController.removeFavorite);
router.get('/notifications/settings', authenticate, userController.getNotificationSettings);
router.put('/notifications/settings', authenticate, userController.updateNotificationSettings);

module.exports = router;
