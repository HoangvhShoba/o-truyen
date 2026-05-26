const express = require('express');
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../../../middlewares/auth');
const { isAdmin } = require('../../../middlewares/roleGuard');

const router = express.Router();

router.use(authenticate, isAdmin);

router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/users', adminController.getUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.delete('/users/:id', adminController.deleteUser);
router.get('/stories', adminController.getStories);
router.delete('/stories/:id', adminController.deleteStory);
router.get('/comments', adminController.getComments);
router.delete('/comments/:id', adminController.deleteComment);
router.get('/reports', adminController.getReports);
router.put('/reports/:id/resolve', adminController.resolveReport);

module.exports = router;
