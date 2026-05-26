const express = require('express');
const categoryController = require('../controllers/category.controller');
const router = express.Router();

router.get('/', categoryController.getCategories);
router.get('/:slug', categoryController.getCategoryBySlug);
router.get('/:slug/stories', categoryController.getStoriesByCategory);

module.exports = router;
