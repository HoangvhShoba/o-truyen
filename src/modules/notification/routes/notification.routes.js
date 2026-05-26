const express = require('express');
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../../../middlewares/auth');

const router = express.Router();

router.get('/', authenticate, notificationController.getNotifications);
router.put('/:id/read', authenticate, notificationController.markAsRead);
router.put('/read-all', authenticate, notificationController.markAllAsRead);
router.delete('/:id', authenticate, notificationController.deleteNotification);

module.exports = router;
