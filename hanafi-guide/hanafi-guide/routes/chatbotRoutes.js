const express = require('express');
const router = express.Router();
const { getResponse } = require('../controllers/chatbotController');
const hanafiGuard = require('../middleware/hanafiGuard');

router.post('/', hanafiGuard, getResponse);

module.exports = router;
