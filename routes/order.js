const express = require('express');
const router = express.Router();
const { createOrder } = require('../controllers/order-controller');
const { authenticateToken } = require('../middleware/authenticateToken')

router.post('/orders/:productId', authenticateToken, createOrder);

module.exports = router;