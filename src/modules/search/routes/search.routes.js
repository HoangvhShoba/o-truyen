const express = require('express');
const searchController = require('../controllers/search.controller');

const router = express.Router();

router.get('/', searchController.search);
router.get('/suggest', searchController.getSuggestions);
router.get('/trending', searchController.getTrendingKeywords);

module.exports = router;
